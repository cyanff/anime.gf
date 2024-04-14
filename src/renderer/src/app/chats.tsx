import { AppContext, DialogConfig } from "@/components/AppContext";
import ChatBar from "@/components/ChatBar";
import ChatsSidebar from "@/components/ChatsSidebar";
import Message from "@/components/Message";
import { useShiftKey } from "@/lib/hook/useShiftKey";
import { queries } from "@/lib/queries";
import { reply } from "@/lib/reply";
import { time } from "@/lib/time";
import { CardBundle, PersonaBundle, UIMessage } from "@shared/types";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import "../styles/global.css";

enum ScrollEvent {
  SCROLLED_TO_TOP,
  NEW_CHARACTER_MESSAGE
}

function ChatsPage(): JSX.Element {
  const { createDialog } = useContext(AppContext);
  const [chatID, setChatID] = useState(1);
  const [personaBundle, setPersonaBundle] = useState<PersonaBundle>();
  const [cardBundle, setCardBundle] = useState<CardBundle>();
  const [chatHistoryLimit, setChatHistoryLimit] = useState(20);
  const [chatHistory, setChatHistory] = useState<UIMessage[]>([]);
  // Keep track of which message is being edited, only one message can be edited at a time
  const [editingMessageID, setEditingMessageID] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const isShiftKeyPressed = useShiftKey();
  const latestCharacterMessageIDX = chatHistory.findLastIndex((m) => m.sender === "character");
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  // Used to keep track of the (old) scroll height so we could restore it
  const oldScrollHeightRef = useRef(0);
  const scrollEventRef = useRef<ScrollEvent | null>(null);

  // Sync states with db on load
  useEffect(() => {
    syncCardBundle();
    syncPersonaBundle();
    syncChatHistory();
    // Scroll to the bottom of the chat on load
    // Race condition, too much of a hassle to fix
    setTimeout(scrollToBottom, 100);
  }, [chatID]);

  // Sync chat history when the limit changes
  useEffect(() => {
    syncChatHistory();
  }, [chatHistoryLimit]);

  useLayoutEffect(() => {
    // Scroll to bottom on character message
    if (scrollEventRef.current === ScrollEvent.NEW_CHARACTER_MESSAGE) {
      scrollToBottom();
    }
    // Restore scroll position after loading more messages
    else if (scrollEventRef.current === ScrollEvent.SCROLLED_TO_TOP) {
      const delta = chatAreaRef.current!.scrollHeight - oldScrollHeightRef.current;
      chatAreaRef.current!.scrollTop = delta;
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const syncCardBundle = async () => {
    const res = await queries.getCardBundle(chatID);
    if (res.kind == "err") {
      toast.error("Error fetching card bundle.");
      return;
    }
    setCardBundle(res.value);
  };

  const syncPersonaBundle = async () => {
    const res = await queries.getPersonaBundle(chatID);
    if (res.kind == "err") {
      toast.error("Error fetching persona bundle.");
      return;
    }
    setPersonaBundle(res.value);
  };

  const syncChatHistory = async () => {
    const res = await queries.getChatHistory(chatID, chatHistoryLimit);
    if (res.kind == "err") {
      toast.error("Error fetching chat history.");
      return;
    }
    setChatHistory(res.value);
  };

  // Add escape key listener to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingMessageID(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Loading screen
  if (!personaBundle || !cardBundle) {
    return <div className="h-screen w-screen bg-neutral-800 "></div>;
  }

  const handleEditSubmit = (messageID?: number, candidateID?: number) => {
    if (!messageID && !candidateID) {
      return;
    }
    if (messageID && candidateID) {
      return;
    }
    // Clear the editing state
    setEditingMessageID(null);
    try {
      // Editing a main message
      if (messageID) {
        queries.updateMessageText(messageID, editText);
      }
      // Editing a candidate message
      else if (candidateID) {
        queries.updateCandidateMessage(candidateID, editText);
      }
    } catch (e) {
      toast.error(`Failed to edit the message. Error: ${e}`);
      console.error(e);
    } finally {
      syncChatHistory();
    }
  };

  const handleSendMessage = async () => {
    if (isGenerating) {
      return;
    }

    setIsTyping(true);
    setUserInput("");
    scrollToBottom();
    setIsGenerating(true);

    // Optimistic update
    const cachedUserInput = userInput;
    setChatHistory((prevMessages: UIMessage[]) => [
      ...prevMessages,
      {
        id: -1,
        sender: "user",
        text: cachedUserInput,
        is_regenerated: 0,
        candidates: [],
        inserted_at: new Date().toISOString()
      }
    ]);

    // Generate a reply
    let characterReply: string;
    try {
      characterReply = await reply.generate(chatID, cardBundle.data, personaBundle.data, userInput);
      const insertRes = await queries.insertMessagePair(chatID, userInput, characterReply);
      scrollEventRef.current = ScrollEvent.NEW_CHARACTER_MESSAGE;
      if (insertRes.kind == "err") {
        toast.error(`Failed to insert user and character mesage into database. 
        Error ${insertRes.error}`);
        return;
      }
    } catch (e) {
      toast.error(`Failed to generate a reply. Error: ${e}`);
      console.error(e);
      // Restore the user's input
      setUserInput(cachedUserInput);
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
      scrollToBottom();
      syncChatHistory();
    }
  };

  const handleRegenerate = async (messageID: number) => {
    if (isGenerating) {
      return;
    }
    setIsGenerating(true);
    setIsTyping(true);
    try {
      const characterReply = await reply.regenerate(chatID, messageID, cardBundle.data, personaBundle.data);
      const candidateID = await queries.insertCandidateMessage(messageID, characterReply);
      await queries.setCandidateMessageAsPrime(messageID, candidateID);
    } catch (e) {
      toast.error(`Failed to regenerate a reply. Error: ${e}`);
      console.error(e);
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
      syncChatHistory();
    }
  };

  const handleDelete = (messageID: number) => {
    const deleteMessage = async () => {
      try {
        await queries.deleteMessage(messageID);
      } catch (e) {
        toast.error(`Failed to delete message. Error: ${e}`);
        console.error(e);
      } finally {
        syncChatHistory();
      }
    };

    if (isShiftKeyPressed) {
      deleteMessage();
    } else {
      const config: DialogConfig = {
        title: "Delete Message",
        actionLabel: "Delete",
        description: "Are you sure you want to delete this message?",
        onAction: deleteMessage
      };
      createDialog(config);
    }
  };

  const handleRewind = async (messageID: number) => {
    const rewind = async () => {
      try {
        await queries.resetChatToMessage(chatID, messageID);
      } catch (e) {
        toast.error(`Failed to rewind chat. Error: ${e}`);
        console.error(e);
      } finally {
        syncChatHistory();
      }
    };

    if (isShiftKeyPressed) {
      rewind();
    } else {
      const config: DialogConfig = {
        title: "Rewind Chat",
        actionLabel: "Rewind",
        description:
          "Are you sure you want to rewind the chat to this message? Rewinding will delete all messages that were sent after this message.",
        onAction: rewind
      };
      createDialog(config);
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // User scrolled to top
    if (e.currentTarget.scrollTop == 0) {
      // Store the current scroll height so we could restore it later
      oldScrollHeightRef.current = e.currentTarget.scrollHeight;
      scrollEventRef.current = ScrollEvent.SCROLLED_TO_TOP;
      setChatHistoryLimit((prevLimit) => prevLimit + 20);
    }
  };

  return (
    <>
      <ChatsSidebar
        chatID={chatID}
        setChatID={setChatID}
        personaBundle={personaBundle}
        syncChatHistory={syncChatHistory}
      />
      {/* Main Content */}
      <div className="flex h-full w-full grow flex-row overflow-x-hidden">
        {/* Chat Area and Chat Bar Wrapper*/}
        <div className="relative flex h-full flex-auto flex-col pl-8 pt-8">
          {/* Chat Area */}
          <div
            ref={chatAreaRef}
            onScroll={handleScroll}
            className="scroll-primary mr-2 flex grow scroll-py-0 flex-col space-y-4 overflow-y-scroll px-5 py-1 transition duration-500 ease-out"
          >
            {chatHistory?.map((message, idx) => {
              const iso = time.sqliteToISO(message.inserted_at);
              const relativeTime = time.isoToLLMRelativeTime(iso);
              const isLatest = idx === chatHistory.length - 1;
              const isLatestCharacterMessage = idx === latestCharacterMessageIDX;

              // Combine the main message and its candidates into one candidates array
              let candidates = [{ id: message.id, text: message.text }];
              candidates = candidates.concat(message.candidates);

              // If there are no prime candidates, set the index to be the main message
              const primeCandidateIDX = message.candidates.findIndex((c) => c.id === message.prime_candidate_id);
              const candidatesIDX = primeCandidateIDX === -1 ? 0 : primeCandidateIDX + 1;
              const noCandidates = message.candidates.length === 1;

              return (
                <Message
                  key={idx}
                  messageID={message.id}
                  avatar={message.sender === "user" ? personaBundle.avatarURI || "" : cardBundle.avatarURI || ""}
                  name={message.sender === "user" ? personaBundle.data.name : cardBundle.data.character.name}
                  sender={message.sender}
                  candidates={candidates}
                  candidatesIDX={candidatesIDX}
                  timestring={relativeTime}
                  isLatest={isLatest}
                  isLatestCharacterMessage={isLatestCharacterMessage}
                  isEditing={editingMessageID === message.id}
                  handleEdit={() => setEditingMessageID(message.id)}
                  setEditText={setEditText}
                  handleEditSubmit={() => {
                    if (noCandidates) {
                      handleEditSubmit(message.id);
                    } else {
                      handleEditSubmit(undefined, message.candidates[candidatesIDX].id);
                    }
                  }}
                  handleRegenerate={() => handleRegenerate(message.id)}
                  handleRewind={() => handleRewind(message.id)}
                  handleDelete={() => {
                    handleDelete(message.id);
                  }}
                />
              );
            })}
          </div>

          <ChatBar
            chatID={chatID}
            personaData={personaBundle.data}
            cardData={cardBundle.data}
            isTyping={isTyping}
            userInput={userInput}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
            className="mb-1 mr-5"
          />
        </div>
      </div>
    </>
  );
}

export default ChatsPage;
