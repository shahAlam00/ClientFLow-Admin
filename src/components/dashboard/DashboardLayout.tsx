import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardTopbar title={title} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
