import { queries } from "@/lib/queries";
import { reply } from "@/lib/reply";
import { cn } from "@/lib/utils";
import { PaperAirplaneIcon, PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
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
  const requestUUIDRef = useRef<string | null>(null);

  const prompt = `Message ${
    cardBundle.data.character.handle?.length ? `@${cardBundle.data.character.handle}` : cardBundle.data.character.name
  }`;

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

  const sendMessageHandler = async () => {
    if (isGenerating) return;
    const cachedUserInput = userInput;
    setUserInput("");
    setIsGenerating(true);
    onMessageSend(userInput);
    try {
      const requestSentHandler = (uuid: string) => {
        requestUUIDRef.current = uuid;
      };
      const replyRes = await reply.generate(chatID, cardBundle.data, personaBundle.data, userInput, requestSentHandler);
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
      requestUUIDRef.current = null;
      setIsGenerating(false);
    }
  };

  const cancelGenerationHandler = async () => {
    console.log("Cancelling generation...");
    console.log("requestUUID: ", requestUUIDRef.current);
    console.log("isGenerating: ", isGenerating);

    if (!isGenerating) return;
    if (requestUUIDRef.current === null) return;
    const res = await window.api.xfetch.abort(requestUUIDRef.current);
    console.log(res);
  };

  return (
    <div className="mb-1 mr-5">
      <div className="flex h-fit w-fit items-center ">
        <Typing className="mb-1 ml-4 mt-1" name={cardBundle.data.character.name} typing={isGenerating} />
      </div>
      <div className="flex min-h-fit w-full shrink-0 space-x-2 overflow-auto rounded-3xl bg-input-primary p-4">
        <button className="flex size-7 items-center justify-center">
          <PlusCircleIcon
            className={` size-7 transition duration-150 ease-out hover:brightness-90 fill-action-tertiary`}
            onClick={() => {
              toast("Coming in a future update!");
            }}
          />
        </button>
        {/* Textarea wrapper */}
        <textarea
          disabled={isGenerating}
          onInput={(e) => setUserInput(e.currentTarget.value)}
          ref={textAreaRef}
          maxLength={1024}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (userInput.length != 0) {
                sendMessageHandler();
              }
              // Prevent inserting a new line on pressing enter
              e.preventDefault();
            }
          }}
          value={userInput}
          placeholder={prompt}
          className="scroll-secondary text-tx-primary h-6 max-h-64 w-full resize-none overflow-y-auto bg-inherit px-2 leading-6
            placeholder:select-none focus:outline-none disabled:cursor-not-allowed"
        />
        {/* Send button */}
        <button
          onClick={() => {
            if (isGenerating) {
              cancelGenerationHandler();
            } else {
              if (userInput.length === 0) return;
              sendMessageHandler();
            }
          }}
          className="h-fit w-fit "
        >
          {isGenerating ? (
            <XCircleIcon
              className={`fill-action-tertiary size-7 transition duration-300 ease-out hover:brightness-90`}
            />
          ) : (
            <PaperAirplaneIcon
              className={`${userInput.length > 0 ? "fill-action-primary" : "fill-action-tertiary"}  size-7 transition  duration-300 ease-out hover:brightness-90`}
            />
          )}
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
