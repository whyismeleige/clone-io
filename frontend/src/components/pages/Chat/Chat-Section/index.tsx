"use client";
import { ModelCombobox } from "@/components/shared/ModelCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from "@/hooks/redux";
import {
  ArrowUp,
  ChevronDown,
  CircleCheckBig,
  Clock,
  FileCheck,
  History,
  Plus,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";

export default function ChatSection() {
  const { steps, userPrompts } = useAppSelector((state) => state.chat);
  console.log(steps);
  return (
    <section className="flex flex-col h-full">
      {/* <div className="flex justify-between p-2 shrink-0">
        <ButtonGroup>
          <Button variant="outline" className="cursor-pointer">
            New Chat
            <ChevronDown />
          </Button>
          <ButtonGroupSeparator />
          <Button size="icon" className="cursor-pointer" variant="outline">
            <Plus />
          </Button>
        </ButtonGroup>
        <Button size="icon" className="cursor-pointer" variant="outline">
          <History />
        </Button>
      </div> */}
      <div className="overflow-y-auto flex-1 px-2 custom-scrollbar">
        {userPrompts.map((prompt, index) => (
            <div
              className="flex gap-2 justify-self-end w-4/5 mt-2 items-center"
              key={index}
            >
              <span className="rounded-md p-3 border bg-background shadow-xs hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50">
                {prompt}
              </span>
              <Avatar>
                <AvatarImage
                  src="https://avatars.steamstatic.com/0080c1eebf4fc785c7944995bec1abb8818e2510_full.jpg"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          ))}
        {steps.map((step, index) => (
          <AnimatePresence key={index}>
            <motion.div
              key={index}
              className="flex gap-2 justify-self-start w-4/5 mt-2 items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <motion.div
                key={step.status}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {step.status === "pending" ? (
                  <Spinner className="size-6" />
                ) : (
                  <CircleCheckBig className="text-green-500" />
                )}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {step.title}
              </motion.span>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
      <InputBox />
    </section>
  );
}

function InputBox() {
  const [prompt, setPrompt] = useState("");
  return (
    <InputGroup>
      <InputGroupTextarea
        placeholder="Build with Clone"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          variant="outline"
          className="rounded-full cursor-pointer"
          size="icon-xs"
        >
          <PlusIcon />
        </InputGroupButton>
        <ModelCombobox />
        <InputGroupButton
          variant="default"
          className="ml-auto rounded-full cursor-pointer"
          size="icon-xs"
          disabled={!prompt}
        >
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
