import { AlertConfig, useApp } from "@/app/app";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { RecentChat as RecentChatI, queries } from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  ArrowPathIcon,
  Cog8ToothIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid";
import { PersonaBundle } from "@shared/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ChatsSideBarProps {
  chatID: number;
  personaBundle: PersonaBundle;
  syncChatHistory: () => void;
  setChatID: (id: number) => void;
}

export default function ChatsSidebar({ chatID, personaBundle, syncChatHistory, setChatID }: ChatsSideBarProps) {
  const [recentChats, setRecentChats] = useState<RecentChatI[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { createAlert } = useApp();

  // Sync recent chats on load
  useEffect(() => {
    syncRecentChats();
  }, []);

  const syncRecentChats = async () => {
    const chatCards = await queries.getRecentChats();
    if (chatCards.kind == "err") {
      return;
    }
    setRecentChats(chatCards.value);
  };

  const sidebarVariants = {
    open: { width: "20rem", display: "block", overflow: "visible", opacity: 1 },
    closed: { width: "0", opacity: 0.2, overflow: "hidden", transitionEnd: { display: "none" } }
  };

  return (
    // Sidebar Collapse Button Wrapper
    <div className="flex h-full items-center">
      {/* Sidebar Motion Wrapper*/}
      <motion.div
        initial={{
          width: "20rem"
        }}
        className="h-full"
        animate={sidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.2, type: "tween" }}
        variants={sidebarVariants}
      >
        <div className="flex h-full w-80 flex-col overflow-hidden rounded-2xl bg-background">
          {/*Top Section */}
          <div className="flex grow flex-col px-2 py-3">
            {/* Search Bar */}
            <div className="mb-2 flex w-full items-center space-x-2 overflow-hidden rounded-full bg-neutral-700 p-0.5">
              <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-neutral-400" />
              <input
                className="h-9 w-full grow bg-neutral-700 text-gray-100 caret-white focus:outline-none"
                placeholder="Search for a chat"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    toast("Escape key pressed");
                  }
                }}
              ></input>
            </div>

            <div className="scroll-secondary my-4 flex h-full max-h-full grow flex-col space-y-1  overflow-auto scroll-smooth">
              {recentChats?.map((chat, idx) => {
                return (
                  <RecentChat
                    key={idx}
                    deleteChat={() => {
                      const alertConfig: AlertConfig = {
                        title: "Delete Chat",
                        description: "Are you sure you want to delete this chat?\nThis action cannot be undone.",
                        // Delete chat, update the recent chats list, and set the chat_id to be another chat
                        actionLabel: "Delete",
                        onAction: async () => {
                          await queries.deleteChat(chat.chat_id);
                          syncRecentChats();
                          setChatID(recentChats[0].chat_id);
                          syncChatHistory();
                        }
                      };
                      createAlert(alertConfig);
                    }}
                    resetChat={() => {
                      const alertConfig: AlertConfig = {
                        title: "Reset Chat",
                        description: "Are you sure you want to reset this chat?\nThis action cannot be undone.",
                        actionLabel: "Reset",
                        onAction: async () => {
                          await queries.resetChat(chat.chat_id);
                          syncChatHistory();
                        }
                      };
                      createAlert(alertConfig);
                    }}
                    cloneChat={() => {
                      // TODO clone chat with the given id
                    }}
                    id={chat.chat_id.toString()}
                    avatarURI={chat.avatarURI || ""}
                    name={chat.name}
                    message={chat.last_message}
                    active={chatID == chat.chat_id}
                    onClick={() => setChatID(chat.chat_id)}
                  />
                );
              })}
            </div>
          </div>
          {/*Bottom Section */}
          <div className="flex h-16 w-full shrink-0 flex-row bg-neutral-700 p-3">
            <div className="relative">
              <img src={personaBundle.avatarURI || ""} alt="Avatar" className="h-10 w-10 rounded-full" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-4 ring-gray-700"></span>
            </div>
            <div className="flex h-full flex-col justify-center p-2">
              <h3 className="font-semibold text-gray-100 ">{personaBundle.data.name}</h3>
              <p className="font-medium text-gray-400">Online</p>
            </div>
            {/* Settings Icon */}
            <div className="flex grow items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Cog8ToothIcon className=" ml-5 size-6 cursor-pointer text-neutral-400 transition duration-300 ease-out hover:rotate-180 hover:text-neutral-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Placeholder</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled>
                      Placeholder
                      <DropdownMenuShortcut>
                        <WrenchScrewdriverIcon className="size-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      Placeholder
                      <DropdownMenuShortcut>
                        <WrenchScrewdriverIcon className="size-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      Placeholder
                      <DropdownMenuShortcut>
                        <WrenchScrewdriverIcon className="size-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      Placeholder
                      <DropdownMenuShortcut>
                        <WrenchScrewdriverIcon className="size-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Sidebar Toggle Button */}
      <button
        className={`group ${sidebarOpen ? "ml-1.5" : "-ml-2"} flex h-10 w-3.5 items-center justify-center rounded-full`}
        onClick={() => {
          setSidebarOpen(!sidebarOpen);
        }}
      >
        <div className="h-10 w-1.5 rounded-full bg-neutral-700 transition duration-100 ease-out group-hover:bg-neutral-500"></div>
      </button>
    </div>
  );
}
interface RecentChatProps {
  id: string;
  name: string;
  avatarURI: string;
  message: string;
  active: boolean;
  deleteChat: () => void;
  resetChat: () => void;
  cloneChat: () => void;
  className?: string;
  [x: string]: any;
}

function RecentChat({
  id,
  name,
  avatarURI,
  message,
  active,
  deleteChat,
  resetChat,
  cloneChat,
  className,
  ...rest
}: RecentChatProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          {...rest}
          className={cn(
            `group flex w-full cursor-pointer items-center space-x-3 
        rounded-lg p-2.5 transition duration-150 ease-out hover:bg-accent 
        ${active ? "bg-neutral-700 text-gray-100" : "text-gray-400"}`,
            className
          )}
        >
          <img className="size-12 shrink-0 rounded-full object-cover object-top" src={avatarURI} alt="avatar" />
          <div className={`flex h-full max-w-full flex-col justify-center group-hover:text-gray-100`}>
            <h3 className="line-clamp-1 font-[550]">{name}</h3>
            <p className="line-clamp-1 text-[15px] font-[430]">{message}</p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 px-1 py-2">
        <ContextMenuItem onSelect={deleteChat}>
          Delete Chat
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={resetChat}>
          Reset Chat
          <ContextMenuShortcut>
            <ArrowPathIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Clone Chat
          <ContextMenuShortcut>
            <DocumentDuplicateIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
