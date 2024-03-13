import { cn } from "@/lib/utils";
import { Squircle } from "@squircle-js/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { EllipsisHorizontalIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

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

interface Props {
  className?: string;
  avatar: string | null;
  name: string;
  timestamp: string;
  msg: string;
  byUser: boolean;
  // Type for ...rest
  [x: string]: any;
}

function Message({ className, avatar, name, timestamp, msg, byUser, ...rest }: Props) {
  const roleAlign = byUser ? "self-end" : "self-start";
  const roleColor = byUser ? "bg-[#87375f]" : "bg-[#363636]";
  const base =
    "h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[480] hover:brightness-90 transition duration-200 ease-in text-neutral-200";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: 1 }}
      className={cn("group/msg max-w-3/4 shrink-0", roleAlign)}
    >
      <ContextMenu>
        {/* Right Click Menu*/}
        <ContextMenuTrigger>
          <Squircle cornerRadius={25} cornerSmoothing={1} {...rest} className={cn(base, roleColor, className)}>
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
                  <DropdownMenuContent className="w-44">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Copy</DropdownMenuItem>
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
                      <DropdownMenuItem disabled>
                        Speak
                        <DropdownMenuShortcut>
                          <WrenchScrewdriverIcon className="size-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-left">{msg}</p>
            </div>
          </Squircle>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          <ContextMenuItem inset className="">
            Copy
            <ContextMenuShortcut></ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset disabled>
            Delete
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Regenerate
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Rewind
            <ContextMenuShortcut>
              <WrenchScrewdriverIcon className="size-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Speak
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

/*

*/
