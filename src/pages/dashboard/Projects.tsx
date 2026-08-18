import { CrudPage } from "@/components/dashboard/CrudPage";
import { Star } from "lucide-react";

const Projects = () => (
  <CrudPage
    title="Projects & Highlights"
    pageDescription="Showcase landmark cases and firm highlights."
    initialRows={[
      { id: 1, title: "Acme Corp — INR 2,400 Cr Acquisition", category: "M&A", featured: true },
      { id: 2, title: "Patent defence — TechNova Inc.", category: "IP Law", featured: false },
      { id: 3, title: "Regulatory clearance for FinFlow", category: "Compliance", featured: true },
    ]}
    columns={[
      { key: "title", label: "Project", render: (r) => (
        <span className="flex items-center gap-2">{r.featured && <Star className="h-3.5 w-3.5 text-gold fill-gold" />} {r.title}</span>
      ) },
      { key: "category", label: "Category", className: "w-40" },
    ]}
    fields={[
      { name: "title", label: "Project Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category", type: "select", options: ["M&A", "IP Law", "Compliance", "Litigation", "Tax"] },
      { name: "image", label: "Image", type: "file" },
      { name: "featured", label: "Mark as featured", type: "switch" },
    ]}
    addLabel="New Project"
  />
);
export default Projects;
