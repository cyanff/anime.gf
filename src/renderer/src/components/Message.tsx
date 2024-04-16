/*
  A message component that displays a message in the chat. The message can be from the user or a character.
  User messages are displayed on the right side of the chat area, while character messages are displayed on the left side.
  User messages have a magenta background, while character messages have a gray gradient background.
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
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid";

import Dropdown from "@/components/Dropdown";
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
import { queries } from "@/lib/queries";
import { CardBundle, PersonaBundle, UIMessageCandidate } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { toast } from "sonner";

interface MessageProps {
  className?: string;
  messageID: number;
  avatar: string | null;
  name: string;
  timestring: string;
  sender: "user" | "character";
  personaBundle: PersonaBundle;
  cardBundle: CardBundle;
  candidates: UIMessageCandidate[];
  candidatesIDX: number;
  isLatest: boolean;
  isLatestCharacterMessage: boolean;
  isEditing: boolean;
  handleEdit: () => void;
  setEditText: (text: string) => void;
  handleEditSubmit: () => void;
  handleRegenerate: () => void;
  handleRewind: () => void;
  handleDelete: () => void;
  [rest: string]: any;
}

function Message({
  className,
  messageID,
  avatar,
  name,
  timestring,
  sender,
  personaBundle,
  cardBundle,
  candidates,
  candidatesIDX,
  isLatest,
  isLatestCharacterMessage,
  isEditing,
  handleEdit,
  setEditText,
  handleEditSubmit,
  handleRegenerate,
  handleRewind,
  handleDelete,
  ...rest
}: MessageProps) {
  const roleAlignStyles = sender === "user" ? "self-end" : "self-start";
  const roleColorStyles = sender === "user" ? "bg-[#87375f] outline-neutral-400" : "bg-grad-gray outline-neutral-500";
  const editingStyles = isEditing ? "outline-2 outline-dashed" : "";
  const baseStyles = `h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-95  text-neutral-200 rounded-3xl group/msg`;
  const editFieldRef = useRef<HTMLDivElement>(null);
  const [idx, setIDX] = useState(candidatesIDX);
  const candidate = candidates[idx];

  // Update the index when messageAndCandidatesIDX changes
  // This is necessary because the useState(initState) is only called once, and not updated when initState changes
  useEffect(() => {
    setIDX(candidatesIDX);
  }, [candidatesIDX]);

  // When the index changes, update the primary candidate ID in the database
  useEffect(() => {
    if (idx === 0) {
      queries.updateMessagePrimeCandidate(messageID, null);
    } else {
      queries.updateMessagePrimeCandidate(messageID, candidate.id);
    }
  }, [idx]);

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.text);
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
    setEditText(candidate.text);
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

  const handleChangeMessage = (idx: number) => {
    // If the message  change to is out of bounds, regenerate the message
    if (idx === candidates.length) {
      handleRegenerate();
      return;
    }

    if (isEditing) {
      setEditText(candidates[idx].text);
      focusEditField();
    }

    const clampedValue = Math.min(Math.max(idx, 0), candidates.length - 1);
    setIDX(clampedValue);
  };

  return (
    <div className={cn(" max-w-3/4 shrink-0", roleAlignStyles)}>
      <ContextMenu>
        {/* Right Click Menu*/}
        <div className="flex flex-col">
          <ContextMenuTrigger>
            {/* Message Component */}
            <div {...rest} className={cn(baseStyles, editingStyles, roleColorStyles, className)}>
              <Popover>
                <PopoverTrigger className="shrink-0">
                  <img
                    className="size-12  rounded-full object-cover object-top"
                    src={avatar || "default_avatar.png"}
                    alt="Avatar"
                  />
                </PopoverTrigger>
                <MessagePopoverContentProps sender={sender} personaBundle={personaBundle} cardBundle={cardBundle} />
              </Popover>
              <div className="flex flex-col justify-start space-y-0.5">
                {/* Username and Timestamp */}
                <div className="flex h-fit flex-row items-center justify-between space-x-3">
                  <div className=" text-base font-semibold text-white">{name}</div>
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
                        handleEditSubmit();
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => setEditText(e.currentTarget.textContent!)}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                  >
                    {candidate.text}
                  </div>
                ) : (
                  <ReactMarkdown components={sender === "user" ? userMarkdown : characterMarkdown}>
                    {candidate.text}
                  </ReactMarkdown>
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
            (candidates.length > 1 ? (
              <div className="flex flex-row items-center space-x-2 p-2">
                {/* Left Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    handleChangeMessage(idx - 1);
                  }}
                >
                  <ChevronLeftIcon className="size-5 fill-neutral-500" />
                </button>
                <p className="text-sm font-medium">{`${idx + 1} / ${candidates.length}`}</p>
                {/* Right Arrow */}
                <button
                  className="size-5"
                  onClick={() => {
                    handleChangeMessage(idx + 1);
                  }}
                >
                  <ChevronRightIcon className="size-5 fill-neutral-500" />
                </button>
              </div>
            ) : (
              <div className="px-2 py-1">
                {/* Regenrate */}
                <button className="size-6">
                  <ArrowPathIcon className="size-6 fill-neutral-500" onClick={handleRegenerate} />
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

function MessagePopoverContentProps({ sender, personaBundle, cardBundle }: MessagePopoverContentProps) {
  if (sender === "user") {
    const bannerURI = "default_banner.png";
    const avatarURI = personaBundle.avatarURI || "default_avatar.png";

    return (
      <PopoverContent className="scroll-secondary max-h-[30rem] w-96 overflow-y-scroll bg-neutral-800 p-0 pb-10">
        <MessagePopoverBanner bannerURI={bannerURI} avatarURI={avatarURI} />
        <div className="px-6 pt-12">
          <div className="flex flex-row">
            <div className="pr-10">
              <div className="pb-1.5 text-xl font-semibold">{personaBundle.data.name}</div>
            </div>
          </div>
          {/* Character details dropdowns */}
          <div className="-mx-2 mt-3 flex flex-col rounded-lg bg-neutral-900 p-3">
            <h3 className="mb-1 text-lg font-semibold">About</h3>
            <div className="mb-2 h-[1.3px] w-full bg-neutral-700 brightness-75"></div>
            <p className="text-sm font-[450]">{personaBundle.data.description} </p>
          </div>
        </div>
      </PopoverContent>
    );
  } else {
    const bannerURI = cardBundle.bannerURI;
    const avatarURI = cardBundle.avatarURI;

    return (
      <PopoverContent className="scroll-secondary h-[30rem] w-96 overflow-y-scroll bg-neutral-800 p-0">
        <MessagePopoverBanner bannerURI={bannerURI} avatarURI={avatarURI} />
        <div className="pl-4 pr-2 pt-12">
          <div className="flex flex-row">
            <div className="pr-10">
              <div className="pb-1.5 text-xl font-semibold">{cardBundle.data.character.name}</div>
              <div className="whitespace-nowrap text-xs  text-neutral-400 ">
                <p className="font-medium">{`Created: ${cardBundle.data.meta.created_at}`}</p>
                {cardBundle.data.meta.updated_at && (
                  <p className="font-medium">{`Updated: ${cardBundle.data.meta.updated_at}`}</p>
                )}
              </div>
            </div>
            {/* Character tags */}
            <div className="flex flex-col gap-y-2">
              <div className="text-sm font-semibold">Tags:</div>
              <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                {cardBundle.data.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-neutral-700 px-2 py-1.5 text-xs font-[550] text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Character details dropdowns */}
          <div className="mt-6">
            <Dropdown label="Character Description" content={cardBundle.data.character.description} variant="sm" />
            <Dropdown label="Character Persona" content={cardBundle.data.meta.notes ?? ""} variant="sm" />
            <Dropdown label="Greeting Message" content={cardBundle.data.character.greeting} variant="sm" />
            <Dropdown label="Example Messages" content={cardBundle.data.character.msg_examples} variant="sm" />
          </div>
        </div>
      </PopoverContent>
    );
  }
}

function MessagePopoverBanner({ bannerURI, avatarURI }: { bannerURI: string; avatarURI: string }) {
  return (
    <div className="relative w-full rounded-lg">
      <img src={bannerURI} alt="Banner" className="h-36 w-full object-cover" />
      <img
        src={avatarURI}
        alt="Profile"
        className="absolute -bottom-12 left-4 size-20 rounded-full border-[3px] border-neutral-800 object-cover object-top"
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
      <DropdownMenuContent className="w-36">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleCopy}>Copy</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleEdit}>
            Edit
            <DropdownMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {isLatestCharacterMessage && (
            <DropdownMenuItem onSelect={handleRegenerate}>
              Regenerate
              <DropdownMenuShortcut>
                <WrenchScrewdriverIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {!isLatest && (
            <DropdownMenuItem onSelect={handleRewind}>
              Rewind
              <DropdownMenuShortcut>
                <WrenchScrewdriverIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onSelect={handleCopyText}>
            Copy Text
            <DropdownMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleDelete}>
            Delete
            <DropdownMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
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
    <ContextMenuContent className="w-36">
      <ContextMenuItem onSelect={handleCopy}>
        Copy
        <ContextMenuShortcut>
          <ClipboardDocumentIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={handleEdit}>
        Edit
        <ContextMenuShortcut>
          <WrenchScrewdriverIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      {isLatestCharacterMessage && (
        <ContextMenuItem onSelect={handleRegenerate}>
          Regenerate
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {!isLatest && (
        <ContextMenuItem onSelect={handleRewind}>
          Rewind
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}
      <ContextMenuItem onSelect={handleCopyText}>
        Copy Text
        <ContextMenuShortcut>
          <WrenchScrewdriverIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onSelect={handleDelete}>
        Delete
        <ContextMenuShortcut>
          <WrenchScrewdriverIcon className="size-4" />
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

const userMarkdown: Partial<Components> = {};

const characterMarkdown: Partial<Components> = {
  em: ({ children }) => <span className="font-medium italic text-gray-400">{children}</span>,
  strong: ({ children }) => <span className="font-bold text-gray-200">{children}</span>,
  blockquote: ({ children }) => {
    return (
      <div className="flex items-stretch">
        <div className="mr-3 min-h-8 w-[5px] shrink-0 rounded-sm bg-neutral-600" />
        <p className="self-center italic text-neutral-300">{children}</p>
      </div>
    );
  },
  pre: ({ children }) => <span>{children}</span>,
  p: ({ children }) => {
    console.log("Children:", children);
    if (typeof children === "string") {
      const parts = children.split(/"(.*?)"/);

      console.log("Parts:", parts);

      return (
        <div>
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <span key={index} className="font-medium text-rose-300">
                  "{part}"
                </span>
              );
            }
            return part;
          })}
        </div>
      );
    }

    return <span>{children}</span>;
  }
};

export default Message;
