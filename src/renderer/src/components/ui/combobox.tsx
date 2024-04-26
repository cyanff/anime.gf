import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboBoxProps {
  items: { name: string; value: string }[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  [key: string]: any;
}

export default function Combobox({
  items,
  value,
  setValue,
  placeholder = "",
  emptyMessage = "No results found",
  disabled,
  ...rest
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled} {...rest}>
        <button
          className={` flex h-12 w-full items-center border border-line justify-between rounded-lg ${disabled ? "bg-muted border-none cursor-not-allowed" : "bg-input-primary"}  px-3 py-2 text-tx-primary `}
        >
          <p className="line-clamp-1 text-ellipsis" {...rest}>
            {value ? items.find((item) => item.value === value)?.name : placeholder}
          </p>
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-lg border-none p-0">
        <Command className="w-full rounded-xl bg-input-primary">
          <CommandInput placeholder="Select a model" className="h-9 " />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            <CommandList className="scroll-secondary">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="text-tx-primary"
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
