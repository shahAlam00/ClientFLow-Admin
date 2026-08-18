import { CrudPage } from "@/components/dashboard/CrudPage";

const Team = () => (
  <CrudPage
    title="Team Management"
    pageDescription="Manage attorneys, paralegals, and staff displayed on the public site."
    initialRows={[
      { id: 1, name: "Aarav Sterling", role: "Managing Partner", bio: "30+ years in corporate law." },
      { id: 2, name: "Mira Vance", role: "Senior Partner — IP", bio: "Patent litigation specialist." },
      { id: 3, name: "Rohan Khanna", role: "Associate", bio: "Tax & regulatory practice." },
    ]}
    columns={[
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "bio", label: "Bio" },
    ]}
    fields={[
      { name: "photo", label: "Photo", type: "file" },
      { name: "name", label: "Full Name" },
      { name: "role", label: "Role / Designation" },
      { name: "bio", label: "Short Bio", type: "textarea" },
    ]}
    addLabel="Add Member"
    searchKeys={["name", "role"]}
  />
);
export default Team;
