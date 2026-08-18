import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  FiChevronLeft, 
  FiPhone, 
  FiMail, 
  FiUser,
  FiMapPin,
  FiBookOpen,
  FiAward,
  FiCalendar,
  FiCheckSquare,
  FiGlobe,
  FiDollarSign,
  FiLoader,
  FiAlertCircle,
  FiEdit,
  FiHash
} from "react-icons/fi";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    axios.get(`${API_BASE}/students/${id}`)
      .then(({ data }) => setStudent(data.data || data))
      .catch(() => setError('Failed to load student details.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-base font-medium text-slate-600">Loading student details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-rose-600">
          <FiAlertCircle className="w-12 h-12" />
          <p className="text-base font-semibold">{error || 'Student record not found.'}</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-slate-800 transition-all">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  // Increased font sizes (labels: text-sm/base, values: text-base/lg) with clean spacing
  const Field = ({ icon: Icon, label, value, color = 'text-slate-900' }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-1.5 sm:gap-6">
      <span className="text-slate-500 font-medium text-sm sm:text-base flex items-center gap-3">
        {Icon && (
          <span className="p-2 rounded-xl bg-slate-50 text-slate-500 shrink-0 flex items-center justify-center">
            <Icon size={18} />
          </span>
        )}
        <span className="leading-tight">{label}</span>
      </span>
      <span className={`font-semibold text-base sm:text-lg ${color} text-left sm:text-right break-words max-w-full sm:max-w-[55%]`}>
        {value || 'N/A'}
      </span>
    </div>
  );

  const Badge = ({ value, colorClass }) => (
    <span className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${colorClass}`}>{value}</span>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">

        {/* Top Navigation & Action Header */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <button 
            onClick={() => navigate('/dashboard/students')} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
          >
            <FiChevronLeft size={18} /> Back to Students
          </button>
          
          <button 
            onClick={() => navigate(`/dashboard/student/edit/${id}`)} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            <FiEdit size={16} /> Edit Student
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 lg:col-span-1 h-fit">
            <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-4 pb-6 border-b border-slate-100">
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.studentName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-blue-50 shadow-md" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-inner">
                  {(student.studentName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{student.studentName}</h1>
                <p className="text-base text-slate-600 font-medium">{student.targetCourse || 'Student Profile'}</p>
                {student.clientId && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs sm:text-sm font-mono font-medium">
                    <FiHash size={14} /> {student.clientId}
                  </div>
                )}
                <div className="pt-1.5">
                  <Badge value={student.leadStatus || 'New Inquiry'} colorClass="bg-blue-50 text-blue-700 border-blue-200" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Field icon={FiPhone} label="Personal Phone" value={student.personalPhone} />
              <Field icon={FiPhone} label="WhatsApp" value={student.whatsappNumber} />
              <Field icon={FiMail} label="Email" value={student.email} />
              <Field icon={FiCalendar} label="Date of Birth" value={student.dateOfBirth?.split('T')[0]} />
              <Field icon={FiUser} label="Gender" value={student.gender} />
              <Field icon={FiMapPin} label="City" value={student.city} />
              <Field icon={FiMapPin} label="State" value={student.state} />
            </div>
          </div>

          {/* Right Column: Academic & Counseling */}
          <div className="space-y-6 lg:col-span-2">

            {/* Academic Background Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiBookOpen size={20} />
                </div>
                Academic Background
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <Field icon={FiAward} label="Highest Qualification" value={student.highestQualification} />
                <Field icon={FiCalendar} label="Passing Year" value={student.passingYear} />
                <Field icon={FiAward} label="Percentage / CGPA" value={student.percentageOrCgpa} />
                <Field icon={FiBookOpen} label="Institution Name" value={student.institutionName} />
              </div>
            </div>

            {/* Counseling & Admission Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FiCheckSquare size={20} />
                </div>
                Counseling & Admission Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <Field icon={FiBookOpen} label="Target Course" value={student.targetCourse} />
                <Field icon={FiMapPin} label="Interested College" value={student.interestedCollege} />
                <Field icon={FiBookOpen} label="Specialization" value={student.preferredSpecialization} />
                <Field icon={FiCalendar} label="Admission Intake" value={student.admissionIntake} />
                <Field icon={FiCheckSquare} label="Admission Agreed" value={student.admissionAgreed} />
                <Field icon={FiGlobe} label="Lead Status" value={student.leadStatus} />
                <Field icon={FiDollarSign} label="Budget Range" value={student.budgetRange} />
                <Field icon={FiUser} label="Assigned Counselor" value={student.assignedCounselor} />
                <Field icon={FiCalendar} label="Next Follow-Up" value={student.nextFollowUpDate?.split('T')[0]} />
              </div>

              {student.counselingNotes && (
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Counseling Notes</p>
                  <p className="text-base text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 leading-relaxed font-medium">
                    {student.counselingNotes}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ClientDetail;