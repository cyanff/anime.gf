import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        `scroll-secondary flex h-36 w-full resize-none overflow-auto rounded-xl border border-line bg-background px-3 py-2
        text-sm text-tx-secondary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "InputArea";

export { Textarea };
