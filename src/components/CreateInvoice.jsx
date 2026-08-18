import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Save, 
  Eye,
  MessageSquareMore
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

function CreateInvoice() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingInvoice = state?.invoice;
  
  // Form Input States
  const [client, setClient] = useState('');
  const [caseName, setCaseName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2026-07-13');
  const [dueDate, setDueDate] = useState('2026-08-12');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  
  // Validation States for Inline Warnings
  const [clientError, setClientError] = useState('');
  const [invoiceDateError, setInvoiceDateError] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const [lineItemErrors, setLineItemErrors] = useState({});

  // Table Items State
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', sacCode: '998211', rate: 0, taxPercent: 18 }
  ]);

  // Pricing Calculation States
  const [discountType, setDiscountType] = useState('%');
  const [discountValue, setDiscountValue] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxableAmount: 0,
    gstAmount: 0,
    total: 0
  });

  useEffect(() => {
    if (!editingInvoice) return;
    setClient(typeof editingInvoice.client === 'string' ? editingInvoice.client : editingInvoice.client?.name || editingInvoice.clientName || '');
    setCaseName(editingInvoice.caseName || '');
    setInvoiceDate(editingInvoice.invoiceDate || '');
    setDueDate(editingInvoice.dueDate || '');
    setStatus(editingInvoice.status || 'Pending');
    setNotes(editingInvoice.notes || '');
    setTerms(editingInvoice.terms || '');
    const savedItems = editingInvoice.items || editingInvoice.lineItems || [];
    setLineItems(savedItems.map((item, index) => ({ ...item, id: item.id || item._id || Date.now() + index })));
    setDiscountType(editingInvoice.discountType || '%');
    setDiscountValue(Number(editingInvoice.discountValue || 0));
    setAdjustment(Number(editingInvoice.adjustment || 0));
    setAdjustmentReason(editingInvoice.adjustmentReason || '');
  }, [editingInvoice]);

  // Calculate fields dynamically
  useEffect(() => {
    let subtotal = 0;
    let gstTotal = 0;

    lineItems.forEach(item => {
      const itemAmount = Number(item.rate) || 0;
      subtotal += itemAmount;
      const itemGst = itemAmount * (Number(item.taxPercent) / 100);
      gstTotal += itemGst;
    });

    let discountAmount = 0;
    if (discountType === '%') {
      discountAmount = subtotal * (Number(discountValue) / 100);
    } else {
      discountAmount = Number(discountValue) || 0;
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const gstRatio = subtotal > 0 ? (gstTotal / subtotal) : 0.18;
    const adjustedGst = taxableAmount * gstRatio;
    const total = taxableAmount + adjustedGst + (Number(adjustment) || 0);

    setSummary({
      subtotal,
      discountAmount,
      taxableAmount,
      gstAmount: adjustedGst,
      total
    });
  }, [lineItems, discountType, discountValue, adjustment]);

  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), description: '', sacCode: '998211', rate: 0, taxPercent: 18 }
    ]);
  };

  const handleRemoveLine = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
      setLineItemErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`desc_${id}`];
        delete newErrors[`rate_${id}`];
        return newErrors;
      });
    }
  };

  const handleItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => (item.id === id ? { ...item, [field]: value } : item)));
    
    // Clear inline error on typing
    if (field === 'description' && value.trim()) {
      setLineItemErrors(prev => ({ ...prev, [`desc_${id}`]: '' }));
    }
    if (field === 'rate' && Number(value) >= 0) {
      setLineItemErrors(prev => ({ ...prev, [`rate_${id}`]: '' }));
    }
  };

  const handleBack = () => {
    navigate('/dashboard/invoices');
  };

  const handleCreateInvoice = async () => {
    setError('');
    let isValid = true;

    // 1. Inline validation for Client
    if (!client.trim()) {
      setClientError('Client name is required.');
      isValid = false;
    } else {
      setClientError('');
    }

    // 2. Inline validation for Dates
    if (!invoiceDate) {
      setInvoiceDateError('Invoice date is required.');
      isValid = false;
    } else {
      setInvoiceDateError('');
    }

    if (!dueDate) {
      setDueDateError('Due date is required.');
      isValid = false;
    } else {
      setDueDateError('');
    }

    // 3. Inline validation for Line Items (Description & Rate)
    const newErrors = {};
    lineItems.forEach(item => {
      if (!item.description || !item.description.trim()) {
        newErrors[`desc_${item.id}`] = 'Description is required.';
        isValid = false;
      }
      if (item.rate === '' || item.rate === undefined || Number(item.rate) <= 0) {
        newErrors[`rate_${item.id}`] = 'Rate must be greater than 0.';
        isValid = false;
      }
    });
    setLineItemErrors(newErrors);

    if (!isValid) {
      return;
    }

    const payload = {
      client,
      caseName,
      invoiceDate,
      dueDate,
      status,
      items: lineItems,
      summary,
      discountType,
      discountValue,
      adjustment,
      adjustmentReason,
      notes,
      terms,
    };
    try {
      setIsSaving(true);
      if (editingInvoice) {
        await api.put(`/invoices/${editingInvoice._id || editingInvoice.id}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      navigate('/dashboard/invoices');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Invoice could not be created.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/70 font-sans antialiased text-slate-700">
        <div className="max-w-7xl mx-auto ">
          
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
            </div>
            <button onClick={handleBack} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Invoice Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Invoice Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={client} 
                        onChange={(e) => {
                          setClient(e.target.value);
                          if (e.target.value.trim()) setClientError('');
                        }} 
                        placeholder="Search or enter client name..." 
                        className={`w-full pl-10 pr-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${clientError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                      />
                    </div>
                    {clientError && <p className="mt-1.5 text-xs font-medium text-rose-600">{clientError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Case (Optional)</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={caseName} 
                        onChange={(e) => setCaseName(e.target.value)} 
                        placeholder="Search case..." 
                        className="w-full pl-10 pr-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Date *</label>
                    <input 
                      type="date" 
                      value={invoiceDate} 
                      onChange={(e) => {
                        setInvoiceDate(e.target.value);
                        if (e.target.value) setInvoiceDateError('');
                      }} 
                      className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${invoiceDateError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                    />
                    {invoiceDateError && <p className="mt-1.5 text-xs font-medium text-rose-600">{invoiceDateError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date *</label>
                    <input 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (e.target.value) setDueDateError('');
                      }} 
                      className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${dueDateError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                    />
                    {dueDateError && <p className="mt-1.5 text-xs font-medium text-rose-600">{dueDateError}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Complete">Complete</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Invoice Line Items */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Invoice Line Items</h3>
                  <button 
                    type="button" 
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Line
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-3 w-2/5">Description *</th>
                        <th className="py-3 px-3">SAC Code</th>
                        <th className="py-3 px-3 w-28">Rate (₹) *</th>
                        <th className="py-3 px-3">Amount (₹)</th>
                        <th className="py-3 px-3 w-20">Tax %</th>
                        <th className="py-3 px-3 text-right w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 align-top">
                          <td className="py-4 px-2">
                            <input 
                              type="text" 
                              placeholder="Item description..." 
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${lineItemErrors[`desc_${item.id}`] ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                            />
                            {lineItemErrors[`desc_${item.id}`] && (
                              <p className="mt-1.5 text-xs font-medium text-rose-600">{lineItemErrors[`desc_${item.id}`]}</p>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <select 
                              value={item.sacCode} 
                              onChange={(e) => handleItemChange(item.id, 'sacCode', e.target.value)}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-sm text-slate-800 bg-white cursor-pointer"
                            >
                              <option value="998211">998211</option>
                              <option value="998212">998212</option>
                              <option value="998311">998311</option>
                            </select>
                          </td>
                          <td className="py-4 px-2">
                            <input 
                              type="number" 
                              min="0" 
                              value={item.rate}
                              onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-right ${lineItemErrors[`rate_${item.id}`] ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                            />
                            {lineItemErrors[`rate_${item.id}`] && (
                              <p className="mt-1.5 text-xs font-medium text-rose-600">{lineItemErrors[`rate_${item.id}`]}</p>
                            )}
                          </td>
                          <td className="py-4 px-3 font-semibold text-slate-900 text-sm pt-5">
                            ₹{(Number(item.rate) || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-2">
                            <input 
                              type="number" 
                              value={item.taxPercent}
                              onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-sm text-center"
                            />
                          </td>
                          <td className="py-4 px-2 text-right pt-4">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveLine(item.id)} 
                              disabled={lineItems.length === 1}
                              className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-xl transition-colors hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 3: Notes & Terms */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Notes & Terms</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Internal Notes</label>
                    <textarea 
                      rows="3" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Add internal notes..."
                      className="w-full p-3.5 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Terms & Conditions</label>
                    <textarea 
                      rows="3" 
                      value={terms} 
                      onChange={(e) => setTerms(e.target.value)} 
                      placeholder="Enter payment terms..."
                      className="w-full p-3.5 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    ></textarea>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side Sidebar Summary Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Invoice Summary</h3>
              
              <div className="space-y-4 text-base text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{summary.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Discount</span>
                  <div className="flex items-center gap-2 max-w-[160px]">
                    <select 
                      value={discountType} 
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="%">%</option>
                      <option value="₹">₹</option>
                    </select>
                    <input 
                      type="number" 
                      min="0" 
                      value={discountValue} 
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-right focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-3.5">
                  <span className="text-slate-500">Taxable Amount</span>
                  <span className="font-semibold text-slate-900">₹{summary.taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">GST</span>
                  <span className="font-semibold text-slate-900">₹{summary.gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3.5">
                  <span className="text-slate-500">Adjustment</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={adjustment} 
                      onChange={(e) => setAdjustment(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm text-right focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Reason for adjustment" 
                      value={adjustmentReason} 
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4 pb-2">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">₹{summary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div className="space-y-3 pt-2">
                {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
                <button 
                  type="button" 
                  onClick={handleCreateInvoice} 
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
                <button 
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
                >
                  <Eye className="w-5 h-5 text-slate-500" /> Preview Invoice
                </button>
                <button type="button" onClick={handleBack} className="w-full px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 text-center block">
                  Cancel
                </button>
              </div>

              <div className="text-xs text-slate-400 text-center pt-3 border-t border-slate-100">
                {lineItems.length} line item{lineItems.length > 1 ? 's' : ''} added
              </div>
            </div>

          </div>
        </div>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-105 transition-all">
            <MessageSquareMore className="w-6 h-6" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default CreateInvoice;