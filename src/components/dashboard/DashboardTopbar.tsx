import React, { useState, useMemo, useEffect } from "react";
import { Bell, Search, LogOut, ShieldCheck, AlertTriangle, Briefcase, Users, FileText, CalendarCheck, Film, Plus, CheckCircle2, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Searchable dashboard menu items and routes database
const searchIndex = [
  { label: "Active Cases / Case Management", path: "/dashboard/cases", category: "Cases", icon: Briefcase },
  { label: "Total Clients & New Client", path: "/dashboard/client", category: "Clients", icon: Users },
  { label: "Appointments & Pending Tasks", path: "/dashboard/appointments", category: "Tasks", icon: FileText },
  { label: "Hearings Schedule", path: "/dashboard/case-status", category: "Schedule", icon: CalendarCheck },
  { label: "Blogs & Active Matters", path: "/dashboard/blogs", category: "Content", icon: Film },
  { label: "Reels Management", path: "/dashboard/reels", category: "Content", icon: Film },
  { label: "Announcements Portal", path: "/dashboard/announcements", category: "General", icon: Bell },
];

// Initial notifications data fallback
const initialNotifications = [
  { id: 1, title: "New hearing scheduled", description: "Case #402 hearing listed for tomorrow.", time: "10m ago", unread: true },
  { id: 2, title: "Client document uploaded", description: "Priya Mehta uploaded KYC documents.", time: "1h ago", unread: true },
  { id: 3, title: "Payment received", description: "Invoice #109 has been successfully paid.", time: "3h ago", unread: false },
];

export function DashboardTopbar({ title }: { title: string }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Listen for custom dashboard update events (Cases, Blogs, Documents, Appointments)
  useEffect(() => {
    const handleNewActivity = (event: any) => {
      const { title, description } = event.detail || {};
      if (title) {
        const newNotif = {
          id: Date.now(),
          title: title,
          description: description || "New entry added successfully.",
          time: "Just now",
          unread: true,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    };

    window.addEventListener("dashboard-notification", handleNewActivity as EventListener);
    return () => {
      window.removeEventListener("dashboard-notification", handleNewActivity as EventListener);
    };
  }, []);

  // Filter items dynamically based on live typing query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchIndex.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSignOut = () => {
    // Saari cookies delete karne ka tarika
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // LocalStorage aur SessionStorage completely clear karein
    localStorage.clear();
    sessionStorage.clear();

    // Redirect & Force reload
    navigate("/", { replace: true });
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur border-b border-border flex items-center px-4 lg:px-8 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl text-primary truncate">{title}</h1>
        </div>

        {/* WORKING LIVE SEARCH BAR */}
        <div className="hidden md:flex relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages, cases, clients…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-secondary/50 border-transparent   transition-all"
          />

          {/* Instant Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-border/60">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        navigate(result.path);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors text-left"
                    >
                      <div className="h-7 w-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{result.label}</p>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{result.category}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                  No matching results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* NOTIFICATION BUTTON WITH HOVER/CLICK DROPDOWN */}
        <div 
          className="relative"
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold animate-pulse" />
            )}
          </Button>

          {/* Notification Hover/Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full w-80 bg-card border border-border rounded-xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer flex gap-3 items-start ${notif.unread ? 'bg-secondary/30' : ''}`}
                    >
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${notif.unread ? 'bg-gold' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>

              <div className="px-4 pt-2 border-t border-border/60 text-center">
                <button 
                  onClick={() => navigate("/dashboard/announcements")}
                  className="text-[11px] text-primary font-medium hover:underline"
                >
                  View all announcements &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <div className="leading-tight">
            <div className="text-xs font-medium text-primary">Admin</div>
            <div className="text-[10px] text-muted-foreground ">admin@anujsinha.law</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowLogoutModal(true)} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* CENTER CONFIRMATION POPUP MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Confirm Sign Out</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to log out of your admin dashboard session?
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <Button
                variant="outline"
                className="w-full sm:w-28"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </Button>
              <Button
                className="w-full sm:w-28 text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#f43f5e" }}
                onClick={handleSignOut}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}