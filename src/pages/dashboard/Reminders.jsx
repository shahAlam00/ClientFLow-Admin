import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle, ArrowLeft, Bell, CalendarDays, Check, CheckCircle2, ChevronDown,
    Clock3, Filter, LockKeyhole, Pencil, Phone, Plus, RefreshCw, Search,
    Trash2, UsersRound, Video, X, RotateCcw, MessageSquareMore
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import api from "@/lib/axios";

const day = (offset) => {
    const value = new Date();
    value.setHours(9, 0, 0, 0);
    value.setDate(value.getDate() + offset);
    return value.toISOString().slice(0, 10);
};
const formatDate = (date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const isToday = (date) => date === day(0);
const isOverdue = (reminder) => reminder.status !== "Completed" && reminder.date < day(0);
const emptyReminder = () => ({ customer: "", title: "", description: "", date: day(0), priority: "Medium", type: "Call", recurring: false });
const reminderId = (reminder) => reminder?._id || reminder?.id;
const reminderPayload = ({ customer, title, description, date, priority, type, status = "Pending", recurring }) => ({ customer, title, description, date, priority, type, status, recurring });
const normalizeReminder = (reminder) => ({ ...reminder, id: reminderId(reminder), customer: reminder.customer || reminder.customerName || reminder.clientName || "", title: reminder.title || reminder.reminderText || reminder.reminder || "", description: reminder.description || reminder.notes || "", date: String(reminder.date || reminder.dueDate || reminder.reminderDate || day(0)).slice(0, 10), priority: reminder.priority || "Medium", type: reminder.type || reminder.reminderType || "Call", status: reminder.status || "Pending", recurring: Boolean(reminder.recurring ?? reminder.isRecurring) });
const responseList = (response) => {
    const data = response.data?.data ?? response.data;
    const list = Array.isArray(data) ? data : data?.reminders || data?.items || [];
    return Array.isArray(list) ? list.map(normalizeReminder) : [];
};

const initialReminders = [
    ["Shah Alam", "Discuss case strategy", "Review evidence before tomorrow's hearing.", -14, "Low", "Call", "Overdue", true],
    ["Rohan Sharma", "Send settlement documents", "Share the final draft for client approval.", -5, "High", "Follow Up", "Overdue"],
    ["Priya Mehta", "Confirm hearing attendance", "Check whether all witnesses are available.", -1, "Medium", "Meeting", "Overdue"],
    ["Aarav Verma", "Follow up on invoice", "Payment is pending for the June consultation.", 0, "High", "Follow Up", "Pending"],
    ["Neha Kapoor", "Review contract clauses", "Discuss the indemnity and termination clauses.", 0, "Medium", "Call", "Pending"],
    ["Vikram Rao", "Client onboarding call", "Collect KYC documents and engagement letter.", 0, "Low", "Call", "Pending"],
    ["Anita Desai", "Team case review", "Weekly litigation matter review with the team.", 1, "Medium", "Meeting", "Pending", true],
    ["Meera Iyer", "Prepare response draft", "Start the written response to the notice.", 2, "High", "Follow Up", "Pending"],
    ["Kabir Singh", "Share hearing notes", "Send concise notes from the last hearing.", 3, "Low", "Follow Up", "Pending"],
    ["Sonal Gupta", "Mediation preparation", "Schedule preparation discussion with the client.", 4, "High", "Meeting", "Pending"],
    ["Dev Malhotra", "Check document status", "Verify filing documents received from client.", 5, "Medium", "Follow Up", "Pending"],
    ["Isha Khanna", "Discovery call", "Clarify missing information in the discovery list.", 6, "Low", "Call", "Pending"],
    ["Ramesh Nair", "Fee review meeting", "Review outstanding fees and proposed payment plan.", 8, "Medium", "Meeting", "Pending"],
    ["Tanya Bose", "Share case update", "Send the monthly progress update.", -1, "Low", "Follow Up", "Completed"],
    ["Karan Patel", "Initial consultation", "Discuss the case timeline and next actions.", 0, "Medium", "Call", "Completed"],
].map(([customer, title, description, offset, priority, type, status, recurring], index) => ({ id: `r-${index + 1}`, customer, title, description, date: day(offset), priority, type, status, recurring: Boolean(recurring) }));

const typeConfig = {
    Call: { icon: Phone, className: "bg-red-50 text-red-500" },
    Meeting: { icon: UsersRound, className: "bg-violet-50 text-violet-500" },
    "Follow Up": { icon: MessageSquareMore, className: "bg-blue-50 text-blue-500" },
};
const priorityClass = { Low: "border-emerald-300 bg-emerald-50 text-emerald-700", Medium: "border-blue-300 bg-blue-50 text-blue-700", High: "border-orange-300 bg-orange-50 text-orange-700" };

function ModalShell({ children, onClose }) {
    return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
        <motion.div initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }} transition={{ duration: .18 }} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>{children}</motion.div>
    </motion.div></AnimatePresence>;
}

