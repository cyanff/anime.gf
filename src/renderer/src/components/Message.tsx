/*
  A message component.  
  A message can be from the user or a character.
  Users can copy, edit, regenerate, and rewind messages. 
  Users can only use "regenerate" on the latest message that is sent by a character.
  Users can only use "rewind" on any message that is not the latest message.
*/

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  ArrowPathIcon,
  BackwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon
} from "@heroicons/react/24/solid";

import { DialogConfig, useApp } from "@/components/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useShiftKey } from "@/lib/hook/useShiftKey";
import { render } from "@/lib/macros";
import { MessageHistory, MessageWithCandidates, queries } from "@/lib/queries";
import { reply } from "@/lib/reply";
import { MessageCandidate as MessageCandidateI, Message as MessageI } from "@shared/db_types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { useEffect, useMemo, useRef, useState } from "react";
import Markdown, { Components } from "react-markdown";
import { toast } from "sonner";
import { ProfilePopoverContent } from "./ProfilePopoverContent";

type Choices = ({ kind: "message" } & MessageI) | ({ kind: "candidate" } & MessageCandidateI);

interface MessageProps {
  message: MessageWithCandidates;
  messagesHistory: MessageHistory;
  personaBundle: PersonaBundle;
  cardBundle: CardBundle;
  editingMessageID: number | null;
  setEditingMessageID: (id: number | null) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  syncMessageHistory: () => void;
}

const getChoices = (message: MessageWithCandidates): Choices[] => {
  const ret: Choices[] = [{ kind: "message", ...message }];
  message.candidates.forEach((candidate) => {
    ret.push({ kind: "candidate", ...candidate });
  });
  return ret;
};
const getIDX = (message: MessageWithCandidates) => {
  if (message.prime_candidate_id) {
    return message.candidates.findIndex((c) => c.id === message.prime_candidate_id) + 1;
  }
  return 0;
};

