import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

interface LogoButtonProps {
  className?: string;
  [key: string]: any;
}

export default function LogoButton({ className, rest }: LogoButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);
  const { setTheme } = useTheme();

  useEffect(() => {
    //TODO: Dynamic implementation for list of themes
    const storedThemes = [
      "magenta",
      "magenta-darkmode",
      "magenta-lightmode",
      "magenta-highcontrast",
      "cyan",
      "cyan-darkmode",
      "cyan-lightmode",
      "cyan-highcontrast",
      "custom-theme1",
      "custom-theme2",
      "custom-theme3",
      "custom-theme4"
    ];

    setThemes(storedThemes);
  }, []);

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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <motion.button
          className={cn("bg-grad-logo h-9 w-16 rounded-full px-5 py-3", className)}
          transition={{ type: "spring" }}
          animate={isClicked ? "clicked" : "initial"}
          variants={variants}
          onMouseDown={() => setIsClicked(true)}
          onClick={() => toast("To the beat! ^-^")}
          {...rest}
        ></motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div>
          {themes.map((theme) => (
            <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>{theme}</DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
