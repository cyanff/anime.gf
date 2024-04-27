/*
  A message component.  
  A message can be from the user or a character.
  Users can copy, edit, regenerate, and rewind messages. 
  Users can only use "regenerate" on the latest message sent by a character.
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
  TrashIcon
} from "@heroicons/react/24/solid";

import { DialogConfig, useApp } from "@/components/AppContext";
import Dropdown from "@/components/Dropdown";
import Tag from "@/components/Tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useShiftKey } from "@/lib/hook/useShiftKey";
import { MessageWithCandidates, MessagesHistory, queries } from "@/lib/queries";
import { reply } from "@/lib/reply";
import { time } from "@/lib/time";
import { MessageCandidate as MessageCandidateI, Message as MessageI } from "@shared/db_types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import Markdown, { Components } from "react-markdown";
import { toast } from "sonner";

type MessageOrCandidate = ({ kind: "message" } & MessageI) | ({ kind: "candidate" } & MessageCandidateI);

interface MessageProps {
  messageWithCandidates: MessageWithCandidates;
  messagesHistory: MessagesHistory;
  personaBundle: PersonaBundle;
  cardBundle: CardBundle;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  handleEdit: () => void;
  editingMessageID: number | null;
  setEditText: (text: string) => void;
  onEditSubmit: (isCandidate: boolean, id: number) => void;
  synChatHistory: () => void;
}

export default function Message({
  messageWithCandidates,
  messagesHistory,
  personaBundle,
  cardBundle,
  isGenerating,
  setIsGenerating,
  handleEdit,
  setEditText,
  editingMessageID,
  onEditSubmit,
  synChatHistory
}: MessageProps) {
  const [messagesOrCandidates, setMessageOrCandidate] = useState<MessageOrCandidate[]>(() => {
    const ret: MessageOrCandidate[] = [];
    ret.push({ kind: "message", ...messageWithCandidates });
    messageWithCandidates.candidates.forEach((candidate) => {
      ret.push({ kind: "candidate", ...candidate });
    });
    return ret;
  });

  const [idx, setIDX] = useState(() => {
    if (messageWithCandidates.prime_candidate_id) {
      return messageWithCandidates.candidates.findIndex((c) => c.id === messageWithCandidates.prime_candidate_id) + 1;
    }
    return 0;
  });

  const isLatest;

  const editFieldRef = useRef<HTMLDivElement>(null);
  const isShiftKeyPressed = useShiftKey();
  const { createDialog } = useApp();

  const { id: messageID, chat_id: chatID, sender } = messageWithCandidates;
  const isEditing = editingMessageID === messageWithCandidates.id;
  const { name, avatar } =
    messageWithCandidates.sender === "user"
      ? { name: personaBundle.data.name, avatar: personaBundle.avatarURI }
      : { name: cardBundle.data.character.name, avatar: cardBundle.avatarURI };

  // When the user switches between messages, update the "prime candidate" column in the database accordingly
  useEffect(() => {
    const messageOrCandidate = messagesOrCandidates[idx];
    if (messageOrCandidate.kind === "message") {
      queries.updateMessagePrimeCandidate(messageID, null);
      return;
    } else {
      queries.updateMessagePrimeCandidate(messageID, messageOrCandidate.id);
    }
  }, [idx]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageWithCandidates.text);
    toast.success("Message copied to clipboard!");
  };

  const handleCopyText = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast.success("Selection copied to clipboard!");
    }
  };

  // Focus on the edit field when the user starts editing
  useEffect(() => {
    if (!isEditing) return;
    setEditText(messageWithCandidates.text);
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

  const roleAlignStyles = sender === "user" ? "self-end" : "self-start";
  const roleColorStyles = sender === "user" ? "bg-chat-user-grad" : "bg-chat-character-grad";
  const editingStyles = isEditing ? "outline-2 outline-dashed outline-tx-secondary" : "";
  const baseStyles = `h-fit flex items-start space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-95 text-tx-primary rounded-3xl group/msg`;
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
                <MessagePopoverContent sender={sender} personaBundle={personaBundle} cardBundle={cardBundle} />
              </Popover>
              <div className="flex flex-col justify-start space-y-0.5">
                {/* Name */}
                <div className="flex h-fit flex-row items-center justify-between space-x-3">
                  <div className=" text-base font-semibold text-tx-primary">{name}</div>
                  <MessageDropdownMenu
                    isLatest={isLatest}
                    isLatestCharacterMessage={isLatestCharacterMessage}
                    handleCopy={handleCopy}
                    handleCopyText={handleCopyText}
                    handleEdit={handleEdit}
                    handleRegenerate={handleRegenerate}
                    handleRewind={handleRewind}
                    handleDelete={handleDelete}
                  />
                </div>
                {isEditing ? (
                  // Show edit field if editing
                  <div
                    ref={editFieldRef}
                    className="scroll-secondary h-auto w-full overflow-y-scroll text-wrap break-all bg-transparent text-left focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        onEditSubmit(idx !== 0, messages[idx].id);
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => setEditText(e.currentTarget.textContent!)}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                  >
                    {messageWithCandidates.text}
                  </div>
                ) : (
                  <Markdown
                    allowedElements={["p", "blockquote", "strong", "em"]}
                    unwrapDisallowed
                    skipHtml
                    className="whitespace-pre-wrap"
                    components={sender === "user" ? userMarkdown : characterMarkdown}
                  >
                    {messageWithCandidates.text}
                  </Markdown>
                )}
              </div>
            </div>

            <MessageContextMenuContent
              isLatest={isLatest}
              isLatestCharacterMessage={isLatestCharacterMessage}
              handleCopy={handleCopy}
              handleCopyText={handleCopyText}
              handleEdit={handleEdit}
              handleRegenerate={handleRegenerate}
              handleRewind={handleRewind}
              handleDelete={handleDelete}
            />
          </ContextMenuTrigger>

          {/* Regeneration Controls
              - if latest character message
                - if there are candidate messages:
                  - show <  1 / n  > candidate selector
                  - default to showing the prime candidate if it exists
                - else :
                  - show regenerate button
              - else:
                - show message text 
          */}
          {isLatestCharacterMessage &&
            /* Show the candidate selector if there are multiple candidates */
            (messages.length > 1 ? (
              <div className="flex flex-row items-center space-x-2 p-2">
                {/* Left Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    handleChangeMessage(idx - 1);
                  }}
                >
                  <ChevronLeftIcon className="size-5 text-tx-tertiary" />
                </button>
                <p className="font-mono text-sm font-semibold text-tx-tertiary">{`${idx + 1}/${messages.length}`}</p>
                {/* Right Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    handleChangeMessage(idx + 1);
                  }}
                >
                  <ChevronRightIcon className="size-5 text-tx-tertiary" />
                </button>
              </div>
            ) : (
              <div className="px-2 py-1">
                {/* Regenrate */}
                <button className="size-6">
                  <ArrowPathIcon className="size-6 text-tx-tertiary" onClick={handleRegenerate} />
                </button>
              </div>
            ))}
        </div>
      </ContextMenu>
    </div>
  );
}

