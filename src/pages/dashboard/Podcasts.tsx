import { CrudPage } from "@/components/dashboard/CrudPage";

const Podcasts = () => (
  <CrudPage
    title="Podcasts"
    pageDescription="Upload audio episodes or embed external links."
    initialRows={[
      { id: 1, title: "Ep. 12 — Boardroom Disputes", duration: "32:14", url: "https://…", published: true },
      { id: 2, title: "Ep. 11 — Cross-border M&A", duration: "41:02", url: "https://…", published: true },
      { id: 3, title: "Ep. 10 — Privacy Frameworks", duration: "27:48", url: "https://…", published: false },
    ]}
    columns={[
      { key: "title", label: "Episode" },
      { key: "duration", label: "Duration", className: "w-28" },
      { key: "published", label: "Status", className: "w-28", render: (r) => (
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium ${r.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
          {r.published ? "Live" : "Draft"}
        </span>
      ) },
    ]}
    fields={[
      { name: "title", label: "Episode Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "thumbnail", label: "Thumbnail", type: "file" },
      { name: "audio", label: "Audio File", type: "file" },
      { name: "url", label: "Or Embed URL (Spotify / YouTube)" },
      { name: "duration", label: "Duration", placeholder: "32:14" },
      { name: "published", label: "Publish", type: "switch" },
    ]}
    addLabel="New Episode"
  />
);
export default Podcasts;
