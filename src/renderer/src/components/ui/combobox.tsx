import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComboBoxProps {
  items: { name: string; value: string }[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export default function Combobox({
  items,
  value,
  setValue,
  placeholder = "",
  emptyMessage = "No results found"
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex h-10 w-full items-center justify-between rounded-md bg-neutral-700 px-3 py-2">
          <p className="line-clamp-1 text-ellipsis">
            {value ? items.find((item) => item.value === value)?.name : placeholder}
          </p>
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-none p-0">
        <Command className="w-full bg-neutral-700">
          <CommandInput placeholder="Select a model" className="h-9" />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            <CommandList className="scroll-tertiary">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="text-white"
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.name}
                  <CheckIcon className={cn("ml-auto h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
