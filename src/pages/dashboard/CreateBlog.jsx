import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import BlogForm from "@/components/blogs/BlogForm";
import api from "@/lib/axios";

const CreateBlog = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editingId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // File state alag se rakhi hai
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({ 
    title: "", slug: "", category: "", excerpt: "", content: "", 
    image: "", published: true, metaTitle: "", metaDescription: "", metaKeywords: "" 
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/blogs/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Categories fetch failed", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingId) {
      api.get(`/blogs/${editingId}`).then(res => setForm(res.data)).catch(console.error);
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // UI preview ke liye FileReader (optional)
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();

  // Remove inline styles from editor content
  const cleanContent = form.content.replace(/style="[^"]*"/g, "");

  for (const key in form) {
    if (key === "content") {
      formData.append("content", cleanContent);
    } else {
      formData.append(key, form[key]);
    }
  }

  if (selectedFile) {
    formData.append("image", selectedFile);
  }

  try {
    if (editingId) {
      await api.put(`/blogs/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      await api.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    navigate("/dashboard/blogs");
  } catch (err) {
    console.error("Submission failed:", err);
  } finally {
    setLoading(false);
  }
};
  return (
    <DashboardLayout title={editingId ? "Edit Article" : "Write Article"}>
      <div className="max-w-5xl py-5">
        <button onClick={() => navigate(-1)} className="mb-5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          &larr; Back to Dashboard
        </button>
        
        <BlogForm 
          form={form} 
          categories={categories} 
          handleChange={handleChange} 
          handleSubmit={handleSubmit} 
          handleFileChange={handleFileChange} 
          editingId={editingId} 
          loading={loading} 
        />
      </div>
    </DashboardLayout>
  );
};

export default CreateBlog;