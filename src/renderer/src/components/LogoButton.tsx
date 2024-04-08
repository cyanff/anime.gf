import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoButtonProps {
  className?: string;
}

export default function LogoButton({ className }: LogoButtonProps) {
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
      className={cn("bg-grad-magenta-2 h-9 w-16 rounded-full px-5 py-3", className)}
      transition={{ type: "spring" }}
      animate={isClicked ? "clicked" : "initial"}
      variants={variants}
      onMouseDown={() => setIsClicked(true)}
    ></motion.button>
  );
}
