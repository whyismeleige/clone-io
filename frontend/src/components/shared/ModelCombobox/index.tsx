import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconType, SiAnthropic } from "@icons-pack/react-simple-icons";
import { Bot, Check } from "lucide-react";
import { useState } from "react";

interface Model {
  icon: IconType;
  name: string;
  modelId: string;
}

const models: Model[] = [
  {
    icon: SiAnthropic,
    name: "claude-3.7-sonnet",
    modelId: "claude-3-7-sonnet-20250219",
  },
  {
    icon: SiAnthropic,
    name: "claude-4.5-sonnet",
    modelId: "claude-sonnet-4-5-20250929",
  },
  {
    icon: SiAnthropic,
    name: "claude-4.1-opus",
    modelId: "claude-opus-4-1-20250805",
  },
];

export const ModelCombobox = () => {
  const [open, setOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model>(models[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="cursor-pointer justify-between"
        >
          {currentModel.icon ? <currentModel.icon /> : <Bot />}
          {currentModel.name ? currentModel.name : "Select Model..."}
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
                  value={model.modelId}
                  className="cursor-pointer"
                  onSelect={() => {
                    setOpen(false);
                    setCurrentModel(model);
                  }}
                >
                  <model.icon />
                  {model.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      model.name === currentModel.name
                        ? "opacity-100"
                        : "opacity-0"
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
