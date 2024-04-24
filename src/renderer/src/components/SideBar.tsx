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
    <div className="mr-3.5 flex h-full w-20 flex-col items-center bg-background py-6">
      <LogoButton className="mb-4 size-12" />

      {/* Top Button Group*/}
      <div className="flex flex-col">
        <Button
          size="icon"
          className={`m-2 size-16 rounded-xl ${page === "create" ? "bg-background" : ""}`}
          onClick={() => setPage("create")}
        >
          <PlusCircleIcon className="size-8 text-secondary" />
        </Button>
        <Button className="m-2 size-16  rounded-xl hover:bg-accent " onClick={() => setPage("chats")}>
          <ChatBubbleLeftRightIcon className="size-8 text-secondary" />
        </Button>
        <Button className="m-2 size-16  rounded-xl hover:bg-accent" onClick={() => setPage("collections")}>
          <UserGroupIcon className="size-8 text-secondary" />
        </Button>
        <Button className="m-2 size-16  rounded-xl hover:bg-accent" onClick={() => setPage("settings")}>
          <Cog8ToothIcon className="size-8 text-secondary" />
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
          <DiscordIcon className="fill-secondary" />
        </Button>
        <Button
          size="icon"
          className="mx-2 size-12 rounded-xl"
          onClick={() => {
            toast.info("Docs are coming soon™!");
          }}
        >
          <BookOpenIcon className="size-7 text-secondary" />
        </Button>
      </div>
    </div>
  );
}
