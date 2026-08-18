import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, RefreshCw, Plus, Users, UserCheck, X,
  Briefcase, Search, Phone, Mail, Building2, Pencil, Trash2, Eye,
  ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";

const emptyReferrer = {
  name: "",
  type: "External",
  company: "",
  phone: "",
  email: "",
  clientName: "",
  caseName: "",
  royaltyType: "None",
  notes: ""
};

// Dummy skeleton rows for initial and refreshing loading states
const skeletonRows = Array(5)
  .fill(null)
  .map((_, i) => ({ _id: `skeleton-${i}`, isLoading: true }));

const getResponseData = (response) => response.data?.data ?? response.data;

const Referrers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Delete Confirmation Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error & Inline Warning states
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [listError, setListError] = useState("");

  // Form state
  const [newReferrer, setNewReferrer] = useState(emptyReferrer);

  // Main list state
  const [referrersData, setReferrersData] = useState([]);

  const loadReferrers = async () => {
    setListError("");
    try {
      setLoading(true);
      const response = await api.get("/referrers");
      const data = getResponseData(response);
      setReferrersData(Array.isArray(data) ? data : data?.referrers || []);
    } catch (error) {
      console.error("Unable to load referrers:", error);
      setListError(error.response?.data?.message || "Unable to load referrers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrers();
  }, []);

  // Search filtering
  const filteredReferrers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return referrersData;
    return referrersData.filter((item) =>
      [item.name, item.email, item.phone, item.clientName, item.caseName].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [referrersData, searchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Use skeleton rows when loading, otherwise use filtered results
  const displayedReferrers = loading ? skeletonRows : filteredReferrers;

  // Pagination calculations
  const totalPages = Math.ceil(displayedReferrers.length / itemsPerPage) || 1;

  const paginatedReferrers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedReferrers.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedReferrers, currentPage, itemsPerPage]);

  // Field validation function for inline warnings
  const validateField = (field, value) => {
    let error = "";
    if (field === "name" && !value.trim()) {
      error = "Name field is required.";
    }
    if (field === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        error = "Please enter a valid email address.";
      }
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setNewReferrer((prev) => ({ ...prev, [field]: value }));
    const errorMsg = validateField(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode("create");
    setSelectedId(null);
    setNewReferrer(emptyReferrer);
    setFormErrors({});
    setServerError("");
  };

  const openCreateModal = () => {
    setNewReferrer(emptyReferrer);
    setSelectedId(null);
    setModalMode("create");
    setFormErrors({});
    setServerError("");
    setIsModalOpen(true);
  };

  const openReferrer = async (item, mode) => {
    const id = item._id || item.id;
    setServerError("");
    setFormErrors({});
    try {
      const response = await api.get(`/referrers/${id}`);
      const referrer = getResponseData(response);
      setNewReferrer({ ...emptyReferrer, ...referrer });
      setSelectedId(referrer._id || referrer.id || id);
      setModalMode(mode);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Unable to load referrer:", error);
      setListError(error.response?.data?.message || "Unable to load referrer details.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Perform validation on submit
    const nameError = validateField("name", newReferrer.name);
    const emailError = validateField("email", newReferrer.email);

    if (nameError || emailError) {
      setFormErrors({
        name: nameError,
        email: emailError
      });
      return;
    }

    try {
      setIsSaving(true);
      setServerError("");
      const payload = {
        name: newReferrer.name,
        type: newReferrer.type,
        company: newReferrer.company,
        phone: newReferrer.phone,
        email: newReferrer.email,
        clientName: newReferrer.clientName,
        caseName: newReferrer.caseName,
        royaltyType: newReferrer.royaltyType,
        notes: newReferrer.notes
      };

      if (modalMode === "edit") {
        await api.put(`/referrers/${selectedId}`, payload);
      } else {
        await api.post("/referrers", payload);
      }
      await loadReferrers();
      closeModal();
    } catch (error) {
      console.error("Unable to save referrer:", error);
      setServerError(error.response?.data?.message || "Unable to save referrer.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Delete Confirmation Popup
  const promptDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete._id || itemToDelete.id;

    try {
      setIsDeleting(true);
      await api.delete(`/referrers/${id}`);
      setReferrersData((current) => current.filter((referrer) => (referrer._id || referrer.id) !== id));
      closeDeleteModal();
    } catch (error) {
      console.error("Unable to delete referrer:", error);
      setListError(error.response?.data?.message || "Unable to delete referrer.");
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl bg-[#f8fafc] font-sans antialiased relative">

        {/* List level error banner */}
        {listError && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-600 flex items-center justify-between">
            <span>{listError}</span>
            <button type="button" onClick={() => setListError("")} className="p-1 text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button type="button" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-slate-700" />
                <h1 className="text-xl font-bold text-slate-800">Referrers</h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Manage your client referral sources</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button onClick={loadReferrers} variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-600 hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={openCreateModal}
              className="h-10 bg-gold hover:bg-amber-600 text-slate-950 font-bold px-4 shadow-xs flex items-center gap-2 rounded-lg transition-colors border border-amber-400/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Referrer
            </Button>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Referrers</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{referrersData.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Referred Clients</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">
                {referrersData.filter(item => item.clientName && item.clientName.trim() !== "").length}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Cases</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">
                {referrersData.filter(item => item.caseName && item.caseName.trim() !== "").length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter / Search Area */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search referrers by name, email, phone, client, or case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-200/80 focus-visible:ring-amber-500/30 text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>
        </div>

        {/* Data List Table Box */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">Referrer</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[13%]">Type</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">Contact</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Client</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Case</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-[10%]">Royalty</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-slate-700">
                {paginatedReferrers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No referrers found.
                    </td>
                  </tr>
                ) : (
                  paginatedReferrers.map((item) => {
                    // SKELETON ROW RENDER STATE
                    if (item.isLoading) {
                      return (
                        <tr key={item._id} className="animate-pulse">
                          <td className="py-4 px-5">
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-slate-200 rounded"></div>
                              <div className="h-3 w-20 bg-slate-100 rounded"></div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
                              <div className="h-3 w-32 bg-slate-100 rounded"></div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-12 bg-slate-200 rounded mx-auto"></div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // NORMAL REFERRER ROW
                    return (
                      <tr key={item._id || item.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{item.name}</span>
                            <div className="flex items-center gap-1 text-slate-400 mt-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-xs font-medium">{item.company || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Mail className="w-3.5 h-3.5 text-slate-300" />
                              <span className="truncate max-w-[180px]">{item.email || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700 truncate max-w-[140px]">
                          {item.clientName || "-"}
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700 truncate max-w-[140px]">
                          {item.caseName || "-"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                            {item.royaltyType || "None"}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-3">
                            <button type="button" onClick={() => openReferrer(item, "view")} aria-label={`View ${item.name}`} className="p-1 text-slate-500 hover:bg-slate-50 rounded-md transition-colors"><Eye className="w-4 h-4" /></button>
                            <button type="button" onClick={() => openReferrer(item, "edit")} aria-label={`Edit ${item.name}`} className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button type="button" onClick={() => promptDelete(item)} aria-label={`Delete ${item.name}`} className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-50/30">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-700">{filteredReferrers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredReferrers.length)}</span> of{" "}
              <span className="font-semibold text-slate-700">{filteredReferrers.length}</span> entries
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 w-8 p-0 border-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`h-8 w-8 text-xs font-semibold rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="h-8 w-8 p-0 border-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ADD / EDIT / VIEW REFERRER MODAL OVERLAY */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">
                  {modalMode === "create" ? "Add New Referrer" : modalMode === "edit" ? "Edit Referrer" : "View Referrer"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form fields */}
              <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
                {serverError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-medium text-rose-600">
                    {serverError}
                  </div>
                )}

                <fieldset disabled={modalMode === "view"} className="space-y-4">

                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Name *</Label>
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={newReferrer.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`h-10 border-slate-200 text-sm focus-visible:ring-amber-500/30 ${
                        formErrors.name ? "border-rose-500 focus-visible:ring-rose-500/30" : ""
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Type & Company/Firm Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Type *</Label>
                      <Select value={newReferrer.type} onValueChange={(v) => handleInputChange("type", v)}>
                        <SelectTrigger className="h-10 border-slate-200 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="External">External</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Company/Firm</Label>
                      <Input
                        type="text"
                        placeholder="Company or firm name"
                        value={newReferrer.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="h-10 border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                      <Input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={newReferrer.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="h-10 border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Email</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newReferrer.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`h-10 border-slate-200 text-sm ${
                          formErrors.email ? "border-rose-500 focus-visible:ring-rose-500/30" : ""
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Client & Case Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Client</Label>
                      <Input
                        type="text"
                        placeholder="Client name"
                        value={newReferrer.clientName}
                        onChange={(e) => handleInputChange("clientName", e.target.value)}
                        className="h-10 border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Case</Label>
                      <Input
                        type="text"
                        placeholder="Case title"
                        value={newReferrer.caseName}
                        onChange={(e) => handleInputChange("caseName", e.target.value)}
                        className="h-10 border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Royalty Sub-Section */}
                  <div className="pt-2 border-t border-slate-50 space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Royalty Settings</p>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Royalty Type</Label>
                      <Select value={newReferrer.royaltyType} onValueChange={(v) => handleInputChange("royaltyType", v)}>
                        <SelectTrigger className="h-10 border-slate-200 text-sm w-full sm:max-w-[240px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Percentage">Percentage (%)</SelectItem>
                          <SelectItem value="Fixed">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Additional notes about this referrer..."
                      value={newReferrer.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="border-slate-200 text-sm resize-none focus-visible:ring-amber-500/30"
                    />
                  </div>

                </fieldset>

                {/* Form Action Controls inside popup footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="h-10 text-slate-500 px-4 border-slate-200 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  {modalMode !== "view" && (
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 text-xs shadow-xs rounded-lg"
                    >
                      {isSaving ? "Saving..." : "Save Referrer Record"}
                    </Button>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION POPUP MODAL */}
        {isDeleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-rose-50 text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Delete Referrer</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-slate-700">{itemToDelete.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="h-9 text-slate-600 px-4 border-slate-200 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 text-xs shadow-xs rounded-lg"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Referrers;