import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO 
} from "date-fns";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Gavel, Clock, MapPin, AlertCircle, FileText, 
  Plus, CalendarDays, ChevronDown, User, ArrowRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Comprehensive Mock Data
const mockCases = [
  {
    _id: "CASE-2026-001",
    title: "Adesh Kumar Bhardwaj v. M/s Arcmate Samiah Consortium & Ors.",
    case_number: "CC/1245/2026",
    court_name: "CJM Surajpur",
    case_stage: "Evidence",
    priority: "High",
    nod: "2026-06-16T10:00:00Z",
    client_name: "Adesh Kumar",
    hearing_purpose: "Cross Examination"
  },
  {
    _id: "CASE-2026-002",
    title: "State vs. Rahul Verma",
    case_number: "FIR/44/2026",
    court_name: "District Court GBN",
    case_stage: "Arguments",
    priority: "Normal",
    nod: "2026-06-16T14:30:00Z",
    client_name: "Rahul Verma",
    hearing_purpose: "Bail Hearing"
  },
  {
    _id: "CASE-2026-003",
    title: "Priya Singh v. Rajat Singh",
    case_number: "HMA/890/2026",
    court_name: "Family Court GBN",
    case_stage: "Mediation",
    priority: "Urgent",
    nod: "2026-06-18T10:00:00Z",
    client_name: "Priya Singh",
    hearing_purpose: "Interim Maintenance"
  }
];

const CaseManagement = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // States
  const [selectedDate, setSelectedDate] = useState(new Date("2026-06-16"));
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-06-16"));
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter cases for selected date
  const casesOnSelectedDate = mockCases.filter(c => 
    isSameDay(parseISO(c.nod), selectedDate)
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Render function for the compact dropdown calendar grid
  const renderDropdownCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const hasMatters = mockCases.some(c => isSameDay(parseISO(c.nod), cloneDay));

        days.push(
          <button
            key={day.toString()}
            onClick={() => {
              setSelectedDate(cloneDay);
              setIsOpen(false); // Close popover instantly on select
            }}
            className={`w-8 h-8 text-xs font-medium rounded-full flex flex-col items-center justify-center relative transition-all ${
              !isCurrentMonth ? "text-muted-foreground/30" : "text-foreground hover:bg-muted"
            } ${
              isSelected ? "bg-primary text-primary-foreground font-semibold hover:bg-primary" : ""
            }`}
          >
            <span>{format(day, "d")}</span>
            {hasMatters && !isSelected && (
              <span className="w-1 h-1 rounded-full bg-red-500 absolute bottom-1"></span>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="p-3 bg-card border shadow-xl rounded-xl w-[280px] absolute top-12 left-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Month Selector Controls */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {/* Days Header Letters */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        {/* Dates Grid Area */}
        <div className="space-y-1">{rows}</div>
      </div>
    );
  };
  return (
    <DashboardLayout title="Case Docket">
      <div className="max-w-7xl space-y-6 animate-in fade-in duration-300">
        {/* Dynamic Action Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
          
          {/* Popover Toggle Button Wrapper */}
          <div className="relative inline-block" ref={dropdownRef}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
              Selected Schedule Date
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 bg-muted/40 font-semibold px-4 py-2 border-border rounded-xl hover:bg-muted text-foreground transition-all shadow-sm"
            >
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>{format(selectedDate, "eee, dd MMM yyyy")}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isOpen && renderDropdownCalendar()}
          </div>
          {/* Action Call Contextual Button */}
          <div className="sm:self-end">
            <Button 
              onClick={() => navigate(`/dashboard/cases/add?date=${format(selectedDate, "yyyy-MM-dd")}`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm rounded-xl px-5"
            >
              <Plus className="w-4 h-4" /> Add Case / Hearing
            </Button>
          </div>
        </div>
        {/* Dynamic Results Grid Section */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-card">
          <CardHeader className="border-b border-border/40 bg-muted/10 py-4 px-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Daily Cause List</CardTitle>
                <CardDescription className="text-xs">Scheduled appearances mapped for this date context</CardDescription>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-primary/5 border border-primary/10 rounded-lg text-primary font-bold">
                {casesOnSelectedDate.length} {casesOnSelectedDate.length === 1 ? 'Matter' : 'Matters'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {casesOnSelectedDate.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">No hearings scheduled</p>
                <p className="text-xs mt-1 text-muted-foreground max-w-xs mx-auto">
                  There are no system records or filings listed on {format(selectedDate, "dd MMMM")}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {casesOnSelectedDate.map((caseItem) => (
                  <div 
                    key={caseItem._id} 
                    className="p-5 hover:bg-muted/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Priority pill & ID */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                          {caseItem._id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          caseItem.priority === 'Urgent' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {caseItem.priority}
                        </span>
                      </div>
                      {/* Case Title */}
                      <h4 className="font-bold text-sm sm:text-base text-foreground tracking-tight max-w-2xl leading-snug">
                        {caseItem.title}
                      </h4>
                      {/* Meta information items */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 opacity-70" />
                          <span>Client: <strong className="text-foreground/80 font-medium">{caseItem.client_name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gavel className="w-3.5 h-3.5 opacity-70" />
                          <span>{caseItem.case_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          <span>{caseItem.court_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage & Action buttons right aligned */}
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-0 border-dashed border-border gap-2 shrink-0">
                      <div className="text-xs bg-primary/10 text-primary border border-primary/20 font-bold px-2.5 py-1 rounded-lg">
                        {caseItem.hearing_purpose}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 font-semibold group-hover:translate-x-1 transition-all"
                        onClick={() => navigate(`/dashboard/cases/${caseItem._id}`)}
                      >
                        Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CaseManagement;