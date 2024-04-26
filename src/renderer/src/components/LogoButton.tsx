import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LogoButtonProps {
  className?: string;
  [key: string]: any;
}

export default function LogoButton({ className, rest }: LogoButtonProps) {
  const [themes, setThemes] = useState<string[]>([]);
  const { setTheme } = useTheme();

  useEffect(() => {
    const storedThemes = ["anime-gf", "sakura-bloom", "artic-dark", "midnight-red", "twilight", "custom"];

    setThemes(storedThemes);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          className={cn("h-9 w-16 outline-none rounded-full bg-logo-grad px-5 py-3", className)}
          {...rest}
        ></button>
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
