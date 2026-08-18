import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import BlogTable from "@/components/blogs/BlogTable";
import api from "@/lib/axios";
import {
  Plus,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Skeleton Component matching the Table layout
const BlogTableSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="h-12 bg-muted/60 rounded-xl w-full" />

      {/* Table Rows Skeleton */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-14 bg-muted/30 rounded-xl w-full flex items-center px-4 gap-4"
        >
          <div className="h-5 bg-muted/50 rounded w-1/3" />
          <div className="h-5 bg-muted/50 rounded w-1/4" />
          <div className="h-5 bg-muted/50 rounded w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =========================
  // PAGINATION STATE
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =========================
  // DELETE POPUP STATE
  // =========================
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // FETCH BLOGS
  // =========================
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/blogs`);
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // =========================
  // TRIGGER DELETE MODAL
  // =========================
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // =========================
  // CONFIRM DELETE ACTION
  // =========================
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/blogs/${deleteId}`);
      await fetchBlogs();
    } catch (error) {
      console.log("Delete blog error:", error);
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // Reset pagination on search input change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // =========================
  // SEARCH & PAGINATION LOGIC
  // =========================
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) =>
      b.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Auto-adjust page if deletion makes the current page out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredBlogs.length, totalPages, currentPage]);

  return (
    <DashboardLayout title="Blog Management">
      <div className="max-w-7xl mx-auto py-8 space-y-6 -mt-12">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Articles</h1>
          <button
            onClick={() => navigate("/create-blog")}
            className="bg-gold text-black px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:opacity-90 transition shadow-md"
          >
            <Plus size={18} /> Create New Blog
          </button>
        </div>

        {/* Blog Table Section */}
        <div className="p-6 rounded-3xl border bg-card shadow-sm space-y-4">
          <input
            className="w-full p-3 border rounded-xl mb-2 bg-background focus:outline-none focus:ring-2 focus:ring-gold/50 transition"
            placeholder="Search articles by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <BlogTableSkeleton />
          ) : (
            <>
              <BlogTable
                blogs={paginatedBlogs}
                handleEdit={(b) => navigate(`/create-blog?id=${b._id}`)}
                handleDelete={handleDeleteClick}
              />

              {/* ============================================== */}
              {/* CENTERED MODERN PAGINATION */}
              {/* ============================================== */}
              {filteredBlogs.length > 0 && (
                <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    {/* PREVIOUS BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-10 w-10 rounded-2xl border border-border bg-background hover:bg-muted text-foreground transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* PAGE NUMBERS */}
                    <div className="flex items-center gap-1.5 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 min-w-[40px] px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                              currentPage === page
                                ? "bg-gold text-black shadow-md shadow-gold/20 scale-105"
                                : "border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
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
                      className="flex items-center justify-center h-10 w-10 rounded-2xl border border-border bg-background hover:bg-muted text-foreground transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* COUNTER TEXT */}
                  <p className="text-xs text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="font-bold text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-foreground">
                      {Math.min(endIndex, filteredBlogs.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-foreground">
                      {filteredBlogs.length}
                    </span>{" "}
                    articles
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================== */}
      {/* CENTERED DELETE CONFIRMATION POPUP MODAL */}
      {/* ============================================== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* HEADER */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Delete Blog Article?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to delete this blog? This action cannot be undone and will permanently remove it from your website.
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
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition disabled:opacity-50"
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
    </DashboardLayout>
  );
};

export default Blogs;