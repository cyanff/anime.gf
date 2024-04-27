import { useApp } from "@/components/AppContext";
import LogoButton from "@/components/LogoButton";
import DiscordIcon from "@/components/icons/discord";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { card } from "@/lib/card";
import {
  ArrowDownOnSquareIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";
import { useRef } from "react";
import { toast } from "sonner";

interface SideBarProps {
  page: string;
  setPage: (page: string) => void;
}

export default function SideBar({ page, setPage }: SideBarProps) {
  const cardImportInputRef = useRef<HTMLInputElement>(null);
  const { syncCardBundles } = useApp();

  async function cardImportInputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const res = await card.importFromFileList(files);

    let numValidFiles = 0;
    res.forEach((r) => {
      if (r.kind === "err") {
        toast.error(r.error.message);
        return;
      }
      numValidFiles++;
    });
    if (numValidFiles > 0) {
      toast.success(`${numValidFiles} files imported successfully.`);
    }
    syncCardBundles();
  }

  return (
    <div className="bg-nav-primary mr-3.5 flex h-full w-20 flex-col items-center py-6">
      <input
        ref={cardImportInputRef}
        className="hidden"
        type="file"
        accept=".zip"
        onChange={cardImportInputChangeHandler}
        multiple
      />
      <LogoButton className="mb-4 size-12" />

      {/* Top Button Group*/}
      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Button variant="ghost" size="icon" className={"m-2 size-16 rounded-xl"}>
              <PlusCircleIcon className="text-tx-secondary size-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={-15} className="*:text-tx-primary font-medium p-1.5">
            <DropdownMenuItem
              onSelect={() => {
                setPage("create");
              }}
            >
              <PencilSquareIcon className="size-4 text-tx-secondary mr-2" />
              <span>Create Card</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                cardImportInputRef!.current?.click();
              }}
            >
              <ArrowDownOnSquareIcon className="size-4 text-tx-secondary mr-2" />
              <span> Import Card </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" className="m-2 size-16 rounded-xl" onClick={() => setPage("chats")}>
          <ChatBubbleLeftRightIcon className="text-tx-secondary size-8" />
        </Button>
        <Button
          variant="ghost"
          className="m-2 size-16 rounded-xl hover:bg-accent"
          onClick={() => setPage("collections")}
        >
          <UserGroupIcon className="text-tx-secondary size-8" />
        </Button>
        <Button variant="ghost" className="m-2 size-16 rounded-xl hover:bg-accent" onClick={() => setPage("settings")}>
          <Cog8ToothIcon className="text-tx-secondary size-8" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="grow"></div>

      {/* Bottom Button Group*/}
      <div className="flex flex-col space-y-2">
        <Button
          variant="ghost"
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
          variant="ghost"
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
