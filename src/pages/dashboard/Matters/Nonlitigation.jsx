import React, { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  CircleAlert, 
  Clock3, 
  Download, 
  Eye, 
  FileCheck2, 
  FileText, 
  Pencil, 
  Plus, 
  Search, 
  Trash2, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { deleteMatter, getMatters } from '@/services/matterService';
import { getClients } from '@/services/clientService';

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
const statusLabel = (value) => String(value || 'draft').replaceAll('_', ' ');
const matterId = (matter) => matter._id || matter.id;
const clientDisplayText = (client) => {
  if (!client || typeof client === 'string') return client || '';
  const personalName = [client?.firstName, client?.middleName, client?.lastName].filter(Boolean).join(' ');
  return client?.name || client?.fullName || personalName || client?.companyName || client?.displayName || client?.organizationName || client?.email || '';
};

const clientName = (matter, clientLookup = new Map()) => {
  const client = matter.client;
  const directName = clientDisplayText(client) || matter.clientName || matter.clientDisplayName || matter.clientFullName || matter.clientEmail || '';
  if (directName) return directName;
  const clientId = matter.clientId || matter.client_id || matter.client?._id || matter.client?.id || matter.client;
  if (clientId) {
    const selectedClient = clientLookup.get(String(clientId));
    if (selectedClient) return clientDisplayText(selectedClient);
  }
  return '—';
};

const clientDisplayName = (matter, clientLookup = new Map()) => {
  const result = clientName(matter, clientLookup);
  return result === '—' ? 'Client not selected' : result;
};

const dueDateValue = (matter) => {
  const candidates = [
    matter.dueDate,
    matter.due,
    matter.due_date,
    matter.dueDateValue,
    matter.deadline,
    matter.deadlineDate,
    matter.deadline_date,
    matter.expectedCompletionDate,
    matter.expected_completion_date,
    matter.timeline?.dueDate,
    matter.timeline?.due,
    matter.timeline?.deadline,
    matter.dates?.due,
    matter.dates?.dueDate,
    matter.dates?.deadline,
    matter.deliveryDate,
    matter.date,
  ];
  return candidates.find((value) => value !== undefined && value !== null && value !== '');
};

const displayDate = (value) => {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const fileUrl = (file) => {
  const value = typeof file === 'string' ? file : file.url || file.path || file.filePath || file.filename;
  if (!value) return '#';
  if (/^https?:\/\//.test(value)) return value;
  return `${apiBase}/${String(value).replace(/^\/+/, '')}`;
};

const fileName = (file) => typeof file === 'string' ? file.split('/').pop() : file.originalname || file.name || file.filename || 'Attachment';

const ITEMS_PER_PAGE = 6;

function Nonlitigation() {
  const navigate = useNavigate();
  const [matters, setMatters] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Delete modal state
  const [currentPage, setCurrentPage] = useState(1);
  const [matterToDelete, setMatterToDelete] = useState(null);

  const loadMatters = async () => {
    setLoading(true); 
    setError('');
    try { 
      setMatters(await getMatters()); 
    } catch (requestError) { 
      setError(requestError.response?.data?.message || 'Unable to load matters.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadMatters(); }, []);

  useEffect(() => {
    getClients().then((clientList) => setClients(Array.isArray(clientList) ? clientList : [])).catch(() => setClients([]));
  }, []);

  const clientLookup = useMemo(() => new Map(clients.map((client) => [String(client._id || client.id), client])), [clients]);

  const visibleMatters = useMemo(() => matters.filter((matter) => {
    const searchable = `${matter.matterTitle || matter.title || ''} ${clientDisplayName(matter, clientLookup)} ${matter.workType || matter.type || ''} ${matter.assignedTo || ''}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (!statusFilter || matter.status === statusFilter);
  }), [matters, query, statusFilter, clientLookup]);

  // Reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  const totalPages = Math.ceil(visibleMatters.length / ITEMS_PER_PAGE) || 1;

  const paginatedMatters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleMatters.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleMatters, currentPage]);

  const counts = { 
    total: matters.length, 
    ongoing: matters.filter((m) => m.status === 'ongoing').length, 
    pending: matters.filter((m) => String(m.status || '').startsWith('pending')).length, 
    completed: matters.filter((m) => m.status === 'completed').length, 
    overdue: matters.filter((m) => dueDateValue(m) && new Date(dueDateValue(m)) < new Date() && m.status !== 'completed').length 
  };

  const summary = [
    { label: 'Total', value: counts.total, icon: FileCheck2 }, 
    { label: 'In Progress', value: counts.ongoing, icon: Clock3 }, 
    { label: 'Pending', value: counts.pending, icon: CircleAlert }, 
    { label: 'Completed', value: counts.completed, icon: CheckCircle2 }, 
    { label: 'Overdue', value: counts.overdue, icon: CircleAlert }
  ];

  const handleConfirmDelete = async () => {
    if (!matterToDelete) return;
    try { 
      await deleteMatter(matterId(matterToDelete)); 
      setMatters((current) => current.filter((item) => matterId(item) !== matterId(matterToDelete))); 
      if (selected && matterId(selected) === matterId(matterToDelete)) {
        setSelected(null); 
      }
      setMatterToDelete(null);
    } catch (requestError) { 
      setError(requestError.response?.data?.message || 'Unable to delete matter.'); 
      setMatterToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-7rem)] bg-slate-50/70 text-slate-700">
        <div className="mx-auto max-w-[1400px] ">
          <header className="flex flex-col gap-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => navigate('/dashboard')} className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-white">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-soft text-gold">
                    <FileCheck2 className="h-4 w-4" />
                  </span>
                  <h1 className="text-2xl font-bold text-slate-950">Matters / Assignments</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500">Non-litigation work: drafting, advisory, assignments, compliance & more</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/dashboard/add-noncase')} className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-gold px-4 text-sm font-bold text-gold-foreground sm:self-auto">
              <Plus className="h-4 w-4" />New Matter
            </button>
          </header>

          {error && <div role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {summary.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between">
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </article>
            ))}
          </section>

          <section className="mt-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search matters..." className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-gold" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
                <option value="">All statuses</option>
                <option value="ongoing">In progress</option>
                <option value="pending_approval">Awaiting approval</option>
                <option value="pending_client">Awaiting client</option>
                <option value="completed">Completed</option>
                <option value="draft">Not started</option>
                <option value="on_hold">On hold</option>
              </select>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Matter</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due date</th>
                        <th className="px-4 py-3">Assignee</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <tr key={item} className="animate-pulse">
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-28"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-2">
                              <div className="h-7 w-7 bg-slate-200 rounded"></div>
                              <div className="h-7 w-7 bg-slate-200 rounded"></div>
                              <div className="h-7 w-7 bg-slate-200 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center border-t border-slate-200 bg-slate-50/50 py-3.5">
                  <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            ) : visibleMatters.length === 0 ? (
              <div className="grid min-h-64 place-items-center px-5 text-center">
                <div>
                  <FileCheck2 className="mx-auto h-8 w-8 text-slate-300" />
                  <h2 className="mt-3 font-bold text-slate-900">{query || statusFilter ? 'No matching matters found' : 'No matters found'}</h2>
                  <button type="button" onClick={() => navigate('/dashboard/add-noncase')} className="mt-3 text-sm font-bold text-gold">Create a matter</button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Matter</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due date</th>
                        <th className="px-4 py-3">Assignee</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedMatters.map((matter) => (
                        <tr key={matterId(matter)} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => setSelected(matter)} className="font-semibold text-slate-900 hover:text-gold">
                              {matter.matterTitle || matter.title || 'Untitled matter'}
                            </button>
                            <p className="mt-0.5 text-xs text-slate-500">{matter.workType || matter.type || '—'}</p>
                          </td>
                          <td className="px-4 py-3">{clientName(matter, clientLookup)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize">{statusLabel(matter.status)}</span>
                          </td>
                          <td className="px-4 py-3">{displayDate(dueDateValue(matter))}</td>
                          <td className="px-4 py-3">{matter.assignedTo || 'Unassigned'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1">
                              <button title="View details" onClick={() => setSelected(matter)} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button title="Edit" onClick={() => navigate(`/dashboard/add-noncase/${matterId(matter)}`)} className="rounded p-2 text-indigo-600 hover:bg-indigo-50">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button title="Delete" onClick={() => setMatterToDelete(matter)} className="rounded p-2 text-rose-600 hover:bg-rose-50">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Centered Pagination Control Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/50 py-3.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-3 text-xs font-bold text-gold-foreground transition-opacity disabled:opacity-40"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 min-w-9 rounded-lg px-2.5 text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-gold text-gold-foreground shadow-sm scale-105'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-3 text-xs font-bold text-gold-foreground transition-opacity disabled:opacity-40"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Details Modal */}
      {selected && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gold">Matter details</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{selected.matterTitle || selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Client" value={clientName(selected, clientLookup)} />
              <Detail label="Work type" value={selected.workType || selected.type} />
              <Detail label="Status" value={statusLabel(selected.status)} />
              <Detail label="Priority" value={selected.priority} />
              <Detail label="Assigned to" value={selected.assignedTo} />
              <Detail label="Due date" value={displayDate(dueDateValue(selected))} />
            </div>
            {(selected.scopeOfWork || selected.description) && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase text-slate-400">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{selected.scopeOfWork || selected.description}</p>
              </div>
            )}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase text-slate-400">Attachments</p>
              {(selected.files || selected.attachments || []).length ? (
                <div className="mt-2 space-y-2">
                  {(selected.files || selected.attachments).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="min-w-0 flex-1 truncate text-sm">{fileName(file)}</span>
                      <a href={fileUrl(file)} target="_blank" rel="noreferrer" className="rounded p-1.5 text-indigo-600 hover:bg-indigo-50" title="View">
                        <Eye className="h-4 w-4" />
                      </a>
                      <a href={fileUrl(file)} download className="rounded p-1.5 text-indigo-600 hover:bg-indigo-50" title="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">No files uploaded.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setMatterToDelete(selected)} className="rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">
                Delete
              </button>
              <button onClick={() => navigate(`/dashboard/add-noncase/${matterId(selected)}`)} className="rounded-lg bg-gold px-3 py-2 text-sm font-bold text-gold-foreground">
                Edit matter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Delete Confirmation Popup */}
      {matterToDelete && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">“{matterToDelete.matterTitle || matterToDelete.title || 'Untitled matter'}”</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setMatterToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
                className="rounded-lg px-4 py-2 text-sm font-bold shadow hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default Nonlitigation;