export default function Message({
  message,
  messagesHistory,
  personaBundle,
  cardBundle,
  isGenerating,
  setIsGenerating,
  editingMessageID,
  setEditingMessageID,
  syncMessageHistory
}: MessageProps) {
  const editFieldRef = useRef<HTMLDivElement>(null);
  const isShiftKeyPressed = useShiftKey();
  const { createDialog } = useApp();
  const { id: messageID, chat_id: chatID, sender } = message;
  const isEditing = editingMessageID === messageID;
  const [editText, setEditText] = useState("");
  const { name, avatar } =
    sender === "user"
      ? { name: personaBundle.data.name, avatar: personaBundle.avatarURI }
      : { name: cardBundle.data.character.name, avatar: cardBundle.avatarURI };
  const isLatest = useMemo(
    () => messagesHistory.length > 0 && messagesHistory[messagesHistory.length - 1].id === messageID,
    [messagesHistory, messageID]
  );
  const [choices, setChoices] = useState<Choices[]>(getChoices(message));
  const [idx, setIDX] = useState(() => getIDX(message));
  useEffect(() => {
    setChoices(getChoices(message));
    setIDX(getIDX(message));
  }, [message]);
  const text = choices[idx].text;

  // When the user switches between messages, update the "prime candidate" column in the database accordingly
  useEffect(() => {
    const messageOrCandidate = choices[idx];
    if (messageOrCandidate.kind === "message") {
      queries.updateMessagePrimeCandidate(messageID, null);
      return;
    } else {
      queries.updateMessagePrimeCandidate(messageID, messageOrCandidate.id);
    }
  }, [idx, messageID, choices]);

  // Focus on the edit field when the user starts editing
  useEffect(() => {
    if (!isEditing) return;
    focusEditField();
  }, [isEditing]);

  const focusEditField = () => {
    setTimeout(() => {
      if (editFieldRef.current !== null) {
        // Focus on the edit field
        const editField = editFieldRef.current;
        editField.focus();
        // Place the caret at the end of the text
        const range = document.createRange();
        range.selectNodeContents(editFieldRef.current);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
  };

  const copyTextHandler = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast.success("Selection copied to clipboard!");
    }
  };

  const changeChoiceHandler = (idx: number) => {
    // If the message  change to is out of bounds, regenerate the message
    if (idx === choices.length) {
      regenerateHandler();
      return;
    }
    // If user is currently in message edit mode, change the edit field to the new message
    if (isEditing) {
      setEditText(choices[idx].text);
      focusEditField();
    }
    const clampedValue = Math.min(Math.max(idx, 0), choices.length - 1);
    setIDX(clampedValue);
  };

  const editSubmitHandler = async () => {
    setEditingMessageID(null);

    try {
      const id = choices[idx].id;
      const renderMacrosRes = render(editText, { cardData: cardBundle.data, personaData: personaBundle.data });
      const renderedEditText = renderMacrosRes.kind === "err" ? editText : renderMacrosRes.value;

      if (choices[idx].kind === "message") {
        await queries.updateMessageText(id, renderedEditText);
      } else {
        await queries.updateCandidateMessage(id, renderedEditText);
      }
    } catch (e) {
      toast.error(`Failed to edit the message. Error: ${e}`);
      console.error(e);
    } finally {
      syncMessageHistory();
    }
  };

  const editHandler = async () => {
    setEditingMessageID(messageID);
    const text = choices[idx].text;
    setEditText(text);
  };

  const rewindHandler = () => {
    const rewind = async () => {
      try {
        await queries.resetChatToMessage(chatID, messageID);
      } catch (e) {
        toast.error(`Failed to rewind chat. Error: ${e}`);
        console.error(e);
      } finally {
        syncMessageHistory();
      }
    };

    if (isShiftKeyPressed) {
      rewind();
    } else {
      const config: DialogConfig = {
        title: "Rewind Chat",
        actionLabel: "Rewind",
        description:
          "Are you sure you want to rewind the chat to this message? Rewinding will delete all messages that were sent after this message.",
        onAction: rewind
      };
      createDialog(config);
    }
  };
  const deleteHandler = () => {
    const deleteMessage = async () => {
      try {
        await queries.deleteMessage(messageID);
      } catch (e) {
        toast.error(`Failed to delete message. Error: ${e}`);
        console.error(e);
      } finally {
        syncMessageHistory();
      }
    };

    if (isShiftKeyPressed) {
      deleteMessage();
    } else {
      const config: DialogConfig = {
        title: "Delete Message",
        actionLabel: "Delete",
        description: "Are you sure you want to delete this message?",
        onAction: deleteMessage
      };
      createDialog(config);
    }
  };

  const regenerateHandler = async () => {
    if (isGenerating) {
      toast.info("Already generating a reply. Please wait...");
      return;
    }
    setIsGenerating(true);
    try {
      const replyRes = await reply.regenerate(chatID, messageID, cardBundle.data, personaBundle.data);
      if (replyRes.kind === "err") throw replyRes.error;
      const candidateID = await queries.insertCandidateMessage(messageID, replyRes.value);
      await queries.setCandidateMessageAsPrime(messageID, candidateID);
    } catch (e) {
      toast.error(`Failed to regenerate a reply. Error: ${e}`);
      console.error(e);
    } finally {
      setIsGenerating(false);
      syncMessageHistory();
    }
  };

  const continueHandler = async () => {
    if (isGenerating) {
      toast.info("Already generating a reply. Please wait...");
      return;
    }
    setIsGenerating(true);
    try {
      const replyRes = await reply.continue_(chatID, cardBundle.data, personaBundle.data);
      if (replyRes.kind === "err") throw replyRes.error;
      await queries.insertMessage(chatID, replyRes.value, "character");
    } catch (e) {
      toast.error(`Failed to regenerate a reply. Error: ${e}`);
      console.error(e);
    } finally {
      setIsGenerating(false);
      syncMessageHistory();
    }
  };

  const isCharacter = sender === "character";
  const isFirst = messagesHistory.length > 0 && messagesHistory[0].id === messageID;
  const showRegenerate = isLatest && isCharacter && !isFirst;
  const showRewind = !isLatest;
  const showContinue = isLatest && isCharacter;
  const menuProps = {
    showContinue,
    showRegenerate,
    showRewind,
    onCopy: copyHandler,
    onCopyText: copyTextHandler,
    onEdit: editHandler,
    onRegenerate: regenerateHandler,
    onRewind: rewindHandler,
    onDelete: deleteHandler,
    onContinue: continueHandler
  };

  const roleAlignStyles = sender === "user" ? "self-end" : "self-start";
  const roleColorStyles = sender === "user" ? "bg-chat-user-grad" : "bg-chat-character-grad";
  const editingStyles = isEditing ? "outline-2 outline-dashed outline-tx-secondary" : "";
  const baseStyles =
    "h-fit flex items-start space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-95 transition duration-200 ease-out text-tx-primary rounded-3xl group/msg";
  return (
    <div className={cn("max-w-3/4 shrink-0", roleAlignStyles)}>
      <ContextMenu>
        {/* Right Click Menu*/}
        <div className="flex flex-col">
          <ContextMenuTrigger>
            {/* Message Component */}
            <div className={cn(baseStyles, editingStyles, roleColorStyles)}>
              <Popover>
                <PopoverTrigger className="m-1.5 shrink-0">
                  <img
                    className="size-12 select-none rounded-full object-cover object-top"
                    draggable="false"
                    src={avatar || "default_avatar.png"}
                    alt="Avatar"
                  />
                </PopoverTrigger>
                <ProfilePopoverContent type={sender} bundle={sender === "user" ? personaBundle : cardBundle} />
              </Popover>
              <div className="flex flex-col justify-start space-y-0.5">
                {/* Name */}
                <div className="flex h-fit flex-row items-center justify-between space-x-3">
                  <div className=" text-base font-semibold text-tx-primary">{name}</div>
                  <MessageDropdownMenu {...menuProps} />
                </div>
                {isEditing ? (
                  // Show edit field if editing
                  <div
                    ref={editFieldRef}
                    className="scroll-secondary whitespace-pre-line h-auto w-full overflow-y-scroll text-wrap break-all bg-transparent text-left focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        editSubmitHandler();
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => setEditText(e.currentTarget.textContent!)}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                  >
                    {text}
                  </div>
                ) : (
                  // Show the message if not editing
                  <Markdown
                    allowedElements={["p", "blockquote", "strong", "em"]}
                    unwrapDisallowed
                    skipHtml
                    className="whitespace-pre-wrap"
                    components={sender === "user" ? userMarkdown : characterMarkdown}
                  >
                    {text}
                  </Markdown>
                )}
              </div>
            </div>
            <MessageContextMenuContent {...menuProps} />
          </ContextMenuTrigger>

          {showRegenerate &&
            /* Show the selector arrows if there are multiple candidates */
            (message.candidates.length > 0 ? (
              <div className="flex flex-row items-center space-x-2 p-2">
                {/* Left Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    changeChoiceHandler(idx - 1);
                  }}
                >
                  <ChevronLeftIcon className="size-5 text-tx-tertiary" />
                </button>
                <p className="font-mono text-sm font-semibold text-tx-tertiary">{`${idx + 1}/${choices.length}`}</p>
                {/* Right Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    changeChoiceHandler(idx + 1);
                  }}
                >
                  <ChevronRightIcon className="size-5 text-tx-tertiary" />
                </button>
              </div>
            ) : (
              <div className="px-2 py-1">
                {/* Regenrate */}
                <button className="size-6">
                  <ArrowPathIcon className="size-6 text-tx-tertiary" onClick={regenerateHandler} />
                </button>
              </div>
            ))}
        </div>
      </ContextMenu>
    </div>
  );
}

