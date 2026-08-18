import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown,
  CircleDollarSign, ClipboardList, FileText, FolderPlus, LayoutList, MessageSquare,
  Paperclip, Plus, Search, ShieldCheck, Tag, Users, X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { createMatter, getMatterById, updateMatter } from '@/services/matterService';
import { getClients } from '@/services/clientService';

const workTypeSeed = [
  'Documentation', 'IP Filing', 'Legal Notice', 'Application drafting',
  'Complaint / notice drafting', 'Court proceeding support', 'Notices & evidence',
  'Police station visit', 'Other legal work',
];

const statusOptions = [
  { id: 'ongoing', title: 'In progress', description: 'Work has started', dot: 'bg-blue-500', active: 'border-blue-500 bg-blue-50/70 ring-blue-100' },
  { id: 'pending_approval', title: 'Awaiting approval', description: 'Needs senior review', dot: 'bg-amber-500', active: 'border-amber-500 bg-amber-50/70 ring-amber-100' },
  { id: 'pending_client', title: 'Awaiting client', description: 'Waiting for a response', dot: 'bg-slate-500', active: 'border-slate-500 bg-slate-50 ring-slate-100' },
  { id: 'completed', title: 'Completed', description: 'Work is already finished', dot: 'bg-emerald-500', active: 'border-emerald-500 bg-emerald-50/70 ring-emerald-100' },
  { id: 'draft', title: 'Not started', description: 'Save this work for later', dot: 'bg-violet-500', active: 'border-violet-500 bg-violet-50/70 ring-violet-100' },
  { id: 'on_hold', title: 'On hold', description: 'Temporarily paused', dot: 'bg-cyan-500', active: 'border-cyan-500 bg-cyan-50/70 ring-cyan-100' },
];

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';
const deliverableText = (deliverable) => typeof deliverable === 'string'
  ? deliverable
  : deliverable?.title || deliverable?.name || deliverable?.description || '';
const clientDisplayName = (client) => client?.name || client?.fullName || [client?.firstName, client?.middleName, client?.lastName].filter(Boolean).join(' ') || client?.companyName || client?.email || 'Unnamed client';

function FormSection({ id, icon: Icon, title, description, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-6"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-4.5 w-4.5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-900">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{description}</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div id={id} className="border-t border-slate-100 px-4 py-5 sm:px-6">{children}</div>}
    </section>
  );
}

