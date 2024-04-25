import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        `flex min-h-32 text-tx-primary w-full outline-none rounded-xl resize-none border border-line bg-input-primary px-3 py-2
        text-sm shadow-sm placeholder:text-tx-secondary disabled:cursor-not-allowed disabled:opacity-50 scroll-secondary`,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
