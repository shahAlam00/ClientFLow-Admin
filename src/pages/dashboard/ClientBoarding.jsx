"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  FiChevronLeft,
  FiSave,
  FiBriefcase,
  FiUser,
  FiUploadCloud,
  FiCheckCircle,
  FiX,
  FiPhone,
  FiMail,
  FiGlobe,
  FiLayers,
  FiTool,
  FiTrendingUp,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
  FiImage,
  FiTrash2,
} from "react-icons/fi";

export function ClientBoarding() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    clientName: "",
    personalPhone: "",
    businessPhone: "",
    email: "",
    websiteUrl: "",
    industryType: "",
    primaryService: "",
    projectStatus: "Warm Lead",
    leadSource: "Google Ads",
    assignedAccountManager: "",
    onboardingNotes: "",
    profileImage: null,
    profileImagePreview: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: URL.createObjectURL(file),
      }));
      if (fieldErrors.profileImage) {
        setFieldErrors((prev) => ({ ...prev, profileImage: "" }));
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
      profileImagePreview: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }
    if (!formData.clientName.trim()) {
      errors.clientName = "Contact person name is required";
    }
    if (!formData.personalPhone.trim()) {
      errors.personalPhone = "Phone number is required";
    }
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.primaryService) {
      errors.primaryService = "Select a primary service";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "profileImagePreview" && formData[key] !== null && formData[key] !== "") {
          payload.append(key, formData[key]);
        }
      });

      await API.post("/clients", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Client onboarded successfully!");
      setTimeout(() => navigate("/dashboard/clients"), 1500);
    } catch (err) {
      console.error("Failed to onboard client", err);
      setFieldErrors({
        general: err.response?.data?.message || "Failed to save. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: FiImage },
    { id: "contact", label: "Contact", icon: FiUser },
    { id: "service", label: "Services", icon: FiTool },
    { id: "notes", label: "Notes", icon: FiFileText },
  ];

  const InputWrapper = ({ label, name, error, children, required }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 animate-pulse">
          <FiAlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20 pt-2">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
              <FiChevronLeft size={14} />
            </div>
            Back to Clients
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                New Client Onboarding
              </h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Register a new enterprise client and configure their service pipeline
              </p>
            </div>
            {successMsg && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
                <FiCheckCircle size={14} />
                {successMsg}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Success */}
        {successMsg && (
          <div className="sm:hidden flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold mb-4">
            <FiCheckCircle size={14} />
            {successMsg}
          </div>
        )}

        {/* General Error */}
        {fieldErrors.general && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <FiAlertCircle size={16} />
            {fieldErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* ─── Section 1: Profile Upload ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Brand Profile</h3>
                <p className="text-[11px] text-slate-400 font-medium">Company logo or contact photo</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-6">
                {formData.profileImagePreview ? (
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-md">
                      <img
                        src={formData.profileImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <FiImage size={24} />
                    <span className="text-[10px] font-bold mt-1">No Image</span>
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95">
                    <FiUploadCloud size={14} />
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    PNG, JPG or WEBP. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Contact Details ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Contact Details</h3>
                <p className="text-[11px] text-slate-400 font-medium">Corporate and personal information</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputWrapper label="Company / Brand" name="companyName" error={fieldErrors.companyName} required>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Apex Tech Solutions"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      fieldErrors.companyName
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Contact Person" name="clientName" error={fieldErrors.clientName} required>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Rajesh Sharma"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      fieldErrors.clientName
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Personal Phone" name="personalPhone" error={fieldErrors.personalPhone} required>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="tel"
                    name="personalPhone"
                    value={formData.personalPhone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      fieldErrors.personalPhone
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Business Phone" name="businessPhone">
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="tel"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    placeholder="011-29845100"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Email Address" name="email" error={fieldErrors.email}>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      fieldErrors.email
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Website" name="websiteUrl">
                <div className="relative">
                  <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </InputWrapper>

              <InputWrapper label="Industry" name="industryType">
                <div className="relative">
                  <FiLayers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                  >
                    <option value="">Select Industry</option>
                    <option>E-Commerce & Retail</option>
                    <option>Real Estate</option>
                    <option>Healthcare & Pharma</option>
                    <option>SaaS & Tech Startup</option>
                    <option>Education & EdTech</option>
                    <option>Finance & Legal</option>
                    <option>Travel & Hospitality</option>
                    <option>Manufacturing & Industrial</option>
                  </select>
                </div>
              </InputWrapper>
            </div>
          </div>

          {/* ─── Section 3: Service & Pipeline ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Service Configuration</h3>
                <p className="text-[11px] text-slate-400 font-medium">Pipeline status and service mapping</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <InputWrapper label="Primary Service" name="primaryService" error={fieldErrors.primaryService} required>
                <div className="relative">
                  <FiTool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    name="primaryService"
                    value={formData.primaryService}
                    onChange={handleInputChange}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border transition-all focus:outline-none focus:ring-4 appearance-none cursor-pointer ${
                      fieldErrors.primaryService
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                    }`}
                  >
                    <option value="">Select Service</option>
                    <optgroup label="Digital Marketing">
                      <option>SEO Optimization</option>
                      <option>Local SEO & GMB</option>
                      <option>PPC / Google Ads</option>
                      <option>Social Media Marketing</option>
                    </optgroup>
                    <optgroup label="Development">
                      <option>Custom Web Development</option>
                      <option>E-Commerce Website</option>
                      <option>Mobile App Development</option>
                      <option>UI/UX Wireframing</option>
                      <option>SaaS Custom Software</option>
                    </optgroup>
                  </select>
                </div>
              </InputWrapper>

              <InputWrapper label="Pipeline Status" name="projectStatus">
                <div className="relative">
                  <FiTrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    name="projectStatus"
                    value={formData.projectStatus}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                  >
                    <option>Hot Lead</option>
                    <option>Warm Lead</option>
                    <option>Proposal Shared</option>
                    <option>Deal Closed</option>
                    <option>On Hold</option>
                  </select>
                </div>
              </InputWrapper>

              <InputWrapper label="Lead Source" name="leadSource">
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                  >
                    <option>Google Ads</option>
                    <option>Organic SEO</option>
                    <option>LinkedIn Outreach</option>
                    <option>Client Referral</option>
                    <option>Direct Call</option>
                    <option>WhatsApp Campaign</option>
                  </select>
                </div>
              </InputWrapper>
            </div>
          </div>

          {/* ─── Section 4: Assignment & Notes ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Assignment & Notes</h3>
                <p className="text-[11px] text-slate-400 font-medium">Account manager and discovery notes</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputWrapper label="Account Manager" name="assignedAccountManager">
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      name="assignedAccountManager"
                      value={formData.assignedAccountManager}
                      onChange={handleInputChange}
                      placeholder="Aman Verma"
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </InputWrapper>
              </div>

              <InputWrapper label="Discovery Notes" name="onboardingNotes">
                <textarea
                  rows={4}
                  name="onboardingNotes"
                  value={formData.onboardingNotes}
                  onChange={handleInputChange}
                  placeholder="Initial requirements, discussion points, or special requests..."
                  className="w-full p-4 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 resize-none"
                />
              </InputWrapper>
            </div>
          </div>

          {/* ─── Sticky Action Bar ─── */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 py-3 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  All changes are auto-validated
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave size={14} />
                  {submitting ? "Saving..." : "Onboard Client"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ClientBoarding;