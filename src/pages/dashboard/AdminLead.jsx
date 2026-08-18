"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiEye,
  FiX,
  FiEdit2,
  FiAlertCircle,
} from "react-icons/fi";

/* ---------------- Precision Date Formatter (IST Friendly) ---------------- */
const formatLeadDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  
  const dayStr = date.toLocaleDateString('en-GB', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric'
  });
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="flex flex-col">
      <span className="text-gray-900 font-semibold text-sm">{dayStr}</span>
      <span className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">{timeStr}</span>
    </div>
  );
};

/* ---------------- Helper Components for Sidebar ---------------- */
const Section = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{title}</h4>
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
    <span className="text-xs text-gray-500 font-medium shrink-0">{label}</span>
    <span className="text-sm text-gray-900 font-bold text-right">{value || "—"}</span>
  </div>
);

/* ---------------- Readable Skeleton Loader ---------------- */
const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b">
        <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 rounded" /></td>
        <td className="px-6 py-4"><div className="h-5 w-40 bg-gray-100 rounded" /></td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-100 rounded" /></td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-100 rounded" /></td>
        <td className="px-6 py-4 text-center"><div className="h-6 w-16 bg-blue-50 rounded mx-auto" /></td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-100 rounded" /></td>
        <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 rounded-lg ml-auto" /></td>
      </tr>
    ))}
  </>
);

