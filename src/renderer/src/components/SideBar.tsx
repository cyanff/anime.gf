import { Button } from "@/components/ui/button";
import LogoButton from "@/components/LogoButton";

interface SideBarProps {
  setPage: (page: string) => void;
}

export default function SideBar({ setPage }: SideBarProps) {
  return (
    <div className="mr-3.5 flex h-full w-20 flex-col items-center bg-background py-6">
      <LogoButton className="mb-4" />
      <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("create")}>
        <img src="/button/plus.svg" alt="" draggable="false" />
      </Button>
      <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("chats")}>
        <img src="/button/chats.svg" alt="Chats" draggable="false" />
      </Button>
      <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("collections")}>
        <img src="/button/home.svg" alt="Collections" draggable="false" />
      </Button>
      <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("settings")}>
        <img src="/button/settings.svg" alt="Settings" draggable="false" />
      </Button>
    </div>
  );
}
