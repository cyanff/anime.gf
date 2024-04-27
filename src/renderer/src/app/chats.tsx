import { AppContext, useApp } from "@/components/AppContext";
import ChatBar from "@/components/ChatBar";
import ChatsSidebar from "@/components/ChatsSidebar";
import Message from "@/components/Message";
import { MessagesHistory, queries } from "@/lib/queries";
import { time } from "@/lib/time";
import { CardBundle, PersonaBundle } from "@shared/types";
import { motion } from "framer-motion";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import "../styles/global.css";

enum ScrollEvent {
  SCROLLED_TO_TOP,
  NEW_CHARACTER_MESSAGE
}

function ChatsPage({ chatID }): JSX.Element {
  const [personaBundle, setPersonaBundle] = useState<PersonaBundle>();
  const [cardBundle, setCardBundle] = useState<CardBundle>();
  const [historyLimit, setHistoryLimit] = useState(50);
  const [messagesHistory, setMessagesHistory] = useState<MessagesHistory>([]);
  // Keep track of which message is being edited, only one message can be edited at a time
  const [editingMessageID, setEditingMessageID] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const latestCharacterMessageIDX = messagesHistory.findLastIndex((m) => m.sender === "character");
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  // Keep track of the previous scroll height to restore it when loading more messages
  const oldScrollHeightRef = useRef(0);
  const scrollEventRef = useRef<ScrollEvent | null>(null);
  const { setActiveChatID } = useApp();

  useEffect(() => {
    (async () => {
      const chatExistsRes = await queries.checkChatExists(chatID);
      // If active chat does not exist, set the most recent chat to be the active chat
      if (chatExistsRes.kind === "ok" && !chatExistsRes.value) {
        console.error(`Chat with ID ${chatID} does not exist. Setting active chat to most recent.`);
        const recentChatRes = await queries.getMostRecentChat();
        if (recentChatRes.kind === "ok" && recentChatRes.value) {
          setActiveChatID(recentChatRes.value);
          return;
        }
      }
      await syncChatHistory();
      await syncPersonaBundle();
      await syncCardBundle();
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    })();
  }, [chatID]);

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
      console.error(res.error);
      return;
    }
    setPersonaBundle(res.value);
  };

  const syncChatHistory = async () => {
    const res = await queries.getChatHistory(chatID, historyLimit);
    if (res.kind == "err") {
      toast.error("Error fetching chat history.");
      return;
    }
    setMessagesHistory(res.value);
  };

  // Sync chat history when the chat history limit changes as users scroll up
  useEffect(() => {
    syncChatHistory();
  }, [historyLimit]);

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
  }, [messagesHistory]);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
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
    return <div className="flex h-screen w-screen items-center justify-center "></div>;
  }

  const handleEditSubmit = async (messageID?: number, candidateID?: number) => {
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
        await queries.updateMessageText(messageID, editText);
      }
      // Editing a candidate message
      else if (candidateID) {
        await queries.updateCandidateMessage(candidateID, editText);
      }
    } catch (e) {
      toast.error(`Failed to edit the message. Error: ${e}`);
      console.error(e);
    } finally {
      syncChatHistory();
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // User scrolled to top
    if (e.currentTarget.scrollTop == 0) {
      // Store the current scroll height so we could restore it later
      oldScrollHeightRef.current = e.currentTarget.scrollHeight;
      scrollEventRef.current = ScrollEvent.SCROLLED_TO_TOP;
      setHistoryLimit((prevLimit) => prevLimit + 15);
    }
  };

  return (
    <motion.div
      className="flex h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.13, delay: 0.12 }}
    >
      <ChatsSidebar chatID={chatID} personaBundle={personaBundle} syncChatHistory={syncChatHistory} />
      {/* Main Content */}
      <div className="flex h-full w-full grow flex-row overflow-hidden">
        {/* Chat Area and Chat Bar Wrapper*/}
        <div className="relative flex h-full flex-auto flex-col pl-8 pt-8">
          {/* Chat Area */}
          <div
            ref={chatAreaRef}
            onScroll={handleScroll}
            className="scroll-primary mr-2 flex grow scroll-py-0 flex-col space-y-4 overflow-auto px-5 py-1 transition duration-500 ease-out"
          >
            {messagesHistory?.map((message, idx) => {
              return (
                <Message
                  key={idx}
                  messageWithCandidates={message}
                  messagesHistory={messagesHistory}
                  personaBundle={personaBundle}
                  cardBundle={cardBundle}
                  isEditing={editingMessageID === message.id}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  handleEdit={() => setEditingMessageID(message.id)}
                  setEditText={setEditText}
                  onEditSubmit={(isCandidate: boolean, id: number) => {
                    if (isCandidate) {
                      handleEditSubmit(undefined, id);
                    } else {
                      handleEditSubmit(id);
                    }
                  }}
                  synChatHistory={syncChatHistory}
                />
              );
            })}
          </div>
          <ChatBar
            chatID={chatID}
            personaBundle={personaBundle}
            cardBundle={cardBundle}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onMessageSend={(message) => {
              // Optimistically add the message to the chat history
              setMessagesHistory((prevMessages: MessagesHistory) => [
                ...prevMessages,
                {
                  id: -1,
                  chat_id: chatID,
                  sender: "user",
                  text: message,
                  is_regenerated: 0,
                  candidates: [],
                  is_embedded: 0,
                  inserted_at: new Date().toISOString()
                }
              ]);
              scrollToBottom();
            }}
            onMessageResolve={(res) => {
              if (res.kind === "err") {
                toast.error(`Failed to send message. ${res.error}`);
              }
              scrollEventRef.current = ScrollEvent.NEW_CHARACTER_MESSAGE;
              syncChatHistory();
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default ChatsPage;
