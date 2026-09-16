import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("font-sans antialiased text-foreground", {
  variants: {
    variant: {
      "header-1": "scroll-m-20 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground",
      "header-2": "scroll-m-20 text-2xl font-bold tracking-tight sm:text-3xl text-foreground",
      "header-3": "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl text-foreground",
      "header-4": "scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
      subtitle: "text-lg font-normal text-muted-foreground leading-relaxed",
      regular: "text-base font-normal leading-normal text-foreground",
      small: "text-sm font-medium leading-none text-foreground",
      muted: "text-sm text-muted-foreground",
      caption: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-medium text-foreground",
      // Aliases
      h1: "scroll-m-20 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground",
      h2: "scroll-m-20 text-2xl font-bold tracking-tight sm:text-3xl text-foreground",
      h3: "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl text-foreground",
      h4: "scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
      body: "text-base font-normal leading-normal text-foreground",
      lead: "text-lg font-normal text-muted-foreground leading-relaxed",
    },
  },
  defaultVariants: {
    variant: "regular",
  },
});

export type TypographyVariant =
  | "header-1"
  | "header-2"
  | "header-3"
  | "header-4"
  | "subtitle"
  | "regular"
  | "small"
  | "muted"
  | "caption"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "lead";

const defaultElementMap: Record<TypographyVariant, React.ElementType> = {
  "header-1": "h1",
  "header-2": "h2",
  "header-3": "h3",
  "header-4": "h4",
  subtitle: "p",
  regular: "p",
  small: "span",
  muted: "p",
  caption: "span",
  code: "code",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  lead: "p",
};

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  variant?: TypographyVariant;
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "regular", as, children, ...props }, ref) => {
    const Component = as || defaultElementMap[variant] || "p";

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";