interface MessagePopoverContentProps {
  sender: "user" | "character";
  personaBundle: PersonaBundle;
  cardBundle: CardBundle;
}

function MessagePopoverContent({ sender, personaBundle, cardBundle }: MessagePopoverContentProps) {
  if (sender === "user") {
    const bannerURI = "default_banner.png";
    const avatarURI = personaBundle.avatarURI || "default_avatar.png";

    // USER popover
    return (
      <PopoverContent className="scroll-secondary bg-float max-h-[30rem] w-96 overflow-y-scroll p-0 pb-10">
        <MessagePopoverBanner bannerURI={bannerURI} avatarURI={avatarURI} />
        <div className="px-6 pt-12">
          <div className="flex flex-row">
            <div className="pr-10">
              <div className="pb-1.5 text-xl font-semibold">{personaBundle.data.name}</div>
            </div>
          </div>
          {/* User details dropdowns */}
          <div className="-mx-2 mt-3 flex flex-col rounded-lg bg-container-primary p-3 space-y-4">
            <h3 className="mb-1 font-semibold text-tx-primary">About</h3>
            <p className="text-sm text-tx-secondary">{personaBundle.data.description} </p>
          </div>
        </div>
      </PopoverContent>
    );
  } else {
    const bannerURI = cardBundle.bannerURI;
    const avatarURI = cardBundle.avatarURI;

    // CHARACTER popover
    return (
      <PopoverContent className="scroll-secondary h-[30rem] w-96 overflow-y-scroll bg-float p-0">
        <MessagePopoverBanner bannerURI={bannerURI} avatarURI={avatarURI} />
        <div className="pl-4 pr-2 pt-12">
          <div className="flex flex-row">
            <div className="pr-10">
              <div className="pb-1.5 text-xl font-semibold text-tx-primary">{cardBundle.data.character.name}</div>
              <div className="whitespace-nowrap text-xs text-tx-tertiary font-[550]">
                <p className="">{`created: ${time.isoToFriendly(cardBundle.data.meta.created_at)}`}</p>
                {cardBundle.data.meta.updated_at && <p className="">{`updated: ${cardBundle.data.meta.updated_at}`}</p>}
              </div>
            </div>
            {/* Tags */}
            <div className="flex flex-col gap-y-2">
              <div className="text-sm font-semibold text-tx-primary">Tags:</div>
              <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                {cardBundle.data.meta.tags.map((tag, idx) => (
                  <Tag key={idx} text={tag} />
                ))}
              </div>
            </div>
          </div>
          {/* Character details dropdowns */}
          <div className="mt-6">
            <Dropdown label="Character Description" content={cardBundle.data.character.description} />
            <Dropdown label="Character Persona" content={cardBundle.data.meta.notes ?? ""} />
            <Dropdown label="Greeting Message" content={cardBundle.data.character.greeting} />
            <Dropdown label="Example Messages" content={cardBundle.data.character.msg_examples} />
          </div>
        </div>
      </PopoverContent>
    );
  }
}

