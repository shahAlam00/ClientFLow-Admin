import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronDown, CircleDollarSign,
  Clock3, FileText, Filter, Info, Landmark, Plus, RefreshCw, Search, UserRound, X, Trash2, Edit, Briefcase
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ExpenseSummaryCard } from '../../../components/ExpenseSummaryCard.jsx';
import api from '@/lib/axios';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Edit Mode & Delete Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dynamic Dropdown Lists & API Data
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clientInvoicesMap, setClientInvoicesMap] = useState({});
  
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    billableTotal: 0,
    billedToClientsTotal: 0,
    pendingReimbursementTotal: 0,
    reimbursedTotal: 0
  });

  // Form Fields State
  const [client, setClient] = useState('');
  const [caseName, setCaseName] = useState('');
  const [expenseType, setExpenseType] = useState('General');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [incurredBy, setIncurredBy] = useState('Ashish Panwar');
  const [billable, setBillable] = useState(true);
  const [reimbursable, setReimbursable] = useState(true);

  // Inline validation warnings state
  const [clientError, setClientError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Fetch expenses, summary metrics, and client invoices from backend
  const fetchExpenseData = async () => {
    try {
      const res = await api.get('/expenses');
      if (res.data && res.data.success) {
        setExpenses(res.data.data);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }

      // Fetch Invoices and calculate client-wise total amounts accurately
      const invoiceRes = await api.get('/invoices').catch(() => ({ data: [] }));
      const invoiceList = Array.isArray(invoiceRes.data) 
        ? invoiceRes.data 
        : invoiceRes.data.invoices || invoiceRes.data.data || invoiceRes.data.result || [];

      const map = {};
      invoiceList.forEach((inv) => {
        // Checking multiple possible keys for client name and invoice amount
        const invClient = inv.clientName || inv.client?.name || inv.client || '';
        const invAmount = Number(inv.totalAmount || inv.amount || inv.grandTotal || 0);
        if (invClient) {
          map[invClient] = (map[invClient] || 0) + invAmount;
        }
      });
      setClientInvoicesMap(map);

    } catch (err) {
      console.error('Failed to load expenses or invoices from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients, expenses and invoices on mount with robust nested data handling
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clientRes = await api.get('/clients').catch(() => ({ data: [] }));
        console.log('API Clients Response:', clientRes.data);
        const rawClientData = clientRes.data;

        // Handle nested response data structure safely
        const clientData = Array.isArray(rawClientData) 
          ? rawClientData 
          : (Array.isArray(rawClientData?.data) ? rawClientData.data : (rawClientData?.data?.data || rawClientData?.clients || rawClientData?.result || []));
        
        setClients(clientData);
      } catch (err) {
        console.error('Failed to load client data:', err);
      }
    };

    fetchInitialData();
    fetchExpenseData();
  }, []);

  // Filter expenses according to active tab selection
  const visibleExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (activeTab === 'mine') return item.owner === 'Ashish Panwar';
      if (activeTab === 'pending') return item.status === 'Pending Approval';
      if (activeTab === 'ready') return item.status === 'Ready to Reimburse';
      if (activeTab === 'rejected') return item.status === 'Rejected';
      return true; // 'all'
    });
  }, [activeTab, expenses]);

  // Reset form fields
  const resetForm = () => {
    setClient('');
    setCaseName('');
    setExpenseType('General');
    setAmount('');
    setDescription('');
    setIncurredBy('Ashish Panwar');
    setBillable(true);
    setReimbursable(true);
    setClientError('');
    setAmountError('');
    setIsEditing(false);
    setEditExpenseId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setIsEditing(true);
    setEditExpenseId(expense._id || expense.id);
    setClient(expense.client || '');
    setCaseName(expense.caseName || '');
    setExpenseType(expense.type || 'General');
    setAmount(expense.amount ? expense.amount.toString() : '');
    setDescription(expense.description || '');
    setIncurredBy(expense.owner || 'Ashish Panwar');
    setBillable(expense.billable !== undefined ? expense.billable : true);
    setReimbursable(expense.reimbursable !== undefined ? expense.reimbursable : true);
    setClientError('');
    setAmountError('');
    setModalOpen(true);
  };

  const handleSaveExpense = async () => {
    let hasError = false;
    if (!client) {
      setClientError('Please select a client.');
      hasError = true;
    } else {
      setClientError('');
    }

    if (!amount || Number(amount) <= 0) {
      setAmountError('Please enter a valid amount.');
      hasError = true;
    } else {
      setAmountError('');
    }

    if (hasError) return;

    try {
      setActionLoading(true);
      const payload = {
        client,
        caseName,
        type: expenseType,
        amount: Number(amount),
        description: description || 'General expense entry',
        owner: incurredBy,
        billable,
        reimbursable
      };

      let res;
      if (isEditing && editExpenseId) {
        res = await api.put(`/expenses/${editExpenseId}`, payload);
      } else {
        res = await api.post('/expenses', payload);
      }

      if (res.data && res.data.success) {
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        setModalOpen(false);
        resetForm();
        await fetchExpenseData();
      }
    } catch (err) {
      console.error('Failed to save expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const promptDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      setActionLoading(true);
      const expenseId = expenseToDelete._id || expenseToDelete.id;
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.data && res.data.success) {
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
        await fetchExpenseData();
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Compute 'Billed to Clients' total dynamically: agar koi specific client select hai to uska invoice total, nahi to saare invoices ka sum ya summary amount
  const currentBilledTotal = useMemo(() => {
    if (client && clientInvoicesMap[client] !== undefined) {
      return clientInvoicesMap[client];
    }
    const totalFromMap = Object.values(clientInvoicesMap).reduce((acc, val) => acc + val, 0);
    return totalFromMap > 0 ? totalFromMap : (summary.billedToClientsTotal || summary.invoicedTotal || 0);
  }, [client, clientInvoicesMap, summary]);

  const cards = [
    ['Total Expenses', `₹${Number(summary.totalExpenses || 0).toFixed(2)}`, 'blue'], 
    ['Billable', `₹${Number(summary.billableTotal || 0).toFixed(2)}`, 'green'], 
    ['Billed to Clients', `₹${Number(currentBilledTotal).toFixed(2)}`, 'purple'],
    ['Pending Reimbursement', `₹${Number(summary.pendingReimbursementTotal || 0).toFixed(2)}`, 'orange'], 
    ['Reimbursed', `₹${Number(summary.reimbursedTotal || 0).toFixed(2)}`, 'emerald'],
  ];

  return (
    <DashboardLayout title="Expenses & Reimbursements">
      <section className="mx-auto max-w-[1280px] text-slate-700">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex gap-3">
            <button onClick={() => history.back()} aria-label="Go back" className="mt-1 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <ArrowLeft size={21} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Expenses &amp; Reimbursements</h1>
              <p className="mt-0.5 text-sm text-slate-600">Track expenses and manage reimbursements <span className="mx-1 text-slate-400">|</span> Logged in as: <strong>Ashish Panwar</strong> <span className="ml-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">super_admin</span></p>
            </div>
          </div>
          <button onClick={handleOpenAddModal} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            <Plus size={18} />Add Expense
          </button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(([title, amount, color]) => (
            <article key={title} className={`expense-card expense-card-${color} min-h-[100px] rounded-lg border border-slate-100 bg-white px-4 py-4 shadow-sm`}>
              <p className="text-sm font-medium text-slate-600">{title}</p>
              {loading ? (
                <div className="mt-2 h-6 w-24 animate-pulse rounded bg-slate-200"></div>
              ) : (
                <p className="mt-1 text-xl font-bold text-slate-950">{amount}</p>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 overflow-visible rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div className="relative">
              <button onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-700">
                <Filter size={17} />Filters <ChevronDown size={16} className={filterOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-8 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter expenses</p>
                  <select className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option>All expense types</option>
                    <option>Billable</option>
                    <option>Reimbursable</option>
                  </select>
                  <button onClick={() => setFilterOpen(false)} className="mt-3 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white">Apply filters</button>
                </div>
              )}
            </div>
            <button onClick={fetchExpenseData} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
              <RefreshCw size={16} />Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {['Date', 'Type', 'Description', 'Client / Case', 'Incurred By', 'Amount', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-4 py-4 font-medium uppercase">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-4 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-40 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-28 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-6 w-20 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-200"></div></td>
                    </tr>
                  ))
                ) : visibleExpenses.length ? (
                  visibleExpenses.map((expense) => (
                    <tr key={expense._id || expense.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-4">{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-4 font-medium">{expense.type}</td>
                      <td className="px-4 py-4 text-slate-600 truncate max-w-xs">{expense.description}</td>
                      <td className="px-4 py-4">{expense.client} {expense.caseName && <span className="text-xs text-slate-400 block">({expense.caseName})</span>}</td>
                      <td className="px-4 py-4">{expense.owner}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">₹{Number(expense.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-4"><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{expense.status}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setSelectedExpense(expense); setViewModalOpen(true); }} className="text-blue-600 font-medium hover:underline cursor-pointer">
                            View
                          </button>
                          <button onClick={() => handleOpenEditModal(expense)} aria-label="Edit expense" className="text-slate-600 hover:text-blue-600 transition">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => promptDeleteExpense(expense)} aria-label="Delete expense" className="text-slate-600 hover:text-red-600 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="h-24 px-4 py-9 text-center text-base text-slate-500">No expenses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-expense-title">
          <div className="max-w-[550px]  overflow-hidden rounded-lg bg-white shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50">
              <h2 id="add-expense-title" className="text-xl font-bold text-slate-950">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-200"><X size={20} /></button>
            </div>
            <div className="px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Step 1: Select Client */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                <label className="block text-sm font-semibold text-amber-900">Step 1: Select Client <span className="text-red-500">*</span></label>
                <div className="relative mt-2">
                  <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    autoFocus 
                    value={client} 
                    onChange={(event) => {
                      setClient(event.target.value);
                      if (event.target.value) setClientError('');
                    }} 
                    className="w-full appearance-none rounded border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="">Search client...</option>
{clients.map((c) => {
                      const clientName = (c.firstName || c.lastName) 
                        ? `${c.firstName || ''} ${c.lastName || ''}`.trim() 
                        : (c.companyName || c.name || c.clientName || c.fullName || c.username || `${c.clientType || 'Client'} (${c._id ? c._id.slice(-4) : ''})`);
                      
                      if (!clientName) return null;
                      return (
                        <option key={c._id || c.id || clientName} value={clientName}>
                          {clientName}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {clientError && <p className="mt-1.5 text-xs font-semibold text-red-600">{clientError}</p>}

                {/* Live Summary Card inside Modal using the imported component */}
                {client && (
                  <div className="mt-3">
                    <ExpenseSummaryCard selectedClient={client} />
                  </div>
                )}
              </div>

              {/* Step 2: Type Case Name Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Case Name (Optional)</label>
                <div className="relative">
                  <Briefcase size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={caseName} 
                    onChange={(e) => setCaseName(e.target.value)}
                    placeholder="Type case name..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Expense Type & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expense Type</label>
                  <select 
                    value={expenseType} 
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option>General</option>
                    <option>Filing Fees</option>
                    <option>Travel & Conveyance</option>
                    <option>Printing & Stationery</option>
                    <option>Court Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (e.target.value) setAmountError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                  {amountError && <p className="mt-1.5 text-xs font-semibold text-red-600">{amountError}</p>}
                </div>
              </div>

              {/* Billable & Reimbursable Options */}
              <div className="flex gap-6 pt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" /> 
                  Billable to Client
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={reimbursable} onChange={(e) => setReimbursable(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" /> 
                  Reimbursable
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  rows="2" 
                  placeholder="Enter expense details..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {/* Incurred By */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Incurred By</label>
                <input 
                  type="text" 
                  value={incurredBy} 
                  onChange={(e) => setIncurredBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none"
                />
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4 flex justify-end gap-3">
                <button onClick={() => { setModalOpen(false); resetForm(); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleSaveExpense} disabled={actionLoading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {actionLoading ? 'Saving...' : isEditing ? 'Update Expense' : 'Create Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <div className="max-w-[300px]  overflow-hidden rounded-lg bg-rose-50 border border-rose-200 shadow-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Are you sure?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Do you really want to delete this expense record for <strong className="text-slate-900">{expenseToDelete.client}</strong> (₹{Number(expenseToDelete.amount || 0).toFixed(2)})? This process cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button 
                onClick={() => { setDeleteModalOpen(false); setExpenseToDelete(null); }} 
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteExpense} 
                disabled={actionLoading}
                className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Detail Modal */}
      {viewModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <div className="max-w-[400px]  overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Expense Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
              <p><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString('en-GB')}</p>
              <p><strong>Client:</strong> {selectedExpense.client}</p>
              <p><strong>Case Name:</strong> {selectedExpense.caseName || 'N/A'}</p>
              <p><strong>Expense Type:</strong> {selectedExpense.type}</p>
              <p><strong>Amount:</strong> ₹{Number(selectedExpense.amount || 0).toFixed(2)}</p>
              <p><strong>Billable to Client:</strong> {selectedExpense.billable ? 'Yes' : 'No'}</p>
              <p><strong>Reimbursable:</strong> {selectedExpense.reimbursable ? 'Yes' : 'No'}</p>
              <p><strong>Status:</strong> <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{selectedExpense.status}</span></p>
              <p><strong>Incurred By:</strong> {selectedExpense.owner}</p>
              <p><strong>Description:</strong> {selectedExpense.description || 'No description provided'}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button onClick={() => setViewModalOpen(false)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}