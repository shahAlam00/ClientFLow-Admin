import React from 'react';
import { 
  ArrowLeft, 
  Scale, 
  Gavel, 
  FileText, 
  Briefcase, 
  Calendar, 
  FileSignature, 
  ShieldCheck, 
  UserCheck,
  FileSpreadsheet,
  FileCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from 'react-router-dom';

function Matters() {
    const navigate=useNavigate();
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 text-slate-600 font-sans antialiased relative selection:bg-indigo-600 selection:text-white p-4 sm:p-8 md:p-12">
        
        {/* Back Button Link top left */}
        <div className="max-w-7xl mx-auto mb-6">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Main Container Core Header Area */}
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/80 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-5">
            <Scale className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
            Create New Matter
          </h1>
          <p className="text-base font-medium text-slate-500 mt-2.5 max-w-md">
            Select the branch of legal work required to initialize your new case workflow.
          </p>
        </div>

        {/* Grid Display Structure Section split cards */}
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch px-1 sm:px-0">
          
          {/* Litigation Block Option Container */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.06)] group">
            <div>
              {/* Soft Icon Wrapper Frame */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Gavel className="w-5 h-5 stroke-[2]" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Litigation Matter
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                Manage court cases, hearings, cause lists, disputes, and judicial proceedings.
              </p>

              {/* Feature Sub-list stack details block */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <Briefcase className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Civil & Criminal Cases</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <Calendar className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Court Hearings & Cause Lists</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Arbitration & Tribunal</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <UserCheck className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Party Management & Orders</span>
                </div>
              </div>
            </div>

            {/* Action Trigger Link Line item button footer */}
            <div className="mt-10 pt-6 border-t border-slate-100">
              <button onClick={() => navigate("/dashboard/matters/new-case")} className="w-full sm:w-auto text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 tracking-wide transition-colors flex items-center justify-between sm:justify-start gap-2 bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100/40 sm:border-0 sm:bg-transparent sm:p-0">
                <span>Create Litigation Case</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Non-Litigation Block Option Container */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.06)] group">
            <div>
              {/* Soft Icon Wrapper Frame */}
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Non-Litigation Matter
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                Drafting, corporate advisory, compliance, corporate registration, and contracts.
              </p>

              {/* Feature Sub-list stack details block */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <FileSignature className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Agreement & Contract Drafting</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Legal Opinions & Advisory</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <Building2 className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Registration & Compliance</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    <FileCheck className="w-4 h-4 text-indigo-500 stroke-[2]" />
                  </div>
                  <span>Due Diligence & Documentation</span>
                </div>
              </div>
            </div>

            {/* Action Trigger Link Line item button footer */}
            <div className="mt-10 pt-4 border-t border-slate-100">
              <button onClick={() => navigate("/dashboard/add-noncase")}  className="w-full sm:w-auto text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 tracking-wide transition-colors flex items-center justify-between sm:justify-start gap-2 bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100/40 sm:border-0 sm:bg-transparent sm:p-0">
                <span>Create Non-Litigation Matter</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Persistent Static Global Sticky Chat Widget Indicator Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-13 h-13 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-[0_6px_20px_rgba(79,70,229,0.35)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group p-3.5">
            <svg className="w-5 h-5 fill-current transition-transform group-hover:rotate-3" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Matters;