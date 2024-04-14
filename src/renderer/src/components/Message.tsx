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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { queries } from "@/lib/queries";
import { UIMessageCandidate } from "@shared/types";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface MessageProps {
  className?: string;
  messageID: number;
  avatar: string | null;
  name: string;
  timestring: string;
  sender: "user" | "character";
  candidates: UIMessageCandidate[];
  candidatesIDX: number;
  isLatest: boolean;
  isLatestCharacterMessage: boolean;
  isEditing: boolean;
  handleEdit: () => void;
  setEditText: (text: string) => void;
  handleEditSubmit: () => void;
  handleRegenerate: () => void;
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
  candidates,
  candidatesIDX,
  isLatest,
  isLatestCharacterMessage,
  isEditing,
  handleEdit,
  setEditText,
  handleEditSubmit,
  handleRegenerate,
  handleDelete,
  ...rest
}: MessageProps) {
  const roleAlignStyles = sender === "user" ? "self-end" : "self-start";
  const roleColorStyles = sender === "user" ? "bg-[#87375f] outline-neutral-400" : "bg-grad-gray outline-neutral-500";
  const editingStyles = isEditing ? "outline-2 outline-dashed" : "";
  const baseStyles = `h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-95 transition duration-200 ease-in text-neutral-200 rounded-3xl group/msg`;
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

  const handleRewind = () => {};

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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(" max-w-3/4 shrink-0", roleAlignStyles)}
    >
      <ContextMenu>
        {/* Right Click Menu*/}
        <div className="flex flex-col">
          <ContextMenuTrigger>
            {/* Message Component */}
            <div {...rest} className={cn(baseStyles, editingStyles, roleColorStyles, className)}>
              <button className="size-12 shrink-0 select-none ">
                <img
                  className="size-12  rounded-full object-cover object-top"
                  src={avatar || "default_avatar.png"}
                  alt="Avatar"
                />
              </button>
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
                  // Display the appropriate message or candidate message
                  <p className="break-normal">{candidate.text}</p>
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
    </motion.div>
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

export default Message;
