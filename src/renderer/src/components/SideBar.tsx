import { Squircle } from "@squircle-js/react";
import { Button } from "@/components/ui/button";

interface SideBarProps {
  setPage: (page: string) => void;
}

export default function SideBar({ setPage }: SideBarProps) {
  return (
    <div>
      <Squircle
        cornerRadius={16}
        cornerSmoothing={1}
        className="relative mr-3.5 flex h-full w-20 flex-col items-center bg-background"
      >
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => {}}>
          <img src="/button/plus.svg" alt="" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("chats")}>
          <img src="/button/chats.svg" alt="Chats" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("collections")}>
          <img src="/button/home.svg" alt="Collections" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("settings")}>
          <img src="/button/settings.svg" alt="Settings" />
        </Button>
      </Squircle>
    </div>
  );
}
