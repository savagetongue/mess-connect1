import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/store/auth";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageToggle } from "../LanguageToggle";
type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};
export function AppLayout({ children, className }: AppLayoutProps): JSX.Element {
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* Header content can go here */}
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle className="relative top-0 right-0" />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </header>
          <main className={"flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8" + (className ? ` ${className}` : "")}>
            {children}
          </main>
        </SidebarInset>
        <Toaster richColors closeButton />
      </div>
    </SidebarProvider>
  );
}