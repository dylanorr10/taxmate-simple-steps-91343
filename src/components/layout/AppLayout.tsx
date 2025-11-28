import { ReactNode } from "react";
import BottomNav from "@/components/BottomNav";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showNav?: boolean;
  showChat?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-full",
};

export const AppLayout = ({
  children,
  header,
  className,
  maxWidth = "lg",
  showNav = true,
  showChat = true,
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {header}
      <main
        className={cn(
          "mx-auto px-4 pb-28 lg:pb-8",
          maxWidthClasses[maxWidth],
          // Desktop: add sidebar space and padding
          "lg:ml-0 lg:px-8",
          className
        )}
      >
        {children}
      </main>
      {showChat && <FloatingChatButton />}
      {showNav && <BottomNav />}
    </div>
  );
};
