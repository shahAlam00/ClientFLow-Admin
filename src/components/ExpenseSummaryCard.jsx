import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';

export function ExpenseSummaryCard({ selectedClient }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedClient) return;
      setLoading(true);
      try {
        const response = await api.get('/invoices');
        const resData = response.data;
        // Aapke API response ke mutabiq resData.data ek array hai
        const data = resData?.data ?? resData;
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching invoices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [selectedClient]);

  const billedToSelectedClient = useMemo(() => {
    if (!selectedClient || !invoices.length) return 0;

    return invoices
      .filter((invoice) => {
        const invClient = invoice.client;
        if (!invClient) return false;

        // Case-insensitive string matching for client name
        return String(invClient).trim().toLowerCase() === String(selectedClient).trim().toLowerCase();
      })
      .reduce((sum, invoice) => {
        // Aapke JSON response ke mutabiq total 'summary.total' ke andar hai
        const amount = invoice.summary?.total ?? invoice.total ?? invoice.amount ?? 0;
        return sum + Number(amount);
      }, 0);
  }, [invoices, selectedClient]);

  const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div className="rounded-3xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Billed to Clients {selectedClient ? `(${selectedClient})` : ''}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {loading ? 'Loading...' : money(billedToSelectedClient)}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {selectedClient ? 'Filtered for selected client' : 'Select a client to view'}
      </p>
    </div>
  );
}