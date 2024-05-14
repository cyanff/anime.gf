import { DialogConfig, useApp } from "@/components/AppContext";
import Avatar from "@/components/Avatar";
import ChatsSearchModal from "@/components/ChatsSearchModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { RecentChatResult, queries } from "@/lib/queries";
import { useChatStore } from "@/lib/store/chatStore";
import { cn } from "@/lib/utils";
import { ArrowPathIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/solid";
import { UIPersonaBundle } from "@shared/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface ChatsSideBarProps {
  chatID: number;
  personaBundle: UIPersonaBundle;
}

export default function ChatsSidebar({ chatID, personaBundle }: ChatsSideBarProps) {
  const [recentChatResults, setRecentChatsResults] = useState<RecentChatResult[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { createModal, createDialog, setActiveChatID } = useApp();
  const { syncMessageHistory } = useChatStore();

  useEffect(() => {
    syncRecentChats();
  }, []);
  const syncRecentChats = async () => {
    const res = await queries.getRecentChatResults();
    if (res.kind == "err") {
      console.error(res.error);
      return;
    }
    setRecentChatsResults(res.value);
  };

  const deleteChatHandler = async (recentChatResult: RecentChatResult) => {
    const config: DialogConfig = {
      title: "Delete Chat",
      description: "Are you sure you want to delete this chat?\nThis action cannot be undone.",
      actionLabel: "Delete",
      // Delete chat, and update the recent chats list, and set the chat_id to be another chat
      onAction: async () => {
        await queries.deleteChat(recentChatResult.value.chat_id);
        syncRecentChats();
      }
    };
    createDialog(config);
  };

  const resetChatHandler = async (recentChatResult: RecentChatResult) => {
    const config: DialogConfig = {
      title: "Reset Chat",
      description: "Are you sure you want to reset this chat?\nThis action cannot be undone.",
      actionLabel: "Reset",
      onAction: async () => {
        const resetTarget = recentChatResult.value.chat_id;
        await queries.resetChat(recentChatResult.value.chat_id);
        if (chatID === resetTarget) {
          syncMessageHistory();
        }
      }
    };
    createDialog(config);
  };

  const sidebarVariants = {
    open: { width: "20rem", display: "block", overflow: "visible", opacity: 1 },
    closed: { width: "0", opacity: 0.2, overflow: "hidden", transitionEnd: { display: "none" } }
  };

  return (
    <div className="flex h-full items-center">
      {/* Sidebar Motion Wrapper*/}
      <motion.div
        className="h-full w-fit"
        initial={{ width: "20rem", display: "block", overflow: "visible", opacity: 1 }}
        animate={sidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.2 }}
        variants={sidebarVariants}
      >
        <div className="bg-nav-secondary flex h-full w-80  flex-col overflow-hidden rounded-3xl">
          {/*Top Section */}
          <div className="flex grow flex-col py-3">
            {/* Search Bar Wrapper*/}
            <div className="mb-2 w-full px-2">
              {/* Search Bar */}
              <div
                className="bg-input-secondary mb-2 flex w-full cursor-pointer items-center space-x-2 overflow-hidden rounded-2xl p-1"
                onClick={() => {
                  createModal(<ChatsSearchModal />);
                }}
              >
                <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-tx-secondary" />
                <Input
                  className="text-tx-secondary h-11 grow cursor-pointer select-none border-none bg-inherit focus:outline-none"
                  placeholder="Search for a chat"
                />
              </div>
            </div>

            {/* Recent Chats */}
            <div className="scroll-secondary flex h-96 grow flex-col space-y-1.5 overflow-y-auto overflow-x-hidden px-2">
              {recentChatResults?.map((recentChatResult, _) => {
                const recentChatID = recentChatResult.value.chat_id;
                return (
                  <RecentChat
                    key={recentChatID}
                    recentChatResult={recentChatResult}
                    onDelete={() => deleteChatHandler(recentChatResult)}
                    onReset={() => resetChatHandler(recentChatResult)}
                    isActive={chatID == recentChatID}
                    onClick={() => setActiveChatID(recentChatID)}
                  />
                );
              })}
            </div>
          </div>
          {/*Bottom Section */}
          <div className="bg-container-tertiary flex h-16 w-full shrink-0 flex-row p-3">
            <div className="relative">
              <img
                src={personaBundle.avatarURI || "default_avatar.png"}
                alt="Avatar"
                className="h-10 w-10 rounded-full"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-container-tertiary bg-green-400 ring-4"></span>
            </div>
            <div className="flex h-full flex-col justify-center p-2">
              <h3 className="font-semibold text-tx-primary ">{personaBundle.data.name}</h3>
              <p className="font-medium text-tx-secondary">Online</p>
            </div>
            {/* Settings Icon */}
            <div className="flex grow items-center justify-end"></div>
          </div>
        </div>
      </motion.div>
      {/* Sidebar Toggle Button */}
      <button
        className={`group ${sidebarOpen ? "ml-1.5" : "-ml-1"} flex h-10 w-3.5 items-center justify-center rounded-full`}
        onClick={() => {
          setSidebarOpen(!sidebarOpen);
        }}
      >
        <div className="h-10 w-1.5 rounded-full bg-action-tertiary transition duration-100 ease-out group-hover:bg-accent"></div>
      </button>
    </div>
  );
}
interface RecentChatProps {
  recentChatResult: RecentChatResult;
  isActive: boolean;
  onDelete: () => void;
  onReset: () => void;
  className?: string;
  [x: string]: any;
}

function RecentChat({ recentChatResult: chatRes, isActive, onDelete, onReset, className, ...rest }: RecentChatProps) {
  const isOk = chatRes.kind === "ok";
  const avatarURI = isOk ? chatRes.value.avatarURI : "";

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          {...rest}
          className={cn(
            `group flex w-full cursor-pointer items-center space-x-3 rounded-xl p-2.5 transition duration-200 ease-out
            hover:bg-accent ${isActive ? "bg-container-tertiary" : ""}`,
            className
          )}
        >
          <Avatar avatarURI={avatarURI} />

          <div className={"flex h-full max-w-full flex-col justify-center overflow-hidden"}>
            {isOk ? (
              <>
                <h3 className="text-tx-primary line-clamp-1 text-ellipsis">{chatRes.value.name}</h3>
                <p className="text-tx-secondary line-clamp-1 text-ellipsis text-[14.5px] w-full">
                  {chatRes.value.last_message}
                </p>
              </>
            ) : (
              <h3 className="text-red-400 line-clamp-1 text-ellipsis">{`?? ${chatRes.value.dir_name} ??`}</h3>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 px-1 py-2">
        <ContextMenuItem onSelect={onReset}>
          Reset
          <ContextMenuShortcut>
            <ArrowPathIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDelete}>
          Delete
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
