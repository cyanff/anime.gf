import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        `flex h-12 w-full select-text rounded-xl border border-line
        bg-background px-2.5  py-1 text-sm text-secondary shadow-sm
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
