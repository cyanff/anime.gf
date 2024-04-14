import { useApp } from "@/components/AppContext";
import { useEffect, useRef, useState } from "react";
import { ChatSearchItem, queries } from "@/lib/queries";
import { toast } from "sonner";
import ChatsSearch from "@/components/ChatsSearch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full items-center bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className=""
      >
        <Popover>
          <PopoverTrigger>
            <img className="size-12  rounded-full object-cover object-top" src={"default_avatar.png"} alt="Avatar" />
          </PopoverTrigger>
          <PopoverContent>hi</PopoverContent>
        </Popover>
      </motion.div>
    </div>
  );
}
