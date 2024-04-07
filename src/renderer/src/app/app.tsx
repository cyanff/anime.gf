import ChatBar from "@/components/ChatBar";
import Message from "@/components/Message";
import { time } from "@/lib/time";
import { CoreMessage as MessageI } from "@/lib/types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { useEffect, useState } from "react";
import "../styles/global.css";
import { RecentChat as RecentChatI, service } from "./app_service";
import RecentChats from "@/components/RecentChats";

function App(): JSX.Element {
  const [chatID, setChatID] = useState(1);
  const [persona, setPersona] = useState<PersonaBundle>();
  const [card, setCard] = useState<CardBundle>();
  const [recentChats, setRecentChats] = useState<RecentChatI[]>([]);
  const [chatHistory, setChatHistory] = useState<MessageI[]>([]);
  const [dbSync, setDBSync] = useState(false);
  const [pages, setPage] = useState("fsf");

  // Toggle the dbSync state to force a re-fetch of the chat history
  const syncDB = () => {
    setDBSync(!dbSync);
  };

  // Fetch sidebar chat cards
  useEffect(() => {
    (async () => {
      const chatCards = await service.getChatCards();
      if (chatCards.kind == "err") {
        return;
      }
      setRecentChats(chatCards.value);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await service.getPersonaBundle(chatID);
      if (res.kind == "err") {
        return;
      }
      setPersona(res.value);
    })();
  }, [chatID]);

  useEffect(() => {
    (async () => {
      const res = await service.getChatHistory(chatID);
      if (res.kind == "err") {
        return;
      }
      setChatHistory(res.value);
    })();
  }, [chatID, dbSync]);

  useEffect(() => {
    (async () => {
      const res = await service.getCardBundle(chatID);
      if (res.kind == "err") {
        return;
      }
      setCard(res.value);
    })();
  }, [chatID]);

  if (!persona || !card) {
    // Loading
    return <div className="h-screen w-screen bg-neutral-800 "></div>;
  }

  return (
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <button className="h-8 w-12 bg-neutral-500" onClick={async () => {}}>
        Test
      </button>
      <RecentChats chatID={chatID} setChatID={setChatID} recentChats={recentChats}></RecentChats>

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
                  avatar={message.sender === "user" ? persona.avatarURI || "" : card.avatarURI || ""}
                  name={message.sender === "user" ? persona.data.name : card.data.character.name}
                  sender={message.sender}
                  message={message.message}
                  timestamp={relativeTime}
                />
              );
            })}
          </div>

          <ChatBar
            chatID={chatID}
            persona={persona.data}
            cardData={card.data}
            setChatHistory={setChatHistory}
            syncDB={syncDB}
            className="mb-1 mr-5"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
