import React, { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  GraduationCap,
  IndianRupee,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Phone,
  MessageCircle,
  CalendarDays,
  MoreHorizontal,
  X,
  Building2,
  BookOpen,
  UserRound,
  ShieldCheck,
  Receipt,
  ClipboardCheck,
  WalletCards,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  Download,
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

interface Admission {
  id: string;
  admissionId: string;
  studentId: string;
  studentName: string;
  phone: string;
  email: string;

  applicationId: string;

  college: string;
  university: string;
  course: string;
  specialization: string;

  academicYear: string;
  admissionDate: string;
  joiningDate: string | null;

  admissionNumber: string | null;
  enrollmentNumber: string | null;

  counsellor: string;
  counsellorInitials: string;

  status:
    | "confirmed"
    | "fee_pending"
    | "onboarding"
    | "cancelled";

  totalFee: number;
  paidFee: number;
  pendingFee: number;

  admissionDocuments: number;
  requiredDocuments: number;

  checklist: {
    applicationApproved: boolean;
    offerLetter: boolean;
    studentAccepted: boolean;
    admissionFeePaid: boolean;
    documentsVerified: boolean;
    admissionFormSigned: boolean;
    enrollmentNumberReceived: boolean;
  };

  notes: string;
}

const initialAdmissions: Admission[] = [
  {
    id: "1",
    admissionId: "ADM-2026-001",
    studentId: "VU-10234",
    studentName: "Monika",
    phone: "+91 6363561319",
    email: "sreenareenivas944@gmail.com",

    applicationId: "APP-2026-004",

    college: "Sharda University",
    university: "Sharda University",
    course: "M.Tech",
    specialization: "Computer Science",

    academicYear: "2026-27",
    admissionDate: "2026-08-17",
    joiningDate: "2026-08-25",

    admissionNumber: "SHD-MTECH-2026-120",
    enrollmentNumber: null,

    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",

    status: "fee_pending",

    totalFee: 180000,
    paidFee: 100000,
    pendingFee: 80000,

    admissionDocuments: 8,
    requiredDocuments: 10,

    checklist: {
      applicationApproved: true,
      offerLetter: true,
      studentAccepted: true,
      admissionFeePaid: false,
      documentsVerified: true,
      admissionFormSigned: true,
      enrollmentNumberReceived: false,
    },

    notes:
      "Student selected. Final admission fee pending.",
  },

  {
    id: "2",
    admissionId: "ADM-2026-002",
    studentId: "VU-10240",
    studentName: "Aditya Raj",
    phone: "+91 9988776655",
    email: "aditya.raj@gmail.com",

    applicationId: "APP-2026-008",

    college: "Galgotias University",
    university: "Galgotias University",
    course: "BCA",
    specialization: "Computer Science",

    academicYear: "2026-27",
    admissionDate: "2026-08-15",
    joiningDate: "2026-08-22",

    admissionNumber: "GU-BCA-2026-201",
    enrollmentNumber: "GU2026BCA221",

    counsellor: "Amit Verma",
    counsellorInitials: "AV",

    status: "confirmed",

    totalFee: 140000,
    paidFee: 140000,
    pendingFee: 0,

    admissionDocuments: 10,
    requiredDocuments: 10,

    checklist: {
      applicationApproved: true,
      offerLetter: true,
      studentAccepted: true,
      admissionFeePaid: true,
      documentsVerified: true,
      admissionFormSigned: true,
      enrollmentNumberReceived: true,
    },

    notes:
      "Admission completed and enrollment number received.",
  },

  {
    id: "3",
    admissionId: "ADM-2026-003",
    studentId: "VU-10241",
    studentName: "Sakshi Gupta",
    phone: "+91 9876001234",
    email: "sakshi@gmail.com",

    applicationId: "APP-2026-009",

    college: "Galgotias University",
    university: "Galgotias University",
    course: "MCA",
    specialization: "Computer Applications",

    academicYear: "2026-27",
    admissionDate: "2026-08-10",
    joiningDate: "2026-08-20",

    admissionNumber: "GU-MCA-2026-110",
    enrollmentNumber: "GU2026MCA991",

    counsellor: "Neha Singh",
    counsellorInitials: "NS",

    status: "onboarding",

    totalFee: 190000,
    paidFee: 190000,
    pendingFee: 0,

    admissionDocuments: 10,
    requiredDocuments: 10,

    checklist: {
      applicationApproved: true,
      offerLetter: true,
      studentAccepted: true,
      admissionFeePaid: true,
      documentsVerified: true,
      admissionFormSigned: true,
      enrollmentNumberReceived: true,
    },

    notes:
      "Student onboarding in progress.",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

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

const getAdmissionStatusClasses = (
  status: Admission["status"]
) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";

    case "fee_pending":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";

    case "onboarding":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400";

    default:
      return "bg-muted text-muted-foreground";
  }
};

const getAdmissionStatusLabel = (
  status: Admission["status"]
) => {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "fee_pending":
      return "Fee Pending";
    case "onboarding":
      return "Onboarding";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const Admissions = () => {
  const [admissions, setAdmissions] =
    useState<Admission[]>(initialAdmissions);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedAdmission, setSelectedAdmission] =
    useState<Admission | null>(null);

  const [loading, setLoading] = useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [message, setMessage] = useState("");

  const filteredAdmissions = useMemo(() => {
    const query = search.toLowerCase().trim();

    return admissions.filter((admission) => {
      const matchesSearch =
        !query ||
        admission.studentName
          .toLowerCase()
          .includes(query) ||
        admission.admissionId
          .toLowerCase()
          .includes(query) ||
        admission.applicationId
          .toLowerCase()
          .includes(query) ||
        admission.college
          .toLowerCase()
          .includes(query) ||
        admission.course
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        admission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [admissions, search, statusFilter]);

  const totalAdmissions = admissions.length;

  const confirmed = admissions.filter(
    (item) => item.status === "confirmed"
  ).length;

  const feePending = admissions.filter(
    (item) => item.status === "fee_pending"
  ).length;

  const onboarding = admissions.filter(
    (item) => item.status === "onboarding"
  ).length;

  const totalFee = admissions.reduce(
    (sum, item) => sum + item.totalFee,
    0
  );

  const collectedFee = admissions.reduce(
    (sum, item) => sum + item.paidFee,
    0
  );

  const pendingFee = admissions.reduce(
    (sum, item) => sum + item.pendingFee,
    0
  );

  const refreshAdmissions = async () => {
    try {
      setLoading(true);

      /*
        Production:

        const response = await api.get(
          "/admissions"
        );

        setAdmissions(response.data.data);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setMessage("Admissions refreshed.");

      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Unable to refresh admissions.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    admission: Admission,
    status: Admission["status"]
  ) => {
    setAdmissions((current) =>
      current.map((item) =>
        item.id === admission.id
          ? { ...item, status }
          : item
      )
    );

    if (selectedAdmission?.id === admission.id) {
      setSelectedAdmission({
        ...selectedAdmission,
        status,
      });
    }

    setMessage(
      `${admission.studentName} admission status updated.`
    );

    setTimeout(() => setMessage(""), 2500);

    /*
      Production:

      await api.patch(
        `/admissions/${admission.id}`,
        { status }
      );
    */
  };

  return (
    <DashboardLayout title="Admissions">

      <div className="space-y-6 pb-10">

        {/* HEADER */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Admissions
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage confirmed admissions, fees,
                documents and onboarding.
              </p>
            </div>

          </div>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={refreshAdmissions}
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
              New Admission
            </Button>

          </div>

        </div>

        {message && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 text-primary px-4 py-3 text-sm flex gap-2 items-center">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Admissions
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalAdmissions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Confirmed
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {confirmed}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Fee Pending
              </p>
              <p className="text-2xl font-bold mt-1 text-amber-600">
                {feePending}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Onboarding
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {onboarding}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Collected
              </p>
              <p className="text-lg font-bold mt-2 text-emerald-600">
                {formatCurrency(collectedFee)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Pending
              </p>
              <p className="text-lg font-bold mt-2 text-rose-600">
                {formatCurrency(pendingFee)}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* SEARCH */}

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
                  placeholder="Search admission ID, student, college or course..."
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

            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t">

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="all">
                      All Status
                    </SelectItem>

                    <SelectItem value="confirmed">
                      Confirmed
                    </SelectItem>

                    <SelectItem value="fee_pending">
                      Fee Pending
                    </SelectItem>

                    <SelectItem value="onboarding">
                      Onboarding
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>
            )}

          </CardContent>

        </Card>

        {/* TABLE */}

        <Card className="overflow-hidden">

          <CardHeader className="border-b">

            <div className="flex items-center justify-between">

              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Admission Records
              </CardTitle>

              <span className="text-xs text-muted-foreground">
                {filteredAdmissions.length} records
              </span>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px]">

                <thead className="bg-muted/30 border-b">

                  <tr>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Admission
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
                      Fee
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Documents
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Joining
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredAdmissions.map(
                    (admission) => {

                      const feePercentage =
                        admission.totalFee > 0
                          ? Math.round(
                              (admission.paidFee /
                                admission.totalFee) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={admission.id}
                          className="hover:bg-muted/20"
                        >

                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-primary">
                              {
                                admission.admissionId
                              }
                            </p>

                            <p className="text-[10px] text-muted-foreground mt-1">
                              {
                                admission.applicationId
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {admission.studentName
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
                                    admission.studentName
                                  }
                                </p>

                                <p className="text-[10px] text-muted-foreground">
                                  {
                                    admission.studentId
                                  }
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {admission.college}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {admission.course}
                              {" • "}
                              {
                                admission.specialization
                              }
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
                                    className={getAdmissionStatusClasses(
                                      admission.status
                                    )}
                                  >
                                    {getAdmissionStatusLabel(
                                      admission.status
                                    )}

                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Badge>

                                </button>

                              </DropdownMenuTrigger>

                              <DropdownMenuContent>

                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      admission,
                                      "confirmed"
                                    )
                                  }
                                >
                                  Confirmed
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      admission,
                                      "fee_pending"
                                    )
                                  }
                                >
                                  Fee Pending
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      admission,
                                      "onboarding"
                                    )
                                  }
                                >
                                  Onboarding
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      admission,
                                      "cancelled"
                                    )
                                  }
                                >
                                  Cancelled
                                </DropdownMenuItem>

                              </DropdownMenuContent>

                            </DropdownMenu>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-bold">
                              {formatCurrency(
                                admission.paidFee
                              )}
                            </p>

                            <div className="w-24 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">

                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${feePercentage}%`,
                                }}
                              />

                            </div>

                            <p className="text-[10px] text-muted-foreground mt-1">
                              Pending{" "}
                              {formatCurrency(
                                admission.pendingFee
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <FileText className="h-4 w-4 text-muted-foreground" />

                              <span className="text-xs font-semibold">
                                {
                                  admission.admissionDocuments
                                }
                                /
                                {
                                  admission.requiredDocuments
                                }
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {formatDate(
                                admission.joiningDate
                              )}
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
                                    setSelectedAdmission(
                                      admission
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Admission
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
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Payment History
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Documents
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

            </div>

          </CardContent>

        </Card>

        {/* =====================================================
            DETAIL DRAWER
        ===================================================== */}

        {selectedAdmission && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">

            <div className="h-full w-full max-w-2xl bg-background shadow-2xl overflow-y-auto">

              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">

                <div className="px-6 py-4 flex justify-between items-center">

                  <div>

                    <p className="text-xs text-primary font-bold">
                      {
                        selectedAdmission.admissionId
                      }
                    </p>

                    <h2 className="text-lg font-bold mt-1">
                      Admission Details
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedAdmission(null)
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

                    <div className="flex justify-between items-start gap-4">

                      <div className="flex items-center gap-3">

                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {selectedAdmission.studentName
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
                              selectedAdmission.studentName
                            }
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {
                              selectedAdmission.studentId
                            }
                          </p>

                        </div>

                      </div>

                      <Badge
                        variant="outline"
                        className={getAdmissionStatusClasses(
                          selectedAdmission.status
                        )}
                      >
                        {getAdmissionStatusLabel(
                          selectedAdmission.status
                        )}
                      </Badge>

                    </div>

                  </CardContent>

                </Card>

                {/* ADMISSION DETAILS */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Admission Information
                    </CardTitle>

                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-5">

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        College
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedAdmission.college
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Course
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedAdmission.course
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Admission Date
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {formatDate(
                          selectedAdmission.admissionDate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Joining Date
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {formatDate(
                          selectedAdmission.joiningDate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Admission Number
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedAdmission.admissionNumber ||
                          "-"
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Enrollment Number
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedAdmission.enrollmentNumber ||
                          "Pending"
                        }
                      </p>
                    </div>

                  </CardContent>

                </Card>

                {/* FEE */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <WalletCards className="h-4 w-4 text-primary" />
                      Fee & Payments
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="grid grid-cols-3 gap-3">

                      <div className="p-3 rounded-lg bg-muted/40">
                        <p className="text-[10px] text-muted-foreground">
                          Total Fee
                        </p>

                        <p className="text-lg font-bold mt-1">
                          {formatCurrency(
                            selectedAdmission.totalFee
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                        <p className="text-[10px] text-muted-foreground">
                          Paid
                        </p>

                        <p className="text-lg font-bold mt-1 text-emerald-600">
                          {formatCurrency(
                            selectedAdmission.paidFee
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20">
                        <p className="text-[10px] text-muted-foreground">
                          Pending
                        </p>

                        <p className="text-lg font-bold mt-1 text-rose-600">
                          {formatCurrency(
                            selectedAdmission.pendingFee
                          )}
                        </p>
                      </div>

                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View Payment History
                    </Button>

                  </CardContent>

                </Card>

                {/* CHECKLIST */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Admission Checklist
                    </CardTitle>

                  </CardHeader>

                  <CardContent className="space-y-2">

                    {[
                      [
                        "Application Approved",
                        selectedAdmission.checklist
                          .applicationApproved,
                      ],
                      [
                        "Offer Letter Received",
                        selectedAdmission.checklist
                          .offerLetter,
                      ],
                      [
                        "Student Accepted",
                        selectedAdmission.checklist
                          .studentAccepted,
                      ],
                      [
                        "Admission Fee Paid",
                        selectedAdmission.checklist
                          .admissionFeePaid,
                      ],
                      [
                        "Documents Verified",
                        selectedAdmission.checklist
                          .documentsVerified,
                      ],
                      [
                        "Admission Form Signed",
                        selectedAdmission.checklist
                          .admissionFormSigned,
                      ],
                      [
                        "Enrollment Number Received",
                        selectedAdmission.checklist
                          .enrollmentNumberReceived,
                      ],
                    ].map(([label, completed]) => (

                      <div
                        key={String(label)}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >

                        <span className="text-xs font-medium">
                          {String(label)}
                        </span>

                        {completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}

                      </div>

                    ))}

                  </CardContent>

                </Card>

                {/* DOCUMENTS */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Admission Documents
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="flex justify-between">

                      <span className="text-sm">
                        Documents
                      </span>

                      <span className="font-bold">
                        {
                          selectedAdmission.admissionDocuments
                        }
                        /
                        {
                          selectedAdmission.requiredDocuments
                        }
                      </span>

                    </div>

                    <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">

                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            (selectedAdmission.admissionDocuments /
                              selectedAdmission.requiredDocuments) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Documents
                    </Button>

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
                    <Receipt className="h-4 w-4 mr-2" />
                    Payment
                  </Button>

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Documents
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

export default Admissions;