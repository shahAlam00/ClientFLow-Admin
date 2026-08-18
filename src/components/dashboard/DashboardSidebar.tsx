import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Phone,
  FileText,
  Mic,
  FolderLock,
  CalendarCheck,
  Film,
  ChevronDown,
  Share2,
  Layers,
  Sparkles,
  ClipboardCheck,
  BriefcaseBusiness,
  BellRing,
  IndianRupee,
  PanelRightInactiveIcon,
  Scale,
  PlusCircle,
  Users,
  CreditCard,
  Files,
  ChartColumn,
  ShieldCheck,
  Landmark,
  Calendar,
  Megaphone,
  UserPlus,
  FileMinus,
  WalletCards
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "MAIN",
    icon: LayoutDashboard,
    isDropdown: true,
    dropdownKey: "main",
    children: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, end: true },
      // { title: "Contact Information", url: "/dashboard/contact", icon: Phone },
      // { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
      // { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
      // { title: "Announcements", url: "/dashboard/announcements", icon: Megaphone },
      // { title: "Reminders", url: "/dashboard/reminders", icon: BellRing },
    ]
  },
  // {
  //   title: "ADDMISSIONS",
  //   icon: LayoutDashboard,
  //   isDropdown: true,
  //   dropdownKey: "admissions",
  //   children: [
  //     { title: "Admissions Pipeline", url: "/dashboard/admissions", icon: LayoutDashboard, end: true },
  //     { title: "Applications", url: "/dashboard/applications", icon: LayoutDashboard, end: true },
  //     { title: "Admissions", url: "/dashboard/admissionss", icon: LayoutDashboard, end: true },
  //     { title: "Enrollment", url: "/dashboard/enrollment", icon: LayoutDashboard, end: true },
  //     // { title: "Contact Information", url: "/dashboard/contact", icon: Phone },
  //     // { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  //     // { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  //     // { title: "Announcements", url: "/dashboard/announcements", icon: Megaphone },
  //     // { title: "Reminders", url: "/dashboard/reminders", icon: BellRing },
  //   ]
  // },
  // {
  //   title: "SOCIAL MEDIA",
  //   icon: Share2,
  //   isDropdown: true,
  //   dropdownKey: "social",
  //   children: [
  //     { title: "Reels", url: "/dashboard/reels", icon: Film },
  //     { title: "Blog", url: "/dashboard/blogs", icon: FileText },
  //     { title: "Podcast", url: "/dashboard/podcasts", icon: Mic },
  //   ]
  // },
  {
    title: "LEAD MANAGEMENT",
    icon: Layers,
    isDropdown: true,
    dropdownKey: "leadDrop",
    children: [
      { title: "Students", url: "/dashboard/leads", icon: FileText },
      { title: "Student Notes", url: "/dashboard/smart-services", icon: Sparkles }
    ]
  },
  {
    title: "STUDENTS",
    icon: Users,
    isDropdown: true,
    dropdownKey: "students",
    children: [
      { title: "Add Student", url: "/dashboard/student", icon: UserPlus, end: true },
      { title: "All Students", url: "/dashboard/students", icon: Users, end: true },
      // { title: "Referrers", url: "/dashboard/referrers", icon: ClipboardCheck, end: true },
      // { title: "Case Management", url: "/dashboard/case-status", icon: BriefcaseBusiness },
    ]
  },
  // {
  //   title: "BILLINGS",
  //   icon: CreditCard,
  //   isDropdown: true,
  //   dropdownKey: "billing",
  //   children: [
  //     { title: "Invoices", url: "/dashboard/invoices", icon: FileText, end: true },
  //     { title: "Proforma Invoices", url: "/dashboard/proforma-invoices", icon: ClipboardCheck, end: true },
  //     { title: "Credit Notes", url: "/dashboard/credit-notes", icon: FileMinus, end: true },
  //     { title: "Payments", url: "/dashboard/payments", icon: BriefcaseBusiness },
  //     { title: "Expenses", url: "/dashboard/expenses", icon: WalletCards },
  //   ]
  // },
  {
    title: "STUDENT DOCUMENTS",
    icon: Files,
    isDropdown: true,
    dropdownKey: "documents",
    children: [
      { title: "Document", url: "/dashboard/cases", icon: FolderLock, end: true },
    ]
  },
  // {
  //   title: "MATTERS",
  //   icon: Scale,
  //   isDropdown: true,
  //   dropdownKey: "matters",
  //   children: [
  //     { title: "Add New", url: "/dashboard/add", icon: PlusCircle, end: true },
  //     { title: "Litigation (CASES)", url: "/dashboard/litigation", icon: ShieldCheck, end: true },
  //     { title: "Non-Litigation (CASES)", url: "/dashboard/nonlitigation", icon: Landmark, end: true },
  //   ]
  // },
  {
    title: "ANALYTICS",
    icon: ChartColumn,
    isDropdown: true,
    dropdownKey: "analytics",
    children: [
      { title: "Money Pulse", url: "/dashboard/cash-flow", icon: IndianRupee, end: true },
      // { title: "Practice", url: "/dashboard/practice", icon: PanelRightInactiveIcon, end: true },
      // { title: "Case Intelligence", url: "/dashboard/case-intelligence", icon: PanelRightInactiveIcon, end: true },
    ]
  },
];

