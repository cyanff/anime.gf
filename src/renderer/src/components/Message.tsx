import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ClipboardDocumentIcon, EllipsisHorizontalIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenu
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/components/AppContext";
import { useRef, useState } from "react";

interface MessageProps {
  className?: string;
  messageID: number;
  avatar: string | null;
  name: string;
  timestring: string;
  text: string;
  sender: "user" | "character";
  isLatest: boolean;
  isLatestCharacterMessage: boolean;
  isEditing: boolean;
  setEditingMessageID: (id: number | null) => void;
  [rest: string]: any;
}

function Message({
  className,
  messageID,
  avatar,
  name,
  timestring,
  text,
  sender,
  isLatest,
  isLatestCharacterMessage,
  isEditing,
  setEditingMessageID,
  ...rest
}: MessageProps) {
  const roleAlignStyles = sender === "user" ? "self-end" : "self-start";
  const roleColorStyles = sender === "user" ? "bg-[#87375f] outline-neutral-400" : "bg-grad-gray outline-neutral-500";
  const editingStyles = isEditing ? "outline-2 outline-dashed" : "";
  const baseStyles = `h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-90 transition duration-200 ease-in text-neutral-200 rounded-3xl`;

  const { createDialog } = useApp();
  const [editText, setEditText] = useState("");
  const editFieldRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleEdit = () => {
    setEditText(text);
    setEditingMessageID(messageID);
    // Execute after the next render
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

  const handleEditSubmit = () => {
    setEditingMessageID(null);
    // Update the message
  };

  const handleRegenerate = () => {};
  const handleRewind = () => {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn("group/msg max-w-3/4 shrink-0", roleAlignStyles)}
    >
      <ContextMenu>
        {/* Right Click Menu*/}
        <ContextMenuTrigger>
          {/* Message Component */}
          <div {...rest} className={cn(baseStyles, editingStyles, roleColorStyles, className)}>
            <img
              className="size-11 shrink-0 rounded-full object-cover object-top"
              src={avatar || "default_avatar.png"}
              alt="Avatar"
            />
            <div className="flex flex-col justify-start space-y-0.5">
              {/* Username and Timestamp */}
              <div className="flex h-fit flex-row items-center justify-between space-x-3">
                <div className=" text-base font-semibold text-white">{name}</div>
                <MessageDropdownMenu
                  isLatest={isLatest}
                  isLatestCharacterMessage={isLatestCharacterMessage}
                  handleCopy={handleCopy}
                  handleEdit={handleEdit}
                  handleRegenerate={handleRegenerate}
                  handleRewind={handleRewind}
                />
              </div>
              {isEditing ? (
                <div
                  ref={editFieldRef}
                  className="scroll-secondary h-auto w-full overflow-y-scroll text-wrap break-all bg-transparent text-left focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleEditSubmit();
                      return;
                    }
                  }}
                  onInput={(e) => setEditText(e.currentTarget.textContent!)}
                  contentEditable={true}
                >
                  {text}
                </div>
              ) : (
                <p className="text-left">{text}</p>
              )}
            </div>
          </div>
          <MessageContextMenuContent
            isLatest={isLatest}
            isLatestCharacterMessage={isLatestCharacterMessage}
            handleCopy={handleCopy}
            handleEdit={handleEdit}
            handleRegenerate={handleRegenerate}
            handleRewind={handleRewind}
          />
        </ContextMenuTrigger>
      </ContextMenu>
    </motion.div>
  );
}

interface MenuProps {
  isLatest: boolean;
  isLatestCharacterMessage: boolean;
  handleCopy: () => void;
  handleEdit: () => void;
  handleRegenerate: () => void;
  handleRewind: () => void;
}

function MessageDropdownMenu({
  isLatest,
  isLatestCharacterMessage,
  handleCopy,
  handleEdit,
  handleRegenerate,
  handleRewind
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
            <DropdownMenuItem disabled>
              Regenerate
              <DropdownMenuShortcut>
                <WrenchScrewdriverIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {!isLatest && (
            <DropdownMenuItem disabled>
              Rewind
              <DropdownMenuShortcut>
                <WrenchScrewdriverIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageContextMenuContent({
  isLatest,
  isLatestCharacterMessage,
  handleCopy,
  handleEdit,
  handleRegenerate,
  handleRewind
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
        <ContextMenuItem disabled>
          Regenerate
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {!isLatest && (
        <ContextMenuItem disabled>
          Rewind
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  );
}

export default Message;
