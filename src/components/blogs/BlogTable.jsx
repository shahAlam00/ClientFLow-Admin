import { Pencil, Trash2, Search, Calendar, FileText } from "lucide-react";

const Badge = ({ published }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${published ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-orange-500"}`} />
    {published ? "Published" : "Draft"}
  </span>
);

const BlogTable = ({ blogs, search, setSearch, handleEdit, handleDelete }) => {
  return (
    <div className="border border-border rounded-3xl bg-card overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">Blog Articles</h2>
          <p className="text-sm text-muted-foreground">Manage your published and draft content.</p>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background pl-8 pr-4 text-sm outline-none focus:border-gold transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left px-6 py-4 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-6 py-4 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-6 py-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr key={blog._id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{blog.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{blog.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge published={blog.published} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(blog)} className="p-2 rounded-lg border hover:bg-muted transition-all">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(blog._id)} className="p-2 rounded-lg border hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 opacity-20" />
                    <p>No blogs found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogTable;