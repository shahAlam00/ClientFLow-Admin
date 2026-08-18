import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Plus, Loader2, AlertCircle, Download, Upload, 
  Trash2, ChevronLeft, ChevronRight, AlertTriangle, X,
  UserCheck, Building2, UserPlus, TrendingUp
} from "lucide-react"; 
import * as XLSX from "xlsx";
import axios from "axios";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ClientTable from "../../components/clients/ClientTable.jsx";
import ClientSearch from "../../components/clients/ClientSearch.jsx";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;
// Update your API base URL according to your environment backend setup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Clients = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null); 
  
  // Real Backend Data State
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Clients on Mount
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/clients`, {
        withCredentials: true, // If using cookies/sessions
      });
      
      // FIXED: Safely extract data array from backend response structure: { success: true, data: [...] }
      const responseData = response.data;
      const fetchedData = Array.isArray(responseData) 
        ? responseData 
        : responseData.data || responseData.clients || [];
        
      setClients(fetchedData);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load client database from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Data Normalization, Filtering & Sorting Pipeline
  const filteredClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    
    const searchLower = search.toLowerCase();
    
    // Step 1: Normalize fields to match Mongoose schema properties (clientName, personalPhone, etc.)
    const normalizedClients = clients.map((client) => {
      const computedName = 
        client.clientName || 
        client.companyName || 
        client.fullName || 
        client.displayName || 
        (client.firstName ? `${client.firstName} ${client.lastName || ''}`.trim() : null) || 
        '-';
        
      const computedPhone = client.personalPhone || client.businessPhone || client.mobilePrimary || client.primaryPhone || client.mobile || '-';
      const computedStatus = client.projectStatus || client.status || 'Active';

      return {
        ...client,
        fullName: computedName,
        name: computedName,
        mobilePrimary: computedPhone,
        mobile: computedPhone,
        primaryPhone: computedPhone,
        status: computedStatus
      };
    });
    
    // Step 2: Filter based on search
    const filtered = normalizedClients.filter((client) => {
      return (
        client.fullName?.toLowerCase().includes(searchLower) ||
        client.companyName?.toLowerCase().includes(searchLower) ||
        client.mobilePrimary?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.clientId?.toLowerCase().includes(searchLower)
      );
    });

    // Step 3: Sorting based on creation date or ID
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Latest first
    });
  }, [clients, search]);

  // Dynamic Statistics Calculation for Top Cards
  const stats = useMemo(() => {
    if (!clients || clients.length === 0) {
      return { total: 0, active: 0, corporate: 0, individual: 0, newThisMonth: 0 };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let active = 0;
    let corporate = 0;
    let individual = 0;
    let newThisMonth = 0;

    clients.forEach((client) => {
      const statusValue = client.projectStatus || client.status || 'Active';
      if (statusValue.toLowerCase() === 'active' || statusValue.toLowerCase() === 'ongoing') {
        active++;
      }

      // Client Type / Company check
      const type = (client.clientType || '').toLowerCase();
      if (type.includes('corporate') || type.includes('company') || client.companyName) {
        corporate++;
      } else {
        individual++;
      }

      // Onboarding Date check (This Month)
      if (client.createdAt || client.onboardingDate) {
        const createdDate = new Date(client.createdAt || client.onboardingDate);
        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
          newThisMonth++;
        }
      }
    });

    return {
      total: clients.length,
      active,
      corporate,
      individual,
      newThisMonth
    };
  }, [clients]);

  // Pagination slicing (6 items per page)
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  // ==================== EDIT HANDLER ====================
  const handleEditClient = (client) => {
    const targetId = client._id || client.id;
    navigate(`/dashboard/client/edit/${targetId}`);
  };

  // ==================== DELETE HANDLER (API INTEGRATED) ====================
  const handleInitiateDelete = (clientOrId) => {
    setActionMessage(null);
    if (typeof clientOrId === "object" && clientOrId !== null) {
      setClientToDelete(clientOrId);
    } else {
      const target = filteredClients.find(
        (c) => c._id === clientOrId || c.id === clientOrId || c.clientId === clientOrId
      );
      setClientToDelete(target || { _id: clientOrId, fullName: "Selected Client" });
    }
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      setIsDeleting(true);
      const targetId = clientToDelete._id || clientToDelete.id;
      
      await axios.delete(`${API_BASE_URL}/clients/${targetId}`, {
        withCredentials: true,
      });
      
      setClients(prev => prev.filter(c => (c._id !== targetId && c.id !== targetId)));
      
      setIsDeleteOpen(false);
      setClientToDelete(null);
      setActionMessage({ type: "success", text: "Client record successfully deleted." });
    } catch (err) {
      console.error("Delete error:", err);
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to delete client record." });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==================== EXPORT TO EXCEL ====================
  const handleExportExcel = () => {
    if (!filteredClients || filteredClients.length === 0) return;

    const dataToExport = filteredClients.map((client) => ({
      "Company Name": client.companyName || "",
      "Client Name": client.clientName || "",
      "Personal Phone": client.personalPhone || "",
      "Business Phone": client.businessPhone || "",
      "Email Address": client.email || "",
      "Website URL": client.websiteUrl || "",
      "Industry Type": client.industryType || "",
      "Primary Service": client.primaryService || "",
      "Project Status": client.projectStatus || "",
      "Lead Source": client.leadSource || "",
      "Account Manager": client.assignedAccountManager || "",
      "Onboarding Notes": client.onboardingNotes || "",
      "Created At": client.createdAt ? client.createdAt.slice(0, 10) : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients Database");

    XLSX.writeFile(workbook, `Consolidated_Clients_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ==================== EXCEL IMPORT API INTEGRATION ====================
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setActionMessage(null);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
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

        const sanitizedClients = importedData.map((row) => ({
          companyName: row["Company Name"] || row["companyName"] || "",
          clientName: row["Client Name"] || row["clientName"] || "",
          personalPhone: row["Personal Phone"] ? row["Personal Phone"].toString() : "",
          businessPhone: row["Business Phone"] ? row["Business Phone"].toString() : "",
          email: row["Email Address"] || row["email"] || "",
          websiteUrl: row["Website URL"] || row["websiteUrl"] || "",
          industryType: row["Industry Type"] || row["industryType"] || "",
          primaryService: row["Primary Service"] || row["primaryService"] || "",
          projectStatus: row["Project Status"] || row["projectStatus"] || "Active",
          leadSource: row["Lead Source"] || row["leadSource"] || "",
          assignedAccountManager: row["Account Manager"] || row["assignedAccountManager"] || "",
          onboardingNotes: row["Onboarding Notes"] || row["onboardingNotes"] || ""
        }));

        // Loop and post to create individual clients since bulk endpoint might not be set up
        const createdClients = [];
        for (const clientData of sanitizedClients) {
          const res = await axios.post(`${API_BASE_URL}/clients`, clientData, {
            withCredentials: true,
          });
          if (res.data && res.data.data) {
            createdClients.push(res.data.data);
          }
        }

        setClients(prev => [...createdClients, ...prev]);
        
        setActionMessage({ 
          type: "success", 
          text: `Successfully imported clients from Excel!` 
        });
      } catch (err) {
        console.error("Import error:", err);
        setActionMessage({ type: "error", text: err.response?.data?.message || "An error occurred while uploading the Excel file." });
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

  // ==================== UI-MATCHED SKELETON LOADER ====================
  if (isLoading) {
    return (
      <DashboardLayout title="Clients">
        <div className="flex flex-col gap-6 w-full animate-pulse">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-36 bg-slate-100 rounded-md"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="h-10 w-full sm:w-64 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border p-5 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-9 w-9 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded"></div>
                <div className="h-3 w-32 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Clients">
        <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
          <AlertCircle className="h-8 w-8 mb-4 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
          <Button onClick={fetchClients} className="mt-4" variant="outline">
            Try Refreshing Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clients">
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Client Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Showing <span className="font-semibold text-foreground">{paginatedClients.length}</span> of <span className="font-semibold text-foreground">{filteredClients.length}</span> filtered clients ({clients?.length || 0} total)
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
              disabled={filteredClients.length === 0 || isImporting}
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all hover:bg-accent rounded-lg"
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>

            <Button 
              onClick={() => navigate("/dashboard/client")}
              disabled={isImporting}
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all hover:shadow-md rounded-lg"
            >
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>
        </div>

        {/* TOP STATS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                All onboarded clients
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <UserCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.active / (stats.total || 1)) * 100).toFixed(0)}% of total clients active
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Corporate / Indv.</CardTitle>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Building2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.corporate} <span className="text-sm font-normal text-muted-foreground">/ {stats.individual}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Companies vs Individual clients
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
                Added in current month
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

        {/* Clients Table Card */}
        <Card className="border shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {filteredClients.length > 0 ? (
              <ClientTable 
                clients={paginatedClients} 
                navigate={navigate}
                onEdit={handleEditClient}
                onDelete={handleInitiateDelete}
              />
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Users className="h-12 w-12 mb-4 text-muted" strokeWidth={1} />
                <p className="text-lg font-medium text-foreground">No clients found</p>
                <p className="text-sm mt-1">Try adjusting your search query or add a new client.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CENTERED ROUNDED PAGINATION CONTROLS */}
        {filteredClients.length > 0 && totalPages > 1 && (
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
      {isDeleteOpen && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Delete Client Record?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-foreground">{clientToDelete.clientName || clientToDelete.companyName || "this client"}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <p className="text-xs font-bold text-slate-800 truncate">
                {clientToDelete.clientName || clientToDelete.companyName || "Selected Client"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ID: <span className="font-mono text-slate-700">{clientToDelete._id || "N/A"}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setClientToDelete(null);
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

export default Clients;