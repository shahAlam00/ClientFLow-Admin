import { RichTextEditor } from "./RichTextEditor";
import { UploadCloud, Settings, Type, LayoutTemplate } from "lucide-react";

export default function BlogForm({ form, handleChange, handleSubmit, editingId, loading, handleFileChange, categories = [] }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-8 rounded-3xl shadow-sm mt-5">
      
      {/* SECTION 1: Core Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Type size={20} />
          <h2 className="text-lg font-bold">Core Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Blog Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter blog title" 
              className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="e.g., my-awesome-blog" 
              className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
  <label className="text-sm font-medium">Category</label>
  <input
    list="category-list"
    name="category"
    value={form.category}
    onChange={handleChange}
    placeholder="Select or type a category..."
    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
    required
  />
  <datalist id="category-list">
    {categories.map((cat, index) => (
      <option key={index} value={cat.name || cat} />
    ))}
  </datalist>
</div>
        </div>
      </section>

      {/* SECTION 2: Media */}
      <section className="space-y-4">
        <label className="text-sm font-medium">Featured Image</label>
        <div className="border-2 border-dashed border-input rounded-2xl p-4 hover:border-primary/50 transition-colors">
          <input type="file" id="imageUpload" className="hidden" onChange={handleFileChange} accept="image/*" />
          <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
            {form.image ? (
              <img src={form.image} alt="Preview" className="max-h-[150px] rounded-lg shadow-md" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={32} className="text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload featured image</span>
              </div>
            )}
          </label>
        </div>
      </section>

      {/* SECTION 3: Content */}
      <section className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Excerpt</label>
          <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Brief summary..." 
            className="w-full p-4 rounded-xl border border-input bg-background h-24 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Blog Content</label>
          <RichTextEditor content={form.content} onChange={(html) => handleChange({ target: { name: "content", value: html } })} />
        </div>
      </section>

      {/* SECTION 4: SEO Settings */}
      <section className="border-t pt-8 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Settings size={20} />
          <h3 className="text-lg font-bold">SEO Settings</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Meta Title" className="w-full p-3 rounded-xl border" />
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} placeholder="Meta Description" className="w-full p-3 rounded-xl border" />
          <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="Keywords (comma separated)" className="w-full p-3 rounded-xl border" />
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex justify-between items-center pt-4 border-t">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="w-5 h-5 accent-primary" />
          <span className="text-sm font-medium">Publish Immediately</span>
        </label>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90">
          {loading ? "Saving..." : editingId ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </form>
  );
}