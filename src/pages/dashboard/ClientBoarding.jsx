import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  FiUploadCloud, 
  FiTrash2, 
  FiImage, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCalendar, 
  FiMapPin, 
  FiBookOpen, 
  FiAward, 
  FiCheckSquare, 
  FiGlobe, 
  FiDollarSign, 
  FiSave 
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ClientBoarding = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formData, setFormData] = useState({
    profileImagePreview: null,
    studentName: '',
    personalPhone: '',
    whatsappNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    state: '',
    highestQualification: '',
    passingYear: '',
    percentageOrCgpa: '',
    institutionName: '',
    targetCourse: '',
    preferredSpecialization: '',
    admissionIntake: '',
    interestedCollege: '', // Added Interested College / University field
    admissionAgreed: 'Pending',
    leadStatus: 'New Inquiry',
    budgetRange: '',
    assignedCounselor: '',
    nextFollowUpDate: '',
    counselingNotes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    studentName: '',
    personalPhone: '',
    email: '',
    targetCourse: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load student data when editing
  useEffect(() => {
    if (!isEdit) return;
    axios.get(`${API_BASE}/students/${id}`)
      .then(({ data }) => {
        const s = data.data || data;
        setFormData(prev => ({
          ...prev,
          studentName: s.studentName || '',
          personalPhone: s.personalPhone || '',
          whatsappNumber: s.whatsappNumber || '',
          email: s.email || '',
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
          gender: s.gender || '',
          city: s.city || '',
          state: s.state || '',
          highestQualification: s.highestQualification || '',
          passingYear: s.passingYear || '',
          percentageOrCgpa: s.percentageOrCgpa || '',
          institutionName: s.institutionName || '',
          targetCourse: s.targetCourse || '',
          preferredSpecialization: s.preferredSpecialization || '',
          admissionIntake: s.admissionIntake || '',
          interestedCollege: s.interestedCollege || '',
          admissionAgreed: s.admissionAgreed || 'Pending',
          leadStatus: s.leadStatus || 'New Inquiry',
          budgetRange: s.budgetRange || '',
          assignedCounselor: s.assignedCounselor || '',
          nextFollowUpDate: s.nextFollowUpDate ? s.nextFollowUpDate.split('T')[0] : '',
          counselingNotes: s.counselingNotes || '',
          profileImagePreview: s.profileImage || null,
        }));
      })
      .catch(err => console.error('Failed to load student:', err));
  }, [id, isEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setFormData((prev) => ({ ...prev, profileImagePreview: URL.createObjectURL(file) }));
    }
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setFormData((prev) => ({ ...prev, profileImagePreview: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline validation for critical fields (no popup alerts)
    if (name === 'studentName') {
      if (value.length > 0 && value.length < 3) {
        setFieldErrors((prev) => ({ ...prev, studentName: 'Name must be at least 3 characters long.' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, studentName: '' }));
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length > 0 && !emailRegex.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fieldErrors.studentName || fieldErrors.email) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = new FormData();
      const fields = { ...formData };
      delete fields.profileImagePreview;
      Object.entries(fields).forEach(([k, v]) => v !== '' && data.append(k, v));
      if (profileImageFile) data.append('profileImage', profileImageFile);

      if (isEdit) {
        await axios.put(`${API_BASE}/students/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(`${API_BASE}/students`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/dashboard/students');
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl   pb-24">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* ─── Section 1: Student Photo & ID ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Student Photo</h3>
                <p className="text-[11px] text-slate-400 font-medium">Passport size photograph or document scan</p>
              </div>
            </div>
            {/* Counselor Note Badge for Profile Image */}
            <span className="text-[11px] font-semibold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              Optional (For Counselor Review)
            </span>
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
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  PNG, JPG or WEBP. Max 2MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section 2: Personal Details ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
              <p className="text-[11px] text-slate-400 font-medium">Student contact details and residential info</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Student Full Name */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Full Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Aarav Sharma"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 ${
                    fieldErrors.studentName
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                  }`}
                />
              </div>
              {fieldErrors.studentName && <span className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.studentName}</span>}
            </div>

            {/* Personal Phone */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Personal Phone <span className="text-rose-500">*</span></label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="tel"
                  name="personalPhone"
                  value={formData.personalPhone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@gmail.com"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border transition-all focus:outline-none focus:ring-4 ${
                    fieldErrors.email
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                  }`}
                />
              </div>
              {fieldErrors.email && <span className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.email}</span>}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Noida"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* State */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Uttar Pradesh"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ─── Section 3: Academic Background ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Academic Background</h3>
              <p className="text-[11px] text-slate-400 font-medium">Previous education qualifications and scores</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Highest Qualification */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Highest Qualification</label>
              <div className="relative">
                <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                >
                  <option value="">Select Qualification</option>
                  <option>High School (10th)</option>
                  <option>Intermediate (12th)</option>
                  <option>Graduation (BCA/BTech/BSc/BA/BCom)</option>
                  <option>Post Graduation (MCA/MBA/MTech)</option>
                </select>
              </div>
            </div>

            {/* Passing Year */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Passing Year</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="passingYear"
                  value={formData.passingYear}
                  onChange={handleInputChange}
                  placeholder="2025"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Percentage / CGPA */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Percentage / CGPA</label>
              <div className="relative">
                <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="percentageOrCgpa"
                  value={formData.percentageOrCgpa}
                  onChange={handleInputChange}
                  placeholder="85% or 8.5 CGPA"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* School / College Name */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">School / College Name</label>
              <div className="relative">
                <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleInputChange}
                  placeholder="Delhi University / CBSE"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ─── Section 4: Course Interest & Admission Agreement ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Counseling & Admission Preference</h3>
              <p className="text-[11px] text-slate-400 font-medium">Target course, interested university, and agreement status</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Target Course - Expanded with MBA, B.Com, M.Com, and all B.A options */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Course <span className="text-rose-500">*</span></label>
              <div className="relative">
                <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select
                  name="targetCourse"
                  value={formData.targetCourse}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border transition-all focus:outline-none focus:ring-4 appearance-none cursor-pointer ${
                    fieldErrors.targetCourse
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                  }`}
                >
                  <option value="">Select Target Course</option>
                  <optgroup label="Management & Commerce">
                    <option>MBA</option>
                    <option>BBA</option>
                    <option>B.Com</option>
                    <option>M.Com</option>
                  </optgroup>
                  <optgroup label="Arts & Humanities (B.A Options)">
                    <option>B.A (General)</option>
                    <option>B.A (Honours)</option>
                    <option>B.A (Economics)</option>
                    <option>B.A (English)</option>
                    <option>B.A (Political Science)</option>
                    <option>B.A (History)</option>
                    <option>B.A (Psychology)</option>
                  </optgroup>
                  <optgroup label="IT & Engineering">
                    <option>B.Tech / B.E</option>
                    <option>BCA</option>
                    <option>MCA</option>
                    <option>B.Sc (IT / Data Science)</option>
                    <option>M.Tech</option>
                    <option>PGDM</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Interested College / University */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Interested College / University</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="interestedCollege"
                  value={formData.interestedCollege}
                  onChange={handleInputChange}
                  placeholder="e.g. AKTU, AKGEC, Amity, DU"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Preferred Specialization */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Specialization</label>
              <div className="relative">
                <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="preferredSpecialization"
                  value={formData.preferredSpecialization}
                  onChange={handleInputChange}
                  placeholder="Full Stack, AI & ML, Finance"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Admission Intake */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admission Intake</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select
                  name="admissionIntake"
                  value={formData.admissionIntake}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                >
                  <option value="">Select Intake</option>
                  <option>Fall 2026</option>
                  <option>Spring 2027</option>
                  <option>Immediate / Current Session</option>
                </select>
              </div>
            </div>

            {/* Admission Agreed? */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admission Agreed? (Is student ready?)</label>
              <div className="relative">
                <FiCheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" size={15} />
                <select
                  name="admissionAgreed"
                  value={formData.admissionAgreed}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-200 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
                >
                  <option value="Pending">Pending / Undecided</option>
                  <option value="Yes">Yes - Agreed to Take Admission</option>
                  <option value="No">No - Not Interested</option>
                </select>
              </div>
            </div>

            {/* Counseling / Lead Status */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Counseling / Lead Status</label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select
                  name="leadStatus"
                  value={formData.leadStatus}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                >
                  <option>New Inquiry</option>
                  <option>Counseling Done</option>
                  <option>Documents Pending</option>
                  <option>Ready to Apply</option>
                  <option>Admission Confirmed</option>
                  <option>Dropped</option>
                </select>
              </div>
            </div>

            {/* Estimated Budget Range */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Budget Range</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  placeholder="1 Lakh - 3 Lakhs"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ─── Section 5: Assignment & Follow-Up Notes ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              5
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Assignment & Remarks</h3>
              <p className="text-[11px] text-slate-400 font-medium">Assigned counselor and follow-up notes</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Assigned Counselor */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Counselor</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                  <input
                    type="text"
                    name="assignedCounselor"
                    value={formData.assignedCounselor}
                    onChange={handleInputChange}
                    placeholder="Amit Verma (Senior Counselor)"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Next Follow-Up Date */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Follow-Up Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    value={formData.nextFollowUpDate}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

            </div>

            {/* Counseling Notes */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Counseling & Discussion Remarks</label>
              <textarea
                rows={4}
                name="counselingNotes"
                value={formData.counselingNotes}
                onChange={handleInputChange}
                placeholder="Write detailed student requirements, agreed fee concessions, document status, or parent discussion notes..."
                className="w-full p-4 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-300 bg-slate-50 border border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Sticky Action Bar ─── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 py-3 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            {submitError && <span className="text-xs text-rose-600 font-semibold">{submitError}</span>}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Education CRM Client Record Ready
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => window.history.back()}
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
                {submitting ? 'Saving...' : isEdit ? 'Update Student Record' : 'Save Student Record'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
    </DashboardLayout>
  );
};

export default ClientBoarding;