import { useState } from "react";
import SettingsPersona from "@/app/settings/settings_persona";
import SettingsChat from "@/app/settings/settings_chat";
import SettingsKeys from "@/app/settings/settings_keys";
import SettingsRecentlyDeleted from "@/app/settings/settings_deleted";
import { KeyIcon } from "@heroicons/react/24/solid";

export default function SettingsPage() {
  const [page, setPage] = useState<string>("chat");
  return (
    <div className="bg-background-secondary flex h-full  w-full rounded-xl">
      {/*Sidebar*/}
      <div className="flex h-full w-56 shrink-0 flex-col space-y-2 overflow-hidden rounded-2xl bg-background px-3 py-8">
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-xl p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "chat" ? "bg-accent text-primary" : "text-secondary"}`}
          onClick={() => setPage("chat")}
        >
          Chat
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-xl p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "persona" ? "bg-accent text-primary" : "text-secondary"}`}
          onClick={() => setPage("persona")}
        >
          Persona
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-xl p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "key" ? "bg-accent text-primary" : "text-secondary"}`}
          onClick={() => setPage("key")}
        >
          API Key
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-xl p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "deleted" ? "bg-accent text-primary" : "text-secondary"}`}
          onClick={() => setPage("deleted")}
        >
          Recently Deleted
        </button>
      </div>

      {/*Settings Content*/}

      <div className="grow">
        {page === "persona" && <SettingsPersona />}
        {page === "chat" && <SettingsChat />}
        {page === "key" && <SettingsKeys />}
        {page === "deleted" && <SettingsRecentlyDeleted />}
      </div>
    </div>
  );
}