export function DashboardSidebar() {
  const { pathname } = useLocation();

  const [dropdownStates, setDropdownStates] = useState<{ [key: string]: boolean }>(() => {
    const initialState: { [key: string]: boolean } = {};
    items.forEach((item) => {
      if (item.isDropdown && item.dropdownKey && item.children) {
        initialState[item.dropdownKey] = item.children.some((child) =>
          child.end ? pathname === child.url : pathname.startsWith(child.url)
        );
      }
    });
    return initialState;
  });

  useEffect(() => {
    items.forEach((item) => {
      if (item.isDropdown && item.dropdownKey && item.children) {
        const isChildActive = item.children.some((child) =>
          child.end ? pathname === child.url : pathname.startsWith(child.url)
        );
        if (isChildActive) {
          setDropdownStates((prev) => ({ ...prev, [item.dropdownKey!]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleDropdown = (key: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-screen w-64 flex-col bg-slate-950 text-slate-100 border-r border-blue-950/60 shadow-2xl overflow-hidden">
      {/* TOP BRANDING & LOGO */}
      <div className="h-20 shrink-0 flex items-center gap-3 px-6 border-b border-blue-900/30 bg-gradient-to-r from-blue-950/50 to-transparent">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/50 flex items-center justify-center border border-blue-400/20 text-white">
          {/* <Scale className="h-6 w-6 text-blue-100" /> */}
          <h1 className="text-2xl">C</h1>
        </div>
        <div className="leading-tight">
          <div className="text-[17px] font-bold tracking-wide text-white">Client<span className="text-blue-400">Flow</span></div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/80 mt-0.5">Admin Console</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin scrollbar-thumb-blue-900/40">
        <div className="space-y-1.5">
          {items.map((item) => {
            if (item.isDropdown && item.dropdownKey) {
              const isChildActive = item.children?.some(child =>
                child.end ? pathname === child.url : pathname.startsWith(child.url)
              );
              const isOpen = dropdownStates[item.dropdownKey];

              return (
                <div key={item.title} className="space-y-1">
                  {/* Parent Trigger Button */}
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.dropdownKey!)}
                    className={cn(
                      "group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                      isChildActive
                        ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20"
                        : "text-slate-300/80 hover:bg-blue-950/40 hover:text-white"
                    )}
                  >
                    {isChildActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isChildActive && "scale-110 text-blue-400")} />
                    <span className="truncate text-left flex-1 tracking-wide">{item.title}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-70 transition-transform duration-300", isOpen && "rotate-180 text-blue-400")} />
                  </button>

                  {/* Dropdown Children Links Container */}
                  {isOpen && (
                    <div className="pl-4 space-y-1 transition-all duration-300 border-l border-blue-950/80 ml-4 my-1">
                      {item.children?.map((child) => {
                        const isSubActive = child.end ? pathname === child.url : pathname.startsWith(child.url);

                        return (
                          <NavLink
                            key={child.url}
                            to={child.url}
                            end={child.end}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                              isSubActive
                                ? "text-blue-300 bg-blue-600/15 font-semibold border-l-2 border-blue-400"
                                : "text-slate-400 hover:bg-blue-950/30 hover:text-slate-200"
                            )}
                          >
                            <child.icon className={cn("h-3.5 w-3.5 shrink-0", isSubActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className="truncate">{child.title}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = item.end ? pathname === item.url : pathname.startsWith(item.url);

            return (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.end}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20"
                    : "text-slate-300/80 hover:bg-blue-950/40 hover:text-white"
                )}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />}
                <item.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300", active && "scale-110 text-blue-400")} />
                <span className="truncate tracking-wide">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="shrink-0 px-5 py-4 border-t border-blue-900/30 bg-blue-950/20">
        <p className="text-[11px] leading-5 text-slate-400">
          © {new Date().getFullYear()} Client Flow CRM.<br />
          <span className="text-slate-500">All rights reserved.</span>
        </p>
      </div>
    </aside>
  );
}