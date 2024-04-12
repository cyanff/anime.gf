import { queries } from "@/lib/queries";
import { UIMessage } from "@shared/types";
import { PaperAirplaneIcon, WrenchIcon } from "@heroicons/react/24/solid";
import { CardData, PersonaData } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Typing from "./Typing";
import { reply } from "@/lib/reply";

interface ChatBarProps {
  chatID: number;
  personaData: PersonaData;
  cardData: CardData;
  isTyping: boolean;
  userInput: string;
  setUserInput: (input: string) => void;
  handleSendMessage: () => void;
  className?: string;
}

export default function ChatBar({
  chatID,
  personaData,
  cardData,
  isTyping,
  userInput,
  setUserInput,
  handleSendMessage,
  className,
  ...rest
}: ChatBarProps) {
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

  return (
    <div className={className}>
      <div className="flex h-fit w-fit items-center ">
        <Typing className="mb-1 ml-4 mt-1" name="Saku" typing={isTyping} />
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
              if (userInput.length != 0) {
                handleSendMessage();
              }
              // Prevent inserting a new line on pressing enter
              e.preventDefault();
            }
          }}
          value={userInput}
          placeholder={`Message @Saku`}
          className="scroll-secondary h-6 max-h-64 w-full resize-none overflow-y-auto bg-inherit px-2 font-[430] leading-6 focus:outline-none"
        />
        {/* Send button */}
        <button
          onClick={() => {
            if (userInput.length != 0) {
              handleSendMessage();
            }
          }}
          className="h-fit w-fit "
        >
          <PaperAirplaneIcon className="h-7 w-7 fill-neutral-400  transition duration-150 ease-out hover:fill-neutral-200  " />
        </button>
      </div>
    </div>
  );
}
