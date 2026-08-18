import React, { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Phone,
  MessageCircle,
  CalendarDays,
  MoreHorizontal,
  X,
  GraduationCap,
  Building2,
  BookOpen,
  UserRound,
  ClipboardList,
  Upload,
  Send,
  ShieldCheck,
  IndianRupee,
  Loader2,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
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

type ApplicationStatus =
  | "draft"
  | "application_started"
  | "documents_pending"
  | "ready_to_submit"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "offer_received"
  | "rejected"
  | "withdrawn";

interface Application {
  id: string;
  applicationNumber: string;

  studentId: string;
  studentName: string;
  phone: string;
  email: string;

  college: string;
  university: string;
  course: string;
  specialization: string;

  applicationType: string;
  academicYear: string;

  counsellor: string;
  counsellorInitials: string;

  status: ApplicationStatus;

  applicationDate: string;
  submittedDate: string | null;

  documentsUploaded: number;
  documentsRequired: number;
  documentsVerified: number;

  applicationFee: number;
  applicationFeePaid: number;

  source: string;

  lastActivity: string;

  notes: string;

  timeline: {
    id: string;
    title: string;
    description: string;
    date: string;
    type: "success" | "info" | "warning" | "danger";
  }[];
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const APPLICATION_STATUSES: {
  id: ApplicationStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "application_started", label: "Application Started" },
  { id: "documents_pending", label: "Documents Pending" },
  { id: "ready_to_submit", label: "Ready to Submit" },
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under Review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "offer_received", label: "Offer Received" },
  { id: "rejected", label: "Rejected" },
  { id: "withdrawn", label: "Withdrawn" },
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status: ApplicationStatus) => {
  switch (status) {
    case "draft":
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800";

    case "application_started":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";

    case "documents_pending":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";

    case "ready_to_submit":
      return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/50";

    case "submitted":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50";

    case "under_review":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50";

    case "shortlisted":
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50";

    case "offer_received":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50";

    case "withdrawn":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusLabel = (status: ApplicationStatus) => {
  return (
    APPLICATION_STATUSES.find(
      (item) => item.id === status
    )?.label || status
  );
};

/* =========================================================
   DEMO DATA
========================================================= */

const initialApplications: Application[] = [
  {
    id: "1",
    applicationNumber: "APP-2026-001",
    studentId: "VU-10231",
    studentName: "Navnit Kumar",
    phone: "+91 9142051894",
    email: "navnit.7809@gmail.com",
    college: "Galgotias University",
    university: "Galgotias University",
    course: "BCA",
    specialization: "Computer Science",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",
    status: "documents_pending",
    applicationDate: "2026-08-13",
    submittedDate: null,
    documentsUploaded: 8,
    documentsRequired: 10,
    documentsVerified: 7,
    applicationFee: 1000,
    applicationFeePaid: 1000,
    source: "Website",
    lastActivity: "2 documents pending",
    notes: "Student interested in BCA Computer Science.",
    timeline: [
      {
        id: "1",
        title: "Application Created",
        description: "Application created by counsellor.",
        date: "2026-08-13",
        type: "info",
      },
      {
        id: "2",
        title: "Documents Uploaded",
        description: "8 out of 10 documents uploaded.",
        date: "2026-08-14",
        type: "success",
      },
      {
        id: "3",
        title: "Documents Pending",
        description: "Migration certificate and income certificate pending.",
        date: "2026-08-17",
        type: "warning",
      },
    ],
  },

  {
    id: "2",
    applicationNumber: "APP-2026-002",
    studentId: "VU-10232",
    studentName: "Manish Kumar",
    phone: "+91 9785587424",
    email: "manishkumarbargora2006@gmail.com",
    college: "Lloyd Institute",
    university: "Lloyd University",
    course: "BA",
    specialization: "General",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Neha Singh",
    counsellorInitials: "NS",
    status: "submitted",
    applicationDate: "2026-08-12",
    submittedDate: "2026-08-15",
    documentsUploaded: 10,
    documentsRequired: 10,
    documentsVerified: 10,
    applicationFee: 500,
    applicationFeePaid: 500,
    source: "Instagram",
    lastActivity: "Application submitted",
    notes: "Application submitted successfully.",
    timeline: [
      {
        id: "1",
        title: "Application Created",
        description: "Application started.",
        date: "2026-08-12",
        type: "info",
      },
      {
        id: "2",
        title: "Documents Verified",
        description: "All required documents verified.",
        date: "2026-08-14",
        type: "success",
      },
      {
        id: "3",
        title: "Application Submitted",
        description: "Application submitted to college.",
        date: "2026-08-15",
        type: "success",
      },
    ],
  },

  {
    id: "3",
    applicationNumber: "APP-2026-003",
    studentId: "VU-10233",
    studentName: "Nigam Kumar Sahu",
    phone: "+91 9109726059",
    email: "nigamsahu115@gmail.com",
    college: "IIMT University",
    university: "IIMT University",
    course: "BCA",
    specialization: "Computer Applications",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Amit Verma",
    counsellorInitials: "AV",
    status: "under_review",
    applicationDate: "2026-08-10",
    submittedDate: "2026-08-12",
    documentsUploaded: 10,
    documentsRequired: 10,
    documentsVerified: 10,
    applicationFee: 1000,
    applicationFeePaid: 1000,
    source: "Facebook",
    lastActivity: "College reviewing application",
    notes: "Waiting for university response.",
    timeline: [
      {
        id: "1",
        title: "Application Submitted",
        description: "Application submitted.",
        date: "2026-08-12",
        type: "success",
      },
      {
        id: "2",
        title: "Under Review",
        description: "College started application review.",
        date: "2026-08-13",
        type: "info",
      },
    ],
  },

  {
    id: "4",
    applicationNumber: "APP-2026-004",
    studentId: "VU-10234",
    studentName: "Monika",
    phone: "+91 6363561319",
    email: "sreenareenivas944@gmail.com",
    college: "Sharda University",
    university: "Sharda University",
    course: "M.Tech",
    specialization: "Computer Science",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",
    status: "offer_received",
    applicationDate: "2026-08-10",
    submittedDate: "2026-08-11",
    documentsUploaded: 10,
    documentsRequired: 10,
    documentsVerified: 10,
    applicationFee: 1500,
    applicationFeePaid: 1500,
    source: "Website",
    lastActivity: "Offer letter received",
    notes: "Student selected. Waiting for admission fee.",
    timeline: [
      {
        id: "1",
        title: "Application Submitted",
        description: "Application successfully submitted.",
        date: "2026-08-11",
        type: "success",
      },
      {
        id: "2",
        title: "Offer Received",
        description: "University issued offer letter.",
        date: "2026-08-16",
        type: "success",
      },
    ],
  },

  {
    id: "5",
    applicationNumber: "APP-2026-005",
    studentId: "VU-10236",
    studentName: "Priyal Mihir Jha",
    phone: "+91 8355901427",
    email: "priyaljha812@gmail.com",
    college: "Amity University",
    university: "Amity University",
    course: "B.Tech",
    specialization: "Computer Science",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Neha Singh",
    counsellorInitials: "NS",
    status: "application_started",
    applicationDate: "2026-07-30",
    submittedDate: null,
    documentsUploaded: 2,
    documentsRequired: 10,
    documentsVerified: 2,
    applicationFee: 0,
    applicationFeePaid: 0,
    source: "Google Ads",
    lastActivity: "Application started",
    notes: "Student comparing colleges.",
    timeline: [
      {
        id: "1",
        title: "Application Started",
        description: "Application created.",
        date: "2026-07-30",
        type: "info",
      },
    ],
  },

  {
    id: "6",
    applicationNumber: "APP-2026-006",
    studentId: "VU-10239",
    studentName: "Riya Sharma",
    phone: "+91 9876512345",
    email: "riya.sharma@gmail.com",
    college: "Amity University",
    university: "Amity University",
    course: "BBA",
    specialization: "Business Administration",
    applicationType: "Regular",
    academicYear: "2026-27",
    counsellor: "Priya Mehta",
    counsellorInitials: "PM",
    status: "shortlisted",
    applicationDate: "2026-07-20",
    submittedDate: "2026-07-22",
    documentsUploaded: 10,
    documentsRequired: 10,
    documentsVerified: 10,
    applicationFee: 1000,
    applicationFeePaid: 1000,
    source: "Instagram",
    lastActivity: "Student shortlisted",
    notes: "Waiting for final offer.",
    timeline: [
      {
        id: "1",
        title: "Application Submitted",
        description: "Application submitted.",
        date: "2026-07-22",
        type: "success",
      },
      {
        id: "2",
        title: "Shortlisted",
        description: "Student shortlisted by university.",
        date: "2026-08-10",
        type: "success",
      },
    ],
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Applications = () => {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [collegeFilter, setCollegeFilter] =
    useState("all");

  const [counsellorFilter, setCounsellorFilter] =
    useState("all");

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  /* =========================================================
     OPTIONS
  ========================================================= */

  const courses = useMemo(
    () =>
      Array.from(
        new Set(
          applications.map(
            (application) => application.course
          )
        )
      ),
    [applications]
  );

  const colleges = useMemo(
    () =>
      Array.from(
        new Set(
          applications.map(
            (application) => application.college
          )
        )
      ),
    [applications]
  );

  const counsellors = useMemo(
    () =>
      Array.from(
        new Set(
          applications.map(
            (application) => application.counsellor
          )
        )
      ),
    [applications]
  );

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.studentName
          .toLowerCase()
          .includes(query) ||
        application.applicationNumber
          .toLowerCase()
          .includes(query) ||
        application.studentId
          .toLowerCase()
          .includes(query) ||
        application.college
          .toLowerCase()
          .includes(query) ||
        application.course
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      const matchesCourse =
        courseFilter === "all" ||
        application.course === courseFilter;

      const matchesCollege =
        collegeFilter === "all" ||
        application.college === collegeFilter;

      const matchesCounsellor =
        counsellorFilter === "all" ||
        application.counsellor === counsellorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCourse &&
        matchesCollege &&
        matchesCounsellor
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    courseFilter,
    collegeFilter,
    counsellorFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalApplications = applications.length;

  const submitted = applications.filter((item) =>
    [
      "submitted",
      "under_review",
      "shortlisted",
      "offer_received",
    ].includes(item.status)
  ).length;

  const underReview = applications.filter(
    (item) => item.status === "under_review"
  ).length;

  const offers = applications.filter(
    (item) => item.status === "offer_received"
  ).length;

  const pendingDocuments = applications.filter(
    (item) =>
      item.documentsUploaded <
      item.documentsRequired
  ).length;

  const rejected = applications.filter(
    (item) => item.status === "rejected"
  ).length;

  /* =========================================================
     REFRESH
  ========================================================= */

  const refreshApplications = async () => {
    try {
      setLoading(true);

      /*
        Production:

        const response = await api.get(
          "/admissions/applications"
        );

        setApplications(response.data.data);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setMessage("Applications refreshed.");

      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Unable to refresh applications.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const updateStatus = async (
    application: Application,
    status: ApplicationStatus
  ) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status,
              lastActivity: `Status changed to ${getStatusLabel(
                status
              )}`,
            }
          : item
      )
    );

    if (selectedApplication?.id === application.id) {
      setSelectedApplication({
        ...selectedApplication,
        status,
        lastActivity: `Status changed to ${getStatusLabel(
          status
        )}`,
      });
    }

    setMessage(
      `${application.applicationNumber} updated to ${getStatusLabel(
        status
      )}`
    );

    setTimeout(() => setMessage(""), 2500);

    /*
      Production API:

      await api.patch(
        `/admissions/applications/${application.id}`,
        { status }
      );

      Also create timeline activity.
    */
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCourseFilter("all");
    setCollegeFilter("all");
    setCounsellorFilter("all");
  };

  return (
    <DashboardLayout title="Applications">

      <div className="space-y-6 pb-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Applications
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage student applications across colleges
                and courses.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={refreshApplications}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}

              Refresh
            </Button>

            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>

          </div>
        </div>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        {message && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 text-primary px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Total
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalApplications}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                All applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Submitted
              </p>
              <p className="text-2xl font-bold mt-1 text-indigo-600">
                {submitted}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Submitted applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Under Review
              </p>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                {underReview}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Waiting for college
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Offers
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {offers}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Offer received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Documents
              </p>
              <p className="text-2xl font-bold mt-1 text-amber-600">
                {pendingDocuments}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Incomplete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Rejected
              </p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {rejected}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Applications rejected
              </p>
            </CardContent>
          </Card>

        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <Card>
          <CardContent className="p-4">

            <div className="flex flex-col lg:flex-row gap-3">

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search application ID, student, college, course..."
                  className="pl-9"
                />

              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowFilters(!showFilters)
                }
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                onClick={resetFilters}
              >
                Reset
              </Button>

            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4 pt-4 border-t">

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>

                    {APPLICATION_STATUSES.map(
                      (status) => (
                        <SelectItem
                          key={status.id}
                          value={status.id}
                        >
                          {status.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={courseFilter}
                  onValueChange={setCourseFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Course" />
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

                <Select
                  value={collegeFilter}
                  onValueChange={setCollegeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="College" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All Colleges
                    </SelectItem>

                    {colleges.map((college) => (
                      <SelectItem
                        key={college}
                        value={college}
                      >
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={counsellorFilter}
                  onValueChange={setCounsellorFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Counsellor" />
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
            )}

          </CardContent>
        </Card>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <Card className="overflow-hidden">

          <CardHeader className="border-b">

            <div className="flex items-center justify-between">

              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Application Records
              </CardTitle>

              <span className="text-xs text-muted-foreground">
                {filteredApplications.length} records
              </span>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px]">

                <thead className="bg-muted/30 border-b">

                  <tr>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Application
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      College / Course
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Documents
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Application Fee
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Counsellor
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Last Activity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredApplications.map(
                    (application) => {

                      const documentPercentage =
                        Math.round(
                          (application.documentsUploaded /
                            application.documentsRequired) *
                            100
                        );

                      return (
                        <tr
                          key={application.id}
                          className="hover:bg-muted/20 transition-colors"
                        >

                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-primary">
                              {
                                application.applicationNumber
                              }
                            </p>

                            <p className="text-[10px] text-muted-foreground mt-1">
                              Applied{" "}
                              {formatDate(
                                application.applicationDate
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {application.studentName
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
                                <p className="text-xs font-semibold">
                                  {
                                    application.studentName
                                  }
                                </p>

                                <p className="text-[10px] text-muted-foreground">
                                  {
                                    application.studentId
                                  }
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {application.college}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {application.course}
                              {" • "}
                              {application.specialization}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <DropdownMenu>

                              <DropdownMenuTrigger
                                asChild
                              >
                                <button>
                                  <Badge
                                    variant="outline"
                                    className={`cursor-pointer ${getStatusClasses(
                                      application.status
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      application.status
                                    )}

                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Badge>
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent>

                                {APPLICATION_STATUSES.map(
                                  (status) => (
                                    <DropdownMenuItem
                                      key={status.id}
                                      onClick={() =>
                                        updateStatus(
                                          application,
                                          status.id
                                        )
                                      }
                                    >
                                      {status.id ===
                                      application.status ? (
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                      ) : (
                                        <Clock className="h-4 w-4 mr-2" />
                                      )}

                                      {status.label}
                                    </DropdownMenuItem>
                                  )
                                )}

                              </DropdownMenuContent>

                            </DropdownMenu>

                          </td>

                          <td className="px-5 py-4">

                            <div className="w-28">

                              <div className="flex justify-between mb-1">

                                <span className="text-[10px] text-muted-foreground">
                                  {
                                    application.documentsUploaded
                                  }
                                  /
                                  {
                                    application.documentsRequired
                                  }
                                </span>

                                <span className="text-[10px] font-bold">
                                  {
                                    documentPercentage
                                  }
                                  %
                                </span>

                              </div>

                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">

                                <div
                                  className={`h-full rounded-full ${
                                    documentPercentage ===
                                    100
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{
                                    width: `${documentPercentage}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {formatCurrency(
                                application.applicationFeePaid
                              )}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              of{" "}
                              {formatCurrency(
                                application.applicationFee
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                                {
                                  application.counsellorInitials
                                }
                              </div>

                              <span className="text-xs">
                                {
                                  application.counsellor
                                }
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs">
                              {
                                application.lastActivity
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <DropdownMenu>

                              <DropdownMenuTrigger
                                asChild
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">

                                <DropdownMenuItem
                                  onClick={() =>
                                    setSelectedApplication(
                                      application
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Application
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
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Document
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                  <CalendarDays className="h-4 w-4 mr-2" />
                                  Schedule Follow-up
                                </DropdownMenuItem>

                              </DropdownMenuContent>

                            </DropdownMenu>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

              {filteredApplications.length === 0 && (
                <div className="py-16 text-center">

                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />

                  <p className="font-semibold mt-3">
                    No applications found
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Try changing your search or filters.
                  </p>

                </div>
              )}

            </div>

          </CardContent>

        </Card>

        {/* =====================================================
            APPLICATION DETAIL DRAWER
        ===================================================== */}

        {selectedApplication && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">

            <div className="h-full w-full max-w-2xl bg-background shadow-2xl overflow-y-auto">

              {/* HEADER */}

              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">

                <div className="px-6 py-4 flex items-center justify-between">

                  <div>

                    <p className="text-xs text-primary font-bold">
                      {
                        selectedApplication.applicationNumber
                      }
                    </p>

                    <h2 className="text-lg font-bold mt-1">
                      Application Details
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedApplication(null)
                    }
                    className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>

                </div>

              </div>

              <div className="p-6 space-y-5">

                {/* STUDENT */}

                <Card>

                  <CardContent className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {selectedApplication.studentName
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

                          <h3 className="font-bold">
                            {
                              selectedApplication.studentName
                            }
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {
                              selectedApplication.studentId
                            }
                          </p>

                        </div>

                      </div>

                      <Badge
                        variant="outline"
                        className={getStatusClasses(
                          selectedApplication.status
                        )}
                      >
                        {getStatusLabel(
                          selectedApplication.status
                        )}
                      </Badge>

                    </div>

                  </CardContent>

                </Card>

                {/* APPLICATION INFO */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Application Information
                    </CardTitle>

                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-5">

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        College
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.college
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        University
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.university
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Course
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.course
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Specialization
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.specialization
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Academic Year
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.academicYear
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Application Type
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedApplication.applicationType
                        }
                      </p>
                    </div>

                  </CardContent>

                </Card>

                {/* DOCUMENTS */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Documents
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="grid grid-cols-3 gap-3">

                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-[10px] text-muted-foreground">
                          Uploaded
                        </p>

                        <p className="text-xl font-bold">
                          {
                            selectedApplication.documentsUploaded
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3">
                        <p className="text-[10px] text-muted-foreground">
                          Verified
                        </p>

                        <p className="text-xl font-bold text-emerald-600">
                          {
                            selectedApplication.documentsVerified
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                        <p className="text-[10px] text-muted-foreground">
                          Pending
                        </p>

                        <p className="text-xl font-bold text-amber-600">
                          {Math.max(
                            selectedApplication.documentsRequired -
                              selectedApplication.documentsUploaded,
                            0
                          )}
                        </p>
                      </div>

                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Manage Documents
                    </Button>

                  </CardContent>

                </Card>

                {/* FEE */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Application Fee
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-muted-foreground">
                          Total Application Fee
                        </p>

                        <p className="text-lg font-bold mt-1">
                          {formatCurrency(
                            selectedApplication.applicationFee
                          )}
                        </p>

                      </div>

                      <Badge
                        className={
                          selectedApplication.applicationFeePaid >=
                          selectedApplication.applicationFee
                            ? "bg-emerald-600"
                            : "bg-amber-600"
                        }
                      >
                        {selectedApplication.applicationFeePaid >=
                        selectedApplication.applicationFee
                          ? "Paid"
                          : "Pending"}
                      </Badge>

                    </div>

                  </CardContent>

                </Card>

                {/* TIMELINE */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Application Timeline
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="space-y-5">

                      {selectedApplication.timeline.map(
                        (event, index) => {

                          const isLast =
                            index ===
                            selectedApplication.timeline.length -
                              1;

                          return (
                            <div
                              key={event.id}
                              className="flex gap-3"
                            >

                              <div className="flex flex-col items-center">

                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    event.type ===
                                    "success"
                                      ? "bg-emerald-100 text-emerald-600"
                                      : event.type ===
                                        "warning"
                                      ? "bg-amber-100 text-amber-600"
                                      : event.type ===
                                        "danger"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {event.type ===
                                  "success" ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : event.type ===
                                    "warning" ? (
                                    <AlertCircle className="h-4 w-4" />
                                  ) : (
                                    <Clock className="h-4 w-4" />
                                  )}
                                </div>

                                {!isLast && (
                                  <div className="w-px flex-1 bg-border mt-2" />
                                )}

                              </div>

                              <div className="pb-2">

                                <p className="text-sm font-semibold">
                                  {event.title}
                                </p>

                                <p className="text-xs text-muted-foreground mt-1">
                                  {
                                    event.description
                                  }
                                </p>

                                <p className="text-[10px] text-muted-foreground mt-2">
                                  {formatDate(
                                    event.date
                                  )}
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </CardContent>

                </Card>

                {/* NOTES */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Notes
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {
                        selectedApplication.notes
                      }
                    </p>

                  </CardContent>

                </Card>

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
                    <Upload className="h-4 w-4 mr-2" />
                    Documents
                  </Button>

                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
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

export default Applications;