import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  AlertTriangle,
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileText, 
  Loader2, 
  MessageSquareMore, 
  Pencil, 
  Plus, 
  RotateCw, 
  Search, 
  Trash2, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

const ITEMS_PER_PAGE = 6;

const itemId = (item) => item._id || item.id;
const nameOf = (item) => item.client?.name || item.clientName || item.client || '—';
const totalOf = (item) => item.grandTotal ?? item.total ?? item.summary?.grandTotal ?? 0;
const numberOf = (item) => item.proformaNumber || item.number || `PF-${String(itemId(item) || '').slice(-6)}`;
const money = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

function Proforma() {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  // Pagination & Delete Confirmation Modal States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProformas = async () => {
    setLoading(true); setError('');
    try { 
      const response = await api.get('/proforma'); 
      const data = response.data?.data ?? response.data; 
      setProformas(Array.isArray(data) ? data : data?.proformas ?? []); 
    } catch (requestError) { 
      setError(requestError.response?.data?.message || 'Proformas could not be loaded.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadProformas(); }, []);

  // Reset pagination to Page 1 whenever query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  // Filtering Logic
  const filtered = useMemo(() => {
    return proformas.filter((item) => {
      const matchesQuery = `${numberOf(item)} ${nameOf(item)}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [proformas, query, statusFilter]);

  // Pagination Calculation (6 items / page)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedProformas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const total = proformas.reduce((sum, item) => sum + Number(totalOf(item)), 0);

  // Delete Action Handlers
  const handleInitiateDelete = (item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try { 
      await api.delete(`/proforma/${itemId(itemToDelete)}`); 
      setProformas((list) => list.filter((entry) => itemId(entry) !== itemId(itemToDelete))); 
      setItemToDelete(null);
    } catch (requestError) { 
      setError(requestError.response?.data?.message || 'Proforma could not be deleted.'); 
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-600">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-start gap-3">
              <button onClick={() => navigate(-1)} className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Proforma Invoices</h1>
                <p className="text-sm text-slate-400 mt-0.5">Quotations and estimates before final invoicing</p>
              </div>
            </div>
            
            <button onClick={() => navigate('/dashboard/proforma-invoices/create-new')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gold hover:bg-amber-600 rounded-xl shadow-sm transition-all self-start sm:self-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Proforma
            </button>
          </div>

          {/* Gold Statistics Row */}
          <div className="flex flex-row gap-5 mb-8 overflow-x-auto pb-3 scrollbar-none snap-x">
            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-6 rounded-[16px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[115px] min-w-[220px] flex-1 snap-start group">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{money(total)}</span>
              <span className="text-xs text-slate-400 mt-1 block">{proformas.length} proformas total</span>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-6 rounded-[16px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[115px] min-w-[220px] flex-1 snap-start group">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Sent</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{proformas.filter((item) => item.status === 'Sent').length}</span>
              <span className="text-xs text-slate-400 mt-1 block">Dispatched items</span>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-6 rounded-[16px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[115px] min-w-[220px] flex-1 snap-start group">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Accepted</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{proformas.filter((item) => item.status === 'Accepted').length}</span>
              <span className="text-xs text-slate-400 mt-1 block">Approved deals</span>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-6 rounded-[16px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[115px] min-w-[220px] flex-1 snap-start group">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Converted</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{proformas.filter((item) => item.status === 'Converted').length}</span>
              <span className="text-xs text-slate-400 mt-1 block">Final billing shift</span>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-6 rounded-[16px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[115px] min-w-[220px] flex-1 snap-start group">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Rejected</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{proformas.filter((item) => item.status === 'Rejected').length}</span>
              <span className="text-xs text-slate-400 mt-1 block">Declined pipeline</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center mb-6">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search proforma by number, client..." 
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none placeholder:text-slate-400 text-slate-800 transition-all focus:border-amber-500"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 min-w-[130px] cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="All Status">All Status</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Converted">Converted</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button onClick={loadProformas} className="p-2.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container Area */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[400px] overflow-hidden flex flex-col justify-between">
            {loading ? (
              <div className="w-full overflow-x-auto text-left animate-pulse">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-xs text-slate-400 uppercase">
                    <tr>
                      <th className="p-4">Proforma</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-3">
                            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center my-auto">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-4 border border-slate-100 shadow-inner">
                  <FileText className="w-9 h-9 stroke-[1.25]" />
                </div>
                <h4 className="text-base font-semibold text-slate-800 tracking-tight">No proforma invoices found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">Your recorded logs and estimates will populate inside this viewport framework.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto text-left">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-xs text-slate-400 uppercase">
                    <tr>
                      <th className="p-4">Proforma</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProformas.map((item) => (
                      <tr key={itemId(item)} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-semibold text-slate-900">{numberOf(item)}</td>
                        <td className="p-4">{nameOf(item)}</td>
                        <td className="p-4">{item.proformaDate || '—'}</td>
                        <td className="p-4 font-medium">{money(totalOf(item))}</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-3 text-slate-500">
                            <button onClick={() => setViewing(item)} title="View" className="hover:text-slate-800 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate('/dashboard/proforma-invoices/create-new', { state: { proforma: item } })} title="Edit" className="hover:text-amber-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleInitiateDelete(item)} title="Delete" className="text-rose-600 hover:text-rose-700 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CENTERED ROUNDED PAGINATION CONTROLS (6 per page) */}
          {filtered.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center pt-6 pb-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                
                {/* Previous Button */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5 px-2">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-full text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md scale-105"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">{error}</p>}
          
          {/* Proforma Detail View Modal */}
          {viewing && <ProformaView item={viewing} close={() => setViewing(null)} edit={() => navigate('/dashboard/proforma-invoices/create-new', { state: { proforma: viewing } })} />}

          {/* CENTERED DELETE CONFIRMATION MODAL POPUP */}
          {itemToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all scale-100">
                
                {/* Close Modal Cross */}
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-6 text-center">
                  {/* Warning Red Icon */}
                  <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <AlertTriangle className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Confirm Proforma Deletion
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Are you sure you want to delete this proforma invoice? This action cannot be undone.
                  </p>

                  {/* Target Item Details Card */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-6 text-left">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Proforma: {numberOf(itemToDelete)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client: <span className="font-medium text-slate-700">{nameOf(itemToDelete)}</span> | Total: <span className="font-semibold text-slate-700">{money(totalOf(itemToDelete))}</span>
                    </p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setItemToDelete(null)}
                      className="flex-1 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 h-10 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 h-10 text-sm transition-colors"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" /> Delete Proforma
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Floating Message Sticky Badge */}
          <div className="fixed bottom-6 right-6 z-40">
            <button className="p-3.5 bg-amber-500 text-white rounded-full hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
              <MessageSquareMore className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default Proforma;

function ProformaView({ item, close, edit }) { 
  const summary = item.summary || {}; 
  const items = item.items || item.lineItems || []; 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button onClick={close} className="float-right text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">{numberOf(item)}</h2>
        <p className="mb-4 text-sm text-slate-500">{nameOf(item)}</p>
        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3 border-slate-100">
          <p>Date: <b>{item.proformaDate || '—'}</b></p>
          <p>Valid until: <b>{item.validUntil || '—'}</b></p>
          <p>Payment terms: <b>{item.paymentTerms || '—'}</b></p>
          <p>Place of supply: <b>{item.placeOfSupply || '—'}</b></p>
        </div>
        <table className="mt-5 w-full text-sm">
          <thead className="border-y bg-slate-50">
            <tr>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Rate</th>
              <th className="p-2 text-left">Tax</th>
            </tr>
          </thead>
          <tbody>
            {items.map((line, index) => (
              <tr key={line._id || line.id || index} className="border-b">
                <td className="p-2">{line.description}</td>
                <td className="p-2">{line.qty}</td>
                <td className="p-2">{money(line.rate)}</td>
                <td className="p-2">{line.taxPercent || 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-5 max-w-xs space-y-2 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><b>{money(summary.subtotal)}</b></p>
          <p className="flex justify-between"><span>Taxable amount</span><b>{money(summary.taxableAmount)}</b></p>
          <p className="flex justify-between"><span>CGST</span><b>{money(summary.cgst)}</b></p>
          <p className="flex justify-between"><span>SGST</span><b>{money(summary.sgst)}</b></p>
          <p className="flex justify-between"><span>IGST</span><b>{money(summary.igst)}</b></p>
          <p className="flex justify-between border-t pt-2 text-base font-bold text-slate-900"><span>Grand Total</span><b>{money(totalOf(item))}</b></p>
        </div>
        <p className="mt-4 text-sm"><b>Notes:</b> {item.internalNotes || '—'}</p>
        <p className="mt-2 text-sm"><b>Terms:</b> {item.termsAndConditions || '—'}</p>
        <button onClick={edit} className="mt-5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm text-white font-medium transition-colors">
          Edit Proforma
        </button>
      </div>
    </div>
  ); 
}