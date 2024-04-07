// TODO, render sidebar here

import ChatsPage from "@/app/chats";
import CollectionsPage from "@/app/collections";
import SettingsPage from "@/app/settings";
import SideBar from "@/components/SideBar";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState<string>("chats");

  return (
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <SideBar setPage={setPage} />

      {page === "chats" && <ChatsPage />}
      {page === "collections" && <CollectionsPage />}
      {page === "settings" && <SettingsPage />}
    </div>
  );
}
