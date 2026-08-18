import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Plus, Loader2, AlertCircle, Download, Upload, 
  Trash2, ChevronLeft, ChevronRight, AlertTriangle, X,
  UserCheck, GraduationCap, UserPlus, TrendingUp, Eye, Edit
} from "lucide-react"; 
import * as XLSX from "xlsx";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ClientTable from "../../components/clients/ClientTable.jsx";
import ClientSearch from "../../components/clients/ClientSearch.jsx";

import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Students = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null); 
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE}/students`);
      setStudents(data.data || data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setActionMessage({ type: 'error', text: 'Failed to load students from server.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Data Normalization, Filtering & Sorting Pipeline
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    
    const searchLower = search.toLowerCase();
    
    const normalizedStudents = students.map((student) => {
      const computedName = student.studentName || student.fullName || '-';
      const computedPhone = student.personalPhone || student.mobile || '-';
      const computedStatus = student.projectStatus || student.status || 'Active';

      return {
        ...student,
        fullName: computedName,
        name: computedName,
        mobilePrimary: computedPhone,
        status: computedStatus
      };
    });
    
    const filtered = normalizedStudents.filter((student) => {
      return (
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.enrollmentNo?.toLowerCase().includes(searchLower) ||
        student.mobilePrimary?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.course?.toLowerCase().includes(searchLower)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Latest first
    });
  }, [students, search]);

  // Dynamic Statistics Calculation for Top Cards
  const stats = useMemo(() => {
    if (!students || students.length === 0) {
      return { total: 0, active: 0, mca: 0, otherCourses: 0, newThisMonth: 0 };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let active = 0;
    let mca = 0;
    let otherCourses = 0;
    let newThisMonth = 0;

    students.forEach((student) => {
      const statusValue = student.projectStatus || student.status || 'Active';
      if (statusValue.toLowerCase() === 'active') {
        active++;
      }

      const course = (student.course || '').toLowerCase();
      if (course.includes('mca') || course.includes('master of computer')) {
        mca++;
      } else {
        otherCourses++;
      }

      if (student.createdAt || student.admissionDate) {
        const createdDate = new Date(student.createdAt || student.admissionDate);
        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
          newThisMonth++;
        }
      }
    });

    return {
      total: students.length,
      active,
      mca,
      otherCourses,
      newThisMonth
    };
  }, [students]);

  // Pagination slicing (6 items per page)
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // ==================== ACTIONS ====================
  const handleViewStudent = (student) => {
    const targetId = student._id || student.id;
    navigate(`/dashboard/students/${targetId}`);
  };

  const handleEditStudent = (student) => {
    const targetId = student._id || student.id;
    navigate(`/dashboard/student/edit/${targetId}`);
  };

  const handleInitiateDelete = (studentOrId) => {
    setActionMessage(null);
    if (typeof studentOrId === "object" && studentOrId !== null) {
      setStudentToDelete(studentOrId);
    } else {
      const target = filteredStudents.find(
        (s) => s._id === studentOrId || s.id === studentOrId
      );
      setStudentToDelete(target || { _id: studentOrId, studentName: "Selected Student" });
    }
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    const targetId = studentToDelete._id || studentToDelete.id;
    try {
      await axios.delete(`${API_BASE}/students/${targetId}`);
      setStudents(prev => prev.filter(s => s._id !== targetId && s.id !== targetId));
      setActionMessage({ type: 'success', text: 'Student record successfully deleted.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete student.' });
    } finally {
      setIsDeleteOpen(false);
      setStudentToDelete(null);
      setIsDeleting(false);
    }
  };

  // ==================== EXPORT TO EXCEL ====================
  const handleExportExcel = () => {
    if (!filteredStudents || filteredStudents.length === 0) return;

    const dataToExport = filteredStudents.map((student) => ({
      "Enrollment No": student.enrollmentNo || "",
      "Student Name": student.studentName || "",
      "Personal Phone": student.personalPhone || "",
      "Email Address": student.email || "",
      "Course": student.course || "",
      "Semester": student.semester || "",
      "Status": student.projectStatus || "",
      "Admission Date": student.admissionDate || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Database");

    XLSX.writeFile(workbook, `Students_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ==================== EXCEL IMPORT LOCAL ====================
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setActionMessage(null);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });

        const workSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[workSheetName];

        const importedData = XLSX.utils.sheet_to_json(worksheet);

        if (importedData.length === 0) {
          setActionMessage({ type: "error", text: "Excel file is empty!" });
          setIsImporting(false);
          return;
        }

        const sanitizedStudents = importedData.map((row, index) => ({
          _id: `imported_${Date.now()}_${index}`,
          enrollmentNo: row["Enrollment No"] || row["enrollmentNo"] || `ENR${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: row["Student Name"] || row["studentName"] || "Unknown Student",
          personalPhone: row["Personal Phone"] ? row["Personal Phone"].toString() : "",
          email: row["Email Address"] || row["email"] || "",
          course: row["Course"] || row["course"] || "MCA",
          semester: row["Semester"] || row["semester"] || "1st Semester",
          projectStatus: row["Status"] || row["projectStatus"] || "Active",
          admissionDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }));

        setStudents(prev => [...sanitizedStudents, ...prev]);
        setActionMessage({ 
          type: "success", 
          text: `Successfully imported ${sanitizedStudents.length} student records from Excel!` 
        });
      } catch (err) {
        console.error("Import error:", err);
        setActionMessage({ type: "error", text: "An error occurred while uploading the Excel file." });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    setActionMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <DashboardLayout title="Students">
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Student Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Showing <span className="font-semibold text-foreground">{paginatedStudents.length}</span> of <span className="font-semibold text-foreground">{filteredStudents.length}</span> filtered students ({students?.length || 0} total)
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <ClientSearch search={search} setSearch={setSearch} />
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              disabled={isImporting}
            />
            
            <Button
              onClick={triggerFileInput}
              variant="outline"
              disabled={isImporting}
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all hover:bg-accent rounded-lg"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Import Excel
                </>
              )}
            </Button>
            
            <Button
              onClick={handleExportExcel}
              variant="outline"
              disabled={filteredStudents.length === 0 || isImporting}
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all hover:bg-accent rounded-lg"
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>

            <Button 
              onClick={() => navigate("/dashboard/student")}
              disabled={isImporting}
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all hover:shadow-md rounded-lg"
            >
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </div>
        </div>

        {/* TOP STATS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Enrolled student records
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <UserCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.active / (stats.total || 1)) * 100).toFixed(0)}% of total students active
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">MCA / Other Courses</CardTitle>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <GraduationCap className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.mca} <span className="text-sm font-normal text-muted-foreground">/ {stats.otherCourses}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                MCA degree vs other programs
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <UserPlus className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Admitted in current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Status Inline Banner */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all animate-in fade-in duration-200 ${
            actionMessage.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <span className="font-medium">{actionMessage.text}</span>
            <button 
              onClick={() => setActionMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors text-current opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Students Table Card */}
        <Card className="border shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {filteredStudents.length > 0 ? (
              <ClientTable 
                clients={paginatedStudents} 
                navigate={navigate}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                onDelete={handleInitiateDelete}
              />
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Users className="h-12 w-12 mb-4 text-muted" strokeWidth={1} />
                <p className="text-lg font-medium text-foreground">No students found</p>
                <p className="text-sm mt-1">Try adjusting your search query or add a new student.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CENTERED ROUNDED PAGINATION CONTROLS */}
        {filteredStudents.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center pt-2 pb-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 w-8 rounded-full border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-full text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md scale-105"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="h-8 w-8 rounded-full border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
      </div>

      {/* DELETE CONFIRMATION MODAL POPUP */}
      {isDeleteOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Delete Student Record?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-foreground">{studentToDelete.studentName || "this student"}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 truncate">
                {studentToDelete.studentName || "Selected Student"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Enrollment No: <span className="font-mono text-slate-700">{studentToDelete.enrollmentNo || "N/A"}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Students;