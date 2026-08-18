import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Megaphone, Plus, Search, BookOpen, Pin, Edit3, Trash2, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import API from '@/lib/api';

const Announcements = () => {
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingNotice, setViewingNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Delete Confirmation Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic Announcements State
  const [notices, setNotices] = useState([]);

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    category: '',
    audience: 'Everyone',
    expiresOn: '',
    isPinned: false
  });

  const resetForm = () => setFormData({ title: '', content: '', priority: 'Normal', category: '', audience: 'Everyone', expiresOn: '', isPinned: false });
  
  const normaliseNotice = (notice) => ({
    ...notice,
    id: notice.id || notice._id,
    category: notice.category || 'General',
    priority: notice.priority ? `${notice.priority}`.charAt(0).toUpperCase() + `${notice.priority}`.slice(1).toLowerCase() : 'Normal',
    author: notice.author?.name || notice.author || 'Shah Alam',
    authorInitials: notice.authorInitials || String(notice.author?.name || notice.author || 'SA').split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
    date: notice.date || (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')),
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await API.get('/announcements');
        const records = Array.isArray(data) ? data : data.announcements || [];
        const normalized = records.map(normaliseNotice);
        setNotices(normalized);
        const q = new URLSearchParams(window.location.search);
        const id = q.get('id');
        if (id) {
          const found = normalized.find((n) => String(n.id) === String(id) || String(n._id) === String(id));
          if (found) setViewingNotice(found);
        }
      } catch (error) {
        console.error('Failed to load announcements', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredNotices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return notices;
    return notices.filter((notice) => [notice.title, notice.content, notice.author].some((value) => value?.toLowerCase().includes(term)));
  }, [notices, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(start, start + itemsPerPage);
  }, [filteredNotices, currentPage]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, category: formData.category || 'General' };
    try {
      if (editingId) {
        const { data } = await API.put(`/announcements/${editingId}`, payload);
        const updated = normaliseNotice(data);
        setNotices((previous) => previous.map((notice) => notice.id === editingId ? updated : notice));
      } else {
        const { data } = await API.post('/announcements', payload);
        const created = normaliseNotice(data);
        setNotices((previous) => [created, ...previous].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));
      }
      resetForm(); setEditingId(null); setIsOpen(false);
    } catch (error) {
      console.error('Failed to save announcement', error);
      alert('Failed to save announcement');
    }
  };

  const editNotice = (notice) => { 
    setFormData({ 
      title: notice.title || '', 
      content: notice.content || '', 
      priority: notice.priority || 'Normal', 
      category: notice.category || '', 
      audience: notice.audience || 'Everyone', 
      expiresOn: notice.expiresOn ? String(notice.expiresOn).slice(0, 10) : '', 
      isPinned: Boolean(notice.isPinned) 
    }); 
    setEditingId(notice.id); 
    setIsOpen(true); 
  };

  // Trigger Delete Confirmation Modal
  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  // Execute Actual Delete
  const handleDeleteExecute = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await API.delete(`/announcements/${deleteId}`);
      setNotices((previous) => previous.filter((notice) => notice.id !== deleteId));
      setViewingNotice(null);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete announcement', error);
      alert('Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  const priorityClass = (priority) => ({ Low: 'border-slate-200 bg-slate-50 text-slate-600', Normal: 'border-blue-200 bg-blue-50 text-blue-600', High: 'border-amber-200 bg-amber-50 text-amber-600', Urgent: 'border-red-200 bg-red-50 text-red-600' }[priority] || 'border-slate-200 bg-slate-50 text-slate-600');

  return (
    <DashboardLayout title="Announcements">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 font-sans relative">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <button className="text-gray-400 hover:text-gray-700 mt-1 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-slate-700 transform -rotate-12" />
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Notices & Announcements</h1>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Official communications from the firm to the team</p>
            </div>
          </div>

          {/* New Announcement Button */}
          <button
            onClick={() => { resetForm(); setEditingId(null); setIsOpen(true); }}
            className="bg-amber-500 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search notices by title, content or author"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>

        {/* Section Divider/Label */}
        <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4 border-b border-gray-100 pb-2">
          Announcements ({loading ? '...' : filteredNotices.length})
        </div>

        {/* Announcements Stack */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="relative flex gap-4 bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-slate-50 border border-gray-100 rounded-lg text-gray-300 shrink-0">
                  <BookOpen className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : paginatedNotices.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No announcements found</p>
          ) : (
            paginatedNotices.map((notice) => (
              <div
                key={notice.id}
                className="relative flex gap-4 bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
              >
                {/* Left Indicator for High/Urgent Priority */}
                {(notice.priority === 'High' || notice.priority === 'Urgent') && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${notice.priority === 'Urgent' ? 'bg-red-500' : 'bg-amber-500'}`} />
                )}

                {/* Left Side Book Icon */}
                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-slate-50 border border-gray-100 rounded-lg text-slate-500 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>

                {/* Main Content Component */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">{notice.category}</span>

                      {notice.isPinned && (
                        <span className="text-amber-500 flex items-center gap-0.5 normal-case font-semibold">
                          <Pin className="w-3 h-3 fill-amber-500 transform rotate-45" /> Pinned
                        </span>
                      )}

                      <span className={`border px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wide ${priorityClass(notice.priority)}`}>{notice.priority}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-gray-400 shrink-0">
                      <button onClick={() => editNotice(notice)} aria-label={`Edit ${notice.title}`} className="hover:text-slate-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(notice.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <button onClick={() => setViewingNotice(notice)} className="block text-left text-base md:text-lg font-bold text-slate-800 mb-1.5 hover:text-blue-600 transition-colors leading-snug">
                    {notice.title}
                  </button>

                  {/* Content */}
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {notice.content}
                  </p>

                  {/* Footer Meta Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2 font-medium text-gray-600">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {notice.authorInitials}
                      </div>
                      <span>{notice.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{notice.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 mt-6 gap-3">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredNotices.length)}</span> of <span className="font-medium">{filteredNotices.length}</span> notices
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* MODAL POPUP FORM COMPONENT */}
        {/* ======================================================= */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] transform transition-all overflow-hidden scale-100">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
                <button
                  onClick={() => { setIsOpen(false); setEditingId(null); }}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                  />
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Content *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Write your announcement details here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all resize-none"
                  />
                </div>

                {/* Priority Selector (Segmented Radio Group) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Normal', 'High', 'Urgent'].map((level) => (
                      <label
                        key={level}
                        className={`border rounded-lg p-2 text-center text-xs font-semibold cursor-pointer transition-all select-none ${formData.priority === level
                            ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={formData.priority === level}
                          onChange={() => setFormData({ ...formData, priority: level })}
                          className="sr-only"
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Two Column Layout: Category & Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-400 transition-all"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="General">General</option>
                      <option value="Policy Update">Policy Update</option>
                      <option value="Event">Event</option>
                      <option value="Training">Training</option>
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                      <option value="Legal Update">Legal Update</option>
                      <option value="Reminder">Reminder</option>
                    </select>
                  </div>

                  {/* Audience Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Audience</label>
                    <select
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-400 transition-all"
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Attorneys only">Attorneys only</option>
                      <option value="Staff only">Staff only</option>
                    </select>
                  </div>
                </div>

                {/* Expires On Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Expires on</label>
                  <input
                    type="date"
                    value={formData.expiresOn}
                    onChange={(e) => setFormData({ ...formData, expiresOn: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-400 transition-all"
                  />
                </div>

                {/* Pin to Top Checkbox Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 checked:bg-amber-500 transition-all cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      Pin to the top of the board
                    </span>
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setEditingId(null); }}
                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                  >
                    {editingId ? 'Save Changes' : 'Publish'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewingNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="announcement-detail-title">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <header className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{viewingNotice.category}</p>
                  <h2 id="announcement-detail-title" className="mt-1 text-xl font-bold text-slate-900">{viewingNotice.title}</h2>
                </div>
                <button onClick={() => setViewingNotice(null)} aria-label="Close details" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-5 w-5" /></button>
              </header>
              <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${priorityClass(viewingNotice.priority)}`}>{viewingNotice.priority}</span>
                  {viewingNotice.isPinned && <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600"><Pin className="h-3 w-3 fill-amber-500" />Pinned</span>}
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{viewingNotice.content}</p>
                <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Audience</dt>
                    <dd className="mt-1 text-slate-700">{viewingNotice.audience || 'Everyone'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Published</dt>
                    <dd className="mt-1 text-slate-700">{viewingNotice.date}</dd>
                  </div>
                  {viewingNotice.expiresOn && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expires on</dt>
                      <dd className="mt-1 text-slate-700">{new Date(viewingNotice.expiresOn).toLocaleDateString('en-GB')}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Author</dt>
                    <dd className="mt-1 text-slate-700">{viewingNotice.author}</dd>
                  </div>
                </dl>
              </div>
              <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button onClick={() => { setViewingNotice(null); editNotice(viewingNotice); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Edit</button>
                <button onClick={() => setViewingNotice(null)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Close</button>
              </footer>
            </div>
          </div>
        )}

        {/* Center Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
            <div className="max-w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                This action cannot be undone. This announcement will be permanently deleted from the system.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteExecute}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Notice"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Announcements;