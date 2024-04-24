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
      "sakura-white",
      "pastel",
      "cyberpunk",
      "twilight-red",
      "custom"
    ];

    setThemes(storedThemes);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className={cn("h-9 w-16 rounded-full bg-grad-logo px-5 py-3", className)} {...rest}></button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div>
          {themes.map((theme) => (
            <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
              {theme}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
