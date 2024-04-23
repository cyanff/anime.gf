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
        className={`flex w-full items-center justify-between  rounded-t-lg bg-neutral-700 px-4 py-2.5 text-left text-sm font-medium text-gray-200 transition duration-200 ease-out hover:brightness-95`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{label}</span>

        <ChevronDownIcon
          className={`duration-125 size-5 transition ease-out ${isOpen ? "rotate-180 transform" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden  rounded-b-lg bg-neutral-800 transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-4 pb-2 pt-4 text-sm text-primary">{content}</div>
      </div>
    </div>
  );
}
