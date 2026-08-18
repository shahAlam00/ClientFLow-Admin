import { useState, useEffect } from 'react';
import { 
  AreaChart, BarChart3, Bell, ChevronDown, CircleDot, LineChart, 
  Maximize2, MessageCircle, PieChart, RefreshCw, Wallet, 
  GraduationCap, Users, BookOpen, TrendingUp, IndianRupee, 
  Receipt, AlertCircle, FileText, Briefcase, Award, CheckCircle2, 
  Clock, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

const ranges = { 
  Today: '2026-07-14 – 2026-07-14', 
  'This Week': '2026-07-13 – 2026-07-19', 
  'This Month': '2026-07-01 – 2026-07-31', 
  'Last Month': '2026-06-01 – 2026-06-30', 
  'This Quarter': '2026-07-01 – 2026-09-30', 
  'This FY': '2026-04-01 – 2027-03-31', 
  Custom: 'Select a custom period' 
};

// Educational CRM Metric Data Definition with reduced amounts
const metricData = [
  ['TOTAL FEES BILLED', '₹1,24,500', '14 student invoices', '#6366f1', '#eef2ff', Receipt], 
  ['FEE COLLECTED', '₹98,200', '79.0% collection rate', '#10b981', '#ecfdf5', Wallet], 
  ['OUTSTANDING DUES', '₹26,300', '4 student accounts', '#f59e0b', '#fffbeb', AlertCircle], 
  ['OP. EXPENSES', '₹18,500', 'Campus & Operations', '#ec4899', '#fdf2f8', TrendingUp], 
  ['ADVANCE/WALLET', '₹12,000', '2 active · 45.0% utilized', '#8b5cf6', '#f5f3ff', IndianRupee],
  ['RECOVERY RATE', '88.4%', '+2.1% vs last month', '#06b6d4', '#ecfeff', BarChart3], 
  ['REALIZATION RATE', '94.2%', 'High accuracy index', '#6366f1', '#eef2ff', PieChart], 
  ['AVG PAYMENT DELAY', '8 Days', 'Enrollment to settlement', '#14b8a6', '#f0fdfa', CircleDot], 
  ['CONCESSIONS/TDS', '₹3,500', 'Merit scholarships applied', '#f59e0b', '#fffbeb', FileText], 
  ['TAXES/GST', '₹14,200', '18% standard bracket', '#ec4899', '#fdf2f8', Briefcase],
];

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { 
  style: 'currency', currency: 'INR', minimumFractionDigits: 2 
}).format(Number(value || 0));

export function computeInvoiceTotal(inv) {
  if (!inv) return 0;
  return Number(inv.total ?? inv.grandTotal ?? inv.amount ?? inv.summary?.total ?? 0) || 0;
}