function ReminderFormModal({ draft, mode, onClose, onSave }) {
    const [form, setForm] = useState(draft);
    const [submitted, setSubmitted] = useState(false);
    const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
    const save = (event) => { event.preventDefault(); setSubmitted(true); if (form.customer.trim() && form.title.trim() && form.date) onSave(form); };
    const fieldClass = "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    return <ModalShell onClose={onClose}><form onSubmit={save}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div className="flex items-center gap-2 text-slate-900"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-white-600"><Bell size={17} /></span><h2 className="font-sans text-lg font-bold">{mode === "edit" ? "Edit Reminder" : "New Reminder"}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button></div>
        <div className="grid gap-4 p-6 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Customer <span className="text-red-500">*</span><input autoFocus value={form.customer} onChange={(e) => update("customer", e.target.value)} placeholder="Customer name" className={fieldClass} />{submitted && !form.customer.trim() && <span className="mt-1 block text-xs text-red-500">Customer is required.</span>}</label><label className="text-sm font-medium text-slate-700">Due date <span className="text-red-500">*</span><input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={fieldClass} /></label><label className="sm:col-span-2 text-sm font-medium text-slate-700">Reminder <span className="text-red-500">*</span><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="What needs to be done?" className={fieldClass} />{submitted && !form.title.trim() && <span className="mt-1 block text-xs text-red-500">Reminder text is required.</span>}</label><label className="sm:col-span-2 text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Add useful context" rows="2" className={`${fieldClass} resize-none`} /></label><label className="text-sm font-medium text-slate-700">Priority<select value={form.priority} onChange={(e) => update("priority", e.target.value)} className={fieldClass}>{["Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Type<select value={form.type} onChange={(e) => update("type", e.target.value)} className={fieldClass}>{Object.keys(typeConfig).map((item) => <option key={item}>{item}</option>)}</select></label><label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"><button type="button" onClick={() => update("recurring", !form.recurring)} className={`relative h-5 w-9 rounded-full transition ${form.recurring ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${form.recurring ? "left-4.5 translate-x-0" : "left-0.5"}`} style={form.recurring ? { left: "18px" } : undefined} /></button>Make this a recurring reminder</label></div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><motion.button whileTap={{ scale: .98 }} whileHover={{ y: -1 }} type="submit" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white shadow-sm">{mode === "edit" ? "Save changes" : "Create reminder"}</motion.button></div>
    </form></ModalShell>;
}

