import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-background">
        {isAuthenticated && (
          <nav className="border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="font-semibold text-lg">
                  App
                </Link>
                <div className="flex gap-4">
                  <Link
                    to="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/user"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        )}
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
