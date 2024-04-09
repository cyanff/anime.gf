import { useApp } from "@/components/AppContext";
import { useEffect, useRef, useState } from "react";
import { ChatSearchItem, queries } from "@/lib/queries";
import { toast } from "sonner";
import ChatsSearch from "@/components/ChatsSearch";

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full items-center bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <button className="p-2" onClick={() => {}}>
        Click
      </button>
    </div>
  );
}
