import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Eye, 
  FileText, 
  Loader2, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

const ITEMS_PER_PAGE = 6;

const idOf = (invoice) => invoice._id || invoice.id;
const summaryOf = (invoice) => invoice.summary || {};
const totalOf = (invoice) => invoice.total ?? invoice.grandTotal ?? invoice.amount ?? summaryOf(invoice).total ?? 0;
const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
// Updated to support invoiceNo matching backend schema
const numberOf = (invoice) => invoice.invoiceNo || invoice.invoiceNumber || invoice.number || `INV-${String(idOf(invoice) || '').slice(-6)}`;
const clientOf = (invoice) => invoice.client?.name || invoice.clientName || invoice.client || '—';

// Dummy skeleton rows for initial and refreshing loading states
const skeletonRows = Array(ITEMS_PER_PAGE)
  .fill(null)
  .map((_, i) => ({ _id: `skeleton-${i}`, isLoading: true }));

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  // Pagination & Delete Modal States
  const [currentPage, setCurrentPage] = useState(1);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoices = async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/invoices');
      const data = response.data?.data ?? response.data;
      setInvoices(Array.isArray(data) ? data : data?.invoices ?? []);
    } catch (err) { 
      setError(err.response?.data?.message || 'Invoices could not be loaded.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Filtering Pipeline
  const filtered = useMemo(() => 
    invoices.filter((invoice) => 
      `${numberOf(invoice)} ${clientOf(invoice)}`.toLowerCase().includes(query.toLowerCase())
    ), [invoices, query]
  );

  // Use skeleton rows when loading, otherwise use filtered results
  const displayedInvoices = loading ? skeletonRows : filtered;

  // Pagination Logic
  const totalPages = Math.ceil(displayedInvoices.length / ITEMS_PER_PAGE) || 1;
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedInvoices, currentPage]);

  const total = invoices.reduce((sum, invoice) => sum + Number(totalOf(invoice)), 0);
  const statusTotal = (status) => invoices.filter((invoice) => (status === 'Pending' ? !invoice.status || invoice.status === status : invoice.status === status)).reduce((sum, invoice) => sum + Number(totalOf(invoice)), 0);

  // ==================== DELETE MODAL HANDLERS ====================
  const handleInitiateDelete = (invoice) => {
    setInvoiceToDelete(invoice);
  };
  

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    try { 
      await api.delete(`/invoices/${idOf(invoiceToDelete)}`); 
      setInvoices((list) => list.filter((item) => idOf(item) !== idOf(invoiceToDelete))); 
      setInvoiceToDelete(null);
    } catch (err) { 
      setError(err.response?.data?.message || 'Invoice could not be deleted.'); 
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50  font-sans antialiased text-slate-600">
        
        {/* Header */}
<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

  {/* Left Side */}
  <div>
    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
      Invoices
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Manage invoices, track payments, and monitor receivables
    </p>
  </div>

  {/* Right Side */}
  <div className="flex justify-end">
    <button
      onClick={() => navigate("/dashboard/create-new")}
      className="
        inline-flex
        h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-amber-500
        px-5
        text-sm
        font-semibold
        text-white
        shadow-md
        transition-all
        bg-gold
        duration-200
        hover:bg-amber-600
        hover:shadow-lg
        active:scale-95
        whitespace-nowrap
        shrink-0
      "
    >
      <Plus className="h-4 w-4" />
      <span>New Invoice</span>
    </button>
  </div>

</div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-5">
          <Card label="Total Invoiced" value={money(total)} detail={`${invoices.length} invoices`} icon={FileText} colour="blue" />
          <Card label="Collected" value={money(statusTotal('Paid'))} detail={`${invoices.filter((i) => i.status === 'Paid').length} paid`} icon={CheckCircle2} colour="emerald" />
          <Card label="Pending" value={money(statusTotal('Pending'))} detail={`${invoices.filter((i) => !i.status || i.status === 'Pending').length} pending`} icon={Clock} colour="amber" />
          <Card label="Overdue" value={money(statusTotal('Overdue'))} detail={`${invoices.filter((i) => i.status === 'Overdue').length} overdue`} icon={AlertCircle} colour="rose" />
          <Card label="This Month" value={money(total)} detail="Current invoice value" icon={DollarSign} colour="purple" />
        </div>

        {/* Search & Action Bar */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input 
              value={query} 
              onChange={(event) => setQuery(event.target.value)} 
              placeholder="Search by invoice number, client..." 
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-amber-500" 
            />
          </div>
          <button onClick={loadInvoices} className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">{error}</p>}

        {/* Invoices Table Card */}
        <div className="min-h-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            {filtered.length === 0 && !loading ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center">
                <FileText className="mb-4 w-10 h-10 text-slate-300" />
                <h4 className="font-semibold text-slate-800">No invoices found</h4>
                <button onClick={() => navigate('/dashboard/create-new')} className="mt-5 text-sm text-amber-600 font-medium hover:underline">
                  Create your first invoice
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((invoice) => {
                    // SKELETON ROW RENDER STATE
                    if (invoice.isLoading) {
                      return (
                        <tr key={invoice._id} className="border-b border-slate-100 animate-pulse">
                          <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                          <td className="p-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                          <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                          <td className="p-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                          <td className="p-4"><div className="h-6 w-20 bg-slate-200 rounded-full"></div></td>
                          <td className="p-4">
                            <div className="flex justify-center gap-3">
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                              <div className="w-4 h-4 bg-slate-200 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // NORMAL INVOICE ROW
                    return (
                      <tr key={idOf(invoice)} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{numberOf(invoice)}</td>
                        <td className="p-4">{clientOf(invoice)}</td>
                        <td className="p-4">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '—'}</td>
                        <td className="p-4 font-medium">{money(totalOf(invoice))}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            invoice.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {invoice.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-3 text-slate-500">
                            <button onClick={() => setViewing(invoice)} title="View" className="hover:text-slate-800 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate('/dashboard/create-new', { state: { invoice } })} title="Edit" className="hover:text-amber-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleInitiateDelete(invoice)} title="Delete" className="text-rose-600 hover:text-rose-700 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CENTERED ROUNDED PAGINATION CONTROLS */}
        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center pt-6 pb-2">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              
              {/* Previous Button */}
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      disabled={loading}
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
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>
          </div>
        )}

        {/* Modal View Popup */}
        {viewing && <InvoiceView invoice={viewing} close={() => setViewing(null)} edit={() => navigate('/dashboard/create-new', { state: { invoice: viewing } })} />}

        {/* CENTERED DELETE CONFIRMATION MODAL POPUP */}
        {invoiceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all scale-100">
              
              {/* Close Button */}
              <button
                onClick={() => setInvoiceToDelete(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 text-center">
                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Confirm Invoice Deletion
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Are you sure you want to permanently delete this invoice? This action cannot be undone.
                </p>

                {/* Target Details Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-6 text-left">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    Invoice: {numberOf(invoiceToDelete)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Client: <span className="font-medium text-slate-700">{clientOf(invoiceToDelete)}</span> | Amount: <span className="font-semibold text-slate-700">{money(totalOf(invoiceToDelete))}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setInvoiceToDelete(null)}
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
                        <Trash2 className="w-4 h-4" /> Delete Invoice
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function Card({ label, value, detail, icon: Icon, colour }) {
  const colors = {
    blue: 'border-l-blue-500 text-blue-500',
    emerald: 'border-l-emerald-500 text-emerald-500',
    amber: 'border-l-amber-500 text-amber-500',
    rose: 'border-l-rose-500 text-rose-500',
    purple: 'border-l-purple-500 text-purple-500',
  };
  return (
    <div className={`flex items-center justify-between rounded-3xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${colors[colour]}`}>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
      <Icon className="h-6 w-6" />
    </div>
  );
}

function InvoiceView({ invoice, close, edit }) { 
  const summary = summaryOf(invoice); 
  const items = invoice.items || invoice.lineItems || []; 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{numberOf(invoice)}</h2>
            <p className="text-sm text-slate-500">{clientOf(invoice)}</p>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
          <p>Invoice date: <b>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '—'}</b></p>
          <p>Due date: <b>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</b></p>
          <p>Status: <b>{invoice.status || 'Pending'}</b></p>
          <p>Case: <b>{invoice.caseName || '—'}</b></p>
        </div>
        <table className="mb-5 w-full text-sm">
          <thead className="border-y bg-slate-50 text-left">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2">SAC</th>
              <th className="p-2">Rate</th>
              <th className="p-2">GST</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id || item.id || index} className="border-b">
                <td className="p-2">{item.description}</td>
                <td className="p-2">{item.sacCode}</td>
                <td className="p-2">{money(item.rate)}</td>
                <td className="p-2">{item.taxPercent || 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><b>{money(summary.subtotal)}</b></p>
          <p className="flex justify-between"><span>Discount</span><b>{money(summary.discountAmount)}</b></p>
          <p className="flex justify-between"><span>Taxable amount</span><b>{money(summary.taxableAmount)}</b></p>
          <p className="flex justify-between"><span>GST</span><b>{money(summary.gstAmount)}</b></p>
          <p className="flex justify-between"><span>Adjustment</span><b>{money(invoice.adjustment)}</b></p>
          <p className="flex justify-between border-t pt-2 text-base font-bold text-slate-900"><span>Total</span><b>{money(totalOf(invoice))}</b></p>
        </div>
        <p className="mt-5 text-sm"><b>Notes:</b> {invoice.notes || '—'}</p>
        <p className="mt-2 text-sm"><b>Terms:</b> {invoice.terms || '—'}</p>
        <button onClick={edit} className="mt-5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm text-white font-medium transition-colors">
          Edit Invoice
        </button>
      </div>
    </div>
  ); 
}

export default Invoices;