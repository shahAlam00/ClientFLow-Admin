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
  WalletCards,
  ClipboardList,
  BookMarked,
  Activity,
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

interface EnrolledStudent {
  id: string;

  studentId: string;
  admissionId: string;

  name: string;
  phone: string;
  email: string;

  college: string;
  university: string;
  course: string;
  specialization: string;

  batch: string;
  academicYear: string;

  enrollmentNumber: string;
  collegeStudentId: string;

  joiningDate: string;

  counsellor: string;
  counsellorInitials: string;

  status:
    | "active"
    | "onboarding"
    | "fee_pending"
    | "graduated"
    | "dropped"
    | "transferred";

  semester: number;

  totalFee: number;
  paidFee: number;
  pendingFee: number;

  attendancePercentage: number;
  cgpa: number | null;

  documentsCompleted: number;
  documentsRequired: number;

  notes: string;
}

const initialStudents: EnrolledStudent[] = [
  {
    id: "1",
    studentId: "STU-2026-001",
    admissionId: "ADM-2026-002",

    name: "Aditya Raj",
    phone: "+91 9988776655",
    email: "aditya.raj@gmail.com",

    college: "Galgotias University",
    university: "Galgotias University",
    course: "BCA",
    specialization: "Computer Science",

    batch: "2026-2029",
    academicYear: "2026-27",

    enrollmentNumber: "GU2026BCA221",
    collegeStudentId: "GU-STU-221",

    joiningDate: "2026-08-22",

    counsellor: "Amit Verma",
    counsellorInitials: "AV",

    status: "active",

    semester: 1,

    totalFee: 140000,
    paidFee: 140000,
    pendingFee: 0,

    attendancePercentage: 91,
    cgpa: null,

    documentsCompleted: 10,
    documentsRequired: 10,

    notes: "Student joined successfully.",
  },

  {
    id: "2",
    studentId: "STU-2026-002",
    admissionId: "ADM-2026-003",

    name: "Sakshi Gupta",
    phone: "+91 9876001234",
    email: "sakshi@gmail.com",

    college: "Galgotias University",
    university: "Galgotias University",
    course: "MCA",
    specialization: "Computer Applications",

    batch: "2026-2028",
    academicYear: "2026-27",

    enrollmentNumber: "GU2026MCA991",
    collegeStudentId: "GU-STU-991",

    joiningDate: "2026-08-20",

    counsellor: "Neha Singh",
    counsellorInitials: "NS",

    status: "onboarding",

    semester: 1,

    totalFee: 190000,
    paidFee: 190000,
    pendingFee: 0,

    attendancePercentage: 0,
    cgpa: null,

    documentsCompleted: 10,
    documentsRequired: 10,

    notes: "College onboarding in progress.",
  },

  {
    id: "3",
    studentId: "STU-2026-003",
    admissionId: "ADM-2026-001",

    name: "Monika",
    phone: "+91 6363561319",
    email: "sreenareenivas944@gmail.com",

    college: "Sharda University",
    university: "Sharda University",
    course: "M.Tech",
    specialization: "Computer Science",

    batch: "2026-2028",
    academicYear: "2026-27",

    enrollmentNumber: "SHD-MTECH-220",
    collegeStudentId: "SHD-220",

    joiningDate: "2026-08-25",

    counsellor: "Rahul Sharma",
    counsellorInitials: "RS",

    status: "fee_pending",

    semester: 1,

    totalFee: 180000,
    paidFee: 100000,
    pendingFee: 80000,

    attendancePercentage: 0,
    cgpa: null,

    documentsCompleted: 8,
    documentsRequired: 10,

    notes: "Final admission fee pending.",
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

const getStatusClasses = (
  status: EnrolledStudent["status"]
) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";

    case "onboarding":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400";

    case "fee_pending":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";

    case "graduated":
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400";

    case "dropped":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400";

    case "transferred":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400";

    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (
  status: EnrolledStudent["status"]
) => {
  switch (status) {
    case "active":
      return "Active";
    case "onboarding":
      return "Onboarding";
    case "fee_pending":
      return "Fee Pending";
    case "graduated":
      return "Graduated";
    case "dropped":
      return "Dropped";
    case "transferred":
      return "Transferred";
    default:
      return status;
  }
};

const EnrolledStudents = () => {
  const [students, setStudents] =
    useState<EnrolledStudent[]>(initialStudents);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [collegeFilter, setCollegeFilter] =
    useState("all");

  const [selectedStudent, setSelectedStudent] =
    useState<EnrolledStudent | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const courses = useMemo(
    () =>
      Array.from(
        new Set(
          students.map(
            (student) => student.course
          )
        )
      ),
    [students]
  );

  const colleges = useMemo(
    () =>
      Array.from(
        new Set(
          students.map(
            (student) => student.college
          )
        )
      ),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return students.filter((student) => {

      const matchesSearch =
        !query ||
        student.name
          .toLowerCase()
          .includes(query) ||
        student.studentId
          .toLowerCase()
          .includes(query) ||
        student.enrollmentNumber
          .toLowerCase()
          .includes(query) ||
        student.college
          .toLowerCase()
          .includes(query) ||
        student.course
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        student.status === statusFilter;

      const matchesCourse =
        courseFilter === "all" ||
        student.course === courseFilter;

      const matchesCollege =
        collegeFilter === "all" ||
        student.college === collegeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCourse &&
        matchesCollege
      );
    });
  }, [
    students,
    search,
    statusFilter,
    courseFilter,
    collegeFilter,
  ]);

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "active"
  ).length;

  const onboarding = students.filter(
    (student) => student.status === "onboarding"
  ).length;

  const feePending = students.filter(
    (student) =>
      student.status === "fee_pending"
  ).length;

  const totalFee = students.reduce(
    (sum, student) =>
      sum + student.totalFee,
    0
  );

  const collectedFee = students.reduce(
    (sum, student) =>
      sum + student.paidFee,
    0
  );

  const pendingFee = students.reduce(
    (sum, student) =>
      sum + student.pendingFee,
    0
  );

  const refreshStudents = async () => {
    try {
      setLoading(true);

      /*
        Production:

        const response = await api.get(
          "/students/enrolled"
        );

        setStudents(response.data.data);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setMessage("Enrolled students refreshed.");

      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to refresh enrolled students."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (
    student: EnrolledStudent,
    status: EnrolledStudent["status"]
  ) => {
    setStudents((current) =>
      current.map((item) =>
        item.id === student.id
          ? { ...item, status }
          : item
      )
    );

    if (selectedStudent?.id === student.id) {
      setSelectedStudent({
        ...selectedStudent,
        status,
      });
    }

    setMessage(
      `${student.name} status updated to ${getStatusLabel(
        status
      )}.`
    );

    setTimeout(() => setMessage(""), 2500);

    /*
      Production:

      await api.patch(
        `/students/${student.id}/status`,
        { status }
      );
    */
  };

  return (
    <DashboardLayout title="Enrolled Students">

      <div className="space-y-6 pb-10">

        {/* HEADER */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Enrolled Students
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage students after successful admission.
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={refreshStudents}
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
              Add Student
            </Button>

          </div>

        </div>

        {message && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 text-primary px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Students
              </p>

              <p className="text-2xl font-bold mt-1">
                {totalStudents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Active
              </p>

              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {activeStudents}
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
                  placeholder="Search student ID, enrollment number, college or course..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="all">
                      All Status
                    </SelectItem>

                    <SelectItem value="active">
                      Active
                    </SelectItem>

                    <SelectItem value="onboarding">
                      Onboarding
                    </SelectItem>

                    <SelectItem value="fee_pending">
                      Fee Pending
                    </SelectItem>

                    <SelectItem value="graduated">
                      Graduated
                    </SelectItem>

                    <SelectItem value="dropped">
                      Dropped
                    </SelectItem>

                    <SelectItem value="transferred">
                      Transferred
                    </SelectItem>

                  </SelectContent>

                </Select>

                <Select
                  value={courseFilter}
                  onValueChange={setCourseFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                    <SelectValue />
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
                Student Records
              </CardTitle>

              <span className="text-xs text-muted-foreground">
                {filteredStudents.length} students
              </span>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1300px]">

                <thead className="bg-muted/30 border-b">

                  <tr>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      College / Course
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Enrollment
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Semester
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Fee
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Joining
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Counsellor
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase font-bold text-muted-foreground">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredStudents.map(
                    (student) => {

                      const feePercentage =
                        student.totalFee > 0
                          ? Math.round(
                              (student.paidFee /
                                student.totalFee) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-muted/20"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {student.name
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
                                  {student.name}
                                </p>

                                <p className="text-[10px] text-muted-foreground">
                                  {
                                    student.studentId
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {student.college}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {student.course}
                              {" • "}
                              {
                                student.specialization
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-bold">
                              {
                                student.enrollmentNumber
                              }
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {
                                student.collegeStudentId
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
                                    className={getStatusClasses(
                                      student.status
                                    )}
                                  >
                                    {getStatusLabel(
                                      student.status
                                    )}

                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Badge>

                                </button>

                              </DropdownMenuTrigger>

                              <DropdownMenuContent>

                                {[
                                  "active",
                                  "onboarding",
                                  "fee_pending",
                                  "graduated",
                                  "dropped",
                                  "transferred",
                                ].map((status) => (

                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() =>
                                      updateStatus(
                                        student,
                                        status as EnrolledStudent["status"]
                                      )
                                    }
                                  >
                                    {getStatusLabel(
                                      status as EnrolledStudent["status"]
                                    )}
                                  </DropdownMenuItem>

                                ))}

                              </DropdownMenuContent>

                            </DropdownMenu>

                          </td>

                          <td className="px-5 py-4">

                            <span className="text-xs font-semibold">
                              Semester{" "}
                              {student.semester}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-bold">
                              {formatCurrency(
                                student.paidFee
                              )}
                            </p>

                            <div className="w-24 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">

                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${feePercentage}%`,
                                }}
                              />

                            </div>

                            <p className="text-[10px] text-muted-foreground mt-1">
                              Pending{" "}
                              {formatCurrency(
                                student.pendingFee
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-semibold">
                              {formatDate(
                                student.joiningDate
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                                {
                                  student.counsellorInitials
                                }
                              </div>

                              <span className="text-xs">
                                {
                                  student.counsellor
                                }
                              </span>

                            </div>

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
                                    setSelectedStudent(
                                      student
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Student Profile
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
                                  <WalletCards className="h-4 w-4 mr-2" />
                                  Fees
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
            STUDENT 360 DRAWER
        ===================================================== */}

        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">

            <div className="h-full w-full max-w-3xl bg-background shadow-2xl overflow-y-auto">

              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">

                <div className="px-6 py-4 flex items-center justify-between">

                  <div>

                    <p className="text-xs text-primary font-bold">
                      {
                        selectedStudent.studentId
                      }
                    </p>

                    <h2 className="text-lg font-bold mt-1">
                      Student Profile
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedStudent(null)
                    }
                    className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>

                </div>

              </div>

              <div className="p-6 space-y-5">

                {/* PROFILE */}

                <Card>

                  <CardContent className="p-5">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                          {selectedStudent.name
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

                          <h3 className="text-lg font-bold">
                            {selectedStudent.name}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {
                              selectedStudent.phone
                            }
                            {" • "}
                            {
                              selectedStudent.email
                            }
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Enrollment:{" "}
                            <span className="font-semibold text-foreground">
                              {
                                selectedStudent.enrollmentNumber
                              }
                            </span>
                          </p>

                        </div>

                      </div>

                      <Badge
                        variant="outline"
                        className={getStatusClasses(
                          selectedStudent.status
                        )}
                      >
                        {getStatusLabel(
                          selectedStudent.status
                        )}
                      </Badge>

                    </div>

                  </CardContent>

                </Card>

                {/* ACADEMIC */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-primary" />
                      Academic Information
                    </CardTitle>

                  </CardHeader>

                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-5">

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        College
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedStudent.college
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Course
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedStudent.course
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Specialization
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {
                          selectedStudent.specialization
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Batch
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {selectedStudent.batch}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Semester
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        Semester{" "}
                        {selectedStudent.semester}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Joining Date
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {formatDate(
                          selectedStudent.joiningDate
                        )}
                      </p>
                    </div>

                  </CardContent>

                </Card>

                {/* ACADEMIC PERFORMANCE */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                  <Card>

                    <CardContent className="p-4">

                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Attendance
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {
                          selectedStudent.attendancePercentage
                        }
                        %
                      </p>

                    </CardContent>

                  </Card>

                  <Card>

                    <CardContent className="p-4">

                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        CGPA
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {selectedStudent.cgpa ??
                          "N/A"}
                      </p>

                    </CardContent>

                  </Card>

                  <Card>

                    <CardContent className="p-4">

                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Semester
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {selectedStudent.semester}
                      </p>

                    </CardContent>

                  </Card>

                </div>

                {/* FEES */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <WalletCards className="h-4 w-4 text-primary" />
                      Fee Information
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
                            selectedStudent.totalFee
                          )}
                        </p>

                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">

                        <p className="text-[10px] text-muted-foreground">
                          Paid
                        </p>

                        <p className="text-lg font-bold mt-1 text-emerald-600">
                          {formatCurrency(
                            selectedStudent.paidFee
                          )}
                        </p>

                      </div>

                      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20">

                        <p className="text-[10px] text-muted-foreground">
                          Pending
                        </p>

                        <p className="text-lg font-bold mt-1 text-rose-600">
                          {formatCurrency(
                            selectedStudent.pendingFee
                          )}
                        </p>

                      </div>

                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <WalletCards className="h-4 w-4 mr-2" />
                      Open Fee Account
                    </Button>

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

                    <div className="flex justify-between">

                      <span className="text-sm">
                        Completed Documents
                      </span>

                      <span className="font-bold">
                        {
                          selectedStudent.documentsCompleted
                        }
                        /
                        {
                          selectedStudent.documentsRequired
                        }
                      </span>

                    </div>

                    <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">

                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${
                            (selectedStudent.documentsCompleted /
                              selectedStudent.documentsRequired) *
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

                {/* ACTIVITY */}

                <Card>

                  <CardHeader>

                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Student Activity
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="space-y-3">

                      <div className="flex gap-3 p-3 rounded-lg bg-muted/30">

                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />

                        <div>

                          <p className="text-xs font-semibold">
                            Admission completed
                          </p>

                          <p className="text-[10px] text-muted-foreground mt-1">
                            Student successfully enrolled.
                          </p>

                        </div>

                      </div>

                      <div className="flex gap-3 p-3 rounded-lg bg-muted/30">

                        <CalendarDays className="h-4 w-4 text-primary mt-0.5" />

                        <div>

                          <p className="text-xs font-semibold">
                            Joining date
                          </p>

                          <p className="text-[10px] text-muted-foreground mt-1">
                            {
                              formatDate(
                                selectedStudent.joiningDate
                              )
                            }
                          </p>

                        </div>

                      </div>

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
                      {selectedStudent.notes}
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
                    <WalletCards className="h-4 w-4 mr-2" />
                    Fees
                  </Button>

                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
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

export default EnrolledStudents;