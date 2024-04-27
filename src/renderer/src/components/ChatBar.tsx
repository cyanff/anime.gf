import { queries } from "@/lib/queries";
import { reply } from "@/lib/reply";
import { cn } from "@/lib/utils";
import { PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { CardBundle, PersonaBundle, Result } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import styles from "../styles/Typing.module.css";

interface ChatBarProps {
  chatID: number;
  personaBundle: PersonaBundle;
  cardBundle: CardBundle;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  onMessageSend: (message: string) => void;
  onMessageResolve(res: Result<void, Error>): void;
}

export default function ChatBar({
  chatID,
  personaBundle,
  cardBundle,
  isGenerating,
  setIsGenerating,
  onMessageSend,
  onMessageResolve
}: ChatBarProps) {
  const [userInput, setUserInput] = useState<string>("");

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

  const handleSendMessage = async () => {
    if (isGenerating) return;
    const cachedUserInput = userInput;
    setUserInput("");
    setIsGenerating(true);
    onMessageSend(userInput);
    try {
      const replyRes = await reply.generate(chatID, cardBundle.data, personaBundle.data, userInput);
      if (replyRes.kind === "err") {
        onMessageResolve(replyRes);
        return;
      }
      const insertRes = await queries.insertMessagePair(chatID, userInput, replyRes.value);
      onMessageResolve(insertRes);
    } catch (e) {
      // Restore user inputs
      setUserInput(cachedUserInput);
      onMessageResolve({ kind: "err", error: e });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-1 mr-5">
      <div className="flex h-fit w-fit items-center ">
        <Typing className="mb-1 ml-4 mt-1" name={cardBundle.data.character.name} typing={isGenerating} />
      </div>
      <div className="flex min-h-fit w-full shrink-0 space-x-2 overflow-auto rounded-3xl bg-input-primary p-4">
        <button className="flex size-7 items-center justify-center">
          <PlusCircleIcon
            className="size-7 transition duration-150 ease-out hover:brightness-90 fill-action-tertiary"
            onClick={() => {
              toast("Coming in a future update!");
            }}
          />
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
          className="scroll-secondary text-tx-primary h-6 max-h-64 w-full resize-none overflow-y-auto bg-inherit px-2 leading-6
            placeholder:select-none focus:outline-none"
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
          <PaperAirplaneIcon className="size-7 fill-action-tertiary transition duration-150 ease-out hover:brightness-90" />
        </button>
      </div>
    </div>
  );
}

interface TypingProps {
  className?: string;
  name: string;
  typing: boolean;
}

function Typing({ className, name, typing }: TypingProps) {
  return (
    <div className={cn(`flex text-tx-secondary items-center space-x-2 ${typing ? "visible" : "invisible"}`, className)}>
      <div>
        <div className={styles.typing__dot}></div>
        <div className={styles.typing__dot}></div>
        <div className={styles.typing__dot}></div>
      </div>
      <p className="text-[0.9rem]">
        <b>{name}</b> is typing
      </p>
    </div>
  );
}
