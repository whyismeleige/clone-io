"use client";
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useChatContext } from "@/context/chat.context";
import { Spinner } from "@/components/ui/spinner";
import { BACKEND_URL } from "@/utils/config";

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

interface ProjectCardProps {
  project: PublicProject;
  index: number;
  onClick: () => void;
}

interface PublicProject {
  _id: string;
  projectName: string;
  snapshot: string;
  model: string;
  views: number;
  createdBy: string;
  creator: {
    _id: string;
    name: string;
    avatar: string;
  };
  deployedAt: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onClick,
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => {
        onClick();
        router.push(`/chat/${project._id}`);
      }}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Project Preview/Thumbnail */}
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-muted/30 ring-1 ring-border/40 transition-all duration-300 group-hover:ring-border/60 group-hover:shadow-md">
        {!imageError && project.snapshot ? (
          <img
            src={project.snapshot}
            alt={project.projectName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
            <div className="text-3xl font-light text-muted-foreground/40">
              {project.projectName.charAt(0)}
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* View Project Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-105">
            View Project
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-2">
        <h3 className="line-clamp-1 text-base font-medium text-foreground transition-colors duration-200 group-hover:text-foreground/80">
          {project.projectName}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground">
          <span className="text-xs tracking-wide">
            {project.views.toLocaleString()} views
          </span>
        </div>
      </div>
    </div>
  );
};
export default function HeroMain() {
  const [placeholder, setPlaceholder] = useState("");
  const [showTabBtn, toggleShowTabBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>([]);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { prompt, setPrompt, newChat } = useChatContext();
  const router = useRouter();

  useEffect(() => {
    if (prompt !== "") return;

    let shouldStop = false;

    const runAnimations = async () => {
      while (!shouldStop) {
        for (const phrase of phrases) {
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
      // if (e.key === "Tab") {
      //   e.preventDefault();
      //   setPrompt(phraseToSet);
      // }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      shouldStop = true;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [prompt, setPrompt]);

  // Fetch public projects - replace with actual API call
  useEffect(() => {
    const fetchPublicProjects = async () => {
      const response = await fetch(`${BACKEND_URL}/api/chat/public`);

      const data = await response.json();

      setPublicProjects(data.projects);
    };

    fetchPublicProjects();
  }, []);

  const handlePrompt = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        await newChat();
      } else {
        router.replace("/auth?mode=login");
      }
    } catch (error) {
      console.error("Error in Starting New Chat", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (projectId: string) => {
    await fetch(`${BACKEND_URL}/api/chat/public/${projectId}/view`, {
      method: "PATCH",
    });
  };

  return (
    <main className="overflow">
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
                    disabled
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  {showTabBtn && (
                    <div className="absolute top-2 right-2 flex flex-wrap items-center gap-4">
                      <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="pr-2"
                      >
                        Tab <Kbd>⭾</Kbd>
                      </Button>
                    </div>
                  )}
                  <InputGroupAddon align="block-end">
                    <ModelCombobox />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InputGroupButton
                          variant="default"
                          className="ml-auto rounded-full cursor-pointer"
                          size="icon-xs"
                          onClick={handlePrompt}
                          disabled
                        >
                          {loading ? <Spinner /> : <ArrowUp />}
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>Send</TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Public Projects Grid Section */}
        <div className="relative py-18 md:py-18">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center sm:mx-auto lg:mr-auto mb-12">
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="h2"
                className="mx-auto max-w-2xl text-balance text-3xl md:text-4xl font-semibold"
              >
                Build with Clone.io
              </TextEffect>
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.7}
                as="p"
                className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground"
              >
                Explore what others have built with AI
              </TextEffect>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {publicProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  onClick={() => incrementViewCount(project._id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
