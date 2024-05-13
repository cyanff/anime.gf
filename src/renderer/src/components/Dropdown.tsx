import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Markdown from "react-markdown";

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
      <Markdown
        unwrapDisallowed
        skipHtml
        className={`whitespace-pre-line bg-container-tertiary overflow-auto
        scroll-secondary rounded-b-xl transition duration-200 ease-in-out
        text-sm text-tx-secondary ${isOpen ? "max-h-96 px-4 pb-2 pt-4" : "max-h-0"}`}
      >
        {content}
      </Markdown>
    </div>
  );
}
