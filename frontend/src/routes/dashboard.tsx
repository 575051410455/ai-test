import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            {user?.role === "admin" ? (
              <Shield className="h-4 w-4 text-muted-foreground" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === "admin" ? "Full access" : "Standard access"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{user?.email}</div>
            <p className="text-xs text-muted-foreground">Your login email</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Account is verified</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Things you can do in this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-sm">View your profile information</p>
          </div>
          {user?.role === "admin" && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <p className="text-sm">Access admin panel to manage users</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-sm">Update account settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
