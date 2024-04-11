import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  ClipboardDocumentIcon,
  ClipboardIcon,
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
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/components/AppContext";

interface MessageProps {
  className?: string;
  messageID: number;
  avatar: string | null;
  name: string;
  timestamp: string;
  text: string;
  sender: "user" | "character";
  [rest: string]: any;
}

function Message({ className, avatar, name, timestamp, text, sender, ...rest }: MessageProps) {
  const byUser = sender === "user";
  const roleAlign = byUser ? "self-end" : "self-start";
  const roleColor = byUser ? "bg-[#87375f]" : "bg-grad-gray";
  const baseStyles =
    "h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-90 transition duration-200 ease-in text-neutral-200 rounded-3xl";

  const { createDialog } = useApp();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleEdit = () => {};

  // TODO: hold shift to skip delete confirmation
  const handleDelete = () => {};

  const handleRegenerate = () => {};

  const handleRewind = () => {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn("group/msg max-w-3/4 shrink-0", roleAlign)}
    >
      <ContextMenu>
        {/* Right Click Menu*/}
        <ContextMenuTrigger>
          <div {...rest} className={cn(baseStyles, roleColor, className)}>
            <img
              className="size-11 shrink-0 rounded-full object-cover object-top"
              src={avatar || "default_avatar.png"}
              alt="Avatar"
            />
            <div className="flex flex-col justify-start space-y-0.5">
              {/* Username and Timestamp */}
              <div className="flex h-fit flex-row items-center justify-between space-x-3">
                <div className=" text-base font-semibold text-white">{name}</div>
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
                      <DropdownMenuItem disabled>
                        Delete
                        <DropdownMenuShortcut>
                          <WrenchScrewdriverIcon className="size-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        Regenerate
                        <DropdownMenuShortcut>
                          <WrenchScrewdriverIcon className="size-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        Rewind
                        <DropdownMenuShortcut>
                          <WrenchScrewdriverIcon className="size-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-left">{text}</p>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-36">
          <ContextMenuItem className="">
            Copy
            <ContextMenuShortcut>
              <ClipboardDocumentIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled>
            Delete
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Regenerate
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Rewind
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );
}

export default Message;
