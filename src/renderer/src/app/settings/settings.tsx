import SettingsAdvanced from "@/app/settings/settings_advanced";
import SettingsChat from "@/app/settings/settings_chat";
import SettingsRecentlyDeleted from "@/app/settings/settings_deleted";
import SettingsKeys from "@/app/settings/settings_keys";
import SettingsPersona from "@/app/settings/settings_persona";
import { useState } from "react";

export default function SettingsPage() {
  const [page, setPage] = useState<string>("chat");
  return (
    <div className="flex h-full w-full rounded-xl ">
      {/*Sidebar*/}
      <div className="flex h-full w-56 shrink-0 flex-col space-y-1 overflow-hidden rounded-2xl bg-nav-primary px-3 py-8 text-[1.03rem] *:rounded-md">
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3  p-2.5  transition
          duration-150 ease-out hover:bg-accent ${page === "chat" ? "bg-container-tertiary text-tx-primary" : "text-tx-secondary"}`}
          onClick={() => setPage("chat")}
        >
          Chat
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3  p-2.5  transition
          duration-150 ease-out hover:bg-accent ${
            page === "persona" ? "bg-container-tertiary text-tx-primary" : "text-tx-secondary"
          }`}
          onClick={() => setPage("persona")}
        >
          Persona
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3  p-2.5  transition
          duration-150 ease-out hover:bg-accent ${page === "key" ? "bg-container-tertiary text-tx-primary" : "text-tx-secondary"}`}
          onClick={() => setPage("key")}
        >
          API Key
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3  p-2.5  transition
          duration-150 ease-out hover:bg-accent ${
            page === "deleted" ? "bg-container-tertiary text-tx-primary" : "text-tx-secondary"
          }`}
          onClick={() => setPage("deleted")}
        >
          Recently Deleted
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3  p-2.5  transition
          duration-150 ease-out hover:bg-accent ${
            page === "advanced" ? "bg-container-tertiary text-tx-primary" : "text-tx-secondary"
          }`}
          onClick={() => setPage("advanced")}
        >
          Advanced
        </button>
      </div>

      {/*Settings Content*/}

      <div className="grow">
        {page === "chat" && <SettingsChat />}
        {page === "persona" && <SettingsPersona />}
        {page === "key" && <SettingsKeys />}
        {page === "deleted" && <SettingsRecentlyDeleted />}
        {page === "advanced" && <SettingsAdvanced />}
      </div>
    </div>
  );
}
