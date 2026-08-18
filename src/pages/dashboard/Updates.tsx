import { CrudPage } from "@/components/dashboard/CrudPage";

const Updates = () => (
  <CrudPage
    title="Legal Updates"
    pageDescription="Publish bite-size legal news and amendments."
    initialRows={[
      { id: 1, title: "Amendment to Companies Act §148", date: "2026-04-25", published: true, description: "New audit thresholds." },
      { id: 2, title: "Supreme Court ruling on Arbitration Act", date: "2026-04-18", published: true, description: "Implications for contract clauses." },
      { id: 3, title: "GST Circular 214/2026", date: "2026-04-10", published: false, description: "Draft summary." },
    ]}
    columns={[
      { key: "title", label: "Title" },
      { key: "date", label: "Date", className: "w-32" },
      { key: "published", label: "Status", className: "w-28", render: (r) => (
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium ${r.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
          {r.published ? "Live" : "Hidden"}
        </span>
      ) },
    ]}
    fields={[
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "date", label: "Date", type: "date" },
      { name: "published", label: "Publish", type: "switch" },
    ]}
    addLabel="New Update"
  />
);
export default Updates;
