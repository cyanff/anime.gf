import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        `flex h-12 w-full select-text rounded-md border
        border-input border-neutral-600 bg-neutral-700  px-2.5 py-1 text-sm shadow-sm
        transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:font-[450] placeholder:text-muted-foreground focus:outline-none
        focus-visible:outline-none disabled:cursor-not-allowed
        disabled:opacity-50`,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
