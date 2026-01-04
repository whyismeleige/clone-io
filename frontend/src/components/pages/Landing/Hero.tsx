"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowUp,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { animate } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { ModelCombobox } from "@/components/shared/ModelCombobox";
import { useAppSelector } from "@/hooks/redux";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/context/chat.context";

const phrases = [
  `Recreate the minimal, clean style of https://www.notion.so for a productivity tool website.`,
  "Design a futuristic AI company website with glowing gradients and animated particle background.",
  "Clone the design and layout of https://www.apple.com.",
  "Create a professional educational site with course listings, progress tracker, and signup section.",
  "Clone https://www.airbnb.com keeping its structure and visuals.",
  "Create a professional portfolio site with dark mode and glowing accent effects.",
  "Recreate https://www.tesla.com for a futuristic vehicle company.",
  "Build a SaaS landing page with hero section, pricing, testimonials, and signup form.",
  "Copy the layout and animation flow of https://stripe.com for a neutral business payments site.",
  "Design a minimalist e-commerce site with product grid, filters, and checkout flow.",
];

export default function HeroMain() {
  const [placeholder, setPlaceholder] = useState("");
  const [showTabBtn, toggleShowTabBtn] = useState(false);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { prompt, setPrompt } = useChatContext();
  const router = useRouter();

  useEffect(() => {
    if (prompt !== "") return;

    let shouldStop = false;
    let phraseToSet = "";

    const runAnimations = async () => {
      while (!shouldStop) {
        for (const phrase of phrases) {
          phraseToSet = phrase;
          if (shouldStop) break;
          await animate(0, phrase.length, {
            onUpdate: (latest) => {
              setPlaceholder(phrase.slice(0, latest));
            },
            delay: 0.5,
            duration: 2,
          });

          if (shouldStop) break;

          toggleShowTabBtn(true);
          setTimeout(() => toggleShowTabBtn(false), 2400);

          await animate(phrase.length, 0, {
            onUpdate: (latest) => {
              setPlaceholder(phrase.slice(0, latest));
            },
            delay: 2.5,
            duration: 1,
          });
        }
      }
    };
    runAnimations();

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setPrompt(phraseToSet)
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      shouldStop = true;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [prompt, setPrompt]);

  const handlePrompt = () => {
    if(!isAuthenticated) {
      router.push("/auth?mode=Login")
    }
  };
  return (
    <main className="overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>
      <section>
        <div className="relative pt-24 md:pt-36">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center sm:mx-auto lg:mr-auto lg:mt-0">
              <TextEffect
                preset="fade-in-blur"
                speedSegment={0.3}
                as="h1"
                className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
              >
                Build Anything.
              </TextEffect>
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-8 max-w-2xl text-balance text-xl"
              >
                Create or Clone websites with AI
              </TextEffect>
              <div className="mt-10 flex-1 w-full max-w-2xl">
                <InputGroup>
                  <InputGroupTextarea
                    placeholder={placeholder}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  {showTabBtn && (
                    <div className="absolute top-2 right-2 flex flex-wrap items-center gap-4">
                      <Button variant="outline" size="sm" className="pr-2">
                        Tab <Kbd>⭾</Kbd>
                      </Button>
                    </div>
                  )}
                  <InputGroupAddon align="block-end">
                    <InputGroupButton
                      variant="outline"
                      className="rounded-full cursor-pointer"
                      size="icon-xs"
                    >
                      <PlusIcon />
                    </InputGroupButton>
                    <ModelCombobox />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InputGroupButton
                          variant="default"
                          className="ml-auto rounded-full cursor-pointer"
                          size="icon-xs"
                          onClick={handlePrompt}
                          disabled={!prompt}
                        >
                          <ArrowUp />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>Send</TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
            <div className="flex flex-col items-center sm:mx-auto lg:mr-auto lg:mt-0">
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-8 max-w-2xl text-balance text-xl"
              >
                Build with Clone.io
              </TextEffect>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
