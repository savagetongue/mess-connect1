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
import { useTranslation } from "react-i18next";
export function AppSidebar(): JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  const studentNav = [
    { href: "/student", label: t('sidebar_dashboard'), icon: Home },
    { href: "/student/menu", label: t('sidebar_weeklyMenu'), icon: Utensils },
    { href: "/student/dues", label: t('sidebar_myDues'), icon: Wallet },
    { href: "/student/complaints", label: t('sidebar_complaints'), icon: MessageSquare },
    { href: "/student/suggestions", label: t('sidebar_suggestions'), icon: Lightbulb },
    { href: "/student/rules", label: t('sidebar_messRules'), icon: FileText },
  ];
  const managerNav = [
    { href: "/manager", label: t('sidebar_dashboard'), icon: Home },
    { href: "/manager/students", label: t('sidebar_studentManagement'), icon: User },
    { href: "/manager/menu", label: t('sidebar_updateMenu'), icon: Utensils },
    { href: "/manager/financials", label: t('sidebar_financials'), icon: Wallet },
    { href: "/manager/feedback", label: t('sidebar_feedback'), icon: MessageSquare },
    { href: "/manager/broadcast", label: t('sidebar_broadcast'), icon: Send },
    { href: "/manager/notes", label: t('sidebar_notes'), icon: StickyNote },
    { href: "/manager/settings", label: t('sidebar_settings'), icon: Settings },
  ];
  const adminNav = [
    { href: "/admin", label: t('sidebar_adminDashboard'), icon: Shield },
    { href: "/admin/complaints", label: t('sidebar_allComplaints'), icon: FileText },
  ];
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