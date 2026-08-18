import { useEffect, useState } from "react";
import { CrudPage } from "@/components/dashboard/CrudPage.tsx";
import {
  Pin,
  Instagram,
  Youtube,
  UploadCloud,
  GripVertical,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as reelsApi from "@/services/reelsApi.js";

// Dummy skeleton rows for initial loading state (6 for 1st page)
const skeletonRows = Array(6)
  .fill(null)
  .map((_, i) => ({ id: `skeleton-${i}`, isLoading: true }));

const Reels = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // PAGINATION STATE
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // =========================
  // DELETE POPUP STATE
  // =========================
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // FETCH REELS
  // =========================
  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await reelsApi.getReels();
      setRows(data);
    } catch (error) {
      console.log("Fetch reels error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // =========================
  // PAGINATION CALCULATION
  // =========================
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = loading
    ? skeletonRows
    : rows.slice(startIndex, endIndex);

  // Auto-adjust page if item deletion makes current page out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [rows.length, totalPages, currentPage]);

  // =========================
  // CREATE REEL (NOTIFICATION ADDED HERE)
  // =========================
  const handleCreate = async (formData) => {
    try {
      await reelsApi.createReel(formData);
      await fetchReels();


    } catch (error) {
      console.log("Create reel error:", error);
    }
  };

  // =========================
  // UPDATE REEL
  // =========================
  const handleUpdate = async (id, formData) => {
    try {
      await reelsApi.updateReel(id, formData);
      await fetchReels();
    } catch (error) {
      console.log("Update reel error:", error);
    }
  };

  // =========================
  // TRIGGER DELETE POPUP
  // =========================
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // =========================
  // CONFIRM DELETE ACTION (NOTIFICATION ADDED HERE)
  // =========================
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      
      // Find the reel name before deleting for a better notification message
      const targetReel = rows.find((r) => r._id === deleteId || r.id === deleteId);
      
      await reelsApi.deleteReel(deleteId);
      await fetchReels();

      // ✅ LIVE NOTIFICATION TRIGGER FOR REEL DELETION
      window.dispatchEvent(
        new CustomEvent("dashboard-notification", {
          detail: {
            title: "Reel Deleted",
            description: `Reel "${targetReel?.title || "Item"}" was removed from your feed.`,
          },
        })
      );
    } catch (error) {
      console.log("Delete reel error:", error);
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <CrudPage
        title="Social Reels & Updates"
        pageDescription="Manage homepage reels, featured videos, YouTube & Instagram content."
        loading={false}
        // =========================
        // DATA (PAGINATED 6 PER PAGE)
        // =========================
        rows={currentRows}
        // =========================
        // CRUD ACTIONS
        // =========================
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDeleteClick}
        // =========================
        // TABLE COLUMNS
        // =========================
        columns={[
          {
            key: "title",
            label: "Reel Content",
            className: "min-w-[320px]",

            render: (r) => {
              // SKELETON RENDER FOR REEL CONTENT
              if (r.isLoading) {
                return (
                  <div className="flex items-start gap-4 animate-pulse">
                    <div className="h-16 w-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                    <div className="flex flex-col min-w-0 space-y-2 py-1 w-full max-w-[280px]">
                      <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                      <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                      <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md mt-1" />
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex items-start gap-4">
                  {/* THUMBNAIL */}
                  <div className="relative h-16 w-24 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0 group">
                    <img
                      src={
                        r.thumbnail ||
                        "https://placehold.co/600x400/png"
                      }
                      alt={r.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition" />

                    {/* PINNED */}
                    {r.pinned && (
                      <div className="absolute top-1.5 left-1.5 flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 shadow-lg">
                        <Pin className="h-3.5 w-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[15px] text-zinc-900 dark:text-white truncate max-w-[280px] leading-tight">
                        {r.title}
                      </h3>

                      {r.platformLabel && (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          {r.platformLabel}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed max-w-[350px]">
                      {r.caption}
                    </p>

                    {/* META */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 opacity-50" />
                        Order #{r.order}
                      </span>

                      <span>
                        {new Date(
                          r.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            },
          },

          {
            key: "source",
            label: "Platform",
            className: "w-[180px]",

            render: (r) => {
              // SKELETON RENDER FOR PLATFORM COLUMN
              if (r.isLoading) {
                return (
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                    <div className="flex flex-col space-y-1.5">
                      <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                      <div className="h-3 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    </div>
                  </div>
                );
              }

              const sourceConfig = {
                instagram: {
                  icon: (
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Instagram className="h-4 w-4 text-pink-500" />
                    </div>
                  ),
                  label: "Instagram",
                  textColor: "text-pink-600 dark:text-pink-400",
                },

                youtube: {
                  icon: (
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20">
                      <Youtube className="h-4 w-4 text-red-500" />
                    </div>
                  ),
                  label: "YouTube",
                  textColor: "text-red-600 dark:text-red-400",
                },

                upload: {
                  icon: (
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <UploadCloud className="h-4 w-4 text-blue-500" />
                    </div>
                  ),
                  label: "Direct Upload",
                  textColor: "text-blue-600 dark:text-blue-400",
                },
              };

              const config =
                sourceConfig[r.source] || sourceConfig.upload;

              return (
                <div className="flex items-center gap-3">
                  {config.icon}

                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${config.textColor}`}
                    >
                      {config.label}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      Connected
                    </span>
                  </div>
                </div>
              );
            },
          },

          {
            key: "enabled",
            label: "Status",
            className: "w-[180px]",

            render: (r) => {
              // SKELETON RENDER FOR STATUS COLUMN
              if (r.isLoading) {
                return (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <div
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-[0.12em] shadow-sm
                    ${
                      r.enabled
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full animate-pulse
                      ${
                        r.enabled
                          ? "bg-emerald-500"
                          : "bg-zinc-400"
                      }`}
                    />

                    {r.enabled ? "Live" : "Hidden"}
                  </div>

                  {r.pinned && (
                    <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      <Pin className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
              );
            },
          },
        ]}
        // =========================
        // FORM FIELDS
        // =========================
        fields={[
          {
            name: "title",
            label: "Reel Title",
            placeholder: "e.g. Supreme Court Verdict Explained",
          },

          {
            name: "caption",
            label: "Caption",
            type: "textarea",
            placeholder: "Write a compelling caption for your reel...",
          },

          {
            name: "source",
            label: "Media Source",
            type: "select",
            options: ["upload", "youtube", "instagram"],
          },

          {
            name: "videoUrl",
            label: "Video URL",
            placeholder: "https://cdn.example.com/video.mp4",
            description: "Video source or media URL.",
          },

          {
            name: "thumbnail",
            label: "Thumbnail URL",
            placeholder: "https://example.com/thumbnail.jpg",
          },

          {
            name: "platformLabel",
            label: "Platform Label",
            placeholder: "e.g. Featured, Trending, Viral",
          },

          {
            name: "order",
            label: "Display Priority",
            type: "number",
            placeholder: "1",
          },

          {
            name: "pinned",
            label: "Pin as Featured Reel",
            type: "switch",
          },

          {
            name: "enabled",
            label: "Publish Reel",
            type: "switch",
          },
        ]}
        // =========================
        // EXTRA
        // =========================
        addLabel="Add New Reel"
        searchKeys={[
          "title",
          "caption",
          "source",
          "platformLabel",
        ]}
      />

      {/* ============================================== */}
      {/* PAGINATION CONTROLS */}
      {/* ============================================== */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-2 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {Math.min(endIndex, rows.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {rows.length}
            </span>{" "}
            reels
          </div>

          <div className="flex items-center gap-2">
            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* PAGE NUMBERS */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-[36px] px-3 rounded-xl text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                        : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* NEXT BUTTON */}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* CENTERED DELETE CONFIRMATION POPUP MODAL */}
      {/* ============================================== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* HEADER */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Delete Reel?
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Are you sure you want to delete this reel? This action cannot be undone and will permanently remove it from your feed.
                </p>
              </div>
            </div>

            {/* BUTTON ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;