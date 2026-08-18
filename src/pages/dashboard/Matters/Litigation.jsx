import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown,
  CircleAlert, Clock3, Filter, LayoutDashboard, Plus, Search, SlidersHorizontal,
  Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

const metrics = [
  { label: 'Total cases', value: 0, icon: BriefcaseBusiness, iconClass: 'bg-blue-50 text-blue-600', valueClass: 'text-slate-900' },
  { label: 'Active', value: 0, icon: CheckCircle2, iconClass: 'bg-emerald-50 text-emerald-600', valueClass: 'text-emerald-600' },
  { label: "Today's hearings", value: 0, icon: CalendarDays, iconClass: 'bg-rose-50 text-rose-500', valueClass: 'text-rose-500' },
  { label: 'Pending update', value: 0, icon: Clock3, iconClass: 'bg-orange-50 text-orange-500', valueClass: 'text-orange-500' },
  { label: 'Pending tasks', value: 0, icon: CircleAlert, iconClass: 'bg-violet-50 text-violet-600', valueClass: 'text-violet-600' },
  { label: 'Pending matters', value: 0, icon: BriefcaseBusiness, iconClass: 'bg-cyan-50 text-cyan-600', valueClass: 'text-cyan-600' },
];

function SelectFilter({ label }) {
  return (
    <button type="button" className="flex h-10 min-w-[132px] items-center justify-between gap-5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10">
      {label}<ChevronDown className="h-4 w-4" />
    </button>
  );
}

