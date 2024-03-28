import { PaperClipIcon } from "@heroicons/react/24/outline";
import {
  Bars3Icon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  WrenchIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import Typing from "./Typing";
import { cn } from "@/lib/utils";

interface ChatBarProps {
  handleSendMessage: (userInput: string) => void;
  typing: boolean;
  className?: string;
}

export default function ChatBar({ handleSendMessage, typing, className, ...rest }: ChatBarProps) {
  const [userInput, setUserInput] = useState("");

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
