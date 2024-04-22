import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogoButtonProps {
  className?: string;
  [key: string]: any;
}

export default function LogoButton({ className, rest }: LogoButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  // Reset the button state after a delay
  useEffect(() => {
    if (isClicked) {
      const timeoutId = setTimeout(() => {
        setIsClicked(false);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [isClicked]);

  const variants = {
    initial: { scale: 1 },
    clicked: { scale: 1.1 }
  };

  return (
    <motion.button
      className={cn("h-9 w-16 rounded-full bg-grad-magenta-2 px-5 py-3", className)}
      transition={{ type: "spring" }}
      animate={isClicked ? "clicked" : "initial"}
      variants={variants}
      onMouseDown={() => setIsClicked(true)}
      onClick={() => toast("To the beat! ^-^")}
      {...rest}
    ></motion.button>
  );
}
