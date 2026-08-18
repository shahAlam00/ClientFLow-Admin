
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