/* ---------------- Main Page ---------------- */
export const AdminLead = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState({ open: false, id: "", name: "" });
  const [deleting, setDeleting] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Global inline feedback notification state
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const API_BASE_URL = "https://vidya-udbhav-backend.vercel.app/api/leads";

  const triggerFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: "", message: "" });
    }, 4000);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`);
      
      if (!res.ok) throw new Error("Failed to fetch leads from server");

      const result = await res.json();
      const fetchedLeads = result.data?.leads || result.leads || [];
      const fetchedTotal = result.data?.total ?? result.total ?? 0;

      setLeads(fetchedLeads);
      setTotal(fetchedTotal);
    } catch (err) {
      console.error(err.message || "Failed to load leads");
      triggerFeedback("error", err.message || "Failed to load leads from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page]);

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const keyword = search.toLowerCase();
    return leads.filter(
      (l) =>
        (l.fullName || "").toLowerCase().includes(keyword) ||
        (l.email || "").toLowerCase().includes(keyword) ||
        (l.mobileNumber || "").includes(keyword) ||
        (l.course || "").toLowerCase().includes(keyword) ||
        (l.interestedCourse || "").toLowerCase().includes(keyword)
    );
  }, [search, leads]);

  const totalPages = Math.ceil(total / limit);

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE_URL}/${deleteModal.id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete lead");

      setLeads((prev) => prev.filter((l) => l._id !== deleteModal.id));
      setDeleteModal({ open: false, id: "", name: "" });
      triggerFeedback("success", "Lead successfully removed from system records.");
    } catch (err) {
      console.error(err.message || "Delete failed");
      triggerFeedback("error", err.message || "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] space-y-6">
        {/* Inline Warning / Success Text Feedback Bar */}
        {feedback.message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold transition-all ${
            feedback.type === "error" 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
            <FiAlertCircle size={18} className="shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <FiChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <FiCalendar /> Sync Local: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><FiUsers size={22}/></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Active Leads</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{total}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3.5 bg-green-50 text-green-600 rounded-xl"><FiFilter size={22}/></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Filtered Results</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{filteredLeads.length}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl text-gray-900 flex items-center gap-4 shadow-md">
             <div className="p-3.5 bg-white/10 rounded-xl"><FiCalendar size={22}/></div>
             <div>
               <p className="text-xs text-indigo-100 font-semibold uppercase tracking-wider">Current Page</p>
               <h3 className="text-2xl font-black mt-0.5">{page} / {totalPages || 1}</h3>
             </div>
          </div>
        </div>

        {/* Header & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Leads Engine</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage real-time student inquiries instantly</p>
          </div>
          <div className="relative w-full md:w-96 group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, course..."
              className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none text-sm transition-all shadow-inner"
            />
          </div>
        </div>

        {/* High-Readability Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Course</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Gender</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Registration (IST)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <TableSkeleton />
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FiSearch size={32} />
                        <p className="font-semibold text-base text-gray-500">No matching leads found</p>
                        <button onClick={() => setSearch("")} className="text-blue-600 text-sm font-bold hover:underline">Reset Search</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-3.5 align-middle">
                        <span className="font-bold text-gray-900 text-sm block">{lead.fullName}</span>
                      </td>
                      <td className="px-6 py-3.5 align-middle">
                        <div className="flex flex-col max-w-[220px]">
                          <span className="text-gray-800 font-semibold text-sm truncate">{lead.email}</span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{lead.mobileNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 align-middle">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 block w-max truncate max-w-[180px]">
                          {lead.interestedCourse || lead.course || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 align-middle">
                        <div className="text-gray-700 max-w-[160px]">
                          <span className="font-semibold text-sm">{lead.city}</span>
                          <span className="text-xs text-gray-400 block mt-0.5">{lead.state}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 align-middle text-center">
                        <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                          lead.gender === 'Male' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {lead.gender || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 align-middle">
                        {formatLeadDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            title="View Details"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/leads/${lead._id}/add-note`, { state: { lead } })}
                            title="Edit / Add Note"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: lead._id, name: lead.fullName })}
                            title="Delete Lead"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900 font-bold">{filteredLeads.length}</span> of <span className="text-gray-900 font-bold">{total}</span> global leads
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <FiChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                 {[...Array(totalPages)].map((_, i) => (
                   <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === i + 1 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                   >
                    {i + 1}
                   </button>
                 ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Lead Detail Drawer */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setSelectedLead(null)} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-250">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    {selectedLead.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{selectedLead.fullName}</h2>
                    <p className="text-xs font-mono text-gray-400">{selectedLead._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5 text-sm">
                <Section title="Personal Info">
                  <Field label="Full Name" value={selectedLead.fullName} />
                  {selectedLead.fatherName && <Field label="Father's Name" value={selectedLead.fatherName} />}
                  <Field label="Gender" value={selectedLead.gender} />
                  {selectedLead.dateOfBirth && (
                    <Field label="D.O.B" value={new Date(selectedLead.dateOfBirth).toLocaleDateString('en-GB')} />
                  )}
                  {selectedLead.preferredLanguage && <Field label="Language" value={selectedLead.preferredLanguage} />}
                </Section>

                <Section title="Contact Details">
                  <Field label="Email ID" value={selectedLead.email} />
                  <Field label="Mobile No" value={selectedLead.mobileNumber} />
                  <Field label="Address" value={selectedLead.address} />
                  <Field label="City" value={selectedLead.city} />
                  <Field label="State" value={selectedLead.state} />
                </Section>

                <Section title="Academic History">
                  <Field label="Target Course" value={selectedLead.interestedCourse || selectedLead.course} />
                  {selectedLead.qualification && <Field label="Highest Qual" value={selectedLead.qualification} />}
                  {selectedLead.stream && <Field label="Stream" value={selectedLead.stream} />}
                  {selectedLead.twelfthPercentage !== undefined && (
                    <Field label="12th Score" value={`${selectedLead.twelfthPercentage}%`} />
                  )}
                </Section>

                {selectedLead.message && (
                  <Section title="Student Message">
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3.5 leading-relaxed font-medium">{selectedLead.message}</p>
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deletion Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setDeleteModal({ open: false, id: "", name: "" })} />
            <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 z-10">
              <h3 className="text-base font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Are you sure you want to completely clear <span className="font-bold text-gray-900">"{deleteModal.name}"</span> from the system records? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteModal({ open: false, id: "", name: "" })}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel/Close
                </button>
                <button
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-100 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminLead;