import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

interface TimerProps {
  variant: string;
  timeLeft: number;
}

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        error:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    ></div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

const AlertTimer: React.FC<TimerProps> = ({ variant, timeLeft }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
      <div
        className={cn(
          "h-full transition-all duration-100 ease-linear",
          variant === "success" && "bg-green-500",
          variant === "warning" && "bg-yellow-500",
          variant === "error" && "bg-red-500",
          variant === "info" && "bg-blue-500",
          !variant && "bg-gray-500"
        )}
        style={{
          width: `${timeLeft}%`,
        }}
      />
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription, AlertTimer };