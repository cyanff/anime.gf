import ChatBar from "@/components/ChatBar";
import ChatCard from "@/components/ChatCard";
import Message from "@/components/Message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { service } from "./app_service";
import { time } from "@/lib/time";
import { Cog8ToothIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { Squircle } from "@squircle-js/react";
import { useEffect, useState } from "react";
import { getProvider, ProviderE } from "@/lib/provider/provider";
import { toast } from "sonner";
import { Persona, Message as MessageI } from "@/lib/types";
import { CardBundle } from "@shared/types";
import { ChatCard as ChatCardI } from "./app_service";
import "../styles/global.css";

function App(): JSX.Element {
  const [chatID, setChatID] = useState(1);
  const [persona, setPersona] = useState<Persona>();
  const [card, setCard] = useState<CardBundle>();
  const [chatCards, setChatCards] = useState<ChatCardI[]>([]);
  const [chatHistory, setChatHistory] = useState<MessageI[]>([]);
  const [typing, setTyping] = useState(false);

  // Fetch sidebar recent chat cards
  useEffect(() => {
    (async () => {
      const chatCards = await service.getChatCards();
      if (chatCards.kind == "err") {
        return;
      }
      setChatCards(chatCards.value);
    })();
  }, []);

  useEffect(() => {
    async () => {
      const res = await service.getPersona(chatID);
      if (res.kind == "err") {
        return;
      }
      setPersona(res.value);
    };
  }, [chatID]);

  useEffect(() => {
    (async () => {
      const res = await service.getChatHistory(chatID);
      if (res.kind == "err") {
        return;
      }
      setChatHistory(res.value);
    })();
  }, [chatID]);

  useEffect(() => {
    (async () => {
      const res = await service.getCard(chatID);
      if (res.kind == "err") {
        return;
      }
      setCard(res.value);
    })();
  }, [chatID]);

  const handleSendMessage = async (userInput) => {
    // if (userInput.length == 0) {
    //   return;
    // }
    // setChatHistory((prevMessages) => [...prevMessages, userInput]);
    // await queries.insertMessage(chatID, userInput, "user");
    // setTyping(true);
    // const response = await getResponse(chatID);
    // setChatHistory((prevMessages) => [...prevMessages, response]);
    // await queries.insertMessage(chatID, response, "character");
    // setTyping(false);
  };

  return (
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <button className="h-8 w-12 bg-neutral-500" onClick={async () => {}}>
        Test
      </button>
      {/* Sidebar */}
      <Squircle cornerRadius={16} cornerSmoothing={1} className="relative flex h-full w-80 flex-col bg-background">
        {/* Chat Cards */}
        <div
          style={{ scrollbarGutter: "stable" }}
          className="scroll-secondary group/chat-cards my-4 grow overflow-auto scroll-smooth"
        >
          <div className="-mt-2 flex h-full max-h-full flex-col p-2">
            {chatCards?.map((chatCard, idx) => {
              return (
                <ChatCard
                  key={idx}
                  id={chatCard.chat_id.toString()}
                  avatarURI={chatCard.avatarURI || ""}
                  name={chatCard.name}
                  msg={chatCard.last_message}
                  active={chatID == chatCard.chat_id}
                  onClick={() => setChatID(chatCard.chat_id)}
                />
              );
            })}
          </div>
          {/* Scrollbar Hover Fade In/Out Hack*/}
          <div className="absolute right-0 top-0 h-full w-2 bg-background transition duration-75 ease-out group-hover/chat-cards:opacity-0"></div>
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
          {/* Settings Icon */}
          <div className="flex grow items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Cog8ToothIcon className=" ml-5 size-6 cursor-pointer text-neutral-400 transition duration-300 ease-out hover:rotate-180 hover:text-neutral-300" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Placeholder</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>
                    Placeholder
                    <DropdownMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Placeholder
                    <DropdownMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Placeholder
                    <DropdownMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Placeholder
                    <DropdownMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Squircle>
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
                  avatar={""}
                  name={"place holder"}
                  sender={message.sender}
                  message={message.message}
                  timestamp={relativeTime}
                />
              );
            })}
          </div>
          <ChatBar handleSendMessage={() => {}} typing={typing} className="mb-1 mr-5" />
        </div>
      </div>
    </div>
  );
}

export default App;
