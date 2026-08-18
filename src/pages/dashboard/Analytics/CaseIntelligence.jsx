import { useState, useEffect } from 'react';
import { ChevronDown, Download, Maximize2, RefreshCw, Scale, Users, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const periods = { Today: '2026-07-14 – 2026-07-14', 'This Week': '2026-07-13 – 2026-07-19', 'This Month': '2026-07-01 – 2026-07-31', 'Last Month': '2026-06-01 – 2026-06-30', 'This Quarter': '2026-07-01 – 2026-09-30', 'This FY': '2026-04-01 – 2027-03-31', Custom: 'Select a custom period' };
const metrics = [
  ['TOTAL CASES', '0', '', '#7177f8', '#f0f0ff'], ['ACTIVE CASES', '0', '', '#3fc5bc', '#eaf8f6'], ['FILED THIS PERIOD', '0', '', '#f7af3d', '#fff6e7'], ['CLOSED THIS PERIOD', '0', '', '#f66bac', '#fff0f7'], ['DISPOSAL RATE', '0.0%', '', '#a26bf4', '#f5efff'],
  ['AVG CASE AGE', '0', 'days', '#47c7dd', '#e9f8fc'], ['UPDATE OVERDUE', '0', 'cases requiring attention', '#f66bac', '#fff0f7'], ['POCKET INACTIVE', '0.0%', '0 overdue cases', '#3fc5bc', '#eaf8f6'], ['TOTAL CASE VALUE', '₹0', '', '#f7af3d', '#fff6e7'], ['HEARINGS (FR)', '0', '', '#7177f8', '#f0f0ff'],
];
const panels = [
  ['Case Status Breakdown', '#7177f8', 'No case status data'], ['Case Type Distribution', '#3fc5bc', 'No case type data'], ['Cases by Court', '#f7af3d', 'No court data'], ['Cases by Practice Area', '#f66bac', 'No practice-area data'], ['Filing vs Disposal Trend — 6 Months', '#7177f8', 'No data for this period'], ['Active Case Aging', '#a26bf4', 'No active cases'], ['Case Stage Distribution', '#47c7dd', 'No stage data'], ['eCourt Sync Health', '#f7af3d', 'No sync data'],
];

export default function CaseIntelligence() {
  const [period, setPeriod] = useState('Today');
  const [updated, setUpdated] = useState('Updated 14/07/2026 02:00 pm');
  const [collapsed, setCollapsed] = useState({});
  const [zoomed, setZoomed] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metricValues, setMetricValues] = useState(() => Object.fromEntries(metrics.map(([label, value, detail]) => [label, { value, detail }])));
  const refresh = () => setUpdated(`Updated ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  const toggle = (name) => setCollapsed((items) => ({ ...items, [name]: !items[name] }));
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['Metric,Value\nTotal Cases,0\nActive Cases,0'], { type: 'text/csv' })); a.download = 'case-intelligence.csv'; a.click(); };
  const tools = (name) => <div className="flex gap-1"><button onClick={() => setZoomed(name)} aria-label={`Expand ${name}`} className="ci-icon"><Maximize2 size={14} /></button><button onClick={() => toggle(name)} aria-label={`Collapse ${name}`} className="ci-icon"><ChevronDown size={14} className={collapsed[name] ? '-rotate-90 transition-transform' : 'transition-transform'} /></button></div>;
  const panel = ([name, accent, empty]) => <article key={name} className="ci-panel min-h-[270px]" style={{ borderTopColor: accent }}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">{name}</h2>{tools(name)}</header>{!collapsed[name] && <div className="m-auto px-4 py-10 text-center text-xs font-medium text-slate-400">{empty}</div>}</article>;

  const getRangeFor = (key) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (key === 'Today') return [startOfToday, new Date(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate(), 23, 59, 59)];
    if (key === 'This Week') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - s.getDay());
      const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59);
      return [s, e];
    }
    if (key === 'This Month') {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      const e = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      return [s, e];
    }
    if (key === 'Last Month') {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      return [s, e];
    }
    if (key === 'This Quarter') {
      const q = Math.floor(today.getMonth() / 3);
      const s = new Date(today.getFullYear(), q * 3, 1);
      const e = new Date(today.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
      return [s, e];
    }
    if (key === 'This FY') {
      const fyStart = new Date(today.getFullYear(), 3, 1); // Apr 1
      if (today < fyStart) {
        const s = new Date(today.getFullYear() - 1, 3, 1);
        const e = new Date(today.getFullYear(), 2, 31, 23, 59, 59);
        return [s, e];
      }
      const s = fyStart;
      const e = new Date(today.getFullYear() + 1, 2, 31, 23, 59, 59);
      return [s, e];
    }
    return [null, null];
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [casesRes, litRes] = await Promise.allSettled([api.get('/cases'), api.get('/litigation')]);
        const cases = (casesRes.status === 'fulfilled' ? (casesRes.value.data?.data ?? casesRes.value.data) : []) || [];
        const lits = (litRes.status === 'fulfilled' ? (litRes.value.data?.data ?? litRes.value.data) : []) || [];
        const all = Array.isArray(cases) ? cases.concat(Array.isArray(lits) ? lits : []) : (Array.isArray(lits) ? lits : []);

        const [start, end] = getRangeFor(period);
        const inRange = (d) => { if (!d) return false; const dt = new Date(d); if (Number.isNaN(dt.getTime())) return false; if (start && dt < start) return false; if (end && dt > end) return false; return true; };

        const total = all.length;
        const active = all.filter((c) => { const s = String(c.caseStatus || c.status || '').toLowerCase(); return s === 'active' || (s && s !== 'disposed'); }).length;
        const filed = all.filter((c) => inRange(c.createdAt || c.created_at || c.date || c.startDate)).length;
        const closed = all.filter((c) => { const s = String(c.caseStatus || c.status || '').toLowerCase(); return (s === 'disposed' || s === 'closed') && inRange(c.closedAt || c.disposedAt || c.updatedAt || c.updated_at); }).length;
        const disposalRate = filed ? `${((closed / filed) * 100).toFixed(1)}%` : '0.0%';
        const ages = all.map((c) => { const d = new Date(c.createdAt || c.created_at || c.date || c.startDate); return Number.isNaN(d.getTime()) ? null : Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))); }).filter((n) => n !== null);
        const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
        const updateOverdue = all.filter((c) => { const lu = new Date(c.updatedAt || c.updated_at || c.lastUpdated || c.lastActivity); if (Number.isNaN(lu.getTime())) return false; return (Date.now() - lu.getTime()) > (30 * 24 * 60 * 60 * 1000); }).length;
        const pocketInactive = all.filter((c) => { const lu = new Date(c.updatedAt || c.updated_at || c.lastUpdated || c.lastActivity); if (Number.isNaN(lu.getTime())) return false; return (Date.now() - lu.getTime()) > (90 * 24 * 60 * 60 * 1000); }).length;
        const totalValue = all.reduce((s, c) => s + Number(c.caseValue || c.caseSuitValue || c.claimAmount || 0), 0);
        const hearings = all.filter((c) => inRange(c.nextHearingDate || c.hearingDate || c.nextHearing)).length;

        if (!mounted) return;
        setMetricValues((prev) => ({
          ...prev,
          'TOTAL CASES': { value: total.toString(), detail: prev['TOTAL CASES'].detail },
          'ACTIVE CASES': { value: active.toString(), detail: prev['ACTIVE CASES'].detail },
          'FILED THIS PERIOD': { value: filed.toString(), detail: prev['FILED THIS PERIOD'].detail },
          'CLOSED THIS PERIOD': { value: closed.toString(), detail: prev['CLOSED THIS PERIOD'].detail },
          'DISPOSAL RATE': { value: disposalRate, detail: prev['DISPOSAL RATE'].detail },
          'AVG CASE AGE': { value: avgAge.toString(), detail: 'days' },
          'UPDATE OVERDUE': { value: updateOverdue.toString(), detail: prev['UPDATE OVERDUE'].detail },
          'POCKET INACTIVE': { value: pocketInactive.toString(), detail: prev['POCKET INACTIVE'].detail },
          'TOTAL CASE VALUE': { value: `₹${Number(totalValue || 0).toLocaleString('en-IN')}`, detail: prev['TOTAL CASE VALUE'].detail },
          'HEARINGS (FR)': { value: hearings.toString(), detail: prev['HEARINGS (FR)'].detail },
        }));
      } catch (err) {
        console.error('CaseIntelligence load failed', err);
        setError('Unable to load case intelligence metrics');
      } finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [period]);

  return (
    <DashboardLayout title="Case Intelligence">
      <main className="case-intelligence mx-auto max-w-[1320px] pb-8 text-slate-700">
<header className="pt-5">
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-indigo-50 p-3">
      <Scale size={25} className="text-indigo-600" />
    </div>

    <div>
      <h1 className="text-[23px] font-bold tracking-tight text-slate-950">
        Case Intelligence
      </h1>
      <p className="mt-0.5 text-xs text-slate-400">
        {periods[period]}
      </p>
    </div>
  </div>

  <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex flex-wrap gap-2">
      {Object.keys(periods).map((tab) => {
        const isActive = period === tab;

        return (
          <button
            key={tab}
            onClick={() => setPeriod(tab)}
            aria-pressed={isActive}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200
              ${
                isActive
                  ? "border-indigo-600 bg-indigo-600 !text-white hover:bg-indigo-700 hover:!text-white"
                  : "border-slate-300 bg-white !text-slate-700 hover:bg-slate-100 hover:!text-slate-900"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>

    <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-slate-400">
      <span>{updated} · Auto-refreshes every 5 min</span>

      <button
        onClick={() => setSaved(true)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:bg-slate-50"
      >
        {saved ? "View Saved" : "Save View"}
      </button>

      <button
        onClick={download}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:bg-slate-50"
      >
        <Download size={13} />
        Export
      </button>

      <button
        onClick={refresh}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-indigo-600 transition hover:bg-slate-50"
      >
        <RefreshCw size={13} />
        Refresh
      </button>
    </div>
  </div>
</header>
        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{metrics.map(([label, _value, _detail, accent, background]) => { const mv = metricValues[label] || { value: _value, detail: _detail }; return <article key={label} style={{ borderLeftColor: accent, backgroundColor: background }} className="min-h-[100px] rounded-xl border border-slate-200 border-l-4 p-4"><p className="text-[11px] font-medium tracking-wide text-slate-500">{label}</p><p style={{ color: accent }} className="mt-1 text-xl font-bold">{loading ? <Loader2 className="animate-spin text-slate-400" /> : mv.value}</p><p className="mt-1 text-[11px] text-slate-400">{mv.detail || ' '}</p></article> })}</section>
        <section className="mt-5 grid gap-4 lg:grid-cols-2">{panels.slice(0, 4).map(panel)}</section>
        <section className="mt-5 grid gap-4 lg:grid-cols-5"><article className="ci-panel min-h-[300px] lg:col-span-3" style={{ borderTopColor: '#7177f8' }}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Case Load &amp; Hearing Activity</h2>{tools('Case Load & Hearing Activity')}</header>{!collapsed['Case Load & Hearing Activity'] && <div className="m-auto text-center text-xs font-medium text-slate-400">No case activity for this period</div>}</article><article className="ci-panel min-h-[300px] lg:col-span-2" style={{ borderTopColor: '#f7af3d' }}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Priority Overview</h2>{tools('Priority Overview')}</header>{!collapsed['Priority Overview'] && <div className="m-auto text-center text-xs font-medium text-slate-400">No priority data</div>}</article></section>
        <section className="mt-5 grid gap-4 lg:grid-cols-2">{panels.slice(4).map(panel)}</section>
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header className="flex items-center gap-2 border-b border-slate-100 pb-3"><Users size={17} className="text-indigo-600" /><h2 className="text-sm font-semibold text-slate-950">Team Accountability</h2></header><p className="mt-3 text-xs leading-5 text-slate-500">Review assignments, court attendance, and record-update activity across your team to identify workload gaps early.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{[['Court Attendance', 'No hearing attendance recorded'], ['Case Update Activity', 'No case updates recorded'], ['Assigned Case Load', 'No advocate assignment data']].map(([name, empty]) => <article key={name} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-800">{name}</h3><p className="py-8 text-center text-xs text-slate-400">{empty}</p></article>)}</div></section>
        <section className="mt-5 grid gap-4 lg:grid-cols-2"><article className="ci-panel min-h-[145px]" style={{ borderTopColor: '#f66bac' }}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Stale Cases (Update Overdue)</h2><span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-500">0</span></header><p className="m-auto text-xs text-slate-400">No stale cases</p></article><article className="ci-panel min-h-[145px]" style={{ borderTopColor: '#a26bf4' }}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Upcoming Limitations (60 Days)</h2><span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-500">0</span></header><p className="m-auto text-xs text-slate-400">No upcoming limitations</p></article></section>
        {zoomed && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label={zoomed}><div className="flex h-[min(70vh,600px)] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">{zoomed}</h2><button onClick={() => setZoomed('')} className="ci-icon">×</button></header><div className="m-auto text-sm text-slate-400">No data for this period</div></div></div>}
      </main>
    </DashboardLayout>
  );
}
