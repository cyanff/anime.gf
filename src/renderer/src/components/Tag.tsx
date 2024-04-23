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
        `text-shadow inline-block h-fit min-w-8 ${isClickable ? "cursor-pointer hover:brightness-90" : ""} 
           select-none whitespace-nowrap rounded-full
        bg-secondary px-2.5 py-1.5 text-center
        text-xs font-[550] text-secondary shadow-md  transition
        duration-200 ease-out`,
        className
      )}
    >
      {text}
    </span>
  );
}
