import { useState } from "react";

interface DropdownProps {
  label: string;
  content: string;
  variant?: "sm" | "md";
}

export default function Dropdown({ label, content, variant = "md" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "sm") {
    return (
      <div className="mb-2">
        <button
          className="duration-125 flex w-full items-center justify-between rounded-t-lg bg-neutral-700 px-3 py-2.5 text-left text-sm font-medium text-gray-200 transition ease-out hover:brightness-95"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xs font-medium">{label}</span>
          {isOpen ? (
            <img src="/button/arrow.svg" className="rotate-180 transform" alt="description" />
          ) : (
            <img src="/button/arrow.svg" alt="description" />
          )}
        </button>
        <div
          className={`overflow-hidden rounded-b-lg bg-[#212121] transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
        >
          <div className="px-4 pb-2 pt-4 text-sm text-gray-100">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        className="duration-125 flex w-full items-center justify-between rounded-t-lg bg-neutral-700 px-4 py-2.5 text-left text-sm font-medium text-gray-200 transition ease-out hover:brightness-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{label}</span>
        {isOpen ? (
          <img src="/button/arrow.svg" className="rotate-180 transform" alt="description" />
        ) : (
          <img src="/button/arrow.svg" alt="description" />
        )}
      </button>
      <div
        className={`overflow-hidden  rounded-b-lg bg-[#212121] transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-4 pb-2 pt-4 text-sm text-gray-200">{content}</div>
      </div>
    </div>
  );
}
