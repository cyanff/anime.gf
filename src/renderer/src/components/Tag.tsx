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
        `inline-block h-fit min-w-8 ${isClickable ? "cursor-pointer hover:brightness-90" : ""} bg-collection-card-tag select-none
        whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-xs font-[550] text-tx-secondary transition duration-200
        ease-out`,
        className
      )}
    >
      {text}
    </span>
  );
}
