import { useState } from "react";

import { Squircle } from "@squircle-js/react";
import PlusIcon from "../buttons/plus.svg";
import HomeIcon from "../buttons/home.svg";
import ChatIcon from "../buttons/chat.svg";
import SettingsIcon from "../buttons/settings.svg";
import { Button } from "@/components/ui/button";

export default function SideBar({ setPage }) {
  return (
    <div>
      <Squircle
        cornerRadius={16}
        cornerSmoothing={1}
        className="relative mr-4 flex h-full w-20 flex-col items-center bg-background"
      >
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("chats")}>
          <img src={PlusIcon} alt="Plus" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("chats")}>
          <img src={HomeIcon} alt="Chat" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("collections")}>
          <img src={ChatIcon} alt="Home" />
        </Button>
        <Button variant="outline" size="icon" className="m-2 h-16 w-16" onClick={() => setPage("settings")}>
          <img src={SettingsIcon} alt="Settings" />
        </Button>
      </Squircle>
    </div>
  );
}
