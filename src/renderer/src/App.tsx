import "./styles/global.css";
import ChatBar from "@/components/ChatBar";
import { useEffect, useState } from "react";
import MessagesArea from "@/components/MessagesArea";
import ChatCard from "@/components/ChatCard";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";

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
    <div className="flex h-screen bg-neutral-800 p-4 text-sm font-medium text-neutral-200 antialiased lg:text-base">
      {/* Sidebar */}
      <div className="flex flex-col w-80 h-full bg-neutral-900 rounded-lg mr-8">
        {/* Chat Cards */}
        <div className="grow flex flex-col space-y-1 overflow-hidden hover:overflow-y-auto p-4 scrollbar my-3">
          {ddb.chat_cards.map((card, idx) => {
            return <ChatCard key={idx} id={card.id} name={card.name} avatar={card.avatar} msg={card.msg} />;
          })}
        </div>
        {/* Utility Bar */}
        <div className="flex flex-row shrink-0 w-full h-16 bg-neutral-700 p-3 rounded-b-md">
          <div className="relative">
            <img src="cyan.png" alt="Avatar" className="h-10 w-10 rounded-full" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-4 ring-gray-700 bg-green-400"></span>
          </div>
          <div className="h-full flex flex-col justify-center p-2">
            <h3 className="text-gray-100 font-medium ">cyan</h3>
            <p className="text-gray-400">Idle</p>
          </div>
          <div className="grow flex items-center justify-end">
            <button className="text-neutral-400 hover:text-neutral-300 ml-5 transition ">
              <Cog8ToothIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-row overflow-x-hidden">
        {/* Messages Area and Chat Bar Wrapper*/}
        <div className="flex h-full flex-auto flex-col">
          <div className="flex h-full flex-auto flex-shrink-0 flex-col">
            <MessagesArea msgProp={ddb.chat} />
            <ChatBar userInput={userInput} setUserInput={setUserInput} typing={typing} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
