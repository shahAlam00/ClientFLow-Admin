import { CrudPage } from "@/components/dashboard/CrudPage";

const News = () => (
  <CrudPage
    title="News & Events"
    pageDescription="Manage upcoming and past events."
    initialRows={[
      { id: 1, title: "Annual Legal Symposium", date: "2026-06-12", status: "Upcoming", description: "Keynote on AI and law." },
      { id: 2, title: "CSR & Compliance Workshop", date: "2026-05-28", status: "Upcoming", description: "Half-day session." },
      { id: 3, title: "Bar Association Gala", date: "2026-03-04", status: "Past", description: "Recap published." },
    ]}
    columns={[
      { key: "title", label: "Event" },
      { key: "date", label: "Date", className: "w-32" },
      { key: "status", label: "Status", className: "w-28", render: (r) => (
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium ${r.status === "Upcoming" ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
          {r.status}
        </span>
      ) },
    ]}
    fields={[
      { name: "title", label: "Event Name" },
      { name: "date", label: "Event Date", type: "date" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Cover Image", type: "file" },
      { name: "status", label: "Status", type: "select", options: ["Upcoming", "Past"] },
    ]}
    addLabel="New Event"
  />
);
export default News;
