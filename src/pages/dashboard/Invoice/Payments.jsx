import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquareMore,
  X,
  Coins,
  Building2,
  Smartphone,
  CreditCard,
  Globe,
  AlertTriangle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import api from '@/lib/axios';
import { filterPayments } from './paymentsFilterUtils';

const ITEMS_PER_PAGE = 6;

function Payments() {
  // Modal Open/Close Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form State Values & Field Validation Errors
  const [clientSearch, setClientSearch] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [receivedDate, setReceivedDate] = useState('2026-07-13');
  const [paymentMethod, setPaymentMethod] = useState('Bank');
  const [referenceUtr, setReferenceUtr] = useState('');
  const [bankName, setBankName] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [tdsDeducted, setTdsDeducted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Completed');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const loadPayments = async () => {
    try {
      const response = await api.get('/payments');
      const data = response.data?.data ?? response.data;
      setPayments(Array.isArray(data) ? data : data?.payments ?? []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Payments could not be loaded.');
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const openEdit = (payment) => {
    setEditingPayment(payment);
    setClientSearch(payment.client?.name || payment.clientSearch || payment.client || '');
    setAmount(String(payment.amount || 0));
    setReceivedDate(payment.receivedDate || '');
    setPaymentMethod(payment.paymentMethod || 'Bank');
    setReferenceUtr(payment.referenceUtr || '');
    setBankName(payment.bankName || '');
    setSkipReason(payment.skipReason || '');
    setTdsDeducted(Boolean(payment.tdsDeducted));
    setPaymentStatus(payment.paymentStatus || payment.status || 'Completed');
    setNotes(payment.notes || '');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingPayment(null);
    setClientSearch('');
    setAmount('0.00');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setReferenceUtr('');
    setBankName('');
    setSkipReason('');
    setTdsDeducted(false);
    setPaymentStatus('Completed');
    setNotes('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPayment) return;
    setIsDeleting(true);
    try {
      await api.delete(`/payments/${deletingPayment._id || deletingPayment.id}`);
      setPayments((items) => items.filter((item) => (item._id || item.id) !== (deletingPayment._id || deletingPayment.id)));
      setDeletingPayment(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Payment could not be deleted.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    // Inline field validations (No Popup Alerts)
    const errors = {};
    if (!clientSearch.trim()) {
      errors.clientSearch = 'Please enter or select a client.';
    }
    if (!amount || Number(amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0.';
    }
    if (!receivedDate) {
      errors.receivedDate = 'Received date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      client: clientSearch,
      amount: Number(amount),
      receivedDate,
      paymentMethod,
      referenceUtr,
      bankName,
      skipReason,
      tdsDeducted,
      paymentStatus,
      notes
    };

    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id || editingPayment.id}`, payload);
      } else {
        await api.post('/payments', payload);
      }
      setIsModalOpen(false);
      await loadPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Payment could not be saved.');
    }
  };

  // Real-time Search Filtering
  const filteredPayments = useMemo(() => {
    return filterPayments(payments, searchTerm, statusFilter);
  }, [payments, searchTerm, statusFilter]);

  // Reset pagination on search input change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination Logic (6 items per page)
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  const paymentSummary = useMemo(() => {
    const now = new Date();
    const completed = payments.filter((payment) => (payment.paymentStatus || payment.status || '').toLowerCase() === 'completed');
    const pending = payments.filter((payment) => (payment.paymentStatus || payment.status || '').toLowerCase() === 'pending');
    const thisMonth = payments.filter((payment) => {
      if (!payment.receivedDate) return false;
      const date = new Date(`${payment.receivedDate}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    return {
      totalReceived: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      thisMonth: thisMonth.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      completed: completed.length,
      pending: pending.length,
    };
  }, [payments]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(value);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-600 relative ">
        <div className="max-w-7xl mx-auto">

          {/* Top Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-start gap-3">
              <button className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-600">₹</span>
                  <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Payments</h1>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">Record and manage client payments</p>
              </div>
            </div>

            {/* Primary Action Button (#D4AF37 Gold Theme) */}
            <button
              onClick={openCreate}
              style={{ backgroundColor: '#D4AF37' }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white hover:bg-[#b8952e] rounded-xl shadow-md shadow-[#D4AF37]/20 hover:shadow-lg transition-all active:scale-[0.98] self-start sm:self-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Record Payment
            </button>
          </div>

          {/* Gold Accent Stat Cards */}
          <div className="flex flex-row gap-5 mb-8 overflow-x-auto pb-3 scrollbar-none snap-x">
            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-5 rounded-[16px] border border-slate-200/60 shadow-sm flex items-center gap-4 min-w-[260px] flex-1 snap-start">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><IndianRupee className="w-5 h-5 stroke-[2.5]" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Received</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(paymentSummary.totalReceived)}</span>
              </div>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-5 rounded-[16px] border border-slate-200/60 shadow-sm flex items-center gap-4 min-w-[260px] flex-1 snap-start">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="w-5 h-5 stroke-[2.5]" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(paymentSummary.thisMonth)}</span>
              </div>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-5 rounded-[16px] border border-slate-200/60 shadow-sm flex items-center gap-4 min-w-[260px] flex-1 snap-start">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5 stroke-[2.5]" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-0.5">{paymentSummary.completed}</span>
              </div>
            </div>

            <div style={{ borderLeft: '5px solid #D4AF37' }} className="bg-white p-5 rounded-[16px] border border-slate-200/60 shadow-sm flex items-center gap-4 min-w-[260px] flex-1 snap-start">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5 stroke-[2.5]" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
                <span className="text-xl font-extrabold text-amber-600 mt-0.5">{paymentSummary.pending}</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 border border-slate-200/60 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center mb-6">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by payment number, client, status..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-400 text-slate-800"
              />
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 w-full sm:w-auto justify-center shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filters
              </button>
              {showFilters && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              )}
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}

          {/* Table Container Area */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {filteredPayments.length > 0 ? (
              <div>
                <div className="w-full overflow-x-auto text-left">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Payment #</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedPayments.map((payment) => (
                        <tr key={payment._id || payment.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-medium text-slate-800">{payment.paymentNumber || payment._id || payment.id}</td>
                          <td className="p-3 font-medium text-slate-700">{payment.client?.name || payment.clientSearch || payment.client || '—'}</td>
                          <td className="p-3 text-slate-500">{payment.receivedDate || '—'}</td>
                          <td className="p-3 text-slate-600">{payment.paymentMethod || 'Bank'}</td>
                          <td className="p-3 font-semibold text-slate-900">₹{Number(payment.amount || 0).toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${(payment.paymentStatus || payment.status || '').toLowerCase() === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              }`}>
                              {payment.paymentStatus || payment.status || 'Completed'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingPayment(payment)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEdit(payment)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit Payment"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingPayment(payment)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Payment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Credit Notes Style Centered Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={currentPage === page ? { backgroundColor: '#D4AF37' } : {}}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page
                              ? 'text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center my-auto py-12">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4 border border-slate-100">
                  <IndianRupee className="w-9 h-9 stroke-[1.25]" />
                </div>
                <h4 className="text-base font-semibold text-slate-800 tracking-tight">No payments found</h4>
                <p className="text-xs text-slate-400 mt-1">Try recording a new payment or adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTERED MODAL DIALOG (RECORD / EDIT PAYMENT)             */}
        {/* ========================================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300">

              {/* Modal Header */}
              <div className="bg-[#f2fbf7] p-4 px-6 border-b border-emerald-100/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <span className="text-xl font-bold">₹</span>
                  <h3 className="text-lg font-bold tracking-tight text-slate-800">{editingPayment ? 'Edit Payment' : 'Record Payment'}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

         {/* Scrollable Form Body */}
              <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">

                {/* Client Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Client <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Search client (text only)..."
                        value={clientSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Reject input if it contains numbers/digits
                          if (/\d/.test(val)) return;

                          setClientSearch(val);
                          if (fieldErrors.clientSearch) setFieldErrors(prev => ({ ...prev, clientSearch: '' }));
                        }}
                        className={`w-full pl-9 pr-8 py-2 text-xs border rounded-lg focus:outline-none ${fieldErrors.clientSearch ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 bg-white focus:border-[#D4AF37]'
                          }`}
                      />
                    </div>
                    {/* Inline Error Warning */}
                    {fieldErrors.clientSearch && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.clientSearch}</p>
                    )}
                  </div>
                  <div className="md:mt-6">
                    <p className="text-[11px] italic text-slate-400 leading-normal">
                      No pending invoices - payment will be recorded as Advance
                    </p>
                  </div>
                </div>

                {/* Amount and Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          if (fieldErrors.amount) setFieldErrors(prev => ({ ...prev, amount: '' }));
                        }}
                        className={`w-full pl-7 pr-3 py-2 text-xs border rounded-lg font-semibold focus:outline-none text-slate-800 ${fieldErrors.amount ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#D4AF37]'
                          }`}
                      />
                    </div>
                    {/* Inline Error Warning */}
                    {fieldErrors.amount && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.amount}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Received On <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={receivedDate}
                      onChange={(e) => {
                        setReceivedDate(e.target.value);
                        if (fieldErrors.receivedDate) setFieldErrors(prev => ({ ...prev, receivedDate: '' }));
                      }}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none text-slate-700 ${fieldErrors.receivedDate ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#D4AF37]'
                        }`}
                    />
                    {/* Inline Error Warning */}
                    {fieldErrors.receivedDate && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.receivedDate}</p>
                    )}
                  </div>
                </div>

                {/* Payment Methods Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Payment Method <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Cash', label: 'Cash', icon: Coins },
                      { id: 'Cheque', label: 'Cheque', icon: FileCheck },
                      { id: 'Bank', label: 'Bank', icon: Building2 },
                      { id: 'UPI', label: 'UPI', icon: Smartphone },
                      { id: 'Credit/Debit', label: 'Credit/Debit', icon: CreditCard },
                      { id: 'Online', label: 'Online', icon: Globe }
                    ].map((method) => {
                      const IconComponent = method.icon;
                      const isActive = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2 border text-xs font-medium rounded-lg transition-all ${isActive
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                          <IconComponent className="w-3.5 h-3.5 opacity-80" />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank / Reference Details */}
                <div className="bg-purple-50/30 border border-purple-100/50 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Transaction Reference / UTR <span className="text-[10px] font-medium text-purple-500">(recommended)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter reference number"
                        value={referenceUtr}
                        onChange={(e) => setReferenceUtr(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g., HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="bg-[#fffbeb] border border-amber-200 rounded-lg p-3 text-amber-800 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>A reference number is recommended for bank-transfer payments. Bank reconciliation depends on it.</span>
                    </div>
                    <p className="text-slate-500">Enter a UTR/transaction ID above, or pick a reason below to proceed without one.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for skipping reference</label>
                    <select
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-700"
                    >
                      <option value="">— Select a reason —</option>
                      <option>UTR not yet available</option>
                      <option>Cash deposit at branch</option>
                      <option>Internal transfer</option>
                      <option>Backdated entry</option>
                      <option>Reference will be added later</option>
                    </select>
                  </div>
                </div>

                {/* TDS Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={tdsDeducted}
                    onChange={(e) => setTdsDeducted(e.target.checked)}
                    className="rounded border-slate-300 accent-emerald-600 w-3.5 h-3.5"
                  />
                  <span className="text-xs font-semibold text-slate-700">TDS Deducted by Client (Section 194J)</span>
                </label>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-700 font-medium"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Completed</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                    <option>Cancelled</option>
                    <option>Cheque Bounced</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Enter any private notes regarding this transaction..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none resize-none text-slate-800"
                  />
                </div>

              </form>
              {/* Modal Footer Actions */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSave}
                  style={{ backgroundColor: '#D4AF37' }}
                  className="px-5 py-2.5 text-xs font-bold text-white hover:bg-[#b8952e] rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  {editingPayment ? 'Update Payment' : 'Record Payment'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CENTERED GOLD DELETE CONFIRMATION MODAL POPUP             */}
        {/* ========================================================= */}
        {deletingPayment && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white  max-w-sm rounded-2xl shadow-2xl p-6 text-center border border-slate-100 transform scale-100 transition-all">
              <div className="w-12 h-12 bg-amber-50 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Payment</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingPayment(null)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  style={{ backgroundColor: '#D20A2E' }}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white hover:bg-[#b8952e] rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Payment Modal */}
        {viewingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
                <button onClick={() => setViewingPayment(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Client:</span> <b className="text-slate-800">{viewingPayment.client?.name || viewingPayment.clientSearch || viewingPayment.client || '—'}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Amount:</span> <b className="text-slate-800">₹{Number(viewingPayment.amount || 0).toFixed(2)}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Date:</span> <b className="text-slate-800">{viewingPayment.receivedDate || '—'}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Method:</span> <b className="text-slate-800">{viewingPayment.paymentMethod || '—'}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Reference:</span> <b className="text-slate-800">{viewingPayment.referenceUtr || '—'}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Bank:</span> <b className="text-slate-800">{viewingPayment.bankName || '—'}</b></p>
                <p className="flex justify-between py-1 border-b border-slate-50"><span>Status:</span> <b className="text-slate-800">{viewingPayment.paymentStatus || viewingPayment.status || '—'}</b></p>
                <p className="flex justify-between py-1"><span>Notes:</span> <b className="text-slate-800">{viewingPayment.notes || '—'}</b></p>
              </div>
              <button
                onClick={() => { setViewingPayment(null); openEdit(viewingPayment); }}
                style={{ backgroundColor: '#D4AF37' }}
                className="mt-6 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#b8952e] transition-all"
              >
                Edit Payment
              </button>
            </div>
          </div>
        )}

        {/* Floating Support Icon */}
        <div className="fixed bottom-6 right-6 z-40">
          <button className="p-3.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-xl transition-all">
            <MessageSquareMore className="w-5 h-5" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Payments;