export default function AddNewMatter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [openSections, setOpenSections] = useState({ type: true, details: true, status: true, team: false, timeline: false, billing: false, deliverables: false, files: false, notes: false, notifications: false });
  const [workTypes, setWorkTypes] = useState(workTypeSeed);
  const [selectedWorkType, setSelectedWorkType] = useState(workTypeSeed[0]);
  const [searchWorkType, setSearchWorkType] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [client, setClient] = useState('');
  const [matterTitle, setMatterTitle] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [assignedTo, setAssignedTo] = useState('');
  const [supervisedBy, setSupervisedBy] = useState('');
  const [assistedBy, setAssistedBy] = useState('');
  const [linkToCase, setLinkToCase] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [complexity, setComplexity] = useState('Medium');
  const [tags, setTags] = useState(['urgent', 'vip-client']);
  const [tagInput, setTagInput] = useState('');
  const [dates, setDates] = useState({ start: new Date().toISOString().slice(0, 10), due: '', completion: '', delivery: '' });
  const [isBillable, setIsBillable] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [deliverableInput, setDeliverableInput] = useState('');
  const [files, setFiles] = useState([]);
  const [internalNotes, setInternalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [notifications, setNotifications] = useState({ inApp: true, email: true, whatsApp: false });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getClients().then(setClients).catch(() => setError('Clients could not be loaded.'));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMatterById(id).then((response) => {
      const matter = response?.matter || response;
      setClient(matter.client?._id || matter.clientId || matter.client || '');
      setMatterTitle(matter.matterTitle || matter.title || '');
      setSelectedWorkType(matter.workType || matter.type || workTypeSeed[0]);
      setScopeOfWork(matter.scopeOfWork || ''); setDescription(matter.description || '');
      setStatus(matter.status || 'ongoing'); setAssignedTo(matter.assignedTo || '');
      setSupervisedBy(matter.supervisedBy || ''); setAssistedBy(matter.assistedBy || '');
      setLinkToCase(matter.linkToCase || ''); setPriority(matter.priority || 'Medium');
      setComplexity(matter.complexity || 'Medium'); setTags(matter.tags || []);
      setDates({ start: matter.startDate?.slice?.(0, 10) || matter.dates?.start || '', due: matter.dueDate?.slice?.(0, 10) || matter.dates?.due || '', completion: matter.completionDate?.slice?.(0, 10) || matter.dates?.completion || '', delivery: matter.deliveryDate?.slice?.(0, 10) || matter.dates?.delivery || '' });
      setIsBillable(Boolean(matter.isBillable)); setDeliverables((matter.deliverables || []).map(deliverableText).filter(Boolean));
      setInternalNotes(matter.internalNotes || ''); setSpecialInstructions(matter.specialInstructions || '');
      setNotifications(matter.notifications || { inApp: true, email: true, whatsApp: false });
    }).catch(() => setError('Matter details could not be loaded.')).finally(() => setLoading(false));
  }, [id]);

  const toggle = (key) => setOpenSections((sections) => ({ ...sections, [key]: !sections[key] }));
  const addTag = (event) => {
    if (event.key !== 'Enter' || !tagInput.trim()) return;
    event.preventDefault();
    const value = tagInput.trim().toLowerCase();
    if (!tags.includes(value)) setTags((current) => [...current, value]);
    setTagInput('');
  };
  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setDeliverables((current) => [...current, deliverableInput.trim()]);
    setDeliverableInput('');
  };
  const addWorkType = () => {
    const value = newTypeName.trim();
    if (!value) return;
    setWorkTypes((current) => [...current, value]);
    setSelectedWorkType(value);
    setNewTypeName('');
    setAddingType(false);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setSubmitting(true);
    const formData = new FormData();
    const values = { client, clientId: client, matterTitle, title: matterTitle, workType: selectedWorkType, type: selectedWorkType, scopeOfWork, description, status, assignedTo, supervisedBy, assistedBy, linkToCase, priority, complexity, isBillable: String(isBillable), startDate: dates.start, dueDate: dates.due, completionDate: dates.completion, deliveryDate: dates.delivery, internalNotes, specialInstructions };
    Object.entries(values).forEach(([key, value]) => { if (value !== '' && value != null) formData.append(key, value); });
    formData.append('tags', JSON.stringify(tags));
    // The API schema defines deliverables as embedded documents, not strings.
    formData.append('deliverables', JSON.stringify(deliverables.map((title) => ({ title }))));
    formData.append('notifications', JSON.stringify(notifications));
    files.forEach((file) => formData.append('files', file));
    try {
      if (id) await updateMatter(id, formData); else await createMatter(formData);
      navigate('/dashboard/nonlitigation');
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${id ? 'update' : 'create'} matter. Please try again.`);
    } finally { setSubmitting(false); }
  };
  const visibleTypes = workTypes.filter((type) => type.toLowerCase().includes(searchWorkType.toLowerCase()));

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50 pb-28 text-slate-700">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => navigate('/dashboard/nonlitigation')} aria-label="Back to matters" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"><ArrowLeft className="h-5 w-5" /></button>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl  text-gold shadow-lg shadow-indigo-500/20"><BriefcaseBusiness className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><span>Matters</span><span>/</span><span className="text-indigo-600">New matter</span></div>
              <div className="flex items-center gap-2"><h1 className="truncate text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">{id ? 'Edit matter' : 'Add new matter'}</h1><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">{id ? 'EDITING' : 'DRAFT'}</span></div>
              <p className="hidden text-sm text-slate-500 lg:block">Record advisory work, documentation, registrations, and other legal assignments.</p>
            </div>
            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 sm:block"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matter type</p><p className="text-xs font-semibold text-slate-700">Non-litigation</p></div>
          </div>
        </header>

<main className="mx-auto max-w-7xl">
          {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div>}
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">Loading matter…</div> : <><div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:flex sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-3.5"><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="text-base font-bold text-slate-900">Start with the essentials</h2><p className="mt-1 text-sm leading-6 text-slate-600">Client and matter title are required. You can add the remaining details now or later.</p></div></div>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 sm:mt-0"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Auto-saved as draft</div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <FormSection id="work-type" icon={FolderPlus} title="Type of work" description="Choose the category that best describes this assignment." open={openSections.type} onToggle={() => toggle('type')}>
                <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchWorkType} onChange={(e) => setSearchWorkType(e.target.value)} placeholder="Search a work type" className={`${fieldClass} pl-10 text-sm`} /></div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {visibleTypes.map((type) => <button key={type} type="button" onClick={() => setSelectedWorkType(type)} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition ${selectedWorkType === type ? 'border-indigo-600 bg-gold text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}><span className="flex items-center gap-1.5">{selectedWorkType === type && <Check className="h-4 w-4" />}{type}</span></button>)}
                  <button type="button" onClick={() => setAddingType((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 px-3.5 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"><Plus className="h-4 w-4" />Add type</button>
                </div>
                {addingType && <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 p-3.5 sm:flex-row"><input autoFocus value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWorkType())} placeholder="New work type" className={`${fieldClass} text-sm`} /><button type="button" onClick={addWorkType} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Add</button></div>}
              </FormSection>

              <FormSection id="matter-details" icon={ClipboardList} title="Matter details" description="Add the client, title, and a concise brief for your team." open={openSections.details} onToggle={() => toggle('details')}>
                <div className="grid gap-4 md:grid-cols-2"><div><label className={`${labelClass} text-sm`}>Client <span className="text-rose-500">*</span></label><select required value={client} onChange={(e) => setClient(e.target.value)} className={`${fieldClass} text-sm`}><option value="">Select a client</option>{clients.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{clientDisplayName(item)}</option>)}</select></div><div><label className={`${labelClass} text-sm`}>Matter title <span className="text-rose-500">*</span></label><input required value={matterTitle} onChange={(e) => setMatterTitle(e.target.value)} placeholder="e.g. Sale deed for property XYZ" className={`${fieldClass} text-sm`} /></div></div>
                <div className="mt-4"><label className={`${labelClass} text-sm`}>Scope of work</label><textarea rows={2} value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} placeholder="Summarise the work involved" className={`${fieldClass} text-sm`} /></div>
                <div className="mt-4"><label className={`${labelClass} text-sm`}>Description</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context that will help the assigned team member" className={`${fieldClass} text-sm`} /></div>
              </FormSection>

              <FormSection id="status" icon={LayoutList} title="Work status" description="Set the starting stage for this matter." open={openSections.status} onToggle={() => toggle('status')}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{statusOptions.map((option) => <button key={option.id} type="button" onClick={() => setStatus(option.id)} className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-4 ${status === option.id ? `${option.active} ring-2` : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}><span className="flex items-center justify-between"><span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />{status === option.id && <Check className="h-4 w-4 text-slate-700" />}</span><span className="mt-3 block text-sm font-bold text-slate-900">{option.title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{option.description}</span></button>)}</div>
              </FormSection>

              <FormSection id="team" icon={Users} title="Assignment & priority" description="Set ownership, oversight, and urgency." open={openSections.team} onToggle={() => toggle('team')}>
                <div className="grid gap-4 md:grid-cols-2"><div><label className={`${labelClass} text-sm`}>Assigned to</label><select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={`${fieldClass} text-sm`}><option value="">Select team member</option><option>Adv. Rahul Sharma</option><option>Adv. Priya Patel</option></select></div><div><label className={`${labelClass} text-sm`}>Supervised by</label><select value={supervisedBy} onChange={(e) => setSupervisedBy(e.target.value)} className={`${fieldClass} text-sm`}><option value="">Select supervisor</option><option>Senior Adv. Shah</option><option>Managing Partner</option></select></div><div><label className={`${labelClass} text-sm`}>Assisted by</label><input value={assistedBy} onChange={(e) => setAssistedBy(e.target.value)} placeholder="Team member names" className={`${fieldClass} text-sm`} /></div><div><label className={`${labelClass} text-sm`}>Link to case <span className="font-normal text-slate-400">(optional)</span></label><input value={linkToCase} onChange={(e) => setLinkToCase(e.target.value)} placeholder="Search case number or title" className={`${fieldClass} text-sm`} /></div></div>
                <div className="mt-4"><label className={`${labelClass} text-sm`}>Tags <span className="font-normal text-slate-400">(press Enter to add)</span></label><div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"><Tag className="h-3.5 w-3.5" />{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags((current) => current.filter((item) => item !== tag))}><X className="h-3.5 w-3.5" /></button></span>)}<input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add a tag" className="min-w-28 flex-1 bg-transparent px-1.5 text-sm outline-none" /></div></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><div><label className={`${labelClass} text-sm`}>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${fieldClass} text-sm`}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div><div><label className={`${labelClass} text-sm`}>Complexity</label><select value={complexity} onChange={(e) => setComplexity(e.target.value)} className={`${fieldClass} text-sm`}><option>Low</option><option>Medium</option><option>High</option></select></div></div>
              </FormSection>

              <FormSection id="timeline" icon={CalendarDays} title="Timeline & deadlines" description="Track key dates and delivery commitments." open={openSections.timeline} onToggle={() => toggle('timeline')}>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['start', 'Start date'], ['due', 'Due date'], ['completion', 'Completion date'], ['delivery', 'Delivery date']].map(([key, label]) => <div key={key}><label className={`${labelClass} text-sm`}>{label}</label><input type="date" value={dates[key]} onChange={(e) => setDates((current) => ({ ...current, [key]: e.target.value }))} className={`${fieldClass} text-sm`} /></div>)}</div>
              </FormSection>

              <FormSection id="billing" icon={CircleDollarSign} title="Fee & agreements" description="Set billing status for this assignment." open={openSections.billing} onToggle={() => toggle('billing')}><label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4.5 transition hover:bg-slate-50"><span><span className="block text-sm font-bold text-slate-800">This matter is billable</span><span className="mt-1 block text-sm text-slate-500">Include it in fee and invoice tracking.</span></span><input type="checkbox" checked={isBillable} onChange={(e) => setIsBillable(e.target.checked)} className="h-5 w-5 accent-indigo-600" /></label></FormSection>

              <FormSection id="deliverables" icon={Check} title="Deliverables" description="List the documents, opinions, or outcomes to be delivered." open={openSections.deliverables} onToggle={() => toggle('deliverables')}><div className="flex gap-2.5"><input value={deliverableInput} onChange={(e) => setDeliverableInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())} placeholder="e.g. Drafted agreement" className={`${fieldClass} text-sm`} /><button type="button" onClick={addDeliverable} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add</span></button></div>{deliverables.length > 0 && <ul className="mt-3.5 divide-y divide-slate-100 rounded-xl border border-slate-200">{deliverables.map((item, index) => <li key={`${item}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium"><span className="flex items-center gap-2.5 text-slate-700"><Check className="h-4 w-4 text-emerald-500" />{item}</span><button type="button" onClick={() => setDeliverables((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${item}`} className="text-slate-400 hover:text-rose-500"><X className="h-4 w-4" /></button></li>)}</ul>}</FormSection>

              <FormSection id="files" icon={Paperclip} title="Attachments" description="Add client submissions, references, or supporting documents." open={openSections.files} onToggle={() => toggle('files')}><input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => setFiles((current) => [...current, ...Array.from(e.target.files || [])])} /><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 py-9 text-center transition hover:border-indigo-400 hover:bg-indigo-50"><Paperclip className="mx-auto h-6 w-6 text-indigo-500" /><span className="mt-2.5 block text-sm font-bold text-slate-700">Click to upload files</span><span className="mt-1.5 block text-xs text-slate-500">PDF, DOCX, and images up to 25 MB</span></button>{files.length > 0 && <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs"><FileText className="h-4 w-4 shrink-0 text-indigo-500" /><span className="min-w-0 flex-1 truncate font-medium text-slate-700">{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}><X className="h-4 w-4 text-slate-400 hover:text-rose-500" /></button></div>)}</div>}</FormSection>

              <FormSection id="notes" icon={FileText} title="Notes & instructions" description="Keep private context and special handling notes with the matter." open={openSections.notes} onToggle={() => toggle('notes')}><div><label className={`${labelClass} text-sm`}>Internal notes</label><textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Visible only to your team" className={`${fieldClass} text-sm`} /></div><div className="mt-4"><label className={`${labelClass} text-sm`}>Special instructions</label><textarea rows={2} value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Add any special handling instructions" className={`${fieldClass} text-sm`} /></div></FormSection>

              <FormSection id="notifications" icon={Bell} title="Notifications" description="Choose where your team receives updates about this matter." open={openSections.notifications} onToggle={() => toggle('notifications')}><div className="grid gap-2.5 sm:grid-cols-3">{[['inApp', 'In-app notification'], ['email', 'Email updates'], ['whatsApp', 'WhatsApp updates']].map(([key, label]) => <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><span>{label}</span><input type="checkbox" checked={notifications[key]} onChange={(e) => setNotifications((current) => ({ ...current, [key]: e.target.checked }))} className="h-4.5 w-4.5 accent-indigo-600" /></label>)}</div></FormSection>
            </div>

            <aside className="hidden xl:block"><div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Matter summary</p><div className="mt-5 space-y-4.5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Work type</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedWorkType}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Client</p><p className="mt-1 text-sm font-semibold text-slate-800">{client || 'Not selected'}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Owner</p><p className="mt-1 text-sm font-semibold text-slate-800">{assignedTo || 'Unassigned'}</p></div><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-xs font-semibold text-slate-700">Required to create</p><div className="mt-2.5 space-y-2 text-xs">{[['Client', client], ['Matter title', matterTitle]].map(([name, done]) => <p key={name} className={`flex items-center gap-2 font-medium ${done ? 'text-emerald-700' : 'text-slate-500'}`}><Check className={`h-4 w-4 ${done ? 'text-emerald-500' : 'text-slate-300'}`} />{name}</p>)}</div></div></div></div></aside>
          </div>
        </>}</main>

        <div className="z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><p className="hidden text-xs text-slate-500 sm:block">Fields marked <span className="font-bold text-rose-500">*</span> are required.</p><div className="ml-auto flex items-center gap-2"><button type="button" onClick={() => navigate('/dashboard/nonlitigation')} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Cancel</button><button disabled={submitting || loading} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"><BriefcaseBusiness className="h-4 w-4" />{submitting ? 'Saving…' : id ? 'Update matter' : 'Create matter'}</button></div></div></div>
        <button type="button" aria-label="Open help" className="fixed bottom-20 right-4 z-20 hidden h-11 w-11 place-items-center rounded-full bg-gold text-white shadow-lg transition hover:bg-indigo-600 sm:grid"><MessageSquare className="h-5 w-5" /></button>
      </form>
    </DashboardLayout>
  );
}