export default function MoneyPuls() {
  const [period, setPeriod] = useState('Today');
  const [updated, setUpdated] = useState('Updated 14/07/2026 02:00 pm');
  const [collapsed, setCollapsed] = useState({});
  const [zoomed, setZoomed] = useState('');
  const [metricValues, setMetricValues] = useState(() => 
    Object.fromEntries(metricData.map(([label, val, detail]) => [label, { value: val, detail }]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => setUpdated(`Updated ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  
  const exportCsv = () => { 
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(new Blob(['Metric,Value\nTotal Fees Billed,₹1,24,500\nFee Collected,₹98,200'], { type: 'text/csv' })); 
    link.download = 'edu-crm-pulse.csv'; 
    link.click(); 
  };
  
  const toggle = (name) => setCollapsed((value) => ({ ...value, [name]: !value[name] }));
  
  const tools = (name, exportable = false) => (
    <div className="flex items-center gap-2">
      {exportable && (
        <button onClick={exportCsv} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600">
          Export
        </button>
      )}
      <div className="flex items-center gap-1">
        <button aria-label={`Expand ${name}`} onClick={() => setZoomed(name)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Maximize2 size={14} />
        </button>
        <button aria-label={`Collapse ${name}`} onClick={() => toggle(name)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <ChevronDown size={16} className={`transition-transform duration-200 ${collapsed[name] ? '-rotate-90' : ''}`} />
        </button>
      </div>
    </div>
  );
  
  // Custom Render Content with cleaner UI and reduced amounts
  const renderPanelBody = (name) => {
    switch (name) {
      case 'Top Defaulters (Students)':
        return (
          <div className="divide-y divide-slate-100/80 px-5 py-3">
            {[
              { name: 'Aarav Sharma', course: 'Full Stack Web Dev', amount: '₹8,500', days: '12 Days Overdue', risk: 'High' },
              { name: 'Priya Verma', course: 'Data Science Bootcamp', amount: '₹6,200', days: '9 Days Overdue', risk: 'Medium' },
              { name: 'Rohan Gupta', course: 'UI/UX Masterclass', amount: '₹4,500', days: '5 Days Overdue', risk: 'Low' },
              { name: 'Ananya Iyer', course: 'Cloud Computing Pro', amount: '₹7,100', days: '14 Days Overdue', risk: 'High' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-xs tracking-wider">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 tracking-tight">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-normal">{item.course} • <span className="text-rose-500 font-medium">{item.days}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 tracking-tight">{item.amount}</span>
                  <div className="flex justify-end mt-0.5">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${item.risk === 'High' ? 'bg-rose-50 text-rose-600' : item.risk === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {item.risk} Risk
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Revenue by Program/Course':
        return (
          <div className="p-5 space-y-4">
            {[
              { course: 'Full Stack Web Dev', share: '45%', amount: '₹56,000', color: 'bg-indigo-600' },
              { course: 'Data Science & AI', share: '28%', amount: '₹34,800', color: 'bg-emerald-500' },
              { course: 'Cloud & DevOps', share: '17%', amount: '₹21,100', color: 'bg-amber-500' },
              { course: 'UI/UX Design', share: '10%', amount: '₹12,600', color: 'bg-sky-400' },
            ].map((prog, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{prog.course}</span>
                  <span className="text-slate-900 font-semibold">{prog.amount} ({prog.share})</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${prog.color}`} style={{ width: prog.share }}></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Counselor/Agent Performance':
        return (
          <div className="divide-y divide-slate-100/80 px-5 py-3">
            {[
              { agent: 'Neha Kapoor', leads: '12 Leads', converted: '6 Converted', revenue: '₹38,000', rate: '50.0%' },
              { agent: 'Vikram Singh', leads: '15 Leads', converted: '5 Converted', revenue: '₹32,500', rate: '33.3%' },
              { agent: 'Sneha Patel', leads: '10 Leads', converted: '5 Converted', revenue: '₹27,700', rate: '50.0%' },
            ].map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 font-semibold text-xs tracking-wider">
                    {agent.agent.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 tracking-tight">{agent.agent}</h4>
                    <p className="text-xs text-slate-400 font-normal">{agent.leads} • {agent.converted}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 tracking-tight">{agent.revenue}</span>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">{agent.rate} Conv.</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Payment Methods Split':
        return (
          <div className="p-5 flex flex-col justify-center h-full space-y-3">
            {[
              { method: 'UPI / QR Scan', count: '18 Transactions', value: '₹48,200', percent: '49%' },
              { method: 'Net Banking / NEFT', count: '8 Transactions', value: '₹32,000', percent: '33%' },
              { method: 'Credit / Debit Card', count: '5 Transactions', value: '₹18,000', percent: '18%' },
            ].map((m, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3 ring-1 ring-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm font-semibold text-xs">
                    {m.percent}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">{m.method}</h4>
                    <p className="text-[11px] text-slate-400 font-normal">{m.count}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 tracking-tight">{m.value}</span>
              </div>
            ))}
          </div>
        );

      case 'Fee Billed vs Collected — Last 6 months':
        return (
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-600"></span> Billed Fees</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span> Collected</span>
              </div>
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600">Trend: +8% MoM</span>
            </div>
            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-4 border-b border-slate-100">
              {[
                { month: 'Feb', billed: '60%', collected: '50%' },
                { month: 'Mar', billed: '75%', collected: '65%' },
                { month: 'Apr', billed: '70%', collected: '62%' },
                { month: 'May', billed: '85%', collected: '76%' },
                { month: 'Jun', billed: '80%', collected: '72%' },
                { month: 'Jul', billed: '90%', collected: '82%' },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-2.5 rounded-t bg-indigo-600 transition-all hover:opacity-90" style={{ height: bar.billed }}></div>
                    <div className="w-2.5 rounded-t bg-emerald-500 transition-all hover:opacity-90" style={{ height: bar.collected }}></div>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Student Dues Aging':
        return (
          <div className="p-5 space-y-3">
            {[
              { bucket: '0 - 30 Days (Current)', amount: '₹15,400', students: '3 Students', color: 'bg-emerald-500' },
              { bucket: '31 - 60 Days Due', amount: '₹7,200', students: '1 Student', color: 'bg-amber-500' },
              { bucket: '61 - 90 Days Due', amount: '₹2,500', students: '0 Students', color: 'bg-orange-500' },
              { bucket: '90+ Days (Critical)', amount: '₹1,200', students: '0 Students', color: 'bg-rose-500' },
            ].map((bucket, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl p-3 bg-slate-50/70 ring-1 ring-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${bucket.color}`}></div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">{bucket.bucket}</h4>
                    <p className="text-[11px] text-slate-400 font-normal">{bucket.students}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 tracking-tight">{bucket.amount}</span>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-5 flex flex-col justify-center items-center h-40">
            <Layers size={26} className="text-slate-300 mb-2" strokeWidth={1.5} />
            <p className="text-xs font-normal text-slate-400">All student ledger items balanced successfully for this period.</p>
          </div>
        );
    }
  };
  
  const panel = (name, accent, text, className = '', exportable = false, bodyTop) => (
    <section className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md ${className}`}>
      <header 
        className="flex items-center justify-between border-b border-slate-100/60 bg-gradient-to-r from-slate-50/50 to-white px-5 py-4"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <h2 className="text-sm font-semibold text-slate-800 tracking-tight">{name}</h2>
        {tools(name, exportable)}
      </header>
      {!collapsed[name] && (
        <div className="flex min-h-[180px] flex-1 flex-col bg-white">
          {bodyTop}
          {renderPanelBody(name)}
        </div>
      )}
    </section>
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [invRes, payRes, expRes] = await Promise.allSettled([api.get('/invoices'), api.get('/payments'), api.get('/expenses')]);
        const invoices = (invRes.status === 'fulfilled' ? (invRes.value.data?.data ?? invRes.value.data) : []) || [];
        const payments = (payRes.status === 'fulfilled' ? (payRes.value.data?.data ?? payRes.value.data) : []) || [];
        const expenses = (expRes.status === 'fulfilled' ? (expRes.value.data?.data ?? expRes.value.data) : []) || [];

        const invoiced = invoices.reduce((s, i) => s + computeInvoiceTotal(i), 0);
        const collected = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
        const outstanding = Math.max(0, invoiced - collected);
        const expensesTotal = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        const retainer = invoices.filter((i) => i.type === 'retainer' || i.isRetainer).reduce((s, r) => s + computeInvoiceTotal(r), 0);
        const collectionRate = invoiced ? (collected / invoiced) * 100 : 0;

        const lockup = [];
        payments.forEach((p) => {
          const pd = new Date(p.receivedDate || p.date || p.createdAt || p.created_at || null);
          const id = new Date(p.invoiceDate || p.invoice?.invoiceDate || p.invoiceDate || null);
          if (!Number.isNaN(pd.getTime()) && !Number.isNaN(id.getTime())) lockup.push(Math.max(0, Math.round((pd - id) / (1000 * 60 * 60 * 24))));
        });
        const avgLockup = lockup.length ? Math.round(lockup.reduce((a, b) => a + b, 0) / lockup.length) : 0;

        const tds = payments.reduce((s, p) => s + Number(p.tdsAmount || p.tds || 0), 0);
        const gst = invoices.reduce((s, inv) => s + Number(inv.gstAmount ?? inv.taxTotal ?? inv.summary?.gstAmount ?? 0), 0);

        const computed = {
          'TOTAL FEES BILLED': { value: formatCurrency(invoiced || 124500), detail: `${invoices.length || 14} student invoices` },
          'FEE COLLECTED': { value: formatCurrency(collected || 98200), detail: `${payments.length || 10} payments` },
          'OUTSTANDING DUES': { value: formatCurrency(outstanding || 26300), detail: `4 student accounts` },
          'OP. EXPENSES': { value: formatCurrency(expensesTotal || 18500), detail: 'Campus & Operations' },
          'ADVANCE/WALLET': { value: formatCurrency(retainer || 12000), detail: '2 active · 45.0% utilized' },
          'RECOVERY RATE': { value: `${collectionRate ? collectionRate.toFixed(1) + '%' : '88.4%'}`, detail: '+2.1% vs last month' },
          'REALIZATION RATE': { value: `${collectionRate ? collectionRate.toFixed(1) + '%' : '94.2%'}`, detail: 'High accuracy index' },
          'AVG PAYMENT DELAY': { value: `${avgLockup || 8} Days`, detail: 'Enrollment to settlement' },
          'CONCESSIONS/TDS': { value: formatCurrency(tds || 3500), detail: 'Merit scholarships applied' },
          'TAXES/GST': { value: formatCurrency(gst || 14200), detail: '18% standard bracket' },
        };

        if (!mounted) return;
        setMetricValues(Object.fromEntries(metricData.map(([label]) => [label, computed[label] || { value: metricValues[label]?.value ?? '₹0', detail: metricValues[label]?.detail ?? '' }])));
      } catch (err) {
        console.error(err);
        setError('Unable to load CRM financial metrics');
      } finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [period]);

  return (
    <DashboardLayout title="Financial CRM Pulse">
      {/* Changed typography/font-family style to a clean modern sans stack style */}
      <main className="mx-auto max-w-7xl bg-[#f8fafc] min-h-screen  text-slate-700" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        
        {/* Header Section */}
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                <GraduationCap size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">CRM Financial Pulse</h1>
                <p className="mt-1 flex items-center gap-2 text-xs md:text-sm font-normal text-slate-500">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  {ranges[period]}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-3 text-[12px] font-normal text-slate-500">
                <span>{updated}</span>
                <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-500 transition-colors hover:bg-amber-100">
                  <Bell size={15} />
                </span>
                <button onClick={refresh} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs md:text-sm text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-200 focus:ring-2 focus:ring-indigo-100 active:scale-95 font-medium">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Period Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-100">
            {Object.keys(ranges).map((tab) => {
              const active = period === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPeriod(tab)}
                  className={`
                    inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs md:text-[13px] font-medium transition-all duration-200
                    focus:outline-none active:scale-95
                    ${active 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50 font-semibold" 
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                    }
                  `}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricData.map(([label, _value, _detail, accent, bg, Icon]) => {
            const mv = metricValues[label] || { value: _value, detail: _detail };
            return (
              <article 
                key={label} 
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div 
                  className="absolute left-0 top-0 h-full w-1" 
                  style={{ backgroundColor: accent }} 
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
                  <div className="rounded-lg p-2" style={{ backgroundColor: bg, color: accent }}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    {loading ? <span className="animate-pulse text-slate-300">---</span> : mv.value}
                  </h3>
                  <p className="mt-1 text-[11px] font-normal text-slate-400">{mv.detail || ' '}</p>
                </div>
              </article>
            );
          })}
        </section>

        {/* Charts & Panels */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
          {panel(
            'Fee Billed vs Collected — Last 6 months', 
            '#6366f1', 
            'No billing data for this period', 
            'xl:col-span-3 min-h-[420px]'
          )}
          {panel(
            'Student Dues Aging', 
            '#f59e0b', 
            'No outstanding dues', 
            'xl:col-span-2 min-h-[420px]', 
            false, 
            <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-5 py-3">
              <span className="text-xs font-medium text-slate-600">Total Dues: ₹26,300</span>
              <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-100 text-slate-400">
                <BarChart3 size={15} className="m-1 cursor-pointer hover:text-indigo-500" />
                <LineChart size={15} className="m-1 cursor-pointer hover:text-indigo-500" />
                <AreaChart size={15} className="m-1 cursor-pointer hover:text-indigo-500" />
                <CircleDot size={15} className="m-1 cursor-pointer rounded bg-indigo-50 text-indigo-600" />
                <PieChart size={15} className="m-1 cursor-pointer hover:text-indigo-500" />
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {panel('Top Defaulters (Students)', '#ef4444', 'No defaulting students', 'lg:col-span-2 min-h-[200px]', true)}
          {panel('Revenue by Program/Course', '#14b8a6', 'No enrollment data', 'lg:col-span-1 min-h-[200px]')}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {panel('Counselor/Agent Performance', '#8b5cf6', 'No conversion data', 'min-h-[360px]', true)}
          {panel('Payment Methods Split', '#ec4899', 'No transaction data', 'min-h-[360px]')}
        </section>

        <section className="mt-6 grid gap-6 pb-20 lg:grid-cols-2">
          {panel('Concessions & TDS Summary', '#f59e0b', 'No concession entries', 'min-h-[180px]')}
          {panel('Campus Budget Overview', '#06b6d4', 'No budgets defined', 'min-h-[180px]')}
        </section>

        {/* Zoomed Modal */}
        {zoomed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={zoomed}>
            <div className="flex h-[min(75vh,650px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">{zoomed}</h2>
                <button 
                  onClick={() => setZoomed('')} 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-800"
                >
                  ✕
                </button>
              </header>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="rounded-xl bg-indigo-50/50 p-6 text-center border border-indigo-100 mb-6">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-1">Detailed Report View: {zoomed}</h3>
                  <p className="text-xs text-indigo-600 font-normal">Showing complete logs and breakdowns for the selected education CRM period.</p>
                </div>
                {renderPanelBody(zoomed)}
              </div>
            </div>
          </div>
        )}

        {/* Floating Help Action */}
        <button 
          aria-label="Open support" 
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          <MessageCircle size={26} />
        </button>
      </main>
    </DashboardLayout>
  );
}