function Litigation() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  // Pagination State (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Custom Centered Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/litigation');
      const data = response.data?.data ?? response.data;
      setCases(Array.isArray(data) ? data : data?.cases || []);
      try {
        const clientsResponse = await api.get('/clients');
        const clientData = clientsResponse.data?.data ?? clientsResponse.data;
        const clientList = Array.isArray(clientData) ? clientData : clientData?.clients || clientData?.data || [];
        setClients(Array.isArray(clientList) ? clientList : []);
      } catch (clientError) {
        console.error('Unable to load client names:', clientError);
      }
    } catch (error) {
      console.error('Unable to load cases:', error);
      alert(error.response?.data?.message || 'Unable to load litigation cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCases(); }, []);

  const filteredCases = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return cases;
    return cases.filter((item) => [item.caseTitle, item.courtCaseNumber, item.clientName, item.primaryPartyName, item.caseCategory]
      .some((value) => String(value || '').toLowerCase().includes(search)));
  }, [cases, query]);

  // Reset page when search/filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, cases.length]);

  const getClientName = (item) => {
    if (item.clientName) return item.clientName;
    if (item.client?.fullName) return item.client.fullName;
    const clientId = typeof item.client === 'object' ? (item.client?._id || item.client?.id) : item.client;
    const client = clients.find((entry) => String(entry._id || entry.id) === String(clientId));
    return client?.fullName || client?.displayName || client?.organizationName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || 'Unlinked client';
  };

  const getPrimaryPartyName = (item) => item.primaryParty?.partyName || item.primaryParty?.name || item.primaryPartyName || '-';

  const viewCase = async (item) => {
    const id = item._id || item.id;
    try {
      const response = await api.get(`/litigation/${id}`);
      const caseData = response.data?.data ?? response.data;
      setSelectedCase({ ...caseData, clientDisplayName: getClientName(caseData) });
    } catch (error) {
      console.error('Unable to load case:', error);
      alert(error.response?.data?.message || 'Unable to load case details.');
    }
  };

  // Delete Prompt Handler (Open Centered Modal)
  const promptDeleteCase = (item) => {
    const id = item._id || item.id;
    setDeleteModal({
      isOpen: true,
      id: id,
      title: item.caseTitle || 'this case',
    });
  };

  // Execute Delete Function
  const executeDeleteCase = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/litigation/${deleteModal.id}`);
      setCases((current) => current.filter((caseItem) => (caseItem._id || caseItem.id) !== deleteModal.id));
    } catch (error) {
      console.error('Unable to delete case:', error);
      alert(error.response?.data?.message || 'Unable to delete case.');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, id: null, title: '' });
    }
  };

  // Pagination Calculations
  const totalCases = filteredCases.length;
  const totalPages = Math.ceil(totalCases / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCases = filteredCases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const metricValues = {
    'Total cases': cases.length,
    Active: cases.filter((item) => {
      const status = String(item.caseStatus || item.status || '').trim().toLowerCase();
      return status === 'active';
    }).length,
    "Today's hearings": cases.filter((item) => String(item.nextHearingDate || '').slice(0, 10) === today).length,
    'Pending update': cases.filter((item) => {
      const status = String(item.caseStatus || item.status || '').trim().toLowerCase();
      return status === 'on-hold' || status === 'pending';
    }).length,
    'Pending tasks': 0,
    'Pending matters': cases.filter((item) => {
      const status = String(item.caseStatus || item.status || '').trim().toLowerCase();
      return status !== 'disposed';
    }).length,
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-7rem)] bg-slate-50/70 text-slate-700">
        <div className="mx-auto max-w-[1450px] px-1 py-2 sm:px-2 lg:px-4">
          <header className="flex flex-col gap-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard" className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm"><ArrowLeft className="h-5 w-5" /></button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Cases</h1>
                <p className="mt-0.5 text-sm font-medium text-slate-500">Manage all your legal cases</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button type="button" onClick={() => navigate('/dashboard')} className="inline-flex h-10 items-center gap-2 rounded-lg bg-gold px-3 text-sm font-bold text-white shadow-sm shadow-violet-500/25 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-violet-500/20"><LayoutDashboard className="h-4 w-4" />Dashboard</button>
              <button type="button" onClick={() => navigate('/dashboard/matters/new-case')} className="inline-flex h-10 items-center gap-2 rounded-lg bg-gold px-3 text-sm font-bold text-white shadow-sm shadow-blue-500/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"><Plus className="h-4 w-4" />New case</button>
            </div>
          </header>

          <section aria-label="Case overview" className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {metrics.map(({ label, value, icon: Icon, iconClass, valueClass }) => (
              <article key={label} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-slate-500">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${iconClass}`}><Icon className="h-4.5 w-4.5" /></span></div>
                <p className={`mt-1 text-xl font-bold ${valueClass}`}>{metricValues[label] ?? value}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases..." className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <SelectFilter label="Status" />
              <SelectFilter label="Priority" />
              <SelectFilter label="Hearings" />
              <SelectFilter label="Newest" />
              <button type="button" onClick={() => setShowFilters((shown) => !shown)} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700'}`}><SlidersHorizontal className="h-4 w-4" />More</button>
            </div>
            {showFilters && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Advanced filters</span><SelectFilter label="Court" /><SelectFilter label="Case type" /><button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"><Filter className="h-4 w-4" />Clear filters</button></div>}
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
            {loading ? (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500">CASE</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">CLIENT / PARTY</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">COURT</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">STATUS</th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <tr key={item} className="animate-pulse">
                          <td className="px-5 py-4">
                            <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-32"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-36 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-28"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center gap-2">
                              <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                              <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                              <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                  <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            ) : filteredCases.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500">CASE</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">CLIENT / PARTY</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">COURT</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">STATUS</th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCases.map((item) => {
                        const id = item._id || item.id;
                        return (
                          <tr key={id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-slate-800">{item.caseTitle || 'Untitled case'}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{item.courtCaseNumber || item.cnrNumber || 'Case number not added'}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium text-slate-700">{getClientName(item)}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{getPrimaryPartyName(item)}</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">{item.caseCategory || item.filingType || '-'}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{item.caseStatus || 'Active'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-center gap-2">
                                <button type="button" onClick={() => viewCase(item)} aria-label={`View ${item.caseTitle}`} className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                                <button type="button" onClick={() => navigate(`/dashboard/matters/new-case/${id}`)} aria-label={`Edit ${item.caseTitle}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => promptDeleteCase(item)} aria-label={`Delete ${item.caseTitle}`} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ================= CENTERED PAGINATION (ROUNDED GOLD ACTIVE BG) ================= */}
                <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          style={
                            currentPage === page
                              ? { backgroundColor: '#D4AF37', color: '#ffffff' }
                              : {}
                          }
                          className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'shadow-md shadow-[#D4AF37]/30 scale-105'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-slate-700">{Math.min(startIndex + ITEMS_PER_PAGE, totalCases)}</span> of{' '}
                    <span className="font-semibold text-slate-700">{totalCases}</span> cases
                  </p>
                </div>
              </>
            ) : (
              <div className="grid min-h-[330px] place-items-center px-5 py-12 text-center sm:min-h-[390px]">
                <div className="max-w-sm">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400"><BriefcaseBusiness className="h-7 w-7" /></span>
                  <h2 className="mt-5 text-lg font-bold text-slate-700">{query ? 'No matching cases found' : 'No cases found'}</h2>
                  <p className="mt-2 text-sm text-slate-500">{query ? 'Try a different search term or clear your filters.' : 'Create a new case to get started.'}</p>
                  <button type="button" onClick={() => navigate('/dashboard/matters/new-case')} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" />Create new case</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ================= VIEW CASE DETAILS MODAL ================= */}
      {selectedCase && <CaseViewModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />}

      {/* ================= CENTERED DELETE CONFIRMATION MODAL (RED-ROSE DELETE BUTTON) ================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex items-center gap-3.5 mb-4">
              <div 
                style={{ backgroundColor: '#ffe4e6', borderColor: '#fecdd3', color: '#e11d48' }}
                className="p-3 border rounded-xl"
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Case Deletion
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteModal.title}"</span>? All linked documents and records will be removed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteCase}
                disabled={isDeleting}
                style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 flex items-center gap-2 shadow-md shadow-rose-500/20 transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete Case
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function CaseViewModal({ caseData, onClose }) {
  const primaryParty = caseData.primaryParty || {};
  const details = [
    ['Client', caseData.clientDisplayName || caseData.clientName || caseData.client?.fullName], ['Case title', caseData.caseTitle], ['Party', primaryParty.partyName || primaryParty.name || caseData.primaryPartyName],
    ['Party type', primaryParty.partyType || caseData.primaryPartyType], ['Party position', caseData.partyPositions], ['Party number', primaryParty.partyNumber || caseData.primaryPartyNumber],
    ['Party phone', primaryParty.phone || caseData.primaryPartyPhone], ['Party email', primaryParty.email || caseData.primaryPartyEmail], ['Party address', primaryParty.address || caseData.primaryPartyAddress], ['Case category', caseData.caseCategory],
    ['Filing type', caseData.filingType], ['Sections and acts', caseData.sectionsActs], ['Court case number', caseData.courtCaseNumber],
    ['CNR number', caseData.cnrNumber], ['Lead advocate', caseData.leadAdvocate], ['Supervising partner', caseData.supervisingPartner],
    ['Assisting counsels', caseData.assistingCounsels], ['Support staff', caseData.supportStaff], ['Case value', caseData.caseSuitValue],
    ['Claim amount', caseData.claimAmount], ['Retainer fee', caseData.retainerFee], ['Retainer amount', caseData.retainerAmount],
    ['Brief facts', caseData.briefFacts], ['Legal issues', caseData.legalIssues], ['Notes', caseData.caseNotes]
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Case Details</h2>
            <p className="mt-0.5 text-xs text-slate-500">{caseData.caseTitle || 'Litigation case'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close case details" className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-72px)] overflow-y-auto p-5">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className={['Party address', 'Sections and acts', 'Brief facts', 'Legal issues', 'Notes'].includes(label) ? 'sm:col-span-2' : ''}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{value || 'Not provided'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Litigation;