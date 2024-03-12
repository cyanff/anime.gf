import "./styles/global.css";
import ChatBar from "@/components/ChatBar";
import { useEffect, useState } from "react";
import MessagesArea from "@/components/MessagesArea";
import ChatCard from "@/components/ChatCard";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import Message from "@/components/Message";
import time from "@/lib/time";

function App({ ddbProp }): JSX.Element {
  const [userInput, setUserInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [ddb, setDDB] = useState(ddbProp);

  // Before closing, save data to ddb.json
  useEffect(() => {
    window.addEventListener("unload", () => {
      window.api.writeDDB(ddb);
    });
  });

  return (
    <div className="flex h-screen bg-neutral-800 p-6 text-sm  text-neutral-100 antialiased lg:text-base">
      {/* Sidebar */}
      <div className=" flex h-full w-80 flex-col rounded-lg bg-neutral-900">
        {/* Chat Cards */}
        <div className="scroll-secondary my-1 flex grow flex-col space-y-1 overflow-hidden scroll-smooth p-2 hover:overflow-y-auto">
          {ddb.chat_cards.map((card, idx) => {
            return <ChatCard key={idx} id={card.id} name={card.name} avatar={card.avatar} msg={card.msg} />;
          })}
        </div>
        {/* Utility Bar */}
        <div className="flex h-16 w-full shrink-0 flex-row rounded-b-md bg-neutral-700 p-3">
          <div className="relative">
            <img src="cyan.png" alt="Avatar" className="h-10 w-10 rounded-full" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-4 ring-gray-700"></span>
          </div>
          <div className="flex h-full flex-col justify-center p-2">
            <h3 className="font-semibold text-gray-100 ">cyan</h3>
            <p className="font-medium text-gray-400">Online</p>
          </div>
          <div className="flex grow items-center justify-end">
            <button className="ml-5 text-neutral-400 transition hover:text-neutral-300 ">
              <Cog8ToothIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex h-full w-full grow flex-row overflow-x-hidden">
        {/* Chat Area and Chat Bar Wrapper*/}
        <div className="flex h-full flex-auto flex-col pl-8 pr-2 pt-8">
          {/* Chat Area */}
          <div className="scroll-primary scroll-gutter flex grow scroll-py-0 flex-col space-y-4 overflow-hidden px-4 hover:overflow-y-scroll">
            {ddb.chat.map((chat, i) => {
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              const relativeTimestamp = time.isoToUserRelativeTime(chat.timestamp, timezone);
              return (
                <Message
                  key={i}
                  avatar={chat.avatar}
                  name={chat.name}
                  timestamp={relativeTimestamp}
                  msg={chat.msg}
                  byUser={chat.name === "cyan"}
                  align={chat.name === "cyan" ? "right" : "left"}
                />
              );
            })}
          </div>
          <ChatBar userInput={userInput} setUserInput={setUserInput} typing={typing} />
        </div>
      </div>
    </div>
  );
}

export default App;
