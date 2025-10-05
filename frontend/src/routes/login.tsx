import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { login as apiLogin } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate({ to: "/dashboard" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <form.Field
              name="email"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              )}
            />
            <form.Field
              name="password"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}
            />
            {mutation.isError && (
              <div className="text-sm text-destructive">
                {mutation.error?.message || "Login failed"}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
