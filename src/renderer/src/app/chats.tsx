import { useApp } from "@/components/AppContext";
import ChatBar from "@/components/ChatBar";
import ChatsSidebar from "@/components/ChatsSidebar";
import Message from "@/components/Message";
import { Button } from "@/components/ui/button";
import { MessageHistory, queries } from "@/lib/queries";
import { CardBundle, PersonaBundle } from "@shared/types";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import "../styles/global.css";

enum ScrollEvent {
  SCROLLED_TO_TOP,
  NEW_CHARACTER_MESSAGE
}

export default function ChatsPage({ chatID }): JSX.Element {
  const [personaBundle, setPersonaBundle] = useState<PersonaBundle>();
  const [messagesHistory, setMessagesHistory] = useState<MessageHistory>([]);
  const [historyLimit, setHistoryLimit] = useState(50);
  const [editingMessageID, setEditingMessageID] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { setActiveChatID } = useApp();

  useEffect(() => {
    (async () => {
      // If active chat does not exist, set the most recent chat to be the active chat
      const chatExistsRes = await queries.checkChatExists(chatID);
      if (chatExistsRes.kind === "ok" && !chatExistsRes.value) {
        console.error(`Chat with ID ${chatID} does not exist. Setting active chat to most recent.`);
        const recentChatRes = await queries.getMostRecentChat();
        if (recentChatRes.kind === "ok" && recentChatRes.value) {
          setActiveChatID(recentChatRes.value);
          return;
        }
      }
      await syncPersonaBundle();
      await syncMessageHistory();
    })();
  }, [chatID]);

  useEffect(() => {
    syncMessageHistory();
  }, [historyLimit]);

  const syncPersonaBundle = async () => {
    const res = await queries.getPersonaBundle(chatID);
    if (res.kind == "err") {
      toast.error("Error fetching persona bundle.");
      console.error(res.error);
      return;
    }
    setPersonaBundle(res.value);
  };

  const syncMessageHistory = async () => {
    const res = await queries.getChatHistory(chatID, historyLimit);
    if (res.kind == "err") {
      toast.error("Error fetching chat history.");
      console.error(res.error);
      return;
    }
    setMessagesHistory(res.value);
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
  if (!personaBundle) {
    return <div className="flex h-screen w-screen items-center justify-center "></div>;
  }

  return (
    <motion.div
      className="flex h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.13, delay: 0.12 }}
    >
      <ChatsSidebar chatID={chatID} personaBundle={personaBundle} syncMessageHistory={syncMessageHistory} />
      <ErrorBoundary key={chatID} FallbackComponent={ChatAreaFallback}>
        <ChatArea
          chatID={chatID}
          messageHistory={messagesHistory}
          setMessageHistory={setMessagesHistory}
          setHistoryLimit={setHistoryLimit}
          syncMessageHistory={syncMessageHistory}
          personaBundle={personaBundle}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </ErrorBoundary>
    </motion.div>
  );
}

interface ChatAreaProps {
  chatID: number;
  personaBundle: PersonaBundle;
  messageHistory: MessageHistory;
  setMessageHistory: React.Dispatch<React.SetStateAction<MessageHistory>>;
  setHistoryLimit: React.Dispatch<React.SetStateAction<number>>;
  syncMessageHistory: () => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

function ChatArea({
  chatID,
  personaBundle,
  messageHistory,
  setMessageHistory,
  setHistoryLimit,
  syncMessageHistory,
  isGenerating,
  setIsGenerating
}: ChatAreaProps) {
  const [cardBundle, setCardBundle] = useState<CardBundle>();
  const [editingMessageID, setEditingMessageID] = useState<number | null>(null);
  const messageHistoryRef = useRef<HTMLDivElement | null>(null);
  const oldScrollHeightRef = useRef(0);
  const scrollEventRef = useRef<ScrollEvent | null>(null);
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    (async () => {
      await syncCardBundle();
    })();
  }, [chatID]);

  const syncCardBundle = async () => {
    const res = await queries.getCardBundle(chatID);
    if (res.kind === "err") {
      showBoundary(res.error);
      return;
    }
    setCardBundle(res.value);
  };

  // useLayoutEffect(() => {
  //   if (scrollEventRef.current === ScrollEvent.NEW_CHARACTER_MESSAGE) {
  //     scrollToBottom();
  //   } else if (scrollEventRef.current === ScrollEvent.SCROLLED_TO_TOP) {
  //     const delta = chatAreaRef.current!.scrollHeight - oldScrollHeightRef.current;
  //     chatAreaRef.current!.scrollTop = delta;
  //   }
  // }, [messageHistory]);

  const scrollToBottom = () => {
    console.log("Called");
    console.log("messageHistoryRef", messageHistoryRef.current);

    if (messageHistoryRef.current) {
      messageHistoryRef.current.scrollTop = messageHistoryRef.current.scrollHeight;
    }
  };

  const scrollHandler = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (e.currentTarget.scrollTop == 0) {
      oldScrollHeightRef.current = e.currentTarget.scrollHeight;
      scrollEventRef.current = ScrollEvent.SCROLLED_TO_TOP;
      setHistoryLimit((prevLimit: number) => prevLimit + 15);
    }
  };

  if (!cardBundle) return <div className="flex h-screen w-screen items-center justify-center "></div>;
  return (
    <div className="flex h-full w-full grow flex-row overflow-hidden">
      <div className="relative flex h-full flex-auto flex-col pl-8 pt-8">
        <motion.div
          key={chatID}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.12 }}
          ref={messageHistoryRef}
          onScroll={scrollHandler}
          className="scroll-primary mr-2 flex grow scroll-py-0 flex-col space-y-4 overflow-auto px-5 py-1 transition duration-500 ease-out scroll-smooth"
        >
          {messageHistory?.map((message, idx) => {
            return (
              <Message
                key={idx}
                message={message}
                messagesHistory={messageHistory}
                personaBundle={personaBundle}
                cardBundle={cardBundle}
                editingMessageID={editingMessageID}
                setEditingMessageID={setEditingMessageID}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                syncMessageHistory={() => {
                  syncMessageHistory();
                }}
              />
            );
          })}
        </motion.div>

        <motion.div
          key={chatID}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3
          }}
          ref={messageHistoryRef}
          onScroll={scrollHandler}
        >
          <ChatBar
            chatID={chatID}
            personaBundle={personaBundle}
            cardBundle={cardBundle}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onMessageSend={(message) => {
              setMessageHistory((prevMessages: MessageHistory) => [
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
              syncMessageHistory();
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ChatAreaFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full space-y-4">
      <p className="text-lg text-tx-primary">An error occured while attempting to render the chat:</p>
      <div className="bg-container-primary w-96 p-6 rounded-lg flex item-center justify-center">
        <p className="font-mono text-red-400">{error.message || ""}</p>
      </div>
      <Button
        onClick={() => {
          resetErrorBoundary();
          toast("Retry ran...");
        }}
      >
        Try again?
      </Button>
    </div>
  );
}
