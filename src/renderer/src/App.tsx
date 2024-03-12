import "./styles/global.css";
import ChatBar from "@/components/ChatBar";
import { useEffect, useState } from "react";
import ChatCard from "@/components/ChatCard";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import Message from "@/components/Message";
import time from "@/lib/time";
import { Squircle } from "@squircle-js/react";

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
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      {/* Sidebar */}
      <Squircle cornerRadius={16} cornerSmoothing={1} className="relative flex h-full w-80 flex-col bg-neutral-900">
        {/* Chat Cards */}
        <div
          style={{ scrollbarGutter: "stable" }}
          className="scroll-secondary group/chat-cards my-4 grow overflow-auto scroll-smooth"
        >
          <div className="-mt-2 flex h-full max-h-full flex-col p-2">
            {ddb.chat_cards.map((card, idx) => {
              return <ChatCard key={idx} id={card.id} name={card.name} avatar={card.avatar} msg={card.msg} />;
            })}
          </div>
          {/* Scrollbar Hover Fade In/Out Hack*/}
          <div className="duration-[25ms] absolute right-0 top-0 h-full w-2 bg-neutral-900 transition ease-out group-hover/chat-cards:opacity-0"></div>
        </div>

        {/* Utility Bar */}
        <div className="z-50 flex h-16 w-full shrink-0 flex-row bg-neutral-700 p-3">
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
              <Cog8ToothIcon className="h-6 w-6 duration-300 ease-out hover:rotate-180" />
            </button>
          </div>
        </div>
      </Squircle>
      {/* Main Content */}
      <div className="flex h-full w-full grow flex-row overflow-x-hidden">
        {/* Chat Area and Chat Bar Wrapper*/}
        <div className="relative flex h-full flex-auto flex-col pl-8 pt-8">
          {/* Chat Area */}
          <div className="scroll-primary flex grow scroll-py-0 flex-col space-y-4 overflow-y-scroll scroll-smooth px-5 transition duration-500 ease-out">
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
                />
              );
            })}
          </div>
          <ChatBar userInput={userInput} setUserInput={setUserInput} typing={true} className="mb-1 mr-5" />
        </div>
      </div>
    </div>
  );
}

export default App;
