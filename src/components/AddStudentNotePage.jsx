"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FiChevronLeft, FiSave, FiChevronDown, FiChevronUp, FiStar as FiSparkles, FiCheckCircle } from "react-icons/fi";
import API from "@/lib/axios";

export function AddStudentNotePage({ studentsList = [] }) {
  const { leadId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedLead = location.state?.lead;
  const resolvedStudentId = leadId || id || passedLead?._id || passedLead?.id || "";

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentStudent, setCurrentStudent] = useState(passedLead || null);
  const [allStudents, setAllStudents] = useState(studentsList);

  // Accordion State Manager
  const [sections, setSections] = useState({
    communication: true,
    leadStatus: true,
    followUp: true,
    studentInterest: true,
    parentDetails: true,
    documents: true,
    payment: true,
    aiSection: true,
    internalSection: true,
    attachment: true,
    extraFeatures: true,
  });

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [formData, setFormData] = useState({
    selectedStudentId: resolvedStudentId,
    studentName: passedLead?.fullName || passedLead?.name || "",
    studentPhone: passedLead?.mobileNumber || passedLead?.phone || "",

    // 1️⃣ Communication Information
    communicationType: "Outgoing Call",
    callOutcome: "Connected",
    discussionSummary: "",
    quickTags: [],

    // 2️⃣ Lead Status
    leadStatus: "Warm",
    priority: "Medium",
    leadScore: 92,

    // 3️⃣ Follow-up Section
    followUpDate: "",
    followUpTime: "11:00 AM",
    followUpType: "Call",
    reminderBefore: "15 Minutes",

    // 4️⃣ Student Interest
    interestedCourse: passedLead?.interestedCourse || passedLead?.course || "BCA",
    preferredCollege: "",
    preferredCity: "Noida",
    budget: "2 Lakh",
    hostelRequired: "No",
    scholarshipNeeded: "No",

    // 5️⃣ Parent Details
    parentName: "",
    parentPhone: "",
    parentDiscussion: "",
    parentInterested: "No",
    decisionMaker: "Student",

    // 6️⃣ Documents Checklist
    documents: {
      "10th": "Pending",
      "12th": "Pending",
      Aadhar: "Pending",
      PAN: "Pending",
      Photo: "Pending",
      Income: "Pending",
      Category: "Pending",
      Migration: "Pending",
    },

    // 7️⃣ Payment Information
    registrationFee: "",
    counsellingFee: "",
    advance: "",
    pendingAmount: "",

    // 8️⃣ AI Section & Smart Actions
    aiNotesPrompt: "",
    conversationMood: "😊 Happy",
    admissionProbability: "95%",
    leadTemperature: "🔥 Hot",
    nextRecommendedAction: "Call Tomorrow",

    // 9️⃣ Internal Section
    consultantName: "Admin / Counselor",
    department: "Sales",
    source: "Website",
    campaign: "July Campaign",

    // 🔟 Attachment & Timeline
    attachmentType: "Screenshot",
    attachmentFile: null,
  });

  // Fetch student details if ID is present
  useEffect(() => {
    const targetId = resolvedStudentId || formData.selectedStudentId;
    if (targetId && !currentStudent) {
      API.get(`/leads/${targetId}`)
        .then((res) => {
          const studentData = res.data?.data || res.data;
          setCurrentStudent(studentData);
          if (studentData) {
            setFormData((prev) => ({
              ...prev,
              studentName: studentData.fullName || studentData.name || "",
              studentPhone: studentData.mobileNumber || studentData.phone || "",
              interestedCourse: studentData.interestedCourse || studentData.course || prev.interestedCourse,
            }));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch student details", err);
        });
    }
  }, [resolvedStudentId, formData.selectedStudentId, currentStudent]);

  const handleStudentSelectChange = (e) => {
    const selectedId = e.target.value;
    const foundStudent = allStudents.find((stu) => (stu._id || stu.id) === selectedId);

    setFormData((prev) => ({
      ...prev,
      selectedStudentId: selectedId,
      studentName: foundStudent?.fullName || foundStudent?.name || "",
      studentPhone: foundStudent?.mobileNumber || foundStudent?.phone || "",
      interestedCourse: foundStudent?.interestedCourse || foundStudent?.course || prev.interestedCourse,
    }));
    if (foundStudent) setCurrentStudent(foundStudent);
    if (errorMsg) setErrorMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleDocStatusChange = (docName, status) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docName]: status },
    }));
  };

  const handleQuickTagToggle = (tag) => {
    setFormData((prev) => {
      const exists = prev.quickTags.includes(tag);
      const updatedTags = exists
        ? prev.quickTags.filter((t) => t !== tag)
        : [...prev.quickTags, tag];

      const tagString = updatedTags.map(t => `[${t}]`).join(" ");
      return {
        ...prev,
        quickTags: updatedTags,
        discussionSummary: `${tagString} ${prev.discussionSummary.replace(/\[.*?\]/g, "").trim()}`
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalStudentId = formData.selectedStudentId || resolvedStudentId;

    if (!finalStudentId) {
      setErrorMsg("Please select a student lead before submitting the note.");
      return;
    }
    if (!formData.discussionSummary.trim()) {
      setErrorMsg("Please enter a discussion summary or note.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = new FormData();
      payload.append("selectedStudentId", finalStudentId);
      payload.append("leadId", finalStudentId);
      payload.append("studentId", finalStudentId);
      payload.append("id", finalStudentId);
      payload.append("fullName", formData.studentName || "");
      payload.append("studentName", formData.studentName || "");
      payload.append("name", formData.studentName || "");
      payload.append("studentPhone", formData.studentPhone || "");
      payload.append("mobileNumber", formData.studentPhone || "");
      payload.append("phone", formData.studentPhone || "");

      Object.entries({
        communicationType: formData.communicationType,
        callOutcome: formData.callOutcome,
        discussionSummary: formData.discussionSummary,
        leadStatus: formData.leadStatus,
        priority: formData.priority,
        leadScore: String(formData.leadScore || 0),
        followUpDate: formData.followUpDate || "",
        followUpTime: formData.followUpTime,
        followUpType: formData.followUpType,
        reminderBefore: formData.reminderBefore,
        interestedCourse: formData.interestedCourse,
        preferredCollege: formData.preferredCollege,
        preferredCity: formData.preferredCity,
        budget: formData.budget,
        hostelRequired: formData.hostelRequired,
        scholarshipNeeded: formData.scholarshipNeeded,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentDiscussion: formData.parentDiscussion,
        parentInterested: formData.parentInterested,
        decisionMaker: formData.decisionMaker,
        consultantName: formData.consultantName,
        department: formData.department,
        source: formData.source,
        campaign: formData.campaign,
        attachmentType: formData.attachmentType,
        aiNotesPrompt: formData.aiNotesPrompt,
        conversationMood: formData.conversationMood,
        admissionProbability: formData.admissionProbability,
        leadTemperature: formData.leadTemperature,
        nextRecommendedAction: formData.nextRecommendedAction,
        quickTags: JSON.stringify(formData.quickTags || []),
        documents: JSON.stringify(formData.documents || {}),
        registrationFee: String(formData.registrationFee || 0),
        counsellingFee: String(formData.counsellingFee || 0),
        advance: String(formData.advance || 0),
        pendingAmount: String(formData.pendingAmount || 0),
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      if (formData.attachmentFile) {
        payload.append("attachmentFile", formData.attachmentFile);
      }

      await API.post("/leads-notes", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(-1);
    } catch (err) {
      console.error("Failed to save note", err);
      setErrorMsg(err.response?.data?.message || "Failed to save note. Please check form data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickTagsList = [
    "Interested", "Parent Interested", "Asked Fees", "Scholarship",
    "Hostel", "Placement", "Government College", "Private College",
    "Wants Brochure", "Documents Pending", "Payment Pending"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-24">

        {/* Top Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiChevronLeft size={18} /> Back
          </button>
        </div>

        {/* Enterprise Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Enterprise CRM Activity & Follow-up</h1>
            <p className="text-sm text-slate-500 mt-0.5">Comprehensive multi-section tracking dashboard for education counseling</p>
          </div>
          {currentStudent && (
            <div className="px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-xs text-blue-500 font-bold block uppercase tracking-wider">Student Info (Read Only)</span>
              <span className="text-sm font-black text-blue-900">{currentStudent.fullName || currentStudent.name}</span>
              <span className="text-xs text-blue-600 block">({currentStudent.mobileNumber || currentStudent.email || "N/A"}) • {currentStudent.interestedCourse || "Course N/A"}</span>
            </div>
          )}
        </div>

        {/* Inline Error Warning Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Fallback Student Selection Dropdown if ID is missing */}
          {!resolvedStudentId && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Student / Lead <span className="text-rose-500">*</span>
              </label>
              <select
                name="selectedStudentId"
                value={formData.selectedStudentId}
                onChange={handleStudentSelectChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="">-- Choose Student from List --</option>
                {allStudents.map((stu) => (
                  <option key={stu._id || stu.id} value={stu._id || stu.id}>
                    {stu.fullName || stu.name} ({stu.mobileNumber || stu.email || "No details"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1️⃣ COMMUNICATION INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("communication")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>1️⃣ Communication Information (Required)</span>
              {sections.communication ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.communication && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Communication Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="communicationType"
                      value={formData.communicationType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Incoming Call">📞 Incoming Call</option>
                      <option value="Outgoing Call">📞 Outgoing Call</option>
                      <option value="WhatsApp Chat">💬 WhatsApp</option>
                      <option value="Email">📧 Email</option>
                      <option value="Google Meet">🎥 Google Meet</option>
                      <option value="Office Visit">🏢 Office Visit</option>
                      <option value="Parent Meeting">📍 Parent Meeting</option>
                      <option value="Document Collection">📄 Document Collection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Call Outcome <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="callOutcome"
                      value={formData.callOutcome}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Connected">Connected</option>
                      <option value="Not Connected">Not Connected</option>
                      <option value="Busy">Busy</option>
                      <option value="Switched Off">Switched Off</option>
                      <option value="Wrong Number">Wrong Number</option>
                      <option value="Callback Requested">Callback Requested</option>
                      <option value="Voicemail">Voicemail</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Quick Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickTagsList.map((tag) => {
                      const isSelected = formData.quickTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagToggle(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                          {isSelected ? "✓ " : "+ "} {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Discussion Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Discussion Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="discussionSummary"
                    value={formData.discussionSummary}
                    onChange={handleInputChange}
                    placeholder="Enter comprehensive notes about the call or meeting discussion..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2️⃣ LEAD STATUS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("leadStatus")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>2️⃣ Lead Status, Priority & Score</span>
              {sections.leadStatus ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.leadStatus && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lead Status</label>
                  <select
                    name="leadStatus"
                    value={formData.leadStatus}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Connected">Connected</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                    <option value="Counselling Done">Counselling Done</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Admission Done">Admission Done</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lead Score (Auto)</label>
                  <input
                    type="text"
                    disabled
                    value={`${formData.leadScore}% (System Auto)`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3️⃣ FOLLOW-UP SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("followUp")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>3️⃣ Follow-up Section</span>
              {sections.followUp ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.followUp && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Next Follow-up Date *</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Time</label>
                  <input
                    type="text"
                    name="followUpTime"
                    value={formData.followUpTime}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Follow-up Type</label>
                  <select
                    name="followUpType"
                    value={formData.followUpType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reminder Before</label>
                  <select
                    name="reminderBefore"
                    value={formData.reminderBefore}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="1 Day">1 Day</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4️⃣ STUDENT INTEREST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("studentInterest")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>4️⃣ Student Interest & Preferences</span>
              {sections.studentInterest ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.studentInterest && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Interested Course</label>
                  <select
                    name="interestedCourse"
                    value={formData.interestedCourse}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="BBA">BBA</option>
                    <option value="B.Pharm">B.Pharm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preferred City</label>
                  <select
                    name="preferredCity"
                    value={formData.preferredCity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Noida">Noida</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Budget</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="1 Lakh">1 Lakh</option>
                    <option value="2 Lakh">2 Lakh</option>
                    <option value="3 Lakh">3 Lakh</option>
                    <option value="5+ Lakh">5+ Lakh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hostel Required</label>
                  <select
                    name="hostelRequired"
                    value={formData.hostelRequired}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Scholarship Needed</label>
                  <select
                    name="scholarshipNeeded"
                    value={formData.scholarshipNeeded}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 5️⃣ PARENT DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("parentDetails")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>5️⃣ Parent Details</span>
              {sections.parentDetails ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.parentDetails && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Parent Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    placeholder="Enter parent/guardian name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Parent Phone</label>
                  <input
                    type="text"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Decision Maker</label>
                  <select
                    name="decisionMaker"
                    value={formData.decisionMaker}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Student">Student</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 6️⃣ DOCUMENTS CHECKLIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("documents")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>6️⃣ Documents Checklist</span>
              {sections.documents ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.documents && (
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.keys(formData.documents).map((docKey) => (
                  <div key={docKey} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block uppercase">{docKey}</span>
                    <select
                      value={formData.documents[docKey]}
                      onChange={(e) => handleDocStatusChange(docKey, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Received">Received</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7️⃣ PAYMENT INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("payment")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>7️⃣ Payment Information</span>
              {sections.payment ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.payment && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registration Fee</label>
                  <input
                    type="number"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleInputChange}
                    placeholder="₹ 0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Counselling Fee</label>
                  <input
                    type="number"
                    name="counsellingFee"
                    value={formData.counsellingFee}
                    onChange={handleInputChange}
                    placeholder="₹ 0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Advance Paid</label>
                  <input
                    type="number"
                    name="advance"
                    value={formData.advance}
                    onChange={handleInputChange}
                    placeholder="₹ 0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pending Amount</label>
                  <input
                    type="number"
                    name="pendingAmount"
                    value={formData.pendingAmount}
                    onChange={handleInputChange}
                    placeholder="₹ 0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 8️⃣ AI SECTION & SMART BUTTONS */}


          {/* 9️⃣ INTERNAL SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("internalSection")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>9️⃣ Internal Section (Assigned Counselor & Source)</span>
              {sections.internalSection ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.internalSection && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assigned Employee</label>
                  <input
                    type="text"
                    name="consultantName"
                    value={formData.consultantName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Admission">Admission</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Website">Website</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Campaign</label>
                  <input
                    type="text"
                    name="campaign"
                    value={formData.campaign}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>
          {/* 🔟 ATTACHMENT SECTION */}
          {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection("attachment")}
              className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer font-bold text-slate-800 text-sm"
            >
              <span>🔟 Attachments (Screenshot / Voice / PDF / Recording)</span>
              {sections.attachment ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
            {sections.attachment && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Attachment Type</label>
                  <select
                    name="attachmentType"
                    value={formData.attachmentType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Screenshot">Screenshot</option>
                    <option value="Voice">Voice Note</option>
                    <option value="PDF">PDF Document</option>
                    <option value="Image">Image</option>
                    <option value="Recording">Call Recording</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, attachmentFile: e.target.files[0] }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            )}
          </div> */}

          {/* 1️⃣3️⃣ STICKY FOOTER ACTION BUTTONS */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2 px-6 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Enterprise Status:</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                  <FiCheckCircle size={12} /> Ready to Save & Timeline Log
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl text-sm transition-colors shadow-md shadow-blue-200 disabled:opacity-50"
                >
                  <FiSave size={16} />
                  {submitting ? "Saving..." : "Save & Schedule Follow-up"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddStudentNotePage; 