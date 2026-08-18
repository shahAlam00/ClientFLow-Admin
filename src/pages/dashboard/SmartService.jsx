"use client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiMessageSquare,
  FiPhoneCall,
  FiPlus,
  FiUser,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiEye,
  FiBookOpen
} from "react-icons/fi";

export function SmartService({ initialNotes = [] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(true);

  // Target Student Details State
  const [targetStudent, setTargetStudent] = useState(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    communicationType: "Outgoing Call",
    leadStatus: "Hot",
    interestedCourse: "",
    discussionSummary: "",
    followUpDate: "",
    consultantName: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit State
  const [editNote, setEditNote] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // View Details Drawer State (Right Side Panel)
  const [viewNote, setViewNote] = useState(null);

  const navigate = useNavigate();
  const { leadId } = useParams();

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Axios instance with default authorization header helper
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Student details fetch karne ke liye function using Axios
  const fetchStudentDetails = async () => {
    if (!leadId) return;
    try {
      const response = await axios.get(`${BASE_URL}/leads/${leadId}`, getAuthConfig());
      const data = response.data;
      if (data.success || data.data) {
        setTargetStudent(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch student details", err);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const url = leadId
        ? `${BASE_URL}/leads-notes?studentId=${leadId}`
        : `${BASE_URL}/leads-notes`;
      const response = await axios.get(url, getAuthConfig());
      const data = response.data;
      if (data.success) setNotes(data.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    if (leadId) {
      fetchStudentDetails();
    } else {
      setTargetStudent(null);
    }
  }, [leadId]);

  const handleCreateSubmit = async () => {
    if (!addForm.discussionSummary) {

      return;
    }
    try {
      setCreating(true);
      // 👇 Target student se name aur phone number nikal kar payload mein add kar rahe hain
      const payload = {
        ...addForm,
        selectedStudentId: leadId || addForm.selectedStudentId,
        leadId: leadId || addForm.selectedStudentId,
        studentId: leadId || addForm.selectedStudentId,
        studentName: targetStudent?.fullName || targetStudent?.name || "",
        fullName: targetStudent?.fullName || targetStudent?.name || "",
        studentPhone: targetStudent?.mobileNumber || targetStudent?.phone || targetStudent?.phoneNo || "",
      };

      const response = await axios.post(`${BASE_URL}/leads-notes`, payload, getAuthConfig());
      const data = response.data;
      if (data.success || response.status === 201) {
        const createdNote = data.data || data;
        setNotes((prev) => [createdNote, ...prev]);
        setIsAddModalOpen(false);
        setAddForm({
          communicationType: "Outgoing Call",
          leadStatus: "Hot",
          interestedCourse: "",
          discussionSummary: "",
          followUpDate: "",
          consultantName: "",
        });
        fetchNotes();
      }
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const response = await axios.delete(`${BASE_URL}/leads-notes/${id}`, getAuthConfig());
      const data = response.data;
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        if (viewNote?._id === id) setViewNote(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const openEdit = (note, e) => {
    e?.stopPropagation();
    setEditNote(note._id);
    setEditForm({
      communicationType: note.communicationType,
      leadStatus: note.leadStatus || note.status || "Warm",
      interestedCourse: note.interestedCourse || "",
      discussionSummary: note.discussionSummary,
      followUpDate: note.followUpDate ? note.followUpDate.slice(0, 10) : "",
      consultantName: note.consultantName,
      selectedStudentId: note.selectedStudentId?._id || note.selectedStudentId || "",
    });
  };

  const handleEditSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(`${BASE_URL}/leads-notes/${editNote}`, editForm, getAuthConfig());
      const data = response.data;
      if (data.success) {
        setNotes((prev) => prev.map((n) => (n._id === editNote ? data.data : n)));
        if (viewNote?._id === editNote) setViewNote(data.data);
        setEditNote(null);
        fetchNotes();
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  // Quick Stats Calculation
  const totalNotes = notes.length;
  const hotLeadsCount = notes.filter(n => (n.leadStatus || n.status || "").toLowerCase() === "hot").length;
  const followUpsCount = notes.filter(n => n.followUpDate).length;
  const confirmedCount = notes.filter(n => (n.leadStatus || n.status || "").toLowerCase() === "admission done").length;
  const [deleteConfirmNote, setDeleteConfirmNote] = useState(null);
  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "Warm").toLowerCase();
    switch (normalizedStatus) {
      case "hot":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "admission done":
      case "admission confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "documents pending":
      case "pending documentation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "lost":
      case "dropped / not interested":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const normalizeDocuments = (documents) => {
    if (!documents) return [];
    if (documents instanceof Map) return Array.from(documents.entries());
    if (typeof documents === "object") return Object.entries(documents);
    return [];
  };

  const getValueText = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
    return String(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Top Header & Add Button Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/80 p-5 rounded-3xl border border-slate-200/60 shadow-sm">
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FiMessageSquare className="text-blue-600" size={18} />
              Communication Timeline & Notes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Track every student conversation, status change and follow-up securely</p>
          </div>

          {/* Target Student Highlight Banner Section */}
          {targetStudent && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <FiUser size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Student</p>
                <p className="text-sm font-black text-slate-800">
                  {targetStudent.fullName || targetStudent.name}
                  <span className="text-blue-600 font-bold ml-2">({targetStudent.mobileNumber || targetStudent.phone || targetStudent.phoneNo})</span>
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
          >
            <FiPlus size={16} /> Add New Note
          </button>
        </div>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Notes</p>
              <h3 className="text-xl font-black text-slate-800 mt-1">{totalNotes}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FiFileText size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hot Leads</p>
              <h3 className="text-xl font-black text-rose-600 mt-1">{hotLeadsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FiTrendingUp size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-ups Set</p>
              <h3 className="text-xl font-black text-amber-600 mt-1">{followUpsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiClock size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Deals</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">{confirmedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiCheckCircle size={20} />
            </div>
          </div>
        </div>

        {/* Timeline Stream Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Recent Conversation History</h2>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <FiFileText className="mx-auto text-slate-300 mb-2" size={36} />
              <p className="text-sm font-semibold text-slate-600">No conversation notes recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add New Note" above to start logging student interactions</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-100 ml-3 space-y-6 pl-5 pt-2">
              {notes.map((note, index) => {
                const studentName = note.fullName || note.selectedStudentId?.fullName || targetStudent?.fullName || note.studentName || "Unknown Student"
                return (
                  <div key={note._id || index} className="relative group">
                    <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />

                    <div
                      onClick={() => setViewNote(note)}
                      className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-blue-400 transition-all cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <FiUser size={12} />
                            {studentName}
                          </span>

                          <span className="px-2.5 py-1 bg-white text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-xs">
                            <FiPhoneCall size={12} className="text-blue-600" />
                            {note.communicationType}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(note.leadStatus || note.status)}`}>
                            {note.leadStatus || note.status || "Warm"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs font-medium text-slate-400">
                            {new Date(note.createdAt || Date.now()).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          <button
                            onClick={() => setViewNote(note)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <FiEye size={13} />
                          </button>
                          <button
                            onClick={(e) => openEdit(note, e)}
                            title="Edit Note"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmNote(note);
                            }}
                            title="Delete Note"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed font-medium line-clamp-2">
                        {note.discussionSummary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/40 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <FiUser size={13} className="text-slate-400" />
                          <span>Consultant: <strong className="text-slate-700">{note.consultantName}</strong></span>
                        </div>
                        {note.followUpDate && (
                          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            <FiCalendar size={13} />
                            <span>Follow-up: <strong>{new Date(note.followUpDate).toLocaleDateString('en-GB')}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add New Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Add Communication Note</h2>
                {targetStudent && (
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    Target: {targetStudent.fullName} ({targetStudent.mobileNumber})
                  </p>
                )}
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <FiX size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Communication Type</label>
                <select
                  value={addForm.communicationType}
                  onChange={(e) => setAddForm(p => ({ ...p, communicationType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option>Outgoing Call</option>
                  <option>Incoming Call</option>
                  <option>WhatsApp Chat</option>
                  <option>Email</option>
                  <option>Direct Office Visit</option>
                  <option>Video Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={addForm.leadStatus}
                  onChange={(e) => setAddForm(p => ({ ...p, leadStatus: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Admission Done">Admission Done</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={addForm.followUpDate}
                  onChange={(e) => setAddForm(p => ({ ...p, followUpDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Consultant Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={addForm.consultantName}
                  onChange={(e) => setAddForm(p => ({ ...p, consultantName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Interested Course</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={addForm.interestedCourse}
                onChange={(e) => setAddForm(p => ({ ...p, interestedCourse: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Discussion Summary</label>
              <textarea
                rows={4}
                placeholder="Write discussion details..."
                value={addForm.discussionSummary}
                onChange={(e) => setAddForm(p => ({ ...p, discussionSummary: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <FiSave size={14} />
                {creating ? "Creating..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Slide-Over View Panel Drawer */}
      {viewNote && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FiBookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Note Details</h2>
                  <p className="text-xs text-blue-600 font-bold">{viewNote.selectedStudentId?.fullName || targetStudent?.fullName || "Student Lead"}</p>
                </div>
              </div>
              <button
                onClick={() => setViewNote(null)}
                className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-500 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-2">
                  <FiPhoneCall size={14} className="text-blue-600" />
                  {viewNote.communicationType}
                </span>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusBadge(viewNote.leadStatus || viewNote.status)}`}>
                  {viewNote.leadStatus || viewNote.status || "Warm"}
                </span>
              </div>

              {(viewNote.selectedStudentId || targetStudent) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Information</p>
                  <p className="text-sm font-black text-slate-800">{viewNote.selectedStudentId?.fullName || targetStudent?.fullName || viewNote.fullName || "Student Lead"}</p>
                  <p className="text-xs text-slate-500">{viewNote.selectedStudentId?.email || targetStudent?.email || ""} | {viewNote.selectedStudentId?.mobileNumber || targetStudent?.mobileNumber || viewNote.studentPhone || ""}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discussion Summary</p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {viewNote.discussionSummary || "No summary added."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Call Outcome</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{getValueText(viewNote.callOutcome)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Priority</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{getValueText(viewNote.priority)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Lead Score</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{getValueText(viewNote.leadScore, "0")}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Follow-up</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">
                    {viewNote.followUpDate ? new Date(viewNote.followUpDate).toLocaleDateString('en-GB') : "Not Set"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-up Details</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Time</span><strong>{getValueText(viewNote.followUpTime)}</strong></div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Type</span><strong>{getValueText(viewNote.followUpType)}</strong></div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Reminder</span><strong>{getValueText(viewNote.reminderBefore)}</strong></div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Consultant</span><strong>{getValueText(viewNote.consultantName)}</strong></div>
                </div>
              </div>

              {(viewNote.interestedCourse || viewNote.preferredCollege || viewNote.preferredCity || viewNote.budget || viewNote.hostelRequired || viewNote.scholarshipNeeded) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Interest</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">Course</span><strong>{getValueText(viewNote.interestedCourse)}</strong></div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">Preferred College</span><strong>{getValueText(viewNote.preferredCollege)}</strong></div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">City</span><strong>{getValueText(viewNote.preferredCity)}</strong></div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">Budget</span><strong>{getValueText(viewNote.budget)}</strong></div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">Hostel</span><strong>{getValueText(viewNote.hostelRequired)}</strong></div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100"><span className="block text-[10px] uppercase text-blue-400">Scholarship Needed</span><strong>{getValueText(viewNote.scholarshipNeeded)}</strong></div>
                  </div>
                </div>
              )}

              {(viewNote.parentName || viewNote.parentPhone || viewNote.parentDiscussion || viewNote.parentInterested || viewNote.decisionMaker) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Details</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Parent</span><strong>{getValueText(viewNote.parentName)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Phone</span><strong>{getValueText(viewNote.parentPhone)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2"><span className="block text-[10px] uppercase text-slate-400">Parent Discussion</span><strong>{getValueText(viewNote.parentDiscussion)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Interested</span><strong>{getValueText(viewNote.parentInterested)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Decision Maker</span><strong>{getValueText(viewNote.decisionMaker)}</strong></div>
                  </div>
                </div>
              )}

              {normalizeDocuments(viewNote.documents).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Checklist</p>
                  <div className="space-y-2">
                    {normalizeDocuments(viewNote.documents).map(([doc, status], idx) => (
                      <div key={`${doc}-${idx}`} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700">{doc}</span>
                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(viewNote.registrationFee !== undefined || viewNote.counsellingFee !== undefined || viewNote.advance !== undefined || viewNote.pendingAmount !== undefined) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Details</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Registration</span><strong>{getValueText(viewNote.registrationFee, "0")}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Counselling</span><strong>{getValueText(viewNote.counsellingFee, "0")}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Advance</span><strong>{getValueText(viewNote.advance, "0")}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Pending</span><strong>{getValueText(viewNote.pendingAmount, "0")}</strong></div>
                  </div>
                </div>
              )}

              {(viewNote.source || viewNote.department || viewNote.campaign || viewNote.attachmentType || viewNote.aiNotesPrompt || viewNote.conversationMood || viewNote.admissionProbability || viewNote.leadTemperature || viewNote.nextRecommendedAction) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Info & AI Summary</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Department</span><strong>{getValueText(viewNote.department)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Source</span><strong>{getValueText(viewNote.source)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2"><span className="block text-[10px] uppercase text-slate-400">Campaign</span><strong>{getValueText(viewNote.campaign)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2"><span className="block text-[10px] uppercase text-slate-400">Attachment Type</span><strong>{getValueText(viewNote.attachmentType)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2"><span className="block text-[10px] uppercase text-slate-400">AI Prompt</span><strong>{getValueText(viewNote.aiNotesPrompt)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Mood</span><strong>{getValueText(viewNote.conversationMood)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Admission Probability</span><strong>{getValueText(viewNote.admissionProbability)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Temperature</span><strong>{getValueText(viewNote.leadTemperature)}</strong></div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase text-slate-400">Recommended Action</span><strong>{getValueText(viewNote.nextRecommendedAction)}</strong></div>
                  </div>
                </div>
              )}

              {Array.isArray(viewNote.quickTags) && viewNote.quickTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {viewNote.quickTags.map((tag, idx) => (
                      <span key={`${tag}-${idx}`} className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged Timestamp</p>
                <p className="text-xs font-medium text-slate-600">
                  {new Date(viewNote.createdAt || Date.now()).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={(e) => {
                  const currentNote = viewNote;
                  setViewNote(null);
                  openEdit(currentNote, e);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <FiEdit2 size={14} /> Edit This Note
              </button>
              <button
                onClick={() => {
                  const currentNote = viewNote;
                  setViewNote(null);
                  setDeleteConfirmNote(currentNote);
                }}
                className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors border border-rose-200"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup Modal */}
      {editNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Edit Note</h2>
                {targetStudent && (
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    Target: {targetStudent.fullName} ({targetStudent.mobileNumber})
                  </p>
                )}
              </div>
              <button onClick={() => setEditNote(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <FiX size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Communication Type</label>
                <select
                  value={editForm.communicationType}
                  onChange={(e) => setEditForm(p => ({ ...p, communicationType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option>Outgoing Call</option>
                  <option>Incoming Call</option>
                  <option>WhatsApp Chat</option>
                  <option>Email</option>
                  <option>Direct Office Visit</option>
                  <option>Video Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={editForm.leadStatus}
                  onChange={(e) => setEditForm(p => ({ ...p, leadStatus: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Admission Done">Admission Done</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={editForm.followUpDate}
                  onChange={(e) => setEditForm(p => ({ ...p, followUpDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Consultant Name</label>
                <input
                  type="text"
                  value={editForm.consultantName}
                  onChange={(e) => setEditForm(p => ({ ...p, consultantName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Discussion Summary</label>
              <textarea
                rows={4}
                value={editForm.discussionSummary}
                onChange={(e) => setEditForm(p => ({ ...p, discussionSummary: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditNote(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <FiSave size={14} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-rose-100">
              <FiTrash2 size={26} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">Delete Note?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this communication note? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteConfirmNote._id);
                  setDeleteConfirmNote(null);
                }}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default SmartService;