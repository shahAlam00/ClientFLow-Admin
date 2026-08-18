import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  FiChevronLeft, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiBriefcase, 
  FiClock, 
  FiFileText, 
  FiUser, 
  FiCheckCircle,
  FiExternalLink,
  FiLoader,
  FiAlertCircle
} from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [newTranscript, setNewTranscript] = useState("");
  
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      date: "10 Aug 2026, 04:30 PM",
      duration: "04 min 12 sec",
      notes: "Discussed project requirements and pricing framework. Client agreed to share wireframes by tomorrow.",
      agent: "Aman Verma"
    }
  ]);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/clients/${id}`, {
          withCredentials: true,
        });

        const responseData = response.data;
        const clientData = responseData.data || responseData;
        setClient(clientData);
      } catch (err) {
        console.error("Error fetching client details:", err);
        setError("Failed to load client details from server.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const startCall = () => {
    if (!client) return;
    setIsCalling(true);
    
    const phoneNumber = client.personalPhone || client.businessPhone || "";
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }

    setTimeout(() => {
      setIsCalling(false);
      setCallActive(true);
    }, 1000);
  };

  const endCall = () => {
    setCallActive(false);
    if (newTranscript.trim()) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) + ", " + now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      const newEntry = {
        id: Date.now(),
        date: formattedDate,
        duration: "02 min 30 sec",
        notes: newTranscript,
        agent: client?.assignedAccountManager || "Admin"
      };
      
      setTranscripts([newEntry, ...transcripts]);
      setNewTranscript("");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading complete client details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-rose-600">
          <FiAlertCircle className="w-10 h-10" />
          <p className="text-sm font-bold">{error || "Client record not found."}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = client.clientName || client.companyName || "Client Profile";
  const displayPhone = client.personalPhone || client.businessPhone || "N/A";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs active:scale-95"
          >
            <FiChevronLeft size={16} /> Back to Clients List
          </button>

          {!callActive && (
            <button 
              onClick={startCall}
              disabled={isCalling}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              <FiPhone size={16} />
              {isCalling ? "Connecting..." : `Call Now: ${displayPhone}`}
            </button>
          )}
        </div>

        {callActive && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold tracking-wide">Live Call Active with {displayName} ({displayPhone})</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">Recording / Note Mode</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Write Call Transcript / Discussion Notes (Saved Date-wise):
              </label>
              <textarea
                rows={3}
                value={newTranscript}
                onChange={(e) => setNewTranscript(e.target.value)}
                placeholder="Type important pointers discussed on call..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={endCall}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <FiCheckCircle size={14} /> End Call & Save Transcript
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 lg:col-span-1">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">{client.clientName || "N/A"}</h1>
                <p className="text-xs text-slate-500 font-medium">{client.companyName || "Independent Client"}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {client.clientId || "CLIENT"}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <FiPhone size={14} /> Personal Phone
                </span>
                {client.personalPhone ? (
                  <a 
                    href={`tel:${client.personalPhone}`}
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    {client.personalPhone} <FiExternalLink size={10} />
                  </a>
                ) : (
                  <span className="font-bold text-slate-400">N/A</span>
                )}
              </div>

              <div className="client-detail-phone-business flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <FiPhone size={14} /> Business Phone
                </span>
                <a 
                  href={`tel:${client.businessPhone}`}
                  className="font-bold text-slate-800 hover:text-emerald-600"
                >
                  {client.businessPhone || "N/A"}
                </a>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2"><FiMail size={14} /> Email</span>
                <span className="font-bold text-slate-800 truncate max-w-[160px]">{client.email || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2"><FiGlobe size={14} /> Website</span>
                <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 truncate max-w-[160px] hover:underline">
                  {client.websiteUrl || "N/A"}
                </a>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2"><FiBriefcase size={14} /> Industry</span>
                <span className="font-bold text-slate-800">{client.industryType || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Primary Service</span>
                <span className="font-bold text-slate-800">{client.primaryService || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Project Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {client.projectStatus || "Active"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Lead Source</span>
                <span className="font-bold text-slate-800">{client.leadSource || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="name-field-label text-slate-400 font-bold uppercase tracking-wider">Manager</span>
                <span className="font-bold text-slate-800">{client.assignedAccountManager || "Unassigned"}</span>
              </div>
            </div>

            {client.onboardingNotes && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Onboarding & Project Notes:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 leading-related">
                  {client.onplotlibNotes || client.onboardingNotes}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FiFileText className="text-blue-600" size={18} /> Date-wise Call Transcripts & History
              </h2>
              <span className="text-xs font-bold text-slate-400">{transcripts.length} Logs Saved</span>
            </div>

            <div className="space-y-4">
              {transcripts.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FiClock size={14} className="text-blue-600" /> {item.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                        Duration: {item.duration}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px]">
                        Agent: {item.agent}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default ClientDetail;