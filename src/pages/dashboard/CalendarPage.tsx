import { useMemo, useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Grid3X3,
  Landmark,
  List,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import API from '@/lib/api'; // Aapka axios instance

type Scope = 'mine' | 'office' | 'holidays';
type Category = 'Hearing' | 'Task' | 'Meeting' | 'Holiday' | 'Deadline' | 'Appointment' | 'Reminder' | 'Other';
type CalendarEventItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  category: Category;
  scope: Scope;
  description?: string;
  color: string;
  allDay?: boolean;
};

const categoryColor: Record<Category, string> = {
  Hearing: '#ef4444', Task: '#7c3aed', Meeting: '#2563eb', Holiday: '#16a34a', Deadline: '#f59e0b', Appointment: '#0891b2', Reminder: '#d97706', Other: '#64748b',
};

const asDateInput = (date = new Date()) => date.toISOString().slice(0, 10);
const asDateTimeInput = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const normalizeCalendarEvent = (item: any): CalendarEventItem => ({
  id: item?.id ?? item?._id ?? item?.eventId ?? '',
  title: item?.title || 'Untitled Event',
  start: item?.start || item?.date || '',
  end: item?.end,
  category: (item?.category as Category) || 'Other',
  scope: (item?.scope as Scope) || 'mine',
  description: item?.description || '',
  color: item?.color || categoryColor[(item?.category as Category) || 'Other'],
  allDay: Boolean(item?.allDay),
});

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [scope, setScope] = useState<Scope>('mine');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [form, setForm] = useState({ title: '', start: asDateTimeInput(), end: asDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)), category: 'Meeting' as Category, allDay: false, location: '', relatedCase: '', relatedClient: '', description: '', reminder: '15 minutes before' });

  // API Integration: Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/calendar');
        const normalized = Array.isArray(data) ? data.map(normalizeCalendarEvent) : [];
        setEvents(normalized);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const shownEvents = useMemo(() => events.filter((event) =>
    event.scope === scope &&
    event.title.toLowerCase().includes(search.trim().toLowerCase()) &&
    (categories.length === 0 || categories.includes(event.category)),
  ), [categories, events, scope, search]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    const inDay = (event: CalendarEventItem, date: Date) => new Date(event.start).toDateString() === date.toDateString();
    return [
      ['Today', events.filter((event) => inDay(event, today)).length, '0 hearings, 0 tasks', 'blue'],
      ['Tomorrow', events.filter((event) => inDay(event, tomorrow)).length, '0 hearings', 'indigo'],
      ['Next 7 Days', events.filter((event) => { const d = new Date(event.start); return d >= today && d <= nextWeek; }).length, '0 hearings', 'green'],
      ['Overdue', events.filter((event) => new Date(event.start) < today).length, '0 tasks, 0 deadlines', 'slate'],
      ['Hearings', events.filter((event) => event.category === 'Hearing').length, 'This month', 'red'],
      ['Tasks', events.filter((event) => event.category === 'Task').length, 'Due this month', 'purple'],
    ] as const;
  }, [events]);

  const changeView = (nextView: string) => { setView(nextView); calendarRef.current?.getApi().changeView(nextView); };
  const navigate = (action: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi(); if (!api) return;
    api[action](); setCurrentDate(api.getDate());
  };
  const openNewEvent = (date = asDateInput()) => {
    const start = new Date(`${date}T09:00`);
    setForm({ title: '', start: asDateTimeInput(start), end: asDateTimeInput(new Date(start.getTime() + 60 * 60 * 1000)), category: 'Meeting', allDay: false, location: '', relatedCase: '', relatedClient: '', description: '', reminder: '15 minutes before' });
    setEditingEventId(null);
    setModalOpen(true);
  };

  const openEditEvent = (calendarEvent: CalendarEventItem) => {
    const start = new Date(calendarEvent.start);
    const end = calendarEvent.end ? new Date(calendarEvent.end) : new Date(start.getTime() + 60 * 60 * 1000);
    setForm({
      title: calendarEvent.title,
      start: asDateTimeInput(start),
      end: asDateTimeInput(end),
      category: calendarEvent.category || 'Meeting',
      allDay: !calendarEvent.end,
      location: '', relatedCase: '', relatedClient: '',
      description: calendarEvent.description || '',
      reminder: '15 minutes before',
    });
    setScope(calendarEvent.scope || 'mine');
    setEditingEventId(calendarEvent.id);
    setModalOpen(true);
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      await API.delete(`/calendar/${id}`);
      setEvents((prev) => prev.filter((ev) => String(ev.id) !== String(id)));
      setModalOpen(false);
      setEditingEventId(null);
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete event');
    }
  };

  const updateEvent = async (id: string, updatedData: Omit<CalendarEventItem, 'id'>) => {
    try {
      const { data } = await API.put(`/calendar/${id}`, updatedData);
      setEvents((prev) => prev.map((ev) => (String(ev.id) === String(id) ? normalizeCalendarEvent(data) : ev)));
    } catch (error) {
      console.error('Update failed', error);
      throw error;
    }
  };

  // API Integration: Save Event
  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    try {
      const payload = {
        title: form.title.trim(),
        start: new Date(form.start).toISOString(),
        end: form.allDay ? undefined : new Date(form.end).toISOString(),
        category: form.category,
        scope: scope,
        description: [form.description.trim(), form.location && `Location: ${form.location}`].filter(Boolean).join('\n'),
        color: categoryColor[form.category],
        allDay: form.allDay
      };

      if (editingEventId) {
        await updateEvent(editingEventId, payload);
      } else {
        const { data } = await API.post('/calendar', payload);
        setEvents((previous) => [...previous, normalizeCalendarEvent(data)]);
      }
      setModalOpen(false);
      setEditingEventId(null);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    }
  };

  const exportEvents = () => {
    const rows = [['Title', 'Date', 'Category', 'Calendar'], ...shownEvents.map((event) => [event.title, new Date(event.start).toLocaleString(), event.category, event.scope])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'calendar-events.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  const toggleCategory = (category: Category) => setCategories((active) => active.includes(category) ? active.filter((item) => item !== category) : [...active, category]);
  const dateLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const scopeButtons: { id: Scope; label: string; icon: typeof UserRound }[] = [
    { id: 'mine', label: 'My Calendar', icon: UserRound }, { id: 'office', label: 'Office Calendar', icon: Building2 }, { id: 'holidays', label: 'Court Holidays', icon: Landmark },
  ];

  return <DashboardLayout title="Calendar">
    <section className="calendar-page mx-auto max-w-[1320px] text-slate-700">
      <header className="flex flex-col gap-4 pb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button aria-label="Go back" onClick={() => history.back()} className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><ArrowLeft size={21} /></button>
          <CalendarDays className="text-blue-600" size={28} aria-hidden="true" />
          <h1 className="text-[25px] font-bold tracking-[-0.03em] text-slate-950">Calendar</h1>
        </div>
        <p className="text-sm text-slate-500">View and manage all your events, hearings, tasks, and deadlines</p>
      </header>

      <nav aria-label="Calendar controls" className="flex flex-wrap items-center gap-2 pb-6">
        {scopeButtons.slice(0, 2).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setScope(id)} aria-pressed={scope === id} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${scope === id ? 'bg-white text-slate-800 shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><Icon size={16} className={id === 'office' ? 'text-green-600' : ''} />{label}</button>)}
        {scopeButtons.slice(2).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setScope(id)} aria-pressed={scope === id} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${scope === id ? 'border-green-300 bg-green-50 text-green-700' : 'border-green-300 bg-white text-green-700 hover:bg-green-50'}`}><Icon size={16} />{label}</button>)}
        <button onClick={exportEvents} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Download size={16} />Export</button>
        <button onClick={() => openNewEvent()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"><Plus size={17} />Add Event</button>
      </nav>

      <div className="grid gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {stats.map(([title, value, detail, tone]) => <article key={title} className={`stat-card stat-${tone} rounded-lg border px-3 py-2.5`}><p className="text-sm font-medium">{title === 'Hearings' && '⚒ '}{title === 'Tasks' && '☑ '}{title}</p><p className="mt-0.5 text-2xl font-bold leading-6">{value}</p><p className="mt-2 text-xs">{detail}</p></article>)}
      </div>

      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><button aria-label="Previous period" onClick={() => navigate('prev')} className="icon-button"><ChevronLeft size={19} /></button><button onClick={() => navigate('today')} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600">Today</button><button aria-label="Next period" onClick={() => navigate('next')} className="icon-button"><ChevronRight size={19} /></button></div>
            <h2 className="text-lg font-semibold text-slate-900">{dateLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"><Search size={16} className="text-slate-400" /><span className="sr-only">Search calendar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="w-28 bg-transparent outline-none placeholder:text-slate-400 sm:w-36" /></label>
            <div className="relative"><button aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 ${categories.length ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}><Filter size={16} />Filters{categories.length ? ` (${categories.length})` : ''}</button>
              {filterOpen && <div className="absolute left-0 top-11 z-20 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-xl"><p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Event types</p>{(Object.keys(categoryColor) as Category[]).map((category) => <label key={category} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />{category}</label>)}<button onClick={() => setCategories([])} className="mt-1 w-full rounded px-2 py-1.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50">Clear filters</button></div>}</div>
            <div className="ml-auto flex items-center rounded-lg bg-slate-100 p-1" role="group" aria-label="Calendar view">{[{ key: 'listWeek', icon: List, label: 'List' }, { key: 'timeGridDay', icon: CalendarDays, label: 'Day' }, { key: 'timeGridWeek', icon: CalendarDays, label: 'Week' }, { key: 'dayGridMonth', icon: Grid3X3, label: 'Month' }].map(({ key, icon: Icon, label }) => <button key={key} onClick={() => changeView(key)} aria-label={label} aria-pressed={view === key} className={`rounded-md p-1.5 transition focus-visible:ring-2 focus-visible:ring-blue-600 ${view === key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Icon size={16} /></button>)}</div>
            <button aria-label="Refresh calendar" onClick={() => { setSearch(''); setCategories([]); calendarRef.current?.getApi().today(); }} className="icon-button"><RefreshCw size={16} /></button>
          </div>
        </div>
        <div className="calendar-shell p-3 sm:p-4"><FullCalendar ref={calendarRef} plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={false} events={shownEvents} editable selectable dayMaxEvents={3} fixedWeekCount={false} eventDisplay="block" height="auto" contentHeight={560} datesSet={(arg) => setCurrentDate(arg.view.calendar.getDate())} dateClick={(arg) => openNewEvent(arg.dateStr)} eventClick={(arg) => {
          const item = events.find((event) => String(event.id) === String(arg.event.id)) || shownEvents.find((event) => String(event.id) === String(arg.event.id));
          if (item) {
            openEditEvent(item);
          }
        }} /></div>
      </div>
    </section>

    {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <form
          onSubmit={saveEvent}
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 id="event-title" className="text-xl font-bold text-slate-950">{editingEventId ? 'Edit Event' : 'Create New Event'}</h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-900">Event Type</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([
                    ['Hearing', BriefcaseBusiness, 'text-red-500'],
                    ['Meeting', UserRound, 'text-blue-600'],
                    ['Deadline', BellRing, 'text-orange-500'],
                    ['Task', CheckSquare, 'text-purple-600'],
                    ['Appointment', CalendarClock, 'text-cyan-600'],
                    ['Reminder', BellRing, 'text-amber-500'],
                    ['Holiday', CalendarDays, 'text-green-600'],
                    ['Other', FileText, 'text-slate-500'],
                  ] as [Category, typeof BriefcaseBusiness, string][]).map(([category, Icon, color]) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => setForm({ ...form, category })}
                      aria-pressed={form.category === category}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${form.category === category ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <Icon size={16} className={color} />
                      {category}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-medium text-slate-900">
                Event Title <span className="text-red-500">*</span>
                <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., Client Consultation" />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-900">
                  Start Date
                  <input type="datetime-local" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-slate-900">
                  End Date
                  <input type="datetime-local" required={!form.allDay} disabled={form.allDay} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50 disabled:text-slate-400" />
                </label>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                All day event
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Location
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Office, Court Room, or Zoom" />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-900">
                  Related Case
                  <select value={form.relatedCase} onChange={(e) => setForm({ ...form, relatedCase: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">No case linked</option>
                    <option>Case #1024</option>
                    <option>Case #1025</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-900">
                  Related Client
                  <select value={form.relatedClient} onChange={(e) => setForm({ ...form, relatedClient: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">No client linked</option>
                    <option>Client A</option>
                    <option>Client B</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-900">
                Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[100px]" placeholder="Add event details..." />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            {editingEventId && <button type="button" onClick={() => deleteEvent(editingEventId)} className="mr-auto rounded-lg border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">Delete Event</button>}
            <button type="button" onClick={() => { setModalOpen(false); setEditingEventId(null); }} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">{editingEventId ? 'Save Changes' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    )}
  </DashboardLayout>;
}
