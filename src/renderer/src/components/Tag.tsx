import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TagProps {
  text: string;
  className?: string;
  isClickable?: boolean;
}

export default function Tag({ text, className, isClickable = true }: TagProps) {
  if (text.trim() === "") {
    return null;
  }

  return (
    <span
      onClick={() => {
        if (!isClickable) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }}
      className={cn(
        `text-shadow inline-block h-fit min-w-8 ${isClickable ? "cursor-pointer hover:brightness-90" : ""} select-none whitespace-nowrap rounded-full bg-gradient-to-br from-neutral-600
    to-neutral-700 px-2.5 py-1.5 text-center text-xs font-[550] text-neutral-200
    shadow transition duration-200 ease-out`,
        className
      )}
    >
      {text}
    </span>
  );
}
