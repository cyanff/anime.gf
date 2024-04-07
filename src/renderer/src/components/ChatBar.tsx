import { service } from "@/app/app_service";
import { PromptVariant, context } from "@/lib/context";
import { ProviderE, getProvider } from "@/lib/provider/provider";
import { CoreMessage } from "@/lib/types";
import { PersonaData } from "@shared/types";
import { PaperAirplaneIcon, WrenchIcon } from "@heroicons/react/24/solid";
import { CardData } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Typing from "./Typing";

interface ChatBarProps {
  chatID: number;
  persona: PersonaData;
  cardData: CardData;
  setChatHistory: (callback: (prevMessages: CoreMessage[]) => CoreMessage[]) => any;
  syncDB: () => void;
  className?: string;
}

export default function ChatBar({
  chatID,
  persona,
  cardData,
  setChatHistory,
  syncDB,
  className,
  ...rest
}: ChatBarProps) {
  const [userInput, setUserInput] = useState("");
  const [typing, setTyping] = useState(false);

  // Dynamically expand the text area to fit the user's input
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea == null) {
      return;
    }
    textarea.style.height = "24px";
    textarea.style.height = textarea.scrollHeight + "px";
  }, [userInput]);

  const handleSendMessage = async (userInput: string) => {
    if (userInput.length == 0) {
      return;
    }
    if (persona === undefined) {
      toast.error("Persona not loaded.");
      return;
    }
    if (cardData === undefined) {
      toast.error("Card not loaded.");
      return;
    }
    const cachedUserInput = userInput;

    // Optimistically clear userInput and append the user's message to the chat history
    setUserInput("");
    setChatHistory((prevMessages: CoreMessage[]) => [
      ...prevMessages,
      {
        sender: "user",
        message: cachedUserInput,
        timestamp: new Date().toISOString()
      }
    ]);

    const model = "claude-3-haiku-20240307";
    // Get response from provider and update chat history
    setTyping(true);
    const contextParams = {
      chatID,
      latestUserMessage: userInput,
      persona: persona,
      cardData,
      jailbreak: "",
      variant: "markdown" as PromptVariant,
      model,
      tokenLimit: 4096
    };

    const contextResult = await context.getContext(contextParams);

    const completionConfig = {
      model,
      system: contextResult.system,
      max_tokens: 256
    };
    const provider = getProvider(ProviderE.ANTHROPIC);
    const completionRes = await provider.getChatCompletion(contextResult.messages, completionConfig);
    setTyping(false);
    if (completionRes.kind == "err") {
      toast.error(`Failed to get chat completion. 
        Error ${completionRes.error}`);
      return;
    }
    const characterReply = completionRes.value;

    const insertRes = await service.insertMessagePair(chatID, userInput, characterReply);
    syncDB();

    if (insertRes.kind == "err") {
      toast.error(`Failed to insert user and character mesage into database. 
        Error ${insertRes.error}`);
      return;
    }
  };

  return (
    <div className={className}>
      <div className="flex h-fit w-fit items-center ">
        <Typing className="mb-1 ml-4 mt-1" name="Saku" typing={typing} />
      </div>
      <div className=" flex min-h-fit w-full shrink-0 space-x-2 overflow-auto rounded-3xl bg-neutral-600 px-4 py-3">
        <button className="flex size-6 items-center justify-center text-neutral-400 hover:text-neutral-300">
          <WrenchIcon className="size-6 fill-neutral-400 transition duration-150 ease-out hover:fill-neutral-200" />
        </button>
        {/* Textarea wrapper */}
        <textarea
          onInput={(e) => setUserInput(e.currentTarget.value)}
          ref={textAreaRef}
          maxLength={1024}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSendMessage(userInput);
              // Prevent inserting a new line on pressing enter
              e.preventDefault();
            }
          }}
          value={userInput}
          placeholder={`Message @Saku`}
          className="scroll-secondary h-6 max-h-64 w-full resize-none overflow-y-auto bg-inherit px-2 font-[430] leading-6 focus:outline-none"
        />
        {/* Send button */}
        <button onClick={() => handleSendMessage(userInput)} className="h-fit w-fit ">
          <PaperAirplaneIcon className="h-7 w-7 fill-neutral-400  transition duration-150 ease-out hover:fill-neutral-200  " />
        </button>
      </div>
    </div>
  );
}
