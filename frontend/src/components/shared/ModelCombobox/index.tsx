import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconType, SiAnthropic } from "@icons-pack/react-simple-icons";
import { Bot, Check } from "lucide-react";
import { useState } from "react";

const models = [
  {
    icon: SiAnthropic,
    name: "claude-3.7-sonnet",
  },
  {
    icon: SiAnthropic,
    name: "claude-4.5-sonnet",
  },
  {
    icon: SiAnthropic,
    name: "claude-4.1-opus",
  },
];

export const ModelCombobox = () => {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<{ name?: string; icon?: IconType }>(
    {}
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="cursor-pointer justify-between"
        >
          {trigger.icon ? <trigger.icon /> : <Bot />}
          {trigger.name ? trigger.name : "Select Model..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model, index: number) => (
                <CommandItem
                  key={index}
                  value={model.name}
                  className="cursor-pointer"
                  onSelect={(currentValue) => {
                    setTrigger(currentValue === trigger.name ? {} : model);
                    setOpen(false);
                  }}
                >
                  <model.icon />
                  {model.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      trigger.name === model.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};