interface MenuProps {
  showContinue: boolean;
  showRegenerate: boolean;
  showRewind: boolean;
  onCopy: () => void;
  onCopyText: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onRewind: () => void;
  onDelete: () => void;
  onContinue: () => void;
}

function MessageDropdownMenu({
  showContinue,
  showRegenerate,
  showRewind,
  onCopy,
  onCopyText,
  onEdit,
  onRegenerate,
  onRewind,
  onDelete,
  onContinue
}: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisHorizontalIcon className="size-6 cursor-pointer opacity-0 transition duration-75 ease-out group-hover/msg:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onCopy}>
            Copy
            <DropdownMenuShortcut className="">
              <ClipboardDocumentIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onEdit}>
            Edit
            <DropdownMenuShortcut>
              <PencilIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {showRegenerate && (
            <DropdownMenuItem onSelect={onRegenerate}>
              Regenerate
              <DropdownMenuShortcut>
                <ArrowPathIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {showRewind && (
            <DropdownMenuItem onSelect={onRewind}>
              Rewind
              <DropdownMenuShortcut>
                <BackwardIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {showContinue && (
            <DropdownMenuItem onSelect={onContinue}>
              Continue
              <DropdownMenuShortcut>
                <PlayIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={onCopyText}>
            Copy Selected
            <DropdownMenuShortcut>
              <ClipboardDocumentIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={onDelete}>
            Delete
            <DropdownMenuShortcut>
              <TrashIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageContextMenuContent({
  showContinue,
  showRegenerate,
  showRewind,
  onCopy,
  onCopyText,
  onEdit,
  onRegenerate,
  onRewind,
  onDelete,
  onContinue
}: MenuProps) {
  return (
    <ContextMenuContent className="w-40">
      <ContextMenuItem onSelect={onCopy} className="">
        Copy
        <ContextMenuShortcut>
          <ClipboardDocumentIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={onEdit}>
        Edit
        <ContextMenuShortcut>
          <PencilIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      {showRegenerate && (
        <ContextMenuItem onSelect={onRegenerate}>
          Regenerate
          <ContextMenuShortcut>
            <ArrowPathIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {showRewind && (
        <ContextMenuItem onSelect={onRewind}>
          Rewind
          <ContextMenuShortcut>
            <BackwardIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {showContinue && (
        <ContextMenuItem onSelect={onContinue}>
          Continue
          <ContextMenuShortcut>
            <PlayIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}
      <ContextMenuItem onSelect={onCopyText}>
        Copy Selected
        <ContextMenuShortcut>
          <ClipboardDocumentIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onSelect={onDelete}>
        Delete
        <ContextMenuShortcut>
          <TrashIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

const userMarkdown: Partial<Components> = {
  em: ({ children }) => <span className="font-[550] italic text-tx-primary">{children}</span>,
  strong: ({ children }) => <span className="pr-1 font-bold text-tx-primary">{children}</span>,
  blockquote: ({ children }) => {
    return (
      <div className="flex items-stretch font-medium italic text-tx-secondary">
        <div className="mr-3 min-h-8 w-[5px] shrink-0 rounded-sm bg-chat-user-blockquote-bar" />
        {children}
      </div>
    );
  }
};

const characterMarkdown: Partial<Components> = {
  em: ({ children }) => <span className="pr-1 font-[550] italic text-tx-secondary">{children}</span>,
  strong: ({ children }) => <span className="pr-1 font-bold text-tx-primary">{children}</span>,
  blockquote: ({ children }) => {
    return (
      <div className="flex items-stretch font-medium italic text-tx-secondary">
        <div className="mr-3 min-h-8 w-[5px] shrink-0 rounded-sm bg-chat-character-blockquote-bar" />
        {children}
      </div>
    );
  }
};
