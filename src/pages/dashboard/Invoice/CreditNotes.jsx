import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquareMore, 
  Plus, 
  RotateCw, 
  Search, 
  X, 
  Eye, 
  Pencil, 
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

// Helper utilities
const idOf = (note) => note?._id || note?.id;
const nameOf = (note) => note?.client?.name || note?.clientName || note?.client || '—';
const totalOf = (note) => note?.totalCredit ?? note?.total ?? note?.summary?.totalCredit ?? 0;
const numberOf = (note) => note?.creditNoteNumber || note?.number || `CN-${String(idOf(note) || '').slice(-6)}`;
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Status Badge Component
const StatusBadge = ({ status }) => {
  const normalized = String(status || 'Draft').toLowerCase();
  
  if (normalized === 'applied' || normalized === 'redeemed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Applied
      </span>
    );
  }
  if (normalized === 'issued' || normalized === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3" /> Issued
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
      <AlertCircle className="w-3 h-3" /> {status || 'Draft'}
    </span>
  );
};

function CreditNotes() {
  const navigate = useNavigate(); 
  const [notes, setNotes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [query, setQuery] = useState(''); 
  const [error, setError] = useState(''); 
  const [viewing, setViewing] = useState(null);

  // States for Custom Centered Delete Confirmation Modal
  const [deletingNote, setDeletingNote] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // States for Centered Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadNotes = async () => { 
    setLoading(true); 
    setError(''); 
    try { 
      const response = await api.get('/creditnotes'); 
      const data = response.data?.data ?? response.data; 
      setNotes(Array.isArray(data) ? data : data?.creditNotes ?? []); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Credit notes could not be loaded.'); 
    } finally { 
      setLoading(false); 
    } 
  };

  useEffect(() => { 
    loadNotes(); 
  }, []);

  // Filtered List
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter((note) => {
      const searchStr = `${numberOf(note)} ${nameOf(note)} ${note?.status || ''} ${note?.relatedInvoice || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [notes, query]);

  // Reset pagination to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Totals calculations
  const total = notes.reduce((sum, note) => sum + Number(totalOf(note)), 0);
  
  const appliedTotal = notes
    .filter((n) => String(n.status).toLowerCase() === 'applied')
    .reduce((s, n) => s + Number(totalOf(n)), 0);

  const availableTotal = notes
    .filter((n) => String(n.status).toLowerCase() !== 'applied')
    .reduce((s, n) => s + Number(totalOf(n)), 0);

  const draftsCount = notes.filter((n) => String(n.status || 'Draft').toLowerCase() === 'draft').length;

  // Confirmed Delete API call
  const handleConfirmDelete = async () => { 
    if (!deletingNote) return;
    setDeletingLoading(true);
    try { 
      await api.delete(`/creditnotes/${idOf(deletingNote)}`); 
      setNotes((all) => all.filter((item) => idOf(item) !== idOf(deletingNote))); 
      if (viewing && idOf(viewing) === idOf(deletingNote)) {
        setViewing(null);
      }
      setDeletingNote(null);
    } catch (err) { 
      setError(err.response?.data?.message || 'Credit note could not be deleted.'); 
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-600">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Credit Notes</h1>
                <p className="mt-0.5 text-sm text-slate-500">Manage customer credit notes, refunds, and adjustments</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/credit-notes/create-new')} 
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> New Credit Note
            </button>
          </div>

          {/* Metric Cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Total Credit Notes', money(total), `${notes.length} notes recorded`], 
              ['Applied', money(appliedTotal), 'Redeemed allocations'], 
              ['Available Balance', money(availableTotal), 'Unused credits'], 
              ['Drafts', draftsCount, 'Pending completion']
            ].map(([label, value, detail]) => (
              <div 
                key={label} 
                className="flex min-h-[115px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                style={{ borderLeft: '5px solid #d97706' }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                <span className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
                <span className="mt-1 block text-xs font-medium text-slate-400">{detail}</span>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
              <input 
                value={query} 
                onChange={(event) => setQuery(event.target.value)} 
                placeholder="Search by credit note number, client, invoice..." 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20" 
              />
              {query && (
                <button 
                  onClick={() => setQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={loadNotes} 
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              title="Refresh list"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Data Table Container */}
          <div className="min-h-[400px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
            {loading ? (
              <div className="w-full">
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="p-4 pl-6">Credit Note</th>
                        <th className="p-4">Client</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <tr key={item} className="animate-pulse">
                          <td className="p-4 pl-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="p-4"><div className="h-5 bg-slate-200 rounded-full w-20"></div></td>
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="p-4 pr-6 text-right">
                            <div className="inline-flex justify-end gap-2">
                              <div className="h-7 w-12 bg-slate-200 rounded"></div>
                              <div className="h-7 w-12 bg-slate-200 rounded"></div>
                              <div className="h-7 w-14 bg-slate-200 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center border-t border-slate-100 bg-slate-50/50 p-4">
                  <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            ) : filtered.length ? (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="p-4 pl-6">Credit Note</th>
                        <th className="p-4">Client</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedNotes.map((note) => (
                        <tr key={idOf(note)} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-900 whitespace-nowrap">
                            {numberOf(note)}
                          </td>
                          <td className="p-4 font-medium text-slate-700">
                            {nameOf(note)}
                          </td>
                          <td className="p-4 text-slate-500 whitespace-nowrap">
                            {note.creditDate || '—'}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <StatusBadge status={note.status} />
                          </td>
                          <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                            {money(totalOf(note))}
                          </td>
                          <td className="p-4 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setViewing(note)} 
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button 
                                onClick={() => navigate('/dashboard/credit-notes/create-new', { state: { creditNote: note } })} 
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button 
                                onClick={() => setDeletingNote(note)} 
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Centered Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Page {currentPage} of {totalPages} ({filtered.length} items total)
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No credit notes found</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                  {query ? 'No notes match your search criteria. Try clearing filters.' : 'Get started by creating your first credit note.'}
                </p>
                {query ? (
                  <button onClick={() => setQuery('')} className="mt-4 text-sm font-semibold text-amber-600 hover:underline">
                    Clear Search
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/dashboard/credit-notes/create-new')} 
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New Credit Note
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Viewing Modal */}
          {viewing && (
            <CreditView 
              note={viewing} 
              close={() => setViewing(null)} 
              edit={() => {
                const noteToEdit = viewing;
                setViewing(null);
                navigate('/dashboard/credit-notes/create-new', { state: { creditNote: noteToEdit } });
              }} 
            />
          )}

          {/* Centered Delete Confirmation Popup Modal */}
          {deletingNote && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget && !deletingLoading) setDeletingNote(null);
              }}
            >
              <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl transition-all">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Credit Note?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to delete <b className="text-slate-800">{numberOf(deletingNote)}</b> for <b className="text-slate-800">{nameOf(deletingNote)}</b>? This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setDeletingNote(null)}
                    disabled={deletingLoading}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold hover:bg-rose-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
                  >
                    {deletingLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <button className="rounded-full bg-slate-900 p-3.5 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
              <MessageSquareMore className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreditView({ note, close, edit }) { 
  const summary = note.summary || {}; 
  const items = note.creditItems || note.items || [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">{numberOf(note)}</h2>
              <StatusBadge status={note.status} />
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">Client: {nameOf(note)}</p>
          </div>
          <button 
            onClick={close} 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Credit Date</span>
            <span className="font-medium text-slate-800">{note.creditDate || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Related Invoice</span>
            <span className="font-medium text-slate-800">{note.relatedInvoice || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Reason</span>
            <span className="font-medium text-slate-800">{note.reason || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Status</span>
            <span className="font-medium text-slate-800">{note.status || 'Draft'}</span>
          </div>
        </div>

        {note.reasonDescription && (
          <div className="mt-4 rounded-xl border border-slate-100 p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Description: </span>
            {note.reasonDescription}
          </div>
        )}

        {/* Items Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-3 pl-4">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 pr-4 text-right">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item._id || item.id || index}>
                    <td className="p-3 pl-4 font-medium text-slate-900">{item.description || item.name || '—'}</td>
                    <td className="p-3 text-center">{item.qty ?? item.quantity ?? 1}</td>
                    <td className="p-3 text-right">{money(item.unitPrice ?? item.rate ?? item.price)}</td>
                    <td className="p-3 pr-4 text-right">{item.taxPercent || item.tax || 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400 italic">No itemized entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">{money(summary.subtotal)}</span>
          </div>
          {Number(summary.cgst) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>CGST</span>
              <span className="font-semibold text-slate-800">{money(summary.cgst)}</span>
            </div>
          )}
          {Number(summary.sgst) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>SGST</span>
              <span className="font-semibold text-slate-800">{money(summary.sgst)}</span>
            </div>
          )}
          {Number(summary.igst) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>IGST</span>
              <span className="font-semibold text-slate-800">{money(summary.igst)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
            <span>Total Credit</span>
            <span>{money(totalOf(note))}</span>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
          <p><b className="text-slate-800">Notes:</b> {note.internalNotes || note.notes || '—'}</p>
          <p><b className="text-slate-800">Terms:</b> {note.termsAndConditions || note.terms || '—'}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button 
            onClick={close} 
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={edit} 
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit Credit Note
          </button>
        </div>
      </div>
    </div>
  ); 
}

export default CreditNotes;