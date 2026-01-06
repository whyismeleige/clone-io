"use client";
import { ModelCombobox } from "@/components/shared/ModelCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ArrowUp, CircleCheckBig } from "lucide-react";
import { useChatContext } from "@/context/chat.context";
import { useAppSelector } from "@/hooks/redux";
import { useRef, useEffect } from "react";

export default function ChatSection() {
  const { user } = useAppSelector((state) => state.auth);
  const { messages, prompt, setPrompt, handleSendPrompt } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <section className="flex flex-col h-full">
      <div className="overflow-y-auto flex-1 px-2 w-full custom-scrollbar">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <div
              className="flex gap-2 justify-self-end flex-row-reverse  w-4/5 mt-2 items-center"
              key={index}
            >
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="rounded-md p-3 border bg-background shadow-xs hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50">
                {message.content}
              </span>
            </div>
          ) : (
            <div key={index}>
              {message.content.map((step, idx) => (
                <AnimatePresence key={idx}>
                  <motion.div
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
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      <InputBox
        prompt={prompt}
        setPrompt={setPrompt}
        sendPrompt={handleSendPrompt}
      />
    </section>
  );
}

function InputBox({
  prompt,
  setPrompt,
  sendPrompt,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  sendPrompt: () => void;
}) {
  return (
    <InputGroup>
      <InputGroupTextarea
        placeholder="Build with Clone"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <InputGroupAddon align="block-end">
        <ModelCombobox />
        <InputGroupButton
          variant="default"
          className="ml-auto rounded-full cursor-pointer"
          size="icon-xs"
          onClick={sendPrompt}
          disabled={!prompt}
        >
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}