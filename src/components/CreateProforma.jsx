import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Percent,
  AlertCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

function CreateProforma() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingProforma = state?.proforma;

  // States for dynamic dropdowns
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([
    { id: 1, title: 'Law' },
    { id: 2, title: 'RERA' },
    { id: 3, title: 'Civil Litigation' },
    { id: 4, title: 'Criminal Defense' },
    { id: 5, title: 'Corporate Advisory' },
    { id: 6, title: 'Family Dispute' }
  ]);

  // Client & Case Details States
  const [client, setClient] = useState('');
  const [caseName, setCaseName] = useState('');

  // Dates & Payment Terms States
  const [proformaDate, setProformaDate] = useState('2026-07-13');
  const [validUntil, setValidUntil] = useState('2026-08-12');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');
  const [placeOfSupply, setPlaceOfSupply] = useState('');

  // Global Settings for Items
  const [defaultTax, setDefaultTax] = useState('18');
  const [isIgst, setIsIgst] = useState(false);
  const [sacCode, setSacCode] = useState('998211');

  // Line Items List State
  const [lineItems, setLineItems] = useState([
    { id: 1, type: 'Professional Fee', description: '', qty: 1, unit: 'Nos', rate: 0, taxPercent: 18 }
  ]);

  // Discount & Summary Calculation States
  const [discountType, setDiscountType] = useState('%');
  const [discountValue, setDiscountValue] = useState(0);

  const [summary, setSummary] = useState({
    subtotal: 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0
  });

  const [internalNotes, setInternalNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    `1. This is a proforma invoice (quotation) and not a demand for payment.\n2. Prices are valid until the date mentioned above.\n3. GST will be charged as applicable.`
  );
  const [isSaving, setIsSaving] = useState(false);
  
  // Validation States
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');
  const [itemErrors, setItemErrors] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching clients...');
        const clientRes = await api.get('/clients');
        console.log('Client API Raw Response:', clientRes.data);
        
        const rawClientData = clientRes.data;
        
        // Safe check for different backend response formats
        const clientData = Array.isArray(rawClientData) 
          ? rawClientData 
          : (rawClientData?.data || rawClientData?.clients || rawClientData?.result || []);
        
        console.log('Parsed Clients Array:', clientData);
        setClients(clientData);

        // Attempt to fetch custom backend cases if available
        const caseRes = await api.get('/cases').catch(() => ({ data: [] }));
        const caseData = Array.isArray(caseRes.data) 
          ? caseRes.data 
          : (caseRes.data?.cases || caseRes.data?.data || caseRes.data?.result || []);
        
        if (caseData && caseData.length > 0) {
          setCases(caseData);
        }
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    fetchData();
  }, []);

  // Calculate fields dynamically based on line items, tax, and discount
  useEffect(() => {
    let subtotal = 0;
    lineItems.forEach(item => {
      const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      subtotal += amount;
    });

    let discountAmount = 0;
    if (discountType === '%') {
      discountAmount = subtotal * (Number(discountValue) / 100);
    } else {
      discountAmount = Number(discountValue) || 0;
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    lineItems.forEach(item => {
      const itemAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      const itemProportion = subtotal > 0 ? itemAmount / subtotal : 0;
      const itemTaxable = taxableAmount * itemProportion;
      const itemTaxRate = (Number(item.taxPercent) !== undefined ? Number(item.taxPercent) : Number(defaultTax)) / 100;

      if (isIgst) {
        igst += itemTaxable * itemTaxRate;
      } else {
        cgst += (itemTaxable * itemTaxRate) / 2;
        sgst += (itemTaxable * itemTaxRate) / 2;
      }
    });

    const grandTotal = taxableAmount + cgst + sgst + igst;

    setSummary({
      subtotal,
      taxableAmount,
      cgst,
      sgst,
      igst,
      grandTotal
    });
  }, [lineItems, discountType, discountValue, defaultTax, isIgst]);

  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), type: 'Professional Fee', description: '', qty: 1, unit: 'Nos', rate: 0, taxPercent: Number(defaultTax) }
    ]);
  };

  const handleRemoveLine = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
      const updatedErrors = { ...itemErrors };
      delete updatedErrors[id];
      setItemErrors(updatedErrors);
    }
  };

  const handleItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'rate' && Number(value) < 0) {
          setItemErrors(prev => ({ ...prev, [id]: 'Rate cannot be negative' }));
        } else if (field === 'qty' && Number(value) <= 0) {
          setItemErrors(prev => ({ ...prev, [id]: 'Qty must be at least 1' }));
        } else {
          setItemErrors(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }
        return updatedItem;
      }
      return item;
    }));
  };

  useEffect(() => {
    if (!editingProforma) return;
    setClient(typeof editingProforma.client === 'string' ? editingProforma.client : editingProforma.client?.name || editingProforma.clientName || '');
    setCaseName(typeof editingProforma.caseName === 'string' ? editingProforma.caseName : editingProforma.caseName?.title || editingProforma.caseName?.name || '');
    setProformaDate(editingProforma.proformaDate || '');
    setValidUntil(editingProforma.validUntil || '');
    setPaymentTerms(editingProforma.paymentTerms || 'Net 15 Days');
    setPlaceOfSupply(editingProforma.placeOfSupply || '');
    setDefaultTax(String(editingProforma.defaultTax || 18));
    setIsIgst(Boolean(editingProforma.isIgst));
    setSacCode(editingProforma.sacCode || '998211');
    const savedItems = editingProforma.items || editingProforma.lineItems || [];
    setLineItems(savedItems.map((item, index) => ({ ...item, id: item.id || item._id || Date.now() + index })));
    setDiscountType(editingProforma.discountType || '%');
    setDiscountValue(Number(editingProforma.discountValue || 0));
    setInternalNotes(editingProforma.internalNotes || '');
    setTermsAndConditions(editingProforma.termsAndConditions || '');
  }, [editingProforma]);

  const saveProforma = async () => {
    setError('');
    setClientError('');

    if (!client) {
      setClientError('Please select a client from the dropdown.');
      return;
    }

    if (Object.keys(itemErrors).length > 0) {
      setError('Please fix all item validation errors before saving.');
      return;
    }

    const payload = { 
      client, 
      caseName, 
      proformaDate, 
      validUntil, 
      paymentTerms, 
      placeOfSupply, 
      defaultTax: Number(defaultTax), 
      isIgst, 
      sacCode, 
      items: lineItems, 
      discountType, 
      discountValue: Number(discountValue), 
      summary, 
      internalNotes, 
      termsAndConditions 
    };

    try {
      setIsSaving(true);
      if (editingProforma) {
        await api.put(`/proforma/${editingProforma._id || editingProforma.id}`, payload);
      } else {
        await api.post('/proforma', payload);
      }
      navigate('/dashboard/proforma-invoices');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Proforma could not be saved.');
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-700">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Main Top Header Line */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3.5">
              <button onClick={() => navigate('/dashboard/proforma-invoices')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">New Proforma Invoice</h1>
                <p className="text-sm text-slate-500">Create a quotation/estimate for client approval before invoicing</p>
              </div>
            </div>
          </div>

          {/* Section 1: Client & Case Details */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <User className="w-4 h-4 text-blue-500" />
              <span>Client & Case Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client <span className="text-red-500">*</span></label>
                <select 
                  value={client} 
                  onChange={(e) => {
                    setClient(e.target.value);
                    if (e.target.value) setClientError('');
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border ${clientError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer`}
                >
                  <option value="" className="bg-white text-slate-700">Select client...</option>
{clients.map((c) => {
    // Check if firstName/lastName exist, otherwise fall back to companyName, name, or clientType label
    const fullName = (c.firstName || c.lastName)
      ? `${c.firstName || ''} ${c.lastName || ''}`.trim() 
      : (c.companyName || c.name || c.clientName || c.fullName || c.username || `${c.clientType} Client (${c._id.slice(-4)})`);
    
    if (!fullName) return null;
    
    return (
      <option key={c._id || c.id || fullName} value={fullName} className="bg-white text-slate-700 py-1">
        {fullName} {c.companyName ? `(${c.companyName})` : ''}
      </option>
    );
  })}
                </select>
                {clientError && <p className="text-xs text-red-500 mt-1.5 font-medium">{clientError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Case (Optional)</label>
                <select 
                  value={caseName} 
                  onChange={(e) => setCaseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="" className="bg-white text-slate-700">-- No specific case --</option>
                  <option value="Civil Property Dispute" className="bg-white text-slate-700">Civil Property Dispute</option>
                  <option value="Criminal Defense Case" className="bg-white text-slate-700">Criminal Defense Case</option>
                  <option value="Property Ownership Dispute" className="bg-white text-slate-700">Property Ownership Dispute</option>
                  <option value="Cyber Crime Case" className="bg-white text-slate-700">Cyber Crime Case</option>
                  <option value="Family Cases" className="bg-white text-slate-700">Family Cases</option>
                  <option value="Corporate / Commercial" className="bg-white text-slate-700">Corporate / Commercial</option>
                  {cases.map((cs) => {
                    const cName = cs.title || cs.name || cs.caseName || cs.caseTitle;
                    if (!cName) return null;
                    return (
                      <option key={cs._id || cs.id || cName} value={cName} className="bg-white text-slate-700 py-1">
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Dates & Payment Terms */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Dates & Payment Terms</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Proforma Date</label>
                <input 
                  type="date" 
                  value={proformaDate} 
                  onChange={(e) => setProformaDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valid Until</label>
                <input 
                  type="date" 
                  value={validUntil} 
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Terms</label>
                <select 
                  value={paymentTerms} 
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option className="bg-white text-slate-700">Net 15 Days</option>
                  <option className="bg-white text-slate-700">Net 30 Days</option>
                  <option className="bg-white text-slate-700">Due on Receipt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Place of Supply</label>
                <input 
                  type="text" 
                  placeholder="e.g., Haryana" 
                  value={placeOfSupply} 
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none placeholder:text-slate-300 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Services & Items Area Grid Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Services & Items</span>
              </div>
              <button 
                type="button" 
                onClick={handleAddLine}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Default Global Config Control Subheader Bar */}
            <div className="bg-slate-50 p-3.5 rounded-lg flex flex-wrap items-center gap-6 text-sm text-slate-700 mb-5 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="font-medium">Default Tax:</span>
                <select value={defaultTax} onChange={(e) => setDefaultTax(e.target.value)} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md focus:outline-none text-sm text-slate-700">
                  <option value="18" className="bg-white text-slate-700">18%</option>
                  <option value="12" className="bg-white text-slate-700">12%</option>
                  <option value="5" className="bg-white text-slate-700">5%</option>
                  <option value="0" className="bg-white text-slate-700">0%</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                <input type="checkbox" checked={isIgst} onChange={(e) => setIsIgst(e.target.checked)} className="rounded border-slate-300 accent-blue-600 text-white w-4 h-4" />
                <span>IGST (Inter-state)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-medium">SAC Code:</span>
                <input type="text" value={sacCode} onChange={(e) => setSacCode(e.target.value)} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md w-28 text-sm focus:outline-none text-slate-700" />
              </div>
            </div>

            {/* Dynamic Items Rows Structure */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] border-collapse text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-3">
                    <th className="py-3 w-32">Type</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-2 w-20 text-center">Qty</th>
                    <th className="py-3 px-2 w-24 text-center">Unit</th>
                    <th className="py-3 px-2 w-28 text-right">Rate</th>
                    <th className="py-3 px-3 w-28 text-right">Amount</th>
                    <th className="py-3 px-2 w-20 text-center">Tax%</th>
                    <th className="py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {lineItems.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-3.5 pr-2">
                        <select 
                          value={item.type} 
                          onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none text-sm text-slate-700"
                        >
                          <option className="bg-white text-slate-700">Professional Fee</option>
                          <option className="bg-white text-slate-700">Consulting Fee</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-2">
                        <input 
                          type="text" 
                          placeholder="Service description..." 
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none text-sm placeholder:text-slate-300 text-slate-800"
                        />
                      </td>
                      <td className="py-3.5 px-1">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center focus:outline-none text-sm text-slate-700"
                        />
                      </td>
                      <td className="py-3.5 px-1">
                        <select 
                          value={item.unit} 
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-center focus:outline-none text-sm text-slate-700"
                        >
                          <option className="bg-white text-slate-700">Nos</option>
                          <option className="bg-white text-slate-700">Hours</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-1">
                        <input 
                          type="number" 
                          min="0" 
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-right focus:outline-none text-sm font-medium text-slate-700"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-right text-sm font-semibold text-slate-800">
                        ₹{((item.qty || 0) * (item.rate || 0)).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-1">
                        <select 
                          value={item.taxPercent} 
                          onChange={(e) => handleItemChange(item.id, 'taxPercent', Number(e.target.value))}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-center focus:outline-none text-sm text-slate-700"
                        >
                          <option value="18" className="bg-white text-slate-700">18%</option>
                          <option value="12" className="bg-white text-slate-700">12%</option>
                          <option value="5" className="bg-white text-slate-700">5%</option>
                          <option value="0" className="bg-white text-slate-700">0%</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLine(item.id)} 
                          disabled={lineItems.length === 1}
                          className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline warning display for line items if any error exists */}
            {Object.keys(itemErrors).length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                {Object.values(itemErrors).map((errMsg, index) => (
                  <p key={index} className="text-xs text-red-600 font-medium">{errMsg}</p>
                ))}
              </div>
            )}

            {/* Calculations Box split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-5 border-t border-slate-100 items-start">
              
              {/* Left Yellow Box: Discount Picker */}
              <div className="bg-[#fefce8] border border-yellow-200 rounded-xl p-4 flex items-center justify-between gap-4 max-w-md">
                <div className="flex items-center gap-2 text-yellow-800 font-semibold text-sm">
                  <Percent className="w-4 h-4 stroke-[2.5]" />
                  <span>Discount:</span>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="%" className="bg-white text-slate-700">%</option>
                    <option value="₹" className="bg-white text-slate-700">₹</option>
                  </select>
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      min="0" 
                      value={discountValue} 
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-24 text-center text-sm focus:outline-none text-slate-800 font-bold"
                    />
                    <span className="text-slate-400 text-xs ml-1.5">{discountType === '%' ? '%' : 'INR'}</span>
                  </div>
                </div>
              </div>

              {/* Right Side Mathematics Summary Grid View */}
              <div className="space-y-3 text-sm text-slate-600 ml-auto w-full max-w-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Items Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Taxable Amount:</span>
                  <span className="font-semibold text-slate-800">₹{summary.taxableAmount.toFixed(2)}</span>
                </div>
                
                {!isIgst ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">CGST:</span>
                      <span className="font-semibold text-slate-800">₹{summary.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">SGST:</span>
                      <span className="font-semibold text-slate-800">₹{summary.sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IGST:</span>
                    <span className="font-semibold text-slate-800">₹{summary.igst.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-2">
                  <span className="text-base font-bold text-slate-900">Grand Total:</span>
                  <span className="text-lg font-extrabold text-blue-600">₹{summary.grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Notes & Terms Footer textareas */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes</label>
              <textarea 
                rows="4" 
                value={internalNotes} 
                onChange={(e) => setInternalNotes(e.target.value)} 
                placeholder="Notes for internal reference..."
                className="w-full p-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300 text-slate-800 resize-none leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Terms & Conditions</label>
              <textarea 
                rows="4" 
                value={termsAndConditions} 
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="w-full p-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-600 resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Bottom Interactive Submission Control Bar */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <button type="button" onClick={() => navigate('/dashboard/proforma-invoices')} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
              ✕ Cancel
            </button>
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span role="alert">{error}</span>
              </div>
            )}
            <button 
              type="button" 
              onClick={saveProforma} 
              disabled={isSaving}
              style={{ backgroundColor: '#D4AF37' }}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white hover:bg-[#b8952e] rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : editingProforma ? 'Update Proforma' : 'Create Proforma'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateProforma;