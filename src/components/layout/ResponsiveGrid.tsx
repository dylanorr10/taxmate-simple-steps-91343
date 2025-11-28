import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid = ({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 4,
}: ResponsiveGridProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid",
        gridCols[cols.default || 1],
        cols.sm && `sm:${gridCols[cols.sm]}`,
        cols.md && `md:${gridCols[cols.md]}`,
        cols.lg && `lg:${gridCols[cols.lg]}`,
        cols.xl && `xl:${gridCols[cols.xl]}`,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "col";
  reverseOnMobile?: boolean;
  gap?: number;
}

export const ResponsiveStack = ({
  children,
  className,
  direction = "col",
  reverseOnMobile = false,
  gap = 4,
}: ResponsiveStackProps) => {
  return (
    <div
      className={cn(
        "flex",
        direction === "col" ? "flex-col lg:flex-row" : "flex-col",
        reverseOnMobile && "flex-col-reverse lg:flex-row",
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};
