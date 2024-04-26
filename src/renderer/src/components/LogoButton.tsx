import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface LogoButtonProps {
  className?: string;
  [key: string]: any;
}

interface Theme {
  internal: string;
  display: string;
}

export default function LogoButton({ className, rest }: LogoButtonProps) {
  const { setTheme } = useTheme();

  const themes: Theme[] = useMemo(
    () => [
      { internal: "anime-gf", display: "Anime.gf" },
      { internal: "sakura-bloom", display: "Sakura Bloom" },
      { internal: "artic-dark", display: "Arctic Dark" },
      { internal: "midnight-red", display: "Midnight Red" },
      { internal: "twilight", display: "Twilight" }
    ],
    []
  );

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
            <DropdownMenuItem key={theme.internal} onClick={() => setTheme(theme.internal)}>
              {theme.display}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
