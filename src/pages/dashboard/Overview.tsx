import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Users, UserPlus, PhoneCall, Flame, UserX, GraduationCap, 
  Calendar, FileText, DollarSign, BarChart3, Mail, 
  MessageSquare, SlidersHorizontal, X, Check, 
  TrendingUp, ShieldCheck, PieChart, Bell
} from "lucide-react";

const Overview = () => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeTab] = useState("dashboard");

  // Widget visibility state for customization
  const [visibleWidgets, setVisibleWidgets] = useState({
    liveStats: true,
    aiInsights: true,
    followUps: true,
    recentLeads: true,
    chartsSection: true,
    performanceAndDocs: true,
    upcomingAndActions: true,
  });

  const handleWidgetToggle = (key: keyof typeof visibleWidgets) => {
    setVisibleWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        
        {/* Top Header & Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/50 backdrop-blur-sm p-5 rounded-2xl border border-border/60 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-medium">
              <span>Home</span>
              <span>/</span>
              <span className="text-foreground capitalize">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Comprehensive pipeline management, counsellors metrics, and real-time conversion insights.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCustomizeOpen(true)}
              className="gap-2 shadow-sm bg-background hover:bg-muted/50 border-border font-medium"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Customize Widgets</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 shadow-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Lead</span>
            </Button>
          </div>
        </div>

        {/* 1. Live Stats Cards (8–10 Live Stats Cards) */}
        {visibleWidgets.liveStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { title: "All Leads", value: "3,842", change: "+14% this mo", icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { title: "New Leads", value: "148", change: "Unassigned", icon: UserPlus, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
              { title: "Follow-up Today", value: "42", change: "Due now", icon: PhoneCall, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { title: "Hot Leads", value: "86", change: "High intent", icon: Flame, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
              { title: "Admission Done", value: "624", change: "Target 80%", icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { title: "Assigned Leads", value: "1,290", change: "Active pool", icon: ShieldCheck, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
              { title: "Lost Leads", value: "312", change: "-4% churn", icon: UserX, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
              { title: "Pending Docs", value: "54", change: "Verification", icon: FileText, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
              { title: "Revenue Collected", value: "₹1.42 Cr", change: "+18% YoY", icon: DollarSign, color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
              { title: "Conversion Rate", value: "16.2%", change: "+2.4% avg", icon: TrendingUp, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 rounded-xl border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                  <div className="p-1.5 rounded-lg bg-background/80 border border-border/40 shadow-xs">
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground">{stat.value}</h3>
                  <p className="text-[11px] font-medium mt-0.5 text-muted-foreground">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. AI Insights Panel */}
        {visibleWidgets.aiInsights && (
          <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/5 via-card to-card shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">AI Intelligence & Pipeline Recommendations</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Live Analysis</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-primary">High Conversion Alert</p>
                <p className="text-xs text-muted-foreground mt-1">Leads from <b>Noida & Delhi NCR</b> requesting MCA courses show a <b>34% higher</b> closure rate when called within 15 minutes.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-amber-500">Follow-up Bottleneck</p>
                <p className="text-xs text-muted-foreground mt-1">Counselor <b>Rahul Sharma</b> has 14 pending follow-ups overdue from yesterday afternoon session.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-emerald-500">Campaign Optimization</p>
                <p className="text-xs text-muted-foreground mt-1">Instagram Lead Form #4 generated 42 Hot Leads today with an acquisition cost lower by 18%.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Today's Follow-ups & Recent Leads Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Follow-ups */}
          {visibleWidgets.followUps && (
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Today's Follow-ups</h2>
                  <p className="text-xs text-muted-foreground">Scheduled calls & priority interactions</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-primary h-8">View All (42)</Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Aarav Gupta", course: "MCA - Full Stack", time: "11:30 AM", status: "Urgent", phone: "+91 98765 XXXXX" },
                  { name: "Sneha Verma", course: "B.Tech CSE", time: "01:00 PM", status: "Hot Lead", phone: "+91 91234 XXXXX" },
                  { name: "Vikram Malhotra", course: "MBA - Data Science", time: "03:30 PM", status: "Negotiation", phone: "+91 99887 XXXXX" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/40 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">{item.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.course} • {item.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground">{item.time}</span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <button title="Call Lead" className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button title="WhatsApp" className="p-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Leads Table */}
          {visibleWidgets.recentLeads && (
            <div className="lg:col-span-2 p-5 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Recent Leads Pipeline</h2>
                  <p className="text-xs text-muted-foreground">Latest inquiries across portals and landing pages</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-8">Filter Leads</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Candidate Name</th>
                      <th className="pb-3 font-semibold">Course Interested</th>
                      <th className="pb-3 font-semibold">Source</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {[
                      { name: "Priya Sharma", course: "MCA (Online)", source: "Google Ads", status: "New Lead", badge: "bg-blue-500/10 text-blue-500" },
                      { name: "Rohan Kapoor", course: "B.Tech AI & ML", source: "Instagram", status: "Hot Lead", badge: "bg-rose-500/10 text-rose-500" },
                      { name: "Ananya Singh", course: "MBA Executive", source: "Website", status: "Assigned", badge: "bg-purple-500/10 text-purple-500" },
                      { name: "Amitabh Roy", course: "BCA Program", source: "Naukri Campus", status: "Admission Done", badge: "bg-emerald-500/10 text-emerald-500" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{row.name}</td>
                        <td className="py-3 text-muted-foreground">{row.course}</td>
                        <td className="py-3 text-muted-foreground">{row.source}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold ${row.badge}`}>{row.status}</span>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* 4. Lead Source Chart & Revenue Chart */}
        {visibleWidgets.chartsSection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Lead Source Chart */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Lead Source Distribution</h2>
                  <p className="text-xs text-muted-foreground">Inquiries categorized by acquisition channels</p>
                </div>
                <PieChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3.5 py-2">
                {[
                  { label: "Google Ads & SEO", count: "1,420 Leads", percent: "38%", color: "bg-blue-500" },
                  { label: "Instagram & Meta Ads", count: "980 Leads", percent: "26%", color: "bg-purple-500" },
                  { label: "Direct Website Inquiries", count: "640 Leads", percent: "17%", color: "bg-emerald-500" },
                  { label: "Education Portals & Affiliates", count: "512 Leads", percent: "14%", color: "bg-amber-500" },
                  { label: "Walk-ins & Referrals", count: "180 Leads", percent: "5%", color: "bg-cyan-500" },
                ].map((ch, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{ch.label}</span>
                      <span className="text-muted-foreground">{ch.count} ({ch.percent})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${ch.color}`} style={{ width: ch.percent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Revenue & Fee Collections</h2>
                  <p className="text-xs text-muted-foreground">Monthly milestone comparisons for FY 2026</p>
                </div>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2 border-b border-border">
                {[
                  { month: "Jan", amount: "₹84L", height: "60%" },
                  { month: "Feb", amount: "₹92L", height: "70%" },
                  { month: "Mar", amount: "₹1.1Cr", height: "85%" },
                  { month: "Apr", amount: "₹98L", height: "75%" },
                  { month: "May", amount: "₹1.25Cr", height: "90%" },
                  { month: "Jun", amount: "₹1.42Cr", height: "100%" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-muted-foreground">{bar.amount}</span>
                    <div className="w-full rounded-t-lg bg-primary/20 hover:bg-primary transition-all relative group" style={{ height: bar.height }}>
                      <div className="absolute inset-0 bg-primary rounded-t-lg opacity-80 group-hover:opacity-100" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. Counsellor Performance & Pending Documents */}
        {visibleWidgets.performanceAndDocs && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Counsellor Performance */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Counsellor Performance Leaderboard</h2>
                  <p className="text-xs text-muted-foreground">Admissions closed and conversion metrics</p>
                </div>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {[
                  { name: "Ankit Verma", conversions: "84 Admissions", rate: "24.5%", avatar: "AV" },
                  { name: "Neha Sharma", conversions: "72 Admissions", rate: "21.0%", avatar: "NS" },
                  { name: "Kunal Mehra", conversions: "65 Admissions", rate: "19.2%", avatar: "KM" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {c.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.conversions} closed this month</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">{c.rate} Conversion</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Documents */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Pending Admission Documents</h2>
                  <p className="text-xs text-muted-foreground">Verifications awaiting student uploads</p>
                </div>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {[
                  { name: "Deepak Kumar", doc: "Graduation Marksheet (MCA)", status: "Pending Verification" },
                  { name: "Ritu Aggarwal", doc: "Transfer Certificate", status: "Awaiting Upload" },
                  { name: "Siddharth Jain", doc: "ID Proof & Photo", status: "Pending Verification" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/40">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.doc}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-500">{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. Upcoming Meetings, Notifications & Quick Actions */}
        {visibleWidgets.upcomingAndActions && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upcoming Meetings */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Upcoming Meetings</h2>
                  <p className="text-xs text-muted-foreground">Scheduled counselling calls & interviews</p>
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-bold text-primary">02:30 PM Today</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">Parent Consultation - MCA Admission</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Video Call via Zoom • Confirmed</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-xs font-bold text-muted-foreground">Tomorrow, 10:00 AM</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">Scholarship Assessment Interview</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Campus Room 302 • Offline</p>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Notifications & Alerts</h2>
                  <p className="text-xs text-muted-foreground">System updates and lead broadcasts</p>
                </div>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/40">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Fee installment received for #MCA-2026-089</p>
                    <p className="text-muted-foreground mt-0.5">₹45,000 credited via Razorpay gateway.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/40">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Server backup completed successfully</p>
                    <p className="text-muted-foreground mt-0.5">Database synced with AWS cloud instance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Quick Action Shortcuts</h2>
                <p className="text-xs text-muted-foreground">Frequent CRM operations</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {[
                  { label: "New Lead", icon: UserPlus },
                  { label: "Send Broadcast", icon: Mail },
                  { label: "Schedule Call", icon: PhoneCall },
                  { label: "Verify Docs", icon: ShieldCheck },
                ].map((act, i) => (
                  <button key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-all text-left">
                    <act.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground">{act.label}</span>
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Open Full System Settings
              </Button>
            </div>

          </div>
        )}

      </div>

      {/* Customize Widgets Modal Drawer */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Customize CRM Dashboard</h3>
                <p className="text-xs text-muted-foreground">Toggle sections and drag-and-drop widgets</p>
              </div>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {[
                { key: "liveStats", label: "Live Stats Cards (8-10 metrics)", desc: "Top overview cards & numbers" },
                { key: "aiInsights", label: "AI Insights Panel", desc: "Automated conversion suggestions" },
                { key: "followUps", label: "Today's Follow-ups", desc: "Scheduled calls and priority tasks" },
                { key: "recentLeads", label: "Recent Leads Table", desc: "Pipeline table with recent inquiries" },
                { key: "chartsSection", label: "Lead Source & Revenue Charts", desc: "Distribution graphs and fee collections" },
                { key: "performanceAndDocs", label: "Counsellors & Pending Documents", desc: "Leaderboards and document verification" },
                { key: "upcomingAndActions", label: "Upcoming Meetings & Quick Actions", desc: "Calendar events and shortcut tools" },
              ].map((item) => {
                const isChecked = visibleWidgets[item.key as keyof typeof visibleWidgets];
                return (
                  <div 
                    key={item.key}
                    onClick={() => handleWidgetToggle(item.key as keyof typeof visibleWidgets)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked 
                        ? 'border-primary/40 bg-primary/5 text-foreground shadow-sm' 
                        : 'border-border/60 bg-muted/20 text-muted-foreground opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      isChecked ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-border bg-muted/20">
              <Button variant="default" size="sm" onClick={() => setIsCustomizeOpen(false)} className="px-5 font-semibold">
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Overview;