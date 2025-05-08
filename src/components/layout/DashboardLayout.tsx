
import { ReactNode, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300",
        "pt-16 pb-8 px-4 md:p-6", // Adjust padding for mobile
        "md:ml-64", // Sidebar width on desktop
        "bg-gradient-to-br from-background/95 via-background/90 to-background/80",
        "overflow-y-auto"
      )}>
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
