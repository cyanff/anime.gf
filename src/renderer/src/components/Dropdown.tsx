import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface DropdownProps {
  label: string;
  content: string;
}

export default function Dropdown({ label, content }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        className={`duration-125 flex w-full items-center justify-between rounded-t-2xl bg-container-secondary px-4 py-2.5 text-left text-sm
          text-tx-primary transition ease-out hover:brightness-90 font-[550]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        <ChevronDownIcon className={`duration-125 size-5 transition  ${isOpen ? "rotate-180 transform" : ""}`} />
      </button>
      <div
        className={`bg-container-tertiary overflow-hidden rounded-b-xl transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <p className="px-4 pb-2 pt-4 text-sm text-tx-secondary">{content}</p>
      </div>
    </div>
  );
}
