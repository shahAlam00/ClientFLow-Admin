import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  X 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

function CreateCreditNote() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingNote = state?.creditNote;

  // Clients state for dynamic dropdown
  const [clients, setClients] = useState([]);

  // Credit Note Details States
  const [client, setClient] = useState('');
  const [creditDate, setCreditDate] = useState('2026-07-13');
  const [relatedInvoice, setRelatedInvoice] = useState('');
  const [reason, setReason] = useState('Other - Specify in notes');
  const [reasonDescription, setReasonDescription] = useState('');

  // Items Settings
  const [defaultTaxRate, setDefaultTaxRate] = useState('18');
  const [isIgst, setIsIgst] = useState(false);

  // Credit Items State
  const [creditItems, setCreditItems] = useState([
    { id: 1, description: '', qty: 1, unitPrice: 0, taxPercent: 18 }
  ]);

  // Additional Information States
  const [internalNotes, setInternalNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    'This credit note is valid for 1 year from the date of issue.'
  );

  const [summary, setSummary] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalCredit: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch clients from backend on mount with debugging & correct nested data handling
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        console.log('API Clients Response:', response.data);
        const rawClientData = response.data;
        
        // Handle nested response data structure (response.data.data)
        const clientData = Array.isArray(rawClientData) 
          ? rawClientData 
          : (Array.isArray(rawClientData?.data) ? rawClientData.data : (rawClientData?.data?.data || rawClientData?.clients || rawClientData?.result || []));
        
        setClients(clientData);
      } catch (err) {
        console.error('Failed to load clients:', err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (!editingNote) return;
    
    // Handle client name mapping if stored as object or string
    const resolvedClient = typeof editingNote.client === 'string' 
      ? editingNote.client 
      : (editingNote.client?.firstName && editingNote.client?.lastName 
          ? `${editingNote.client.firstName} ${editingNote.client.lastName}`.trim() 
          : editingNote.client?.name || editingNote.clientName || '');

    setClient(resolvedClient);
    setCreditDate(editingNote.creditDate || ''); 
    setRelatedInvoice(editingNote.relatedInvoice || '');
    setReason(editingNote.reason || 'Other - Specify in notes'); 
    setReasonDescription(editingNote.reasonDescription || '');
    setDefaultTaxRate(String(editingNote.defaultTaxRate || 18)); 
    setIsIgst(Boolean(editingNote.isIgst));
    const savedItems = editingNote.creditItems || editingNote.items || [];
    setCreditItems(savedItems.map((item, index) => ({ ...item, id: item.id || item._id || Date.now() + index })));
    setInternalNotes(editingNote.internalNotes || ''); 
    setTermsAndConditions(editingNote.termsAndConditions || '');
  }, [editingNote]);

  // Live calculation arithmetic engine
  useEffect(() => {
    let subtotal = 0;
    let totalTax = 0;

    creditItems.forEach(item => {
      const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
      subtotal += amount;
      
      const taxRate = Number(item.taxPercent) / 100;
      totalTax += amount * taxRate;
    });

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIgst) {
      igst = totalTax;
    } else {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
    }

    const totalCredit = subtotal + totalTax;

    setSummary({
      subtotal,
      cgst,
      sgst,
      igst,
      totalCredit
    });
  }, [creditItems, isIgst]);

  const handleAddItem = () => {
    setCreditItems([
      ...creditItems,
      { id: Date.now(), description: '', qty: 1, unitPrice: 0, taxPercent: Number(defaultTaxRate) }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (creditItems.length > 1) {
      setCreditItems(creditItems.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setCreditItems(creditItems.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const saveCreditNote = async () => {
    setError('');
    const payload = { client, creditDate, relatedInvoice, reason, reasonDescription, defaultTaxRate: Number(defaultTaxRate), isIgst, creditItems, internalNotes, termsAndConditions, summary };
    try { 
      setIsSaving(true); 
      if (editingNote) {
        await api.put(`/creditnotes/${editingNote._id || editingNote.id}`, payload);
      } else {
        await api.post('/creditnotes', payload);
      } 
      navigate('/dashboard/credit-notes'); 
    }
    catch (requestError) { 
      setError(requestError.response?.data?.message || 'Credit note could not be saved.'); 
    }
    finally { 
      setIsSaving(false); 
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-700 ">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Page Header Title */}
          <div className="flex items-start gap-3 pb-2">
            <button onClick={() => navigate('/dashboard/credit-notes')} className="mt-1 p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">New Credit Note</h1>
              <p className="text-base text-slate-500 mt-1">Issue a credit note for refunds, adjustments, or corrections</p>
            </div>
          </div>

          {/* Block 1: Credit Note Details */}
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2563eb] font-semibold text-base">
              <FileText className="w-5 h-5" />
              <span>Credit Note Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Client <span className="text-red-500">*</span></label>
                <select 
                  value={client} 
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base focus:outline-none focus:border-blue-500 cursor-pointer text-slate-800"
                >
                  <option value="" className="bg-white text-slate-700">Select client...</option>
{clients.map((c) => {
                    // Agar firstName ya lastName mein se koi bhi ho toh use karo, warna companyName ya baaki fields uthao
                    const clientName = (c.firstName || c.lastName)
                      ? `${c.firstName || ''} ${c.lastName || ''}`.trim() 
                      : (c.companyName || c.name || c.clientName || c.fullName || c.username || `${c.clientType || 'Client'} (${c._id ? c._id.slice(-4) : ''})`);
                    
                    if (!clientName) return null;
                    return (
                      <option key={c._id || c.id || clientName} value={clientName} className="bg-white text-slate-800 py-1.5">
                        {clientName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Credit Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" value={creditDate} onChange={(e) => setCreditDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Related Invoice (Optional)</label>
                <select 
                  value={relatedInvoice} onChange={(e) => setRelatedInvoice(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="" className="bg-white text-slate-700">-- No specific invoice --</option>
                  <option value="INV-001" className="bg-white text-slate-700">INV-001</option>
                </select>
                <span className="text-xs text-slate-500 mt-1.5 block">Select a client first to see their invoices</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason <span className="text-red-500">*</span></label>
                <select 
                  value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base focus:outline-none text-slate-800 cursor-pointer"
                >
                  <option className="bg-white text-slate-700">Other - Specify in notes</option>
                  <option className="bg-white text-slate-700">Correction in Invoice</option>
                  <option className="bg-white text-slate-700">Product Refund</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reason Description</label>
              <textarea 
                rows="3" value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)}
                placeholder="Explain the reason for this credit note..."
                className="w-full p-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Block 2: Credit Items Matrix */}
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900">Credit Items</h3>
              <button 
                type="button" onClick={handleAddItem}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Control Strip Config Panel */}
            <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap items-center gap-6 text-sm text-slate-700 mb-6 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="font-medium">Default Tax Rate:</span>
                <select value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg focus:outline-none text-slate-800 font-medium">
                  <option value="18" className="bg-white text-slate-700">18%</option>
                  <option value="12" className="bg-white text-slate-700">12%</option>
                  <option value="5" className="bg-white text-slate-700">5%</option>
                  <option value="0" className="bg-white text-slate-700">0%</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2.5 cursor-pointer select-none font-medium">
                <input type="checkbox" checked={isIgst} onChange={(e) => setIsIgst(e.target.checked)} className="rounded border-slate-300 accent-blue-600 w-4 h-4" />
                <span>IGST (Inter-state supply)</span>
              </label>
            </div>

            {/* Dynamic Grid Form Layout Row */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] border-collapse text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-3">
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 w-24 text-center">Qty</th>
                    <th className="py-3 px-2 w-32 text-center">Unit Price</th>
                    <th className="py-3 px-2 w-32 text-right">Amount</th>
                    <th className="py-3 px-2 w-28 text-center">Tax %</th>
                    <th className="py-3 px-2 w-32 text-right">Tax Amt</th>
                    <th className="py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-base">
                  {creditItems.map((item) => {
                    const lineAmount = (item.qty || 0) * (item.unitPrice || 0);
                    const lineTax = lineAmount * ((item.taxPercent || 0) / 100);
                    return (
                      <tr key={item.id} className="group">
                        <td className="py-4 px-2">
                          <input 
                            type="text" placeholder="Item description..." value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input 
                            type="number" min="1" value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:outline-none text-sm font-medium"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input 
                            type="number" min="0" value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:outline-none text-sm font-medium"
                          />
                        </td>
                        <td className="py-4 px-3 text-right text-sm font-semibold text-slate-900">
                          ₹{lineAmount.toFixed(0)}
                        </td>
                        <td className="py-4 px-2">
                          <select 
                            value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', Number(e.target.value))}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-center focus:outline-none text-sm text-slate-800"
                          >
                            <option value="18" className="bg-white text-slate-700">18%</option>
                            <option value="12" className="bg-white text-slate-700">12%</option>
                            <option value="5" className="bg-white text-slate-700">5%</option>
                            <option value="0" className="bg-white text-slate-700">0%</option>
                          </select>
                        </td>
                        <td className="py-4 px-3 text-right text-sm font-semibold text-slate-600">
                          ₹{lineTax.toFixed(0)}
                        </td>
                        <td className="py-4 text-center">
                          <button 
                            type="button" onClick={() => handleRemoveItem(item.id)} disabled={creditItems.length === 1}
                            className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Price Calculations Tabular Module */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <div className="space-y-3 text-sm text-slate-700 w-full max-w-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal:</span>
                  <span className="font-bold text-slate-900 text-base">₹{summary.subtotal.toFixed(0)}</span>
                </div>
                {!isIgst ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">CGST:</span>
                      <span className="font-bold text-slate-900 text-base">₹{summary.cgst.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">SGST:</span>
                      <span className="font-bold text-slate-900 text-base">₹{summary.sgst.toFixed(0)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">IGST:</span>
                    <span className="font-bold text-slate-900 text-base">₹{summary.igst.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-2">
                  <span className="text-base font-bold text-slate-900">Total Credit:</span>
                  <span className="text-lg font-extrabold text-emerald-600">₹{summary.totalCredit.toFixed(0)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Block 3: Additional Information textareas */}
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Internal Notes</label>
                <textarea 
                  rows="3" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes (not shown to client)..."
                  className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Terms & Conditions</label>
                <textarea 
                  rows="3" value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Submission Control Bar */}
          <div className="bg-white border border-slate-200/70 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <button type="button" onClick={() => navigate('/dashboard/credit-notes')} className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <div className="flex items-center gap-4">
              {error && <p role="alert" className="text-sm text-rose-600 font-medium">{error}</p>}
              <button 
                type="button" 
                onClick={saveCreditNote}
                disabled={isSaving}
                style={{ backgroundColor: '#D4AF37' }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white hover:opacity-90 rounded-xl transition-all shadow-sm"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : editingNote ? 'Update Credit Note' : 'Create Credit Note'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateCreditNote;