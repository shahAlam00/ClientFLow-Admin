import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scale, Briefcase, Clock, ShieldCheck,
  Plus, Eye, Filter, ArrowUpDown, Edit2, Trash2, ArrowLeft, Save,
  Download, Upload, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Check
} from "lucide-react";
import api from "../../lib/axios.jsx";
import * as XLSX from "xlsx";

// Importing the isolated Dossier View Component
import { CaseDetails } from "../../components/case/CaseDetails.jsx";

function CaseStatus() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [casesRegistry, setCasesRegistry] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FILTER & SORT STATES
  // =========================
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // =========================
  // PAGINATION STATE (6 per page)
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // =========================
  // DELETE POPUP MODAL STATE
  // =========================
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // एडिट मोड को हैंडल करने के लिए स्टेट्स
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    caseRegisterDate: "",
    caseNumber: "",
    firstPartyName: "",
    firstPartyRole: "Petitioner",
    oppositePartyName: "",
    caseType: "",
    caseStudy: "",
    policeStationName: "",
    crnNumber: "",
    courtType: "High Court",
    courtNameNumber: "",
    firNumber: "",
    oldHearingDates: [], 
    nextHearingDate: "",
    caseStatus: "On-hold",
    otherDetails: "",
    remarksNotes: "",
    caseTotalFees: 0,
    addClientFilter: "General",
  });

  // Executive insights metrics tracking summaries state
  const [stats, setStats] = useState([
    { label: "Total Managed Cases", value: "0", icon: Scale, bg: "from-amber-500/5 via-amber-500/10 to-transparent" },
    { label: "Active Ongoing Trials", value: "0", icon: Briefcase, bg: "from-blue-500/5 via-blue-500/10 to-transparent" },
    { label: "On-hold Cases", value: "0", icon: Clock, bg: "from-amber-500/5 via-amber-500/10 to-transparent" },
    { label: "Outstanding Retainers Fees", value: "₹0", icon: ShieldCheck, bg: "from-emerald-500/5 via-emerald-500/10 to-transparent" },
  ]);

  // Utility helper to format YYYY-MM-DD string cleanly to Indian Standard Format DD-MM-YYYY
  const formatDateToIndian = (dateString) => {
    if (!dateString) return "—";
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return cleanDate;
  };

  // Utility helper to safely fetch the latest history log date for clean UI visualization
  const getLatestOldHearingDate = (datesArray) => {
    if (!datesArray || !Array.isArray(datesArray) || datesArray.length === 0) return "—";
    const targetDate = datesArray[datesArray.length - 1]; 
    return formatDateToIndian(targetDate);
  };

  
  // Function to calculate metrics from the updated registry data
  const calculateMetrics = (data) => {
    const totalCases = data.length;
    const activeTrials = data.filter(c => c.caseStatus !== "Disposed").length;
    const onHold = data.filter(c => c.caseStatus === "On-hold").length;
    const totalFees = data.reduce((sum, c) => sum + (Number(c.caseTotalFees) || 0), 0);

    setStats([
      { label: "Total Managed Cases", value: totalCases.toString(), icon: Scale, bg: "from-amber-500/5 via-amber-500/10 to-transparent" },
      { label: "Active Ongoing Trials", value: activeTrials.toString(), icon: Briefcase, bg: "from-blue-500/5 via-blue-500/10 to-transparent" },
      { label: "On-hold Cases", value: onHold.toString(), icon: Clock, bg: "from-amber-500/5 via-amber-500/10 to-transparent" },
      { label: "Outstanding Retainers Fees", value: `₹${(totalFees / 100000).toFixed(1)}L`, icon: ShieldCheck, bg: "from-emerald-500/5 via-emerald-500/10 to-transparent" },
    ]);
  };

  // Integrated Fetching Pipeline
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.get("/management");
      if (response.data.success) {
        const data = response.data.data;
        setCasesRegistry(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error("Database parsing registry failure error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Extract unique practice categories dynamically for filter options
  const uniqueCategories = useMemo(() => {
    const categories = casesRegistry.map(c => c.caseType).filter(Boolean);
    return ["All", ...new Set(categories)];
  }, [casesRegistry]);

  // =========================
  // FILTERED & SORTED CASES
  // =========================
  const processedCases = useMemo(() => {
    let result = [...casesRegistry];

    // Apply Filter by Practice Category
    if (selectedFilter !== "All") {
      result = result.filter(c => c.caseType === selectedFilter);
    }

    // Apply Sort Sequence
    result.sort((a, b) => {
      if (selectedSort === "latest") {
        return new Date(b.caseRegisterDate || 0) - new Date(a.caseRegisterDate || 0);
      } else if (selectedSort === "oldest") {
        return new Date(a.caseRegisterDate || 0) - new Date(b.caseRegisterDate || 0);
      } else if (selectedSort === "fees-high") {
        return (Number(b.caseTotalFees) || 0) - (Number(a.caseTotalFees) || 0);
      } else if (selectedSort === "next-hearing") {
        return new Date(a.nextHearingDate || "9999-12-31") - new Date(b.nextHearingDate || "9999-12-31");
      }
      return 0;
    });

    return result;
  }, [casesRegistry, selectedFilter, selectedSort]);

  // =========================
  // DELETE MODAL HANDLERS
  // =========================
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDeleteCase = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const response = await api.delete(`/management/${deleteId}`);
      if (response.data.success) {
        const updatedRegistry = casesRegistry.filter((item) => item._id !== deleteId);
        setCasesRegistry(updatedRegistry);
        calculateMetrics(updatedRegistry);
      } else {
        alert("Failed to delete the case. Please try again.");
      }
    } catch (error) {
      console.error("Error executing delete framework sequence:", error);
      alert("Server error occurred while deleting the case registry.");
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // Handle Edit Action
  const handleEditCase = (caseItem) => {
    navigate(`/dashboard/cases/edit/${caseItem._id}`);
  };

  // =========================
  // PAGINATION CALCULATIONS
  // =========================
  const totalPages = Math.max(1, Math.ceil(processedCases.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = useMemo(() => {
    return processedCases.slice(startIndex, endIndex);
  }, [processedCases, startIndex, endIndex]);

  // Reset page when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedSort]);

  // Adjust page number if deletion pushes current page past totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [processedCases.length, totalPages, currentPage]);

  // ==================== EXPORT TO EXCEL ====================
  const exportToExcel = () => {
    if (casesRegistry.length === 0) {
      alert("No data available to export.");
      return;
    }

    const dataToExport = casesRegistry.map((item, index) => ({
      "Case ID": item.customClientId || `#A224${index + 1}`,
      "Case Reference Number": item.caseNumber || "",
      "Client/First Party Name": item.firstPartyName || "",
      "First Party Role": item.firstPartyRole || "Petitioner",
      "Opposite Party Name": item.oppositePartyName || "",
      "Practice Category (Type)": item.caseType || "",
      "Register Date": formatDateToIndian(item.caseRegisterDate),
      "Court Type Level": item.courtType || "High Court",
      "Court Name or Bench Room ID": item.courtNameNumber || "N/A",
      "CRN Registry Number": item.crnNumber || "N/A",
      "Police Station Jurisdiction": item.policeStationName || "N/A",
      "FIR Code Index": item.firNumber || "N/A",
      "Old Hearing History Logs": item.oldHearingDates && Array.isArray(item.oldHearingDates) 
        ? item.oldHearingDates.map(d => formatDateToIndian(d)).join(", ") 
        : "N/A",
      "Next Hearing Date": formatDateToIndian(item.nextHearingDate),
      "Trial Status": item.caseStatus || "On-hold",
      "Total Fees (₹)": item.caseTotalFees || 0,
      "Client Segment Tag": item.addClientFilter || "General",
      "Case Study Summary": item.caseStudy || "No logs uploaded.",
      "Internal Office Notes": item.remarksNotes || "No annotations available.",
      "Auxiliary Structural Details": item.otherDetails || "No profiles attached."
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Cases Dossier");
    XLSX.writeFile(workbook, `Consolidated_Legal_Registry_Full_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ==================== EXCEL IMPORT ====================
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (rawData.length === 0) {
          alert("The uploaded Excel sheet is empty.");
          setLoading(false);
          return;
        }

        let successCount = 0;
        for (const row of rawData) {
          let parsedOldDates = [];
          const rawOldDatesField = row["Old Hearing History Logs"] || row["oldHearingDates"];
          if (rawOldDatesField) {
            parsedOldDates = rawOldDatesField.toString().split(",").map(d => d.trim()).filter(Boolean);
          }

          const payload = {
            customClientId: row["Case ID"] || "",
            firstPartyName: row["Client/First Party Name"] || row["firstPartyName"] || "Unknown",
            firstPartyRole: row["First Party Role"] || row["firstPartyRole"] || "Petitioner",
            oppositePartyName: row["Opposite Party Name"] || row["oppositePartyName"] || "Unknown",
            caseType: row["Practice Category (Type)"] || row["caseType"] || "General",
            caseRegisterDate: row["Register Date"] || row["caseRegisterDate"] || new Date().toISOString().slice(0,10),
            caseNumber: row["Case Reference Number"] || row["caseNumber"] || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
            courtType: row["Court Type Level"] || row["courtType"] || "High Court",
            courtNameNumber: row["Court Name or Bench Room ID"] || row["courtNameNumber"] || "",
            policeStationName: row["Police Station Jurisdiction"] || row["policeStationName"] || "",
            crnNumber: row["CRN Registry Number"] || row["crnNumber"] || "",
            firNumber: row["FIR Code Index"] || row["firNumber"] || "",
            oldHearingDates: parsedOldDates,
            nextHearingDate: row["Next Hearing Date"] || row["nextHearingDate"] || "",
            caseStatus: row["Trial Status"] || row["caseStatus"] || "On-hold",
            caseTotalFees: Number(row["Total Fees (₹)"] || row["caseTotalFees"] || 0),
            addClientFilter: row["Client Segment Tag"] || row["addClientFilter"] || "General",
            caseStudy: row["Case Study Summary"] || row["caseStudy"] || "",
            remarksNotes: row["Internal Office Notes"] || row["remarksNotes"] || "",
            otherDetails: row["Auxiliary Structural Details"] || row["otherDetails"] || ""
          };

          try {
            await api.post("/management", payload);
            successCount++;
          } catch (postErr) {
            console.error("Failed to insert single row:", postErr);
          }
        }

        alert(`${successCount} out of ${rawData.length} Dossiers imported successfully.`);
        fetchCases();
      } catch (err) {
        console.error("Excel processing error:", err);
        alert("Failed to parse Excel file structure.");
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; 
  };

  return (
    <DashboardLayout title="Case Status Management">
      <div className="p-1 space-y-6">

        {selectedCase ? (
          <CaseDetails
            selectedCase={selectedCase}
            onBack={() => {
              setSelectedCase(null);
              fetchCases();
            }}
          />
        ) : (
          <>
            {/* TITLE & WORKFLOW BAR */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border/60">
              <div>
                <h1 className="text-2xl font-serif text-primary tracking-tight">Case Records Registry</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monitor ongoing litigation tracking parameters, hearing files, and retainer balances.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importFromExcel}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={handleImportClick}
                  className="h-11 text-xs font-semibold gap-2 border-border/80 hover:bg-secondary/50"
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 text-emerald-600" /> Import
                </Button>

                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="h-11 text-xs font-semibold gap-2 border-border/80 hover:bg-secondary/50"
                >
                  <Download className="h-4 w-4 text-blue-600" /> Export
                </Button>

                <Button
                  onClick={() => navigate("/dashboard/cases/adds")}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs uppercase tracking-widest px-5 h-11 gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="h-4 w-4" /> Add Case File
                </Button>
              </div>
            </div>

            {/* DYNAMIC METRICS GRAPH GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, idx) => (
                <Card key={idx} className="relative overflow-hidden border-border/80 bg-card hover:shadow-md transition-all duration-300 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-40`} />
                  <CardContent className="p-5 relative z-10 flex items-center justify-between">
                    <div className="space-y-1 w-full">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</p>
                      {loading ? (
                        <div className="h-8 w-24 bg-muted/60 rounded animate-pulse mt-1" />
                      ) : (
                        <p className="text-2xl font-bold tracking-tight text-primary">{s.value}</p>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm shrink-0">
                      <s.icon className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CONTROL BAR PANELS WITH FULLY WORKING FILTER & SORT */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-secondary/30 backdrop-blur-sm rounded-xl border border-border/60 gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                
                {/* PRACTICE TRACK FILTER DROPDOWN */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className="h-9 text-xs gap-1.5 font-medium bg-background border-border/80"
                  >
                    <Filter className="h-3.5 w-3.5 text-amber-600" /> 
                    {selectedFilter === "All" ? "Practice Track Filter" : `Filter: ${selectedFilter}`}
                  </Button>

                  {isFilterOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                        Filter By Practice Type
                      </div>
                      {uniqueCategories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedFilter(cat);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                            selectedFilter === cat 
                              ? "bg-amber-500/10 text-amber-600 font-bold" 
                              : "hover:bg-secondary/50 text-foreground"
                          }`}
                        >
                          <span>{cat}</span>
                          {selectedFilter === cat && <Check className="h-3.5 w-3.5 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SORT SEQUENCE DROPDOWN */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className="h-9 text-xs gap-1.5 font-medium bg-background border-border/80"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 text-amber-600" /> Sort Sequence
                  </Button>

                  {isSortOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                        Sort Sequence Order
                      </div>
                      {[
                        { id: "latest", label: "Latest Register Date" },
                        { id: "oldest", label: "Oldest Register Date" },
                        { id: "fees-high", label: "Retainer Due: High to Low" },
                        { id: "next-hearing", label: "Next Hearing Date (Soon)" },
                      ].map((sortOpt) => (
                        <button
                          key={sortOpt.id}
                          onClick={() => {
                            setSelectedSort(sortOpt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                            selectedSort === sortOpt.id 
                              ? "bg-amber-500/10 text-amber-600 font-bold" 
                              : "hover:bg-secondary/50 text-foreground"
                          }`}
                        >
                          <span>{sortOpt.label}</span>
                          {selectedSort === sortOpt.id && <Check className="h-3.5 w-3.5 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <p className="text-xs text-muted-foreground font-medium hidden md:block">
                {loading ? (
                  <span className="inline-block h-3 w-36 bg-muted/60 rounded animate-pulse align-middle" />
                ) : (
                  `Showing ${processedCases.length > 0 ? startIndex + 1 : 0} - ${Math.min(endIndex, processedCases.length)} of ${processedCases.length} Dossiers`
                )}
              </p>
            </div>

            {/* REGISTRY LEDGER DATA TABLE */}
            <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden space-y-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border/80">
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Case ID</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Client / Litigant Profile</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Practice Category</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Calendar Sync Date</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Retainer Due</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Old Hearing Date</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Next Hearing Date</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trial Status</th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Action Framework</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/60">
                    {loading ? (
                      [...Array(6)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="p-4"><div className="h-4 w-16 bg-muted/60 rounded" /></td>
                          <td className="p-4 space-y-2"><div className="h-4 w-32 bg-muted/60 rounded" /><div className="h-3 w-20 bg-muted/40 rounded" /></td>
                          <td className="p-4"><div className="h-4 w-24 bg-muted/60 rounded" /></td>
                          <td className="p-4"><div className="h-4 w-20 bg-muted/60 rounded" /></td>
                          <td className="p-4"><div className="h-4 w-16 bg-muted/60 rounded" /></td>
                          <td className="p-4"><div className="h-4 w-20 bg-muted/60 rounded" /></td>
                          <td className="p-4"><div className="h-4 w-20 bg-muted/60 rounded" /></td>
                          <td className="p-4"><div className="h-6 w-16 bg-muted/60 rounded-full" /></td>
                          <td className="p-4"><div className="flex items-center justify-center gap-2"><div className="h-8 w-8 bg-muted/60 rounded" /><div className="h-8 w-8 bg-muted/60 rounded" /><div className="h-8 w-8 bg-muted/60 rounded" /></div></td>
                        </tr>
                      ))
                    ) : processedCases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                          No matching case profiles found.
                        </td>
                      </tr>
                    ) : (
                      paginatedCases.map((item, index) => (
                        <tr key={item._id || index} className="hover:bg-secondary/10 transition-colors group">
                          <td className="p-4 text-sm font-semibold tracking-mono text-primary whitespace-nowrap">
                            {item.customClientId || `#A224${startIndex + index + 1}`}
                          </td>
                          <td className="p-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.firstPartyName}</p>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.firstPartyRole} Profile</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground font-medium">{item.caseType}</td>
                          
                          <td className="p-4 text-sm text-foreground/90 font-medium whitespace-nowrap">
                            {formatDateToIndian(item.caseRegisterDate)}
                          </td>
                          
                          <td className="p-4 text-sm font-semibold text-destructive whitespace-nowrap">₹{parseFloat(item.caseTotalFees || 0).toLocaleString('en-IN')}</td>
                          
                          <td className="p-4 text-sm text-muted-foreground font-medium whitespace-nowrap">
                            {getLatestOldHearingDate(item.oldHearingDates)}
                          </td>
                          
                          <td className="p-4 text-sm font-medium text-amber-700 whitespace-nowrap">
                            {formatDateToIndian(item.nextHearingDate)}
                          </td>
                          
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-inner ${
                              item.caseStatus === "Disposed" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}>
                              {item.caseStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                                onClick={() => setSelectedCase(item)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600"
                                onClick={() => handleEditCase(item)}
                                title="Edit Case"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteClick(item._id)}
                                title="Delete Case"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* CENTERED MODERN PAGINATION */}
              {!loading && processedCases.length > 0 && (
                <div className="flex flex-col items-center justify-center gap-3 p-4 border-t border-border/80 bg-card">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-10 w-10 p-0 rounded-2xl border-border/80 hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-1.5 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 min-w-[40px] px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                            currentPage === page
                              ? "bg-gold text-white shadow-md shadow-amber-600/20 scale-105"
                              : "border border-border/80 bg-background hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-10 w-10 p-0 rounded-2xl border-border/80 hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="font-bold text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-foreground">
                      {Math.min(endIndex, processedCases.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-foreground">
                      {processedCases.length}
                    </span>{" "}
                    dossiers
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION POPUP MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Delete Case File?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete this case profile? This action cannot be undone and will remove all associated records from the registry.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border-border text-foreground hover:bg-secondary/50 transition disabled:opacity-50"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteCase}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CaseStatus;