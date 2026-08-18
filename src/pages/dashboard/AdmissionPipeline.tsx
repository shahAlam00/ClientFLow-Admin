import React, { useMemo, useState } from "react";


import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Phone,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  Users,
  FileText,
  IndianRupee,
  GraduationCap,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Circle,
  X,
  ArrowRight,
  UserRound,
  Building2,
  BookOpen,
  GripVertical,
  Eye,
  UserPlus,
  ClipboardList,
  WalletCards,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "../../lib/axios";

/* =========================================================
   TYPES
========================================================= */

type PipelineStage =
  | "interested"
  | "counselling"
  | "college_selected"
  | "application_started"
  | "documents_pending"
  | "application_submitted"
  | "under_review"
  | "selected"
  | "fee_pending"
  | "admission_confirmed"
  | "enrolled";

type Priority = "high" | "medium" | "low";

interface AdmissionLead {
  id: string;
  leadId: string;
  studentName: string;
  phone: string;
  email: string;
  course: string;
  college: string;
  city: string;
  counsellor: string;
  counsellorInitials: string;
  stage: PipelineStage;
  priority: Priority;
  leadScore: number;
  documentsReceived: number;
  documentsRequired: number;
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  nextFollowUp: string | null;
  nextFollowUpTime?: string;
  source: string;
  createdAt: string;
  lastActivity: string;
  notes?: string;
}

/* =========================================================
   PIPELINE CONFIG
========================================================= */

const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
  description: string;
}[] = [
    {
      id: "interested",
      label: "Interested",
      description: "Student has shown interest",
    },
    {
      id: "counselling",
      label: "Counselling Done",
      description: "Counselling completed",
    },
    {
      id: "college_selected",
      label: "College Selected",
      description: "Student selected college",
    },
    {
      id: "application_started",
      label: "Application Started",
      description: "Application process started",
    },
    {
      id: "documents_pending",
      label: "Documents Pending",
      description: "Documents are incomplete",
    },
    {
      id: "application_submitted",
      label: "Application Submitted",
      description: "Application submitted",
    },
    {
      id: "under_review",
      label: "Under Review",
      description: "College is reviewing",
    },
    {
      id: "selected",
      label: "Selected / Offer",
      description: "Student received selection",
    },
    {
      id: "fee_pending",
      label: "Fee Pending",
      description: "Admission fee is pending",
    },
    {
      id: "admission_confirmed",
      label: "Admission Confirmed",
      description: "Admission confirmed",
    },
    {
      id: "enrolled",
      label: "Enrolled",
      description: "Student successfully enrolled",
    },
  ];

/* =========================================================
   DEMO DATA
   Replace with API response later.
========================================================= */

const initialLeads: AdmissionLead[] = [
  {
    id: "1",
    leadId: "VU-10231",
    studentName: "Navnit Kumar",
    phone: "+91 9142051894",
    email: "navnit.7809@gmail.com",
    course: "B.Tech",
    college: "Galgotias University",
    city: "Gaya",
    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",
    stage: "documents_pending",
    priority: "high",
    leadScore: 92,
    documentsReceived: 8,
    documentsRequired: 10,
    totalFee: 150000,
    paidFee: 75000,
    pendingFee: 75000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "11:00 AM",
    source: "Website",
    createdAt: "2026-08-13",
    lastActivity: "Documents requested",
    notes: "Parent wants hostel facility.",
  },
  {
    id: "2",
    leadId: "VU-10232",
    studentName: "Manish Kumar",
    phone: "+91 9785587424",
    email: "manishkumarbargora2006@gmail.com",
    course: "BA",
    college: "Lloyd Institute",
    city: "Jodhpur",
    counsellor: "Neha Singh",
    counsellorInitials: "NS",
    stage: "college_selected",
    priority: "medium",
    leadScore: 78,
    documentsReceived: 4,
    documentsRequired: 10,
    totalFee: 110000,
    paidFee: 0,
    pendingFee: 110000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "02:00 PM",
    source: "Instagram",
    createdAt: "2026-08-12",
    lastActivity: "College shortlisted",
    notes: "Interested in scholarship.",
  },
  {
    id: "3",
    leadId: "VU-10233",
    studentName: "Nigam Kumar Sahu",
    phone: "+91 9109726059",
    email: "nigamsahu115@gmail.com",
    course: "BCA",
    college: "IIMT University",
    city: "Madhya Pradesh",
    counsellor: "Amit Verma",
    counsellorInitials: "AV",
    stage: "application_submitted",
    priority: "high",
    leadScore: 89,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 135000,
    paidFee: 25000,
    pendingFee: 110000,
    nextFollowUp: "2026-08-19",
    nextFollowUpTime: "10:30 AM",
    source: "Facebook",
    createdAt: "2026-08-10",
    lastActivity: "Application submitted",
    notes: "Waiting for college response.",
  },
  {
    id: "4",
    leadId: "VU-10234",
    studentName: "Monika",
    phone: "+91 6363561319",
    email: "sreenareenivas944@gmail.com",
    course: "M.Tech",
    college: "Sharda University",
    city: "Bangalore",
    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",
    stage: "selected",
    priority: "high",
    leadScore: 95,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 180000,
    paidFee: 100000,
    pendingFee: 80000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "04:00 PM",
    source: "Website",
    createdAt: "2026-08-10",
    lastActivity: "Offer letter received",
    notes: "Parent ready for fee discussion.",
  },
  {
    id: "5",
    leadId: "VU-10235",
    studentName: "Damini Kirtishni Thakor",
    phone: "+91 8780440323",
    email: "dkthakor0951@gmail.com",
    course: "B.Tech",
    college: "GLS University",
    city: "Mahesana",
    counsellor: "Priya Mehta",
    counsellorInitials: "PM",
    stage: "interested",
    priority: "medium",
    leadScore: 68,
    documentsReceived: 0,
    documentsRequired: 10,
    totalFee: 200000,
    paidFee: 0,
    pendingFee: 200000,
    nextFollowUp: "2026-08-20",
    nextFollowUpTime: "01:00 PM",
    source: "WhatsApp",
    createdAt: "2026-08-07",
    lastActivity: "Interested in B.Tech",
    notes: "Need to discuss budget with parent.",
  },
  {
    id: "6",
    leadId: "VU-10236",
    studentName: "Priyal Mihir Jha",
    phone: "+91 8355901427",
    email: "priyaljha812@gmail.com",
    course: "B.Tech",
    college: "Amity University",
    city: "New Delhi",
    counsellor: "Neha Singh",
    counsellorInitials: "NS",
    stage: "counselling",
    priority: "low",
    leadScore: 55,
    documentsReceived: 2,
    documentsRequired: 10,
    totalFee: 250000,
    paidFee: 0,
    pendingFee: 250000,
    nextFollowUp: "2026-08-21",
    nextFollowUpTime: "03:30 PM",
    source: "Google Ads",
    createdAt: "2026-07-30",
    lastActivity: "Counselling completed",
    notes: "Student comparing colleges.",
  },
  {
    id: "7",
    leadId: "VU-10237",
    studentName: "Khushbu Kumari",
    phone: "+91 7548398558",
    email: "khushbu@gmail.com",
    course: "BA",
    college: "Lloyd Institute",
    city: "Rohtas",
    counsellor: "Amit Verma",
    counsellorInitials: "AV",
    stage: "application_started",
    priority: "medium",
    leadScore: 74,
    documentsReceived: 6,
    documentsRequired: 10,
    totalFee: 100000,
    paidFee: 10000,
    pendingFee: 90000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "05:00 PM",
    source: "Referral",
    createdAt: "2026-07-28",
    lastActivity: "Application created",
    notes: "Need remaining documents.",
  },
  {
    id: "8",
    leadId: "VU-10238",
    studentName: "Aman Singh",
    phone: "+91 9876543210",
    email: "aman.singh@gmail.com",
    course: "MBA",
    college: "Sharda University",
    city: "Noida",
    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",
    stage: "under_review",
    priority: "high",
    leadScore: 91,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 220000,
    paidFee: 50000,
    pendingFee: 170000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "12:00 PM",
    source: "Website",
    createdAt: "2026-07-25",
    lastActivity: "College reviewing application",
    notes: "Application under university review.",
  },
  {
    id: "9",
    leadId: "VU-10239",
    studentName: "Riya Sharma",
    phone: "+91 9876512345",
    email: "riya.sharma@gmail.com",
    course: "BBA",
    college: "Amity University",
    city: "Lucknow",
    counsellor: "Priya Mehta",
    counsellorInitials: "PM",
    stage: "fee_pending",
    priority: "high",
    leadScore: 97,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 175000,
    paidFee: 125000,
    pendingFee: 50000,
    nextFollowUp: "2026-08-18",
    nextFollowUpTime: "09:30 AM",
    source: "Instagram",
    createdAt: "2026-07-20",
    lastActivity: "Payment reminder sent",
    notes: "Final fee installment pending.",
  },
  {
    id: "10",
    leadId: "VU-10240",
    studentName: "Aditya Raj",
    phone: "+91 9988776655",
    email: "aditya.raj@gmail.com",
    course: "BCA",
    college: "Galgotias University",
    city: "Patna",
    counsellor: "Amit Verma",
    counsellorInitials: "AV",
    stage: "admission_confirmed",
    priority: "high",
    leadScore: 100,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 140000,
    paidFee: 140000,
    pendingFee: 0,
    nextFollowUp: null,
    source: "Website",
    createdAt: "2026-07-18",
    lastActivity: "Admission confirmed",
    notes: "Waiting for joining date.",
  },
  {
    id: "11",
    leadId: "VU-10241",
    studentName: "Sakshi Gupta",
    phone: "+91 9876001234",
    email: "sakshi@gmail.com",
    course: "MCA",
    college: "Galgotias University",
    city: "Delhi",
    counsellor: "Neha Singh",
    counsellorInitials: "NS",
    stage: "enrolled",
    priority: "high",
    leadScore: 100,
    documentsReceived: 10,
    documentsRequired: 10,
    totalFee: 190000,
    paidFee: 190000,
    pendingFee: 0,
    nextFollowUp: null,
    source: "Referral",
    createdAt: "2026-07-10",
    lastActivity: "Student enrolled",
    notes: "Enrollment completed successfully.",
  },
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const formatCurrency = (value: number) => {
  if (!value) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string | null) => {
  if (!date) return "No follow-up";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPriorityClasses = (priority: Priority) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50";

    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";

    case "low":
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getStageClasses = (stage: PipelineStage) => {
  switch (stage) {
    case "interested":
      return {
        dot: "bg-blue-500",
        header: "bg-blue-50/70 dark:bg-blue-950/20",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-900/50",
      };

    case "counselling":
      return {
        dot: "bg-violet-500",
        header: "bg-violet-50/70 dark:bg-violet-950/20",
        text: "text-violet-700 dark:text-violet-400",
        border: "border-violet-200 dark:border-violet-900/50",
      };

    case "college_selected":
      return {
        dot: "bg-indigo-500",
        header: "bg-indigo-50/70 dark:bg-indigo-950/20",
        text: "text-indigo-700 dark:text-indigo-400",
        border: "border-indigo-200 dark:border-indigo-900/50",
      };

    case "application_started":
      return {
        dot: "bg-cyan-500",
        header: "bg-cyan-50/70 dark:bg-cyan-950/20",
        text: "text-cyan-700 dark:text-cyan-400",
        border: "border-cyan-200 dark:border-cyan-900/50",
      };

    case "documents_pending":
      return {
        dot: "bg-amber-500",
        header: "bg-amber-50/70 dark:bg-amber-950/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900/50",
      };

    case "application_submitted":
      return {
        dot: "bg-sky-500",
        header: "bg-sky-50/70 dark:bg-sky-950/20",
        text: "text-sky-700 dark:text-sky-400",
        border: "border-sky-200 dark:border-sky-900/50",
      };

    case "under_review":
      return {
        dot: "bg-orange-500",
        header: "bg-orange-50/70 dark:bg-orange-950/20",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-900/50",
      };

    case "selected":
      return {
        dot: "bg-emerald-500",
        header: "bg-emerald-50/70 dark:bg-emerald-950/20",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-900/50",
      };

    case "fee_pending":
      return {
        dot: "bg-rose-500",
        header: "bg-rose-50/70 dark:bg-rose-950/20",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-900/50",
      };

    case "admission_confirmed":
      return {
        dot: "bg-green-600",
        header: "bg-green-50/70 dark:bg-green-950/20",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-900/50",
      };

    case "enrolled":
      return {
        dot: "bg-teal-600",
        header: "bg-teal-50/70 dark:bg-teal-950/20",
        text: "text-teal-700 dark:text-teal-400",
        border: "border-teal-200 dark:border-teal-900/50",
      };

    default:
      return {
        dot: "bg-slate-500",
        header: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
      };
  }
};

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
  iconClass: string;
}

const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: StatCardProps) => {
  return (

    <Card className="border-border/70 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {label}
            </p>

            <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
              {value}
            </p>

            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {hint}
            </p>
          </div>

          <div
            className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* =========================================================
   STUDENT PIPELINE CARD
========================================================= */

interface LeadCardProps {
  lead: AdmissionLead;
  onDragStart: (lead: AdmissionLead) => void;
  onView: (lead: AdmissionLead) => void;
  onMove: (lead: AdmissionLead, stage: PipelineStage) => void;
}

const LeadCard = ({
  lead,
  onDragStart,
  onView,
  onMove,
}: LeadCardProps) => {
  const documentPercentage =
    lead.documentsRequired > 0
      ? Math.round(
        (lead.documentsReceived / lead.documentsRequired) * 100
      )
      : 0;

  const feePercentage =
    lead.totalFee > 0
      ? Math.round((lead.paidFee / lead.totalFee) * 100)
      : 0;

  return (

    <Card
      draggable
      onDragStart={() => onDragStart(lead)}
      className="group border-border/80 bg-card shadow-sm hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <CardContent className="p-4">
        {/* CARD HEADER */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {lead.studentName
                .split(" ")
                .slice(0, 2)
                .map((name) => name.charAt(0))
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <button
                onClick={() => onView(lead)}
                className="font-semibold text-sm text-foreground hover:text-primary transition-colors text-left truncate max-w-[180px] block"
              >
                {lead.studentName}
              </button>

              <p className="text-[10px] text-muted-foreground mt-0.5">
                {lead.leadId}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(lead)}>
                <Eye className="h-4 w-4 mr-2" />
                View Student
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                Call Student
              </DropdownMenuItem>

              <DropdownMenuItem>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <ClipboardList className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>

              <DropdownMenuItem>
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* PRIORITY + SCORE */}
        <div className="flex items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold capitalize ${getPriorityClasses(
              lead.priority
            )}`}
          >
            {lead.priority === "high" ? "🔥 " : ""}
            {lead.priority} Priority
          </Badge>

          <Badge
            variant="outline"
            className="text-[10px] bg-primary/5 text-primary border-primary/20"
          >
            {lead.leadScore}% Score
          </Badge>
        </div>

        {/* COURSE + COLLEGE */}
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {lead.course}
              </p>

              <p className="text-[11px] text-muted-foreground truncate">
                {lead.college}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

            <span className="text-[11px] text-muted-foreground truncate">
              {lead.city}
            </span>
          </div>
        </div>

        {/* DOCUMENT PROGRESS */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />

              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Documents
              </span>
            </div>

            <span className="text-[10px] font-bold text-foreground">
              {lead.documentsReceived}/{lead.documentsRequired}
            </span>
          </div>

          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${documentPercentage === 100
                ? "bg-emerald-500"
                : documentPercentage >= 70
                  ? "bg-blue-500"
                  : "bg-amber-500"
                }`}
              style={{ width: `${documentPercentage}%` }}
            />
          </div>
        </div>

        {/* FEE */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <WalletCards className="h-3.5 w-3.5 text-muted-foreground" />

              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Fee
              </span>
            </div>

            <span className="text-[10px] font-bold text-foreground">
              {feePercentage}%
            </span>
          </div>

          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${feePercentage === 100
                ? "bg-emerald-500"
                : feePercentage > 0
                  ? "bg-blue-500"
                  : "bg-slate-300 dark:bg-slate-700"
                }`}
              style={{ width: `${feePercentage}%` }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              Paid {formatCurrency(lead.paidFee)}
            </span>

            <span className="text-[10px] text-muted-foreground">
              Pending {formatCurrency(lead.pendingFee)}
            </span>
          </div>
        </div>

        {/* FOLLOW-UP */}
        <div className="mt-4 p-2.5 rounded-lg bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />

            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground">
                Next Follow-up
              </p>

              <p className="text-[11px] font-semibold text-foreground mt-0.5">
                {formatDate(lead.nextFollowUp)}
                {lead.nextFollowUpTime
                  ? ` • ${lead.nextFollowUpTime}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {/* COUNSELLOR */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
              {lead.counsellorInitials}
            </div>

            <span className="text-[10px] text-muted-foreground truncate">
              {lead.counsellor}
            </span>
          </div>

          <div
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-grab"
            title="Drag student"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] px-1"
            onClick={() => onView(lead)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] px-1"
          >
            <Phone className="h-3.5 w-3.5 mr-1" />
            Call
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] px-1"
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Chat
          </Button>
        </div>

        {/* MOVE TO NEXT */}
        <div className="mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[10px]"
              >
                Move Stage
                <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 max-h-72 overflow-y-auto">
              {PIPELINE_STAGES.map((stage) => (
                <DropdownMenuItem
                  key={stage.id}
                  disabled={stage.id === lead.stage}
                  onClick={() => onMove(lead, stage.id)}
                >
                  {stage.id === lead.stage ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 mr-2" />
                  )}

                  {stage.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>

  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdmissionPipeline = () => {
  const [leads, setLeads] = useState<AdmissionLead[]>(initialLeads);

  const [search, setSearch] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");

  const [counsellorFilter, setCounsellorFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [isLoading, setIsLoading] = useState(false);

  const [viewMode, setViewMode] =
    useState<"board" | "list">("board");

  const [draggedLead, setDraggedLead] =
    useState<AdmissionLead | null>(null);

  const [selectedLead, setSelectedLead] =
    useState<AdmissionLead | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [notification, setNotification] =
    useState("");

  /* =========================================================
     FETCH PIPELINE
  ========================================================= */

  const fetchPipeline = async () => {
    try {
      setIsLoading(true);

      /*
        Replace this endpoint with your actual backend.

        Example:

        const response = await api.get("/admissions/pipeline");

        setLeads(response.data.data);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setNotification("Pipeline refreshed successfully.");

      setTimeout(() => {
        setNotification("");
      }, 2500);
    } catch (error) {
      console.error(
        "Error fetching admission pipeline:",
        error
      );

      setNotification(
        "Unable to refresh admission pipeline."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const courses = useMemo(() => {
    return Array.from(
      new Set(leads.map((lead) => lead.course))
    );
  }, [leads]);

  const counsellors = useMemo(() => {
    return Array.from(
      new Set(leads.map((lead) => lead.counsellor))
    );
  }, [leads]);

  /* =========================================================
     FILTERED LEADS
  ========================================================= */

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        lead.studentName.toLowerCase().includes(query) ||
        lead.leadId.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.college.toLowerCase().includes(query) ||
        lead.course.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === "all" ||
        lead.course === courseFilter;

      const matchesCounsellor =
        counsellorFilter === "all" ||
        lead.counsellor === counsellorFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        lead.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesCounsellor &&
        matchesPriority
      );
    });
  }, [
    leads,
    search,
    courseFilter,
    counsellorFilter,
    priorityFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalLeads = leads.length;

  const activePipelineLeads = leads.filter(
    (lead) =>
      !["admission_confirmed", "enrolled"].includes(
        lead.stage
      )
  ).length;

  const applicationsSubmitted = leads.filter(
    (lead) =>
      [
        "application_submitted",
        "under_review",
        "selected",
        "fee_pending",
        "admission_confirmed",
        "enrolled",
      ].includes(lead.stage)
  ).length;

  const documentsPending = leads.filter(
    (lead) =>
      lead.documentsReceived <
      lead.documentsRequired
  ).length;

  const selectedCount = leads.filter(
    (lead) => lead.stage === "selected"
  ).length;

  const feePendingCount = leads.filter(
    (lead) => lead.stage === "fee_pending"
  ).length;

  const admissionConfirmed = leads.filter(
    (lead) => lead.stage === "admission_confirmed"
  ).length;

  const enrolledCount = leads.filter(
    (lead) => lead.stage === "enrolled"
  ).length;

  const totalRevenue = leads.reduce(
    (sum, lead) => sum + lead.paidFee,
    0
  );

  const totalPending = leads.reduce(
    (sum, lead) => sum + lead.pendingFee,
    0
  );

  /* =========================================================
     STAGE LEADS
  ========================================================= */

  const getStageLeads = (stage: PipelineStage) => {
    return filteredLeads.filter(
      (lead) => lead.stage === stage
    );
  };

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDragStart = (lead: AdmissionLead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (
    event: React.DragEvent
  ) => {
    event.preventDefault();
  };

  const handleDrop = async (
    stage: PipelineStage
  ) => {
    if (!draggedLead) return;

    if (draggedLead.stage === stage) {
      setDraggedLead(null);
      return;
    }

    const previousStage = draggedLead.stage;

    setLeads((current) =>
      current.map((lead) =>
        lead.id === draggedLead.id
          ? {
            ...lead,
            stage,
            lastActivity: `Moved to ${PIPELINE_STAGES.find(
              (item) => item.id === stage
            )?.label
              }`,
          }
          : lead
      )
    );

    setNotification(
      `${draggedLead.studentName} moved from ${PIPELINE_STAGES.find(
        (item) => item.id === previousStage
      )?.label
      } to ${PIPELINE_STAGES.find(
        (item) => item.id === stage
      )?.label
      }`
    );

    setDraggedLead(null);

    setTimeout(() => {
      setNotification("");
    }, 3000);

    /*
      Production API:

      await api.patch(
        `/admissions/pipeline/${draggedLead.id}/stage`,
        {
          stage
        }
      );

      Also create activity:

      POST /activities

      {
        leadId,
        type: "pipeline_stage_changed",
        oldStage: previousStage,
        newStage: stage
      }
    */
  };

  /* =========================================================
     MANUAL STAGE MOVE
  ========================================================= */

  const handleMoveStage = async (
    lead: AdmissionLead,
    stage: PipelineStage
  ) => {
    if (lead.stage === stage) return;

    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id
          ? {
            ...item,
            stage,
            lastActivity: `Moved to ${PIPELINE_STAGES.find(
              (item) => item.id === stage
            )?.label
              }`,
          }
          : item
      )
    );

    setNotification(
      `${lead.studentName} moved to ${PIPELINE_STAGES.find(
        (item) => item.id === stage
      )?.label
      }`
    );

    setTimeout(() => {
      setNotification("");
    }, 2500);

    /*
      Production API:

      await api.patch(
        `/admissions/pipeline/${lead.id}/stage`,
        {
          stage
        }
      );
    */
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setCourseFilter("all");
    setCounsellorFilter("all");
    setPriorityFilter("all");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardLayout title="Admission Pipeline">
      <div className="space-y-6 pb-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Admission Pipeline
                </h1>

                <p className="text-sm text-muted-foreground mt-0.5">
                  Track every student from counselling to
                  successful enrollment.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPipeline}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}

              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-muted"
                  : ""
              }
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("board")}
              className={
                viewMode === "board"
                  ? "bg-muted"
                  : ""
              }
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Pipeline
            </Button>

            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* =====================================================
            NOTIFICATION
        ===================================================== */}

        {notification && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{notification}</span>
            </div>

            <button
              onClick={() => setNotification("")}
              className="hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          <StatCard
            label="Pipeline"
            value={activePipelineLeads}
            hint={`${totalLeads} total records`}
            icon={TrendingUp}
            iconClass="text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
          />

          <StatCard
            label="Applications"
            value={applicationsSubmitted}
            hint="Submitted or beyond"
            icon={FileText}
            iconClass="text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50"
          />

          <StatCard
            label="Documents"
            value={documentsPending}
            hint="Students need documents"
            icon={ClipboardList}
            iconClass="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
          />

          <StatCard
            label="Selected"
            value={selectedCount}
            hint="Offer received"
            icon={CheckCircle2}
            iconClass="text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
          />

          <StatCard
            label="Fee Pending"
            value={feePendingCount}
            hint={formatCurrency(totalPending)}
            icon={IndianRupee}
            iconClass="text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
          />

          <StatCard
            label="Confirmed"
            value={admissionConfirmed + enrolledCount}
            hint={`${enrolledCount} enrolled`}
            icon={GraduationCap}
            iconClass="text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50"
          />
        </div>

        {/* =====================================================
            SEARCH + FILTERS
        ===================================================== */}

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4">

            <div className="flex flex-col lg:flex-row gap-3">

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search student, lead ID, phone, college or course..."
                  className="pl-9 h-10"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() =>
                  setShowFilters((value) => !value)
                }
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters

                {(courseFilter !== "all" ||
                  counsellorFilter !== "all" ||
                  priorityFilter !== "all") && (
                    <span className="ml-2 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      !
                    </span>
                  )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={resetFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    Course
                  </label>

                  <Select
                    value={courseFilter}
                    onValueChange={setCourseFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        All Courses
                      </SelectItem>

                      {courses.map((course) => (
                        <SelectItem
                          key={course}
                          value={course}
                        >
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    Counsellor
                  </label>

                  <Select
                    value={counsellorFilter}
                    onValueChange={setCounsellorFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Counsellors" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        All Counsellors
                      </SelectItem>

                      {counsellors.map(
                        (counsellor) => (
                          <SelectItem
                            key={counsellor}
                            value={counsellor}
                          >
                            {counsellor}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    Priority
                  </label>

                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        All Priorities
                      </SelectItem>

                      <SelectItem value="high">
                        High Priority
                      </SelectItem>

                      <SelectItem value="medium">
                        Medium Priority
                      </SelectItem>

                      <SelectItem value="low">
                        Low Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">

              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredLeads.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {leads.length}
                </span>{" "}
                students
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Completed
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  Pending
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Urgent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            LIST VIEW
        ===================================================== */}

        {viewMode === "list" && (
          <Card className="border-border/70 shadow-sm overflow-hidden">

            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm flex items-center gap-2">
                <List className="h-4 w-4 text-primary" />
                Admission Records
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead className="bg-muted/30 border-b border-border">

                    <tr className="text-left">

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Student
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Course / College
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Stage
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Documents
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Fee
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Counsellor
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Follow-up
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">

                    {filteredLeads.map((lead) => {

                      const stageConfig =
                        PIPELINE_STAGES.find(
                          (stage) =>
                            stage.id === lead.stage
                        );

                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-muted/20 transition-colors"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {lead.studentName
                                  .split(" ")
                                  .slice(0, 2)
                                  .map(
                                    (name) =>
                                      name.charAt(0)
                                  )
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div>
                                <button
                                  onClick={() =>
                                    setSelectedLead(
                                      lead
                                    )
                                  }
                                  className="text-sm font-semibold hover:text-primary transition-colors"
                                >
                                  {lead.studentName}
                                </button>

                                <p className="text-[10px] text-muted-foreground">
                                  {lead.leadId}
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {lead.course}
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                              {lead.college}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <Badge
                              variant="outline"
                              className="text-[10px]"
                            >
                              {stageConfig?.label}
                            </Badge>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />

                              <span className="text-xs font-semibold">
                                {lead.documentsReceived}/
                                {lead.documentsRequired}
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {formatCurrency(
                                lead.paidFee
                              )}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              Pending{" "}
                              {formatCurrency(
                                lead.pendingFee
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                                {
                                  lead.counsellorInitials
                                }
                              </div>

                              <span className="text-xs">
                                {lead.counsellor}
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-medium">
                              {formatDate(
                                lead.nextFollowUp
                              )}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {
                                lead.nextFollowUpTime
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedLead(
                                  lead
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

                {filteredLeads.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h3 className="text-sm font-semibold">
                      No students found
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      Try changing your search or filters.
                    </p>
                  </div>
                )}

              </div>

            </CardContent>
          </Card>
        )}

        {/* =====================================================
            BOARD VIEW
        ===================================================== */}

        {viewMode === "board" && (
          <div className="overflow-x-auto pb-4">

            <div className="flex gap-4 min-w-max">

              {PIPELINE_STAGES.map((stage) => {

                const stageConfig =
                  getStageClasses(stage.id);

                const stageLeads =
                  getStageLeads(stage.id);

                return (
                  <div
                    key={stage.id}
                    onDragOver={handleDragOver}
                    onDrop={() =>
                      handleDrop(stage.id)
                    }
                    className={`w-[315px] shrink-0 rounded-xl border ${stageConfig.border} bg-muted/10`}
                  >

                    {/* ======================================
                        COLUMN HEADER
                    ====================================== */}

                    <div
                      className={`px-4 py-3 border-b ${stageConfig.border} rounded-t-xl ${stageConfig.header}`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <span
                              className={`h-2.5 w-2.5 rounded-full ${stageConfig.dot}`}
                            />

                            <h3
                              className={`text-xs font-bold ${stageConfig.text}`}
                            >
                              {stage.label}
                            </h3>

                            <span className="h-5 min-w-5 px-1.5 rounded-full bg-background border border-border/60 text-[10px] font-bold flex items-center justify-center">
                              {stageLeads.length}
                            </span>

                          </div>

                          <p className="text-[10px] text-muted-foreground mt-1 pl-4">
                            {stage.description}
                          </p>

                        </div>

                        <DropdownMenu>

                          <DropdownMenuTrigger
                            asChild
                          >
                            <button className="h-7 w-7 rounded-md hover:bg-background/70 flex items-center justify-center">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">

                            <DropdownMenuItem>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Student
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              View All
                            </DropdownMenuItem>

                          </DropdownMenuContent>

                        </DropdownMenu>

                      </div>

                    </div>

                    {/* ======================================
                        COLUMN BODY
                    ====================================== */}

                    <div className="p-3 space-y-3 min-h-[350px]">

                      {stageLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onDragStart={
                            handleDragStart
                          }
                          onView={(selected) =>
                            setSelectedLead(
                              selected
                            )
                          }
                          onMove={
                            handleMoveStage
                          }
                        />
                      ))}

                      {stageLeads.length === 0 && (
                        <div
                          className={`min-h-[220px] rounded-lg border border-dashed ${stageConfig.border} flex flex-col items-center justify-center text-center px-5`}
                        >

                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <p className="text-xs font-semibold text-muted-foreground">
                            No students here
                          </p>

                          <p className="text-[10px] text-muted-foreground mt-1">
                            Drag a student into this stage.
                          </p>

                        </div>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full h-9 text-xs text-muted-foreground hover:text-primary border border-dashed border-transparent hover:border-primary/20"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Student
                      </Button>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* =====================================================
            PIPELINE FOOTER SUMMARY
        ===================================================== */}

        <Card className="border-border/70 shadow-sm">

          <CardContent className="p-4">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Total Students
                </p>

                <p className="text-xl font-bold mt-1">
                  {totalLeads}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Amount Collected
                </p>

                <p className="text-xl font-bold mt-1 text-emerald-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Amount Pending
                </p>

                <p className="text-xl font-bold mt-1 text-rose-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Enrolled
                </p>

                <p className="text-xl font-bold mt-1 text-primary">
                  {enrolledCount}
                </p>
              </div>

            </div>

          </CardContent>

        </Card>

        {/* =====================================================
            STUDENT DETAIL DRAWER / MODAL
        ===================================================== */}

        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-[2px]">

            <div className="h-full w-full max-w-xl bg-background border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">

              {/* HEADER */}

              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">

                <div className="px-5 py-4 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {selectedLead.studentName
                        .split(" ")
                        .slice(0, 2)
                        .map(
                          (name) =>
                            name.charAt(0)
                        )
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2 className="text-base font-bold">
                        {selectedLead.studentName}
                      </h2>

                      <p className="text-[11px] text-muted-foreground">
                        {selectedLead.leadId}
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedLead(null)
                    }
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              </div>

              {/* CONTENT */}

              <div className="p-5 space-y-5">

                {/* STATUS */}

                <div className="flex items-center gap-2 flex-wrap">

                  <Badge>
                    {
                      PIPELINE_STAGES.find(
                        (stage) =>
                          stage.id ===
                          selectedLead.stage
                      )?.label
                    }
                  </Badge>

                  <Badge
                    variant="outline"
                    className={getPriorityClasses(
                      selectedLead.priority
                    )}
                  >
                    {selectedLead.priority}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20 bg-primary/5"
                  >
                    Score{" "}
                    {selectedLead.leadScore}%
                  </Badge>

                </div>

                {/* BASIC DETAILS */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-primary" />
                      Student Information
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Phone
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {selectedLead.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Email
                      </p>

                      <p className="text-sm font-medium mt-1 break-all">
                        {selectedLead.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Course
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {selectedLead.course}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        College
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {selectedLead.college}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        City
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {selectedLead.city}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Source
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {selectedLead.source}
                      </p>
                    </div>

                  </CardContent>
                </Card>

                {/* DOCUMENTS */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Documents
                    </CardTitle>
                  </CardHeader>

                  <CardContent>

                    <div className="flex items-center justify-between">

                      <span className="text-sm">
                        Documents Received
                      </span>

                      <span className="font-bold">
                        {
                          selectedLead.documentsReceived
                        }
                        /
                        {
                          selectedLead.documentsRequired
                        }
                      </span>

                    </div>

                    <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">

                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(selectedLead.documentsReceived /
                            selectedLead.documentsRequired) *
                            100
                            }%`,
                        }}
                      />

                    </div>

                  </CardContent>
                </Card>

                {/* PAYMENT */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Fee Summary
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-3 gap-3">

                    <div className="p-3 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground">
                        Total
                      </p>

                      <p className="text-sm font-bold mt-1">
                        {formatCurrency(
                          selectedLead.totalFee
                        )}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                      <p className="text-[10px] text-muted-foreground">
                        Paid
                      </p>

                      <p className="text-sm font-bold mt-1 text-emerald-600">
                        {formatCurrency(
                          selectedLead.paidFee
                        )}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20">
                      <p className="text-[10px] text-muted-foreground">
                        Pending
                      </p>

                      <p className="text-sm font-bold mt-1 text-rose-600">
                        {formatCurrency(
                          selectedLead.pendingFee
                        )}
                      </p>
                    </div>

                  </CardContent>
                </Card>

                {/* FOLLOW-UP */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Next Follow-up
                    </CardTitle>
                  </CardHeader>

                  <CardContent>

                    {selectedLead.nextFollowUp ? (
                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-sm font-semibold">
                            {formatDate(
                              selectedLead.nextFollowUp
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              selectedLead.nextFollowUpTime
                            }
                          </p>

                        </div>

                        <Badge variant="outline">
                          Scheduled
                        </Badge>

                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No follow-up scheduled.
                      </p>
                    )}

                  </CardContent>
                </Card>

                {/* NOTES */}

                {selectedLead.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        Latest Note
                      </CardTitle>
                    </CardHeader>

                    <CardContent>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedLead.notes}
                      </p>

                    </CardContent>
                  </Card>
                )}

                {/* ACTIONS */}

                <div className="grid grid-cols-2 gap-2">

                  <Button>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Student
                  </Button>

                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>

                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </Button>

                  <Button variant="outline">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Follow-up
                  </Button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdmissionPipeline;