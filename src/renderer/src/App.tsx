import "./styles/global.css";
import ChatBar from "@/components/ChatBar";
import { useEffect, useState } from "react";
import { UIMessage } from "@/lib/types";
import MessagesArea from "@/components/MessagesArea";

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
    <div className="flex h-screen bg-[#373636] p-8 text-sm font-medium text-neutral-200 antialiased lg:text-base">
      <div className="flex h-full w-full flex-row overflow-x-hidden">
        {/* Messages Area and Chat Bar Wrapper*/}
        <div className="flex h-full flex-auto flex-col">
          <div className="flex h-full flex-auto flex-shrink-0 flex-col">
            <MessagesArea msgProp={ddb.chat} />
            <ChatBar userInput={userInput} setUserInput={setUserInput} typing={true} />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="ml-8 hidden w-[22rem] flex-shrink-0 flex-col rounded-lg bg-[#222222] px-4 lg:flex">
        {/* Companion Avatar */}
        <div className="mt-4 flex w-full flex-col items-center rounded-lg bg-[#3C3C3C] px-4 py-6 shadow-md">
          <div className="relative h-64 w-64 overflow-hidden rounded-full shadow-md">
            <img src="saku.png" alt="Avatar" className="h-full w-full object-cover object-top" />
            <div className="h-10 w-10 rounded-full border-2 border-[#3C3C3C] bg-green-500"></div>
          </div>
          <div className="mt-6 w-40 rounded-md bg-[#222222] p-1.5 text-center text-xl font-black text-white">Saku</div>
        </div>
        {/* Companion Bio */}
        <div className="mt-6 flex flex-col p-5">
          <h3 className="mb-2 text-lg font-bold text-white">About Me</h3>
          <div className="whitespace-pre-line text-sm leading-6">im saku</div>
        </div>
        {/* Utlity Bar */}
        <div className="relative mt-auto w-full rounded-md p-2" />
      </div>
    </div>
  );
}

export default App;