function MessagePopoverBanner({ bannerURI, avatarURI }: { bannerURI: string; avatarURI: string }) {
  return (
    <div className="relative w-full rounded-lg">
      <img src={bannerURI || "default_banner.png"} alt="Banner" className="h-36 w-full object-cover" />
      <img
        src={avatarURI || "default_avatar.png"}
        alt="Profile"
        className="absolute -bottom-12 left-4 size-20 rounded-full border-4 object-cover object-top border-float"
      />
    </div>
  );
}

interface MenuProps {
  isLatest: boolean;
  isLatestCharacterMessage: boolean;
  handleCopy: () => void;
  handleCopyText: () => void;
  handleEdit: () => void;
  handleRegenerate: () => void;
  handleRewind: () => void;
  handleDelete: () => void;
}

function MessageDropdownMenu({
  isLatest,
  isLatestCharacterMessage,
  handleCopy,
  handleCopyText,
  handleEdit,
  handleRegenerate,
  handleRewind,
  handleDelete
}: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisHorizontalIcon className="size-6 cursor-pointer opacity-0 transition duration-75 ease-out group-hover/msg:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleCopy}>
            Copy
            <DropdownMenuShortcut className="">
              <ClipboardDocumentIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleEdit}>
            Edit
            <DropdownMenuShortcut>
              <PencilIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {isLatestCharacterMessage && (
            <DropdownMenuItem onSelect={handleRegenerate}>
              Regenerate
              <DropdownMenuShortcut>
                <ArrowPathIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {!isLatest && (
            <DropdownMenuItem onSelect={handleRewind}>
              Rewind
              <DropdownMenuShortcut>
                <BackwardIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onSelect={handleCopyText}>
            Copy Selected
            <DropdownMenuShortcut>
              <ClipboardDocumentIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleDelete}>
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
  isLatest,
  isLatestCharacterMessage,
  handleCopy,
  handleCopyText,
  handleEdit,
  handleRegenerate,
  handleRewind,
  handleDelete
}: MenuProps) {
  return (
    <ContextMenuContent className="w-40">
      <ContextMenuItem onSelect={handleCopy} className="">
        Copy
        <ContextMenuShortcut>
          <ClipboardDocumentIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={handleEdit}>
        Edit
        <ContextMenuShortcut>
          <PencilIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      {isLatestCharacterMessage && (
        <ContextMenuItem onSelect={handleRegenerate}>
          Regenerate
          <ContextMenuShortcut>
            <ArrowPathIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {!isLatest && (
        <ContextMenuItem onSelect={handleRewind}>
          Rewind
          <ContextMenuShortcut>
            <BackwardIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}
      <ContextMenuItem onSelect={handleCopyText}>
        Copy Selected
        <ContextMenuShortcut>
          <ClipboardDocumentIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onSelect={handleDelete}>
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
