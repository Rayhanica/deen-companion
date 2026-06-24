import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <SidebarNav />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="mx-auto min-h-[calc(100vh-65px)] max-w-[1440px] px-4 pb-28 pt-5 md:px-7 md:pb-10 md:pt-7 xl:px-9">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
