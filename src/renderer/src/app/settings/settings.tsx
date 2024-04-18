import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import SettingsPersona from "@/app/settings/settings_persona";

export default function SettingsPage() {
  const [page, setPage] = useState<string>("chat");
  // className="rounded-sm px-3 py-2 text-left text-[1.15rem] font-medium hover:bg-accent"
  return (
    <div className="flex h-full w-full  bg-neutral-800 text-neutral-100">
      {/*Sidebar*/}
      <div className="flex h-full w-56 shrink-0 flex-col space-y-2 overflow-hidden rounded-2xl bg-background px-3 py-8">
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-md p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "chat" ? "bg-neutral-700 text-gray-200" : "text-gray-400"}`}
          onClick={() => setPage("chat")}
        >
          Chat
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-md p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "persona" ? "bg-neutral-700 text-gray-200" : "text-gray-400"}`}
          onClick={() => setPage("persona")}
        >
          Persona
        </button>
        <button
          className={`group flex w-full cursor-pointer items-center space-x-3 
          rounded-md p-2.5 text-[1.07rem] font-[450] transition duration-150 ease-out hover:bg-accent
          ${page === "privacy" ? "bg-neutral-700 text-gray-200" : "text-gray-400"}`}
          onClick={() => setPage("privacy")}
        >
          Privacy
        </button>
      </div>

      {/*Settings Content*/}

      <div className="grow">{page === "persona" && <SettingsPersona />}</div>
    </div>
  );
}
