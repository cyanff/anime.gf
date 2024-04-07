import ChatBar from "@/components/ChatBar";
import Message from "@/components/Message";
import { time } from "@/lib/time";
import { CoreMessage as MessageI } from "@/lib/types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import "../styles/global.css";
import { RecentChat as RecentChatI, service } from "./app_service";
import RecentChats from "@/components/RecentChats";

function ChatsPage(): JSX.Element {
  const [chatID, setChatID] = useState(1);
  const [personaBundle, setPersonaBundle] = useState<PersonaBundle>();
  const [cardBundle, setCardBundle] = useState<CardBundle>();
  const [chatHistory, setChatHistory] = useState<MessageI[]>([]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync states with db on load
  useEffect(() => {
    syncCardBundle();
    syncPersonaBundle();
    syncChatHistory();
  }, [chatID]);

  const syncCardBundle = async () => {
    const res = await service.getCardBundle(chatID);
    if (res.kind == "err") {
      return;
    }
    setCardBundle(res.value);
  };

  const syncPersonaBundle = async () => {
    const res = await service.getPersonaBundle(chatID);
    if (res.kind == "err") {
      return;
    }
    setPersonaBundle(res.value);
  };

  const syncChatHistory = async () => {
    const res = await service.getChatHistory(chatID);
    if (res.kind == "err") {
      return;
    }
    setChatHistory(res.value);
  };

  // Scroll to bottom on load
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  if (!personaBundle || !cardBundle) {
    // Loading
    return <div className="h-screen w-screen bg-neutral-800 "></div>;
  }

  return (
    <>
      <RecentChats chatID={chatID} setChatID={setChatID} personaBundle={personaBundle}></RecentChats>
      {/* Main Content */}
      <div className="flex h-full w-full grow flex-row overflow-x-hidden">
        {/* Chat Area and Chat Bar Wrapper*/}
        <div className="relative flex h-full flex-auto flex-col pl-8 pt-8">
          {/* Chat Area */}
          <div className="scroll-primary flex grow scroll-py-0 flex-col space-y-4 overflow-y-scroll scroll-smooth px-5 transition duration-500 ease-out">
            {chatHistory?.map((message, idx) => {
              const iso = time.sqliteToISO(message.timestamp);
              const relativeTime = time.isoToLLMRelativeTime(iso);
              return (
                <Message
                  key={idx}
                  avatar={message.sender === "user" ? personaBundle.avatarURI || "" : cardBundle.avatarURI || ""}
                  name={message.sender === "user" ? personaBundle.data.name : cardBundle.data.character.name}
                  sender={message.sender}
                  message={message.message}
                  timestamp={relativeTime}
                />
              );
            })}
            <div ref={chatScrollRef} />
          </div>

          <ChatBar
            chatID={chatID}
            persona={personaBundle.data}
            cardData={cardBundle.data}
            setChatHistory={setChatHistory}
            syncChatHistory={syncChatHistory}
            className="mb-1 mr-5"
          />
        </div>
      </div>
    </>
  );
}

export default ChatsPage;
