import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <SidebarNav />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="mx-auto min-h-[calc(100vh-72px)] max-w-7xl px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
