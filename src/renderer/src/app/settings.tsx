import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);

  const sidebarVariants = {
    open: { width: 200 },
    closed: { width: 0 }
  };

  return (
    <div className="flex w-full items-center bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <motion.div className="h-44" variants={sidebarVariants} animate={isOpen ? "open" : "closed"}>
        <div className="h-full w-full bg-red-300"></div>
      </motion.div>

      <button className=" bg-neutral-500 p-2" onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
    </div>
  );
}
