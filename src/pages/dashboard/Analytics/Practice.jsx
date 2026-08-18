import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Maximize2,
  ChevronDown,
  RefreshCw,
  Download,
  Calendar,
  Plus
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import api from '@/lib/api';
function Practice() {
  const [activeTab, setActiveTab] = useState('Custom');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filterTabs = [
    'Today', 'This Week', 'This Month', 'Last Month',
    'This Quarter', 'This FY', 'Custom'
  ];

  // Specific Left Border Colors and Accents matching the image perfectly
  const staticLayout = [
    { label: 'ACTIVE CASES', border: '#6366f1' },
    { label: 'HEARINGS TODAY', border: '#2dd4bf' },
    { label: 'HEARINGS THIS WEEK', border: '#f59e0b' },
    { label: 'FILED THIS PERIOD', border: '#ec4899' },
    { label: 'CLOSED THIS PERIOD', border: '#8b5cf6' },
    { label: 'AVG CASE AGE', border: '#bae6fd' },
    { label: 'WIN RATE', border: '#6366f1' },
    { label: 'ADJOURNMENTS', border: '#2dd4bf' },
    { label: 'CNR TRACKED', border: '#f59e0b' },
  ];

  const [metrics, setMetrics] = useState(staticLayout.map((m) => ({ ...m, value: '0', sub: '' })));

  const parseDate = (v) => {
    if (!v) return null;
    try { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; } catch { return null; }
  };

  const inRange = (date, from, to) => {
    if (!date) return false;
    if (!from && !to) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true); setError('');
        const [casesRes, litRes, apptRes] = await Promise.allSettled([
          api.get('/cases'),
          api.get('/litigation'),
          api.get('/appointments'),
        ]);
        const cases = (casesRes.status === 'fulfilled' ? (casesRes.value.data?.data ?? casesRes.value.data) : []) || [];
        const lits = (litRes.status === 'fulfilled' ? (litRes.value.data?.data ?? litRes.value.data) : []) || [];
        const appts = (apptRes.status === 'fulfilled' ? (apptRes.value.data?.data ?? apptRes.value.data) : []) || [];
        const allCases = Array.isArray(cases) ? cases.concat(Array.isArray(lits) ? lits : []) : (Array.isArray(lits) ? lits : []);

        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const normalizeStatus = (item) => String(item.caseStatus || item.status || '').trim().toLowerCase();

        const activeCases = allCases.filter((c) => {
          const s = normalizeStatus(c);
          return s === 'active' || (s && s !== 'disposed');
        });

        const hearingsToday = (allCases.filter((c) => {
          const d = parseDate(c.nextHearingDate || c.hearingDate || c.hearing_date || c.nextHearing);
          return d && d >= startOfToday && d <= endOfToday;
        }).length) + (Array.isArray(appts) ? appts.filter((a) => {
          const d = parseDate(a.date || a.start || a.startDate);
          return d && d >= startOfToday && d <= endOfToday;
        }).length : 0);

        const hearingsThisWeek = (allCases.filter((c) => {
          const d = parseDate(c.nextHearingDate || c.hearingDate || c.hearing_date || c.nextHearing);
          return d && d >= startOfWeek && d <= endOfWeek;
        }).length) + (Array.isArray(appts) ? appts.filter((a) => {
          const d = parseDate(a.date || a.start || a.startDate);
          return d && d >= startOfWeek && d <= endOfWeek;
        }).length : 0);

        // Filed / Closed this period -> default to month if no dates selected
        const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const filedThisPeriod = allCases.filter((c) => {
          const d = parseDate(c.createdAt || c.created_at || c.date || c.startDate);
          return d && d >= periodStart && d <= periodEnd;
        }).length;

        const closedThisPeriod = allCases.filter((c) => {
          const s = normalizeStatus(c);
          const closedDate = parseDate(c.closedAt || c.disposedAt || c.updatedAt || c.updated_at);
          return (s === 'disposed' || s === 'closed') && closedDate && closedDate >= periodStart && closedDate <= periodEnd;
        }).length;

        const ages = allCases.map((c) => {
          const d = parseDate(c.createdAt || c.created_at || c.startDate || c.date);
          if (!d) return null; return Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
        }).filter((n) => n !== null);
        const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

        const cnrCount = allCases.filter((c) => Boolean(c.cnrNumber || c.cnr || c.cnr_number)).length;
        const cnrPercent = activeCases.length ? ((cnrCount / activeCases.length) * 100).toFixed(1) : '0.0';

        const computed = {
          'ACTIVE CASES': activeCases.length,
          'HEARINGS TODAY': hearingsToday,
          'HEARINGS THIS WEEK': hearingsThisWeek,
          'FILED THIS PERIOD': filedThisPeriod,
          'CLOSED THIS PERIOD': closedThisPeriod,
          'AVG CASE AGE': avgAge,
          'WIN RATE': '0.0%',
          'ADJOURNMENTS': 0,
          'CNR TRACKED': `${cnrCount} (${cnrPercent}% of active)`,
        };

        if (!mounted) return;
        setMetrics((prev) => prev.map((m) => ({ ...m, value: computed[m.label] ?? '0', sub: typeof computed[m.label] === 'number' && m.label === 'AVG CASE AGE' ? 'days' : '' })));
      } catch (err) {
        console.error('Practice metrics load failed', err);
        setError('Unable to load practice metrics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [appliedFrom, appliedTo]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc]  text-slate-600 font-sans antialiased">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* Top Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl shadow-sm">
                ⚖️
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Practice Intelligence</h1>
                <p className="text-xs font-medium text-slate-400 mt-0.5">2026-07-13 — 2026-07-13</p>
              </div>
            </div>

            {/* Controls Bar */}

          </div>

          {/* Dynamic Filters Bar with Date pickers */}
<div className="flex flex-wrap items-center gap-2">

  {/* Save View Button */}
  <button
    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
  >
    <Plus className="h-4 w-4" />
    Save View
  </button>

  {/* Filter Tabs */}
  {filterTabs.map((tab) => {
    const active = activeTab === tab;

    return (
      <button
        key={tab}
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`
          inline-flex
          h-10
          items-center
          justify-center
          rounded-xl
          border
          px-4
          text-sm
          font-semibold
          transition-all
          duration-200
          focus:outline-none
          focus-visible:outline-none
          active:scale-95
          ${
            active
              ? "border-indigo-600 bg-indigo-600 shadow-md"
              : "border-transparent bg-transparent hover:bg-slate-100 hover:border-slate-200"
          }
        `}
      >
        <span
          className={active ? "!text-white" : "text-slate-600"}
        >
          {tab}
        </span>
      </button>
    );
  })}
</div>
          {/* Sync Info Tracker Banner element */}
          <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 font-medium pr-1">
            <span>Updated 13/07/2026 01:47 pm • Auto-refreshes every 5 min</span>
            <div className="w-4 h-4 bg-amber-50 rounded-full flex items-center justify-center text-[10px] border border-amber-100">💡</div>
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm">
              <RefreshCw className="w-3 h-3 text-indigo-500" />
              Refresh
            </button>
          </div>

          {/* Operational Metrics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-4">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{ borderLeft: `3px solid ${m.border}` }}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 pl-4 shadow-sm flex flex-col justify-between min-h-[90px] hover:shadow-md transition-shadow group"
              >
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase transition-colors group-hover:text-slate-500">{m.label}</span>
                <div className="my-1">
                  {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin text-slate-400" size={18} /><span className="text-sm text-slate-400">Loading</span></div> : <span className="text-xl font-black text-slate-900 tracking-tight">{m.value}</span>}
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">{m.sub || '\u00A0'}</span>
              </div>
            ))}
          </div>
          {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          {/* Block 1: Multi Column Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Case Type Distribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col min-h-[340px] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Case Type Distribution</h3>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                No data for this period
              </div>
            </div>

            {/* Court Type Split */}
            <div className="bg-white border border-slate-200 border-t-2 border-t-teal-400 rounded-2xl p-5 flex flex-col min-h-[340px] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Court Type Split (HC / DC / Tribunal)</h3>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                No data for this period
              </div>
            </div>
          </div>

          {/* Block 2: Area Distributions and Monthly trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Practice Area Distribution */}
            <div className="bg-white border border-slate-200 border-t-2 border-t-amber-400 rounded-2xl p-5 flex flex-col min-h-[340px] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Practice Area Distribution</h3>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                No data for this period
              </div>
            </div>

            {/* Monthly Filing Trend */}
            <div className="bg-white border border-slate-200 border-t-2 border-t-pink-400 rounded-2xl p-5 flex flex-col min-h-[340px] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Monthly Filing Trend</h3>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                No data for this period
              </div>
            </div>
          </div>

          {/* Block 3: Today's Hearings Layout */}
          <div className="bg-white border border-slate-200 border-t-2 border-t-indigo-500 rounded-2xl p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Today's Hearings</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-500 bg-amber-50/60 px-2.5 py-0.5 rounded-md">0 today</span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-xs text-slate-400 font-medium py-10">
              No hearings today
            </div>
          </div>

          {/* Block 4: Upcoming 7 Days Hearings */}
          <div className="bg-white border border-slate-200 border-t-2 border-t-teal-400 rounded-2xl p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Upcoming Hearings — Next 7 Days</h3>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center justify-center text-xs text-slate-400 font-medium py-10">
              No upcoming hearings
            </div>
          </div>

          {/* Block 5: Stale Cases vs Results Profile Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Stale cases */}
            <div className="bg-white border border-slate-200 border-t-2 border-t-red-500 rounded-2xl p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Stale Cases (No Activity 30+ days)</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">0 stale</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-xs text-slate-400 font-medium py-8">
                No stale cases
              </div>
            </div>

            {/* Hearing Results */}
            <div className="bg-white border border-slate-200 border-t-2 border-t-amber-400 rounded-2xl p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Hearing Result Distribution</h3>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium py-8">
                No hearing data
              </div>
            </div>
          </div>

        </div>

        {/* Floating Messenger Service Element */}
        <div className="fixed bottom-6 right-6 z-40">
          <button className="p-3.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Practice;