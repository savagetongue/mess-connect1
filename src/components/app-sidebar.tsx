import React from "react";
import {
  Home, User, Settings, Utensils, Wallet, MessageSquare, Lightbulb, Shield, FileText, Send, StickyNote
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth";
import { useLocation } from "react-router-dom";
const studentNav = [
  { href: "/student", label: "Dashboard", icon: Home },
  { href: "/student/menu", label: "Weekly Menu", icon: Utensils },
  { href: "/student/dues", label: "My Dues", icon: Wallet },
  { href: "/student/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/student/suggestions", label: "Suggestions", icon: Lightbulb },
];
const managerNav = [
  { href: "/manager", label: "Dashboard", icon: Home },
  { href: "/manager/students", label: "Student Management", icon: User },
  { href: "/manager/menu", label: "Update Menu", icon: Utensils },
  { href: "/manager/financials", label: "Financials", icon: Wallet },
  { href: "/manager/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/manager/broadcast", label: "Broadcast", icon: Send },
  { href: "/manager/notes", label: "Notes", icon: StickyNote },
  { href: "/manager/settings", label: "Settings", icon: Settings },
];
const adminNav = [
  { href: "/admin", label: "Dashboard", icon: Shield },
  { href: "/admin/complaints", label: "All Complaints", icon: FileText },
];
export function AppSidebar(): JSX.Element {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  const getNavItems = () => {
    switch (user?.role) {
      case 'student': return studentNav;
      case 'manager': return managerNav;
      case 'admin': return adminNav;
      default: return [];
    }
  };
  const navItems = getNavItems();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 center rounded-md bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
            <Utensils size={18} />
          </div>
          <span className="font-display font-semibold text-lg">Mess Connect</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <a href={item.href}><item.icon className="size-4" /> <span>{item.label}</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}