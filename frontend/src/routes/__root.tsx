import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
