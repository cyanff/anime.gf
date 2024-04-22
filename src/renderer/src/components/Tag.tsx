import { cn } from "@/lib/utils";

interface TagProps {
  text: string;
  className?: string;
}

export default function Tag({ text, className }: TagProps) {
  if (text.trim() === "") {
    return null;
  }

  return (
    <span
      className={cn(
        `text-shadow inline-block h-fit whitespace-nowrap rounded-full
    bg-gradient-to-br from-neutral-600 to-neutral-700 px-2 py-1.5 text-xs
    font-medium text-neutral-200 shadow`,
        className
      )}
    >
      {text}
    </span>
  );
}
