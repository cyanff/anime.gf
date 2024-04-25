import { Button } from "@/components/ui/button";
import LogoButton from "@/components/LogoButton";
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  PlusCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";
import DiscordIcon from "@/components/icons/discord";
import { toast } from "sonner";

interface SideBarProps {
  page: string;
  setPage: (page: string) => void;
}

export default function SideBar({ page, setPage }: SideBarProps) {
  return (
    <div className="bg-nav-primary mr-3.5 flex h-full w-20 flex-col items-center py-6">
      <LogoButton className="mb-4 size-12" />

      {/* Top Button Group*/}
      <div className="flex flex-col">
        <Button
          size="icon"
          className={`m-2 size-16 rounded-xl ${page === "create" ? "bg-background" : ""}`}
          onClick={() => setPage("create")}
        >
          <PlusCircleIcon className="text-tx-secondary size-8" />
        </Button>
        <Button className="m-2 size-16  rounded-xl hover:bg-accent " onClick={() => setPage("chats")}>
          <ChatBubbleLeftRightIcon className="text-tx-secondary size-8" />
        </Button>
        <Button className="m-2 size-16  rounded-xl hover:bg-accent" onClick={() => setPage("collections")}>
          <UserGroupIcon className="text-tx-secondary size-8" />
        </Button>
        <Button className="m-2 size-16 rounded-xl hover:bg-accent" onClick={() => setPage("settings")}>
          <Cog8ToothIcon className="text-tx-secondary size-8" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="grow"></div>

      {/* Bottom Button Group*/}
      <div className="flex flex-col space-y-2">
        <Button
          size="icon"
          className="mx-2 size-12 rounded-xl"
          onClick={() => {
            window.api.utils.openURL("https://discord.gg/JrdGVTYV46");
            toast.success("Discord invite opened in browser!");
          }}
        >
          <DiscordIcon className="fill-tx-tertiary" />
        </Button>
        <Button
          size="icon"
          className="mx-2 size-12 rounded-xl"
          onClick={() => {
            toast.info("Docs are coming soon™!");
          }}
        >
          <BookOpenIcon className="text-tx-tertiary size-7" />
        </Button>
      </div>
    </div>
  );
}