function FilterDropdown({ filters, setFilters, onClose }) { const change = (key, value) => setFilters((old) => ({ ...old, [key]: old[key] === value ? "" : value })); return <div className="absolute right-10 top-11 z-30 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-bold text-slate-800">Filter reminders</span><button onClick={() => setFilters({ priority: "", type: "", status: "" })} className="text-xs font-semibold text-blue-600">Clear</button></div>{[["priority", "Priority", ["Low", "Medium", "High"]], ["type", "Reminder type", ["Call", "Meeting", "Follow Up"]], ["status", "Status", ["Pending", "Completed", "Overdue"]]].map(([key, label, values]) => <div key={key} className="mb-3"><p className="mb-1.5 text-xs font-semibold text-slate-500">{label}</p><div className="flex flex-wrap gap-1.5">{values.map((value) => <button key={value} onClick={() => change(key, value)} className={`rounded-md border px-2 py-1 text-xs transition ${filters[key] === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{value}</button>)}</div></div>)}<button onClick={onClose} className="mt-1 w-full rounded-lg bg-slate-800 py-2 text-xs font-semibold text-white">Done</button></div>; }

function ReminderCard({ reminder, onComplete, onEdit, onDelete, onSnooze }) {
    const config = typeConfig[reminder.type]; const TypeIcon = config.icon; const overdue = isOverdue(reminder);
    return <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} whileHover={{ y: -2, boxShadow: "0 12px 24px -18px rgba(15,23,42,.42)" }} className="relative flex gap-4 border-b border-slate-100 bg-white px-4 py-4 transition last:border-b-0 sm:px-5"><span className={`absolute bottom-4 left-4 top-4 w-1 rounded-full ${overdue ? "bg-red-400" : reminder.status === "Completed" ? "bg-slate-300" : "bg-emerald-400"}`} /><div className={`ml-4 grid h-10 w-10 shrink-0 place-items-center rounded-lg ${config.className}`}><TypeIcon size={20} /></div><div className="min-w-0 flex-1 pr-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold text-slate-800">{reminder.customer}</h3>{reminder.recurring && <span className="text-xs font-medium text-violet-600">⟳ Recurring</span>}</div><p className="mt-0.5 truncate text-sm text-slate-600">{reminder.title}</p><p className="mt-1 hidden truncate text-xs text-slate-400 sm:block">{reminder.description}</p><div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${overdue ? "text-red-500" : "text-slate-500"}`}><Clock3 size={14} />{formatDate(reminder.date)}</div></div><div className="flex shrink-0 flex-col items-end gap-3"><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityClass[reminder.priority]}`}>{reminder.priority}</span><div className="flex items-center gap-1 text-slate-400">{reminder.status !== "Completed" && <><button title="Complete" onClick={() => onComplete(reminder.id)} className="rounded-md p-1.5 text-emerald-500 hover:bg-emerald-50"><Check size={17} /></button><div className="relative group"><button title="Snooze" className="rounded-md p-1.5 text-orange-500 hover:bg-orange-50"><Clock3 size={17} /></button><div className="invisible absolute right-0 top-8 z-20 w-28 rounded-lg border border-slate-200 bg-white p-1 shadow-lg group-hover:visible group-focus-within:visible">{[["30 min", .021], ["1 hour", .042], ["Tomorrow", 1], ["Next week", 7]].map(([label, amount]) => <button key={label} onClick={() => onSnooze(reminder.id, amount)} className="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50">{label}</button>)}</div></div></>}<button title="Edit" onClick={() => onEdit(reminder)} className="rounded-md p-1.5 hover:bg-slate-100"><Pencil size={16} /></button><button title="Delete" onClick={() => onDelete(reminder)} className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button></div></div></motion.article>;
}

export default function Reminders() {
    const [reminders, setReminders] = useState([]); const [tab, setTab] = useState("Active"); const [search, setSearch] = useState(""); const [filters, setFilters] = useState({ priority: "", type: "", status: "" }); const [filterOpen, setFilterOpen] = useState(false); const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null); const [, setError] = useState(""); const skipSync = useRef(true); const previousReminders = useRef([]);
    const loadReminders = async () => {
        try { setError(""); const response = await api.get("/reminders"); skipSync.current = true; setReminders(responseList(response)); }
        catch (requestError) { setError(requestError.response?.data?.message || "Reminders could not be loaded."); }
    };
    useEffect(() => { loadReminders(); }, []);
    useEffect(() => {
        if (skipSync.current) { skipSync.current = false; previousReminders.current = reminders; return; }
        const previous = previousReminders.current;
        const previousById = new Map(previous.map((reminder) => [reminder.id, reminder]));
        const currentIds = new Set(reminders.map((reminder) => reminder.id));
        const deleted = previous.filter((reminder) => !currentIds.has(reminder.id));
        const changed = reminders.filter((reminder) => {
            const oldReminder = previousById.get(reminder.id);
            return oldReminder && (oldReminder.status !== reminder.status || oldReminder.date !== reminder.date);
        });
        previousReminders.current = reminders;
        Promise.all([
            ...deleted.map((reminder) => api.delete(`/reminders/${reminder.id}`)),
            ...changed.map((reminder) => api.put(`/reminders/${reminder.id}`, reminderPayload(reminder))),
        ]).catch((requestError) => setError(requestError.response?.data?.message || "Reminder could not be updated."));
    }, [reminders]);
    const summary = useMemo(() => ({ overdue: reminders.filter(isOverdue).length, today: reminders.filter((r) => isToday(r.date) && r.status !== "Completed").length, week: reminders.filter((r) => r.status !== "Completed" && r.date >= day(0) && r.date <= day(7)).length, done: reminders.filter((r) => r.status === "Completed" && isToday(r.date)).length, pending: reminders.filter((r) => r.status === "Pending").length }), [reminders]);
    const shown = useMemo(() => reminders.filter((r) => { const q = search.toLowerCase(); const actualStatus = isOverdue(r) ? "Overdue" : r.status; const tabPass = tab === "All" || (tab === "Active" && actualStatus !== "Completed") || (tab === "Today" && isToday(r.date)) || tab === actualStatus; return tabPass && (!q || [r.customer, r.title, r.description].some((v) => v.toLowerCase().includes(q))) && (!filters.priority || r.priority === filters.priority) && (!filters.type || r.type === filters.type) && (!filters.status || actualStatus === filters.status); }), [reminders, tab, search, filters]);
    const save = async (form) => {
        try { setError(""); if (editing?.id) await api.put(`/reminders/${editing.id}`, reminderPayload({ ...editing, ...form })); else await api.post("/reminders", reminderPayload(form)); setEditing(null); await loadReminders(); }
        catch (requestError) { setError(requestError.response?.data?.message || "Reminder could not be saved."); }
    };
    const snooze = async (id, amount) => {
        const reminder = reminders.find((item) => item.id === id);
        if (!reminder) return;
        try {
            setError("");
            const nextReminder = { ...reminder, date: day(Math.ceil(amount)), status: "Pending" };
            await api.put(`/reminders/${id}`, reminderPayload(nextReminder));
            skipSync.current = true;
            setReminders((all) => all.map((item) => item.id === id ? nextReminder : item));
        }
        catch (requestError) { setError(requestError.response?.data?.message || "Reminder could not be snoozed."); }
    };
    const removeReminder = async () => {
        try { setError(""); await api.delete(`/reminders/${deleting.id}`); setDeleting(null); await loadReminders(); }
        catch (requestError) { setError(requestError.response?.data?.message || "Reminder could not be deleted."); }
    };
    const tabs = ["Active", "Today", "Overdue", "Completed", "All"];
    const cards = [[AlertTriangle, summary.overdue, "Overdue", "text-red-500", "bg-red-100"], [CalendarDays, summary.today, "Today", "text-blue-600", "bg-blue-100"], [CalendarDays, summary.week, "This Week", "text-violet-600", "bg-violet-100"], [CheckCircle2, summary.done, "Done Today", "text-emerald-500", "bg-emerald-100"], [Clock3, summary.pending, "Pending", "text-slate-600", "bg-slate-100"]];
    return <DashboardLayout><main className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 "><div className="mx-auto max-w-7xl">
        
<header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    {/* LEFT SIDE */}
    <div className="flex items-start gap-4">

        <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="mt-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
            <ArrowLeft size={21} />
        </button>

        <div>

            <div className="flex items-center gap-2">
                <Bell size={26} className="text-blue-600" />

                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                    Reminders
                </h1>
            </div>

            <p className="mt-1 text-[15px] text-slate-600">
                Manage your personal and team reminders
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <LockKeyhole size={13} />
                Private to you — only you can see these reminders, unless you assign one to a teammate.
            </p>

        </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="flex justify-end">

        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setEditing(emptyReminder())}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-105 active:scale-95 whitespace-nowrap"
        >
            <Plus className="h-4 w-4" />
            <span>New Reminder</span>
        </motion.button>

    </div>

</header>
        <section className="mb-6 grid grid-cols-1 gap-4 min-[540px]:grid-cols-2 lg:grid-cols-3">{cards.map(([Icon, count, label, color, bg]) => <motion.div whileHover={{ y: -3 }} key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-lg ${bg} ${color}`}><Icon size={20} /></div><div><p className={`text-2xl font-bold leading-none ${color}`}>{count}</p><p className="mt-1 text-xs font-medium text-slate-600">{label}</p></div></motion.div>)}</section><section className="overflow-visible rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1">{tabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`relative whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${tab === name ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{name}{name === "Overdue" && summary.overdue > 0 && <span className="ml-2 inline-grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs text-white">{summary.overdue}</span>}</button>)}</div><div className="relative flex gap-2"><label className="relative min-w-0 flex-1 lg:w-64"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reminders..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500" /></label><button onClick={() => setFilterOpen((open) => !open)} className={`rounded-lg border border-slate-200 p-2.5 ${filterOpen ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`} title="Filters"><Filter size={19} /></button><button onClick={() => { setSearch(""); setFilters({ priority: "", type: "", status: "" }); setTab("Active"); }} className="rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" title="Reset filters"><RefreshCw size={19} /></button>{filterOpen && <FilterDropdown filters={filters} setFilters={setFilters} onClose={() => setFilterOpen(false)} />}</div></div>{tab === "Overdue" && <div className="border-b border-red-50 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">Overdue ({shown.length})</div>}<div><AnimatePresence mode="popLayout">{shown.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} onComplete={(id) => setReminders((all) => all.map((r) => r.id === id ? { ...r, status: "Completed" } : r))} onEdit={setEditing} onDelete={setDeleting} onSnooze={snooze} />)}</AnimatePresence>{!shown.length && <div className="grid min-h-64 place-items-center p-8 text-center"><div><Bell className="mx-auto mb-3 text-slate-300" size={36} /><p className="font-semibold text-slate-700">No reminders found</p><p className="mt-1 text-sm text-slate-400">Try changing your search or filters.</p></div></div>}</div></section></div></main>{editing && <ReminderFormModal draft={editing} mode={editing.id ? "edit" : "new"} onClose={() => setEditing(null)} onSave={save} />} {deleting && <ModalShell onClose={() => setDeleting(null)}><div className="p-6"><div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500"><Trash2 size={20} /></div><h2 className="font-sans text-lg font-bold text-slate-900">Delete reminder?</h2><p className="mt-2 text-sm text-slate-500">This will permanently delete the reminder for {deleting.customer}.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleting(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button onClick={() => { setReminders((all) => all.filter((r) => r.id !== deleting.id)); setDeleting(null); }} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white">Delete</button></div></div></ModalShell>}</DashboardLayout>;
}