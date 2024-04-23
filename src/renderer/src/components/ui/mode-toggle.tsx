import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("default")}>Magenta</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("default-darkmode")}>Magenta Darkmode</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("default-lightmode")}>Magenta Lightmode</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("default-highcontrast")}>Magenta High Contrast</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
