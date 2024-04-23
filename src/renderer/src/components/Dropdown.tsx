import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface DropdownProps {
  label: string;
  content: string;
  variant?: "sm" | "md";
}

export default function Dropdown({ label, content }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        className={`duration-125 flex w-full items-center  justify-between rounded-t-xl bg-background px-4 py-2.5 text-left text-sm font-medium text-primary transition ease-out hover:brightness-90`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{label}</span>

        <ChevronDownIcon
          className={`duration-125 size-5 transition ease-out ${isOpen ? "rotate-180 transform" : ""}`}
        />
      </button>
      <div
        className={`bg-background-secondary  overflow-hidden rounded-b-xl transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <p className="px-4 pb-2 pt-4 text-sm text-secondary">{content}</p>
      </div>
    </div>
  );
}
