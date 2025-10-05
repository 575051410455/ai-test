import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@/lib/auth";
import { getAllUsers, createUser, updateUser, deleteUser, type User } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Users, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

function AdminComponent() {
  const { user, token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(token!),
    enabled: !!token && user?.role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string; role: "user" | "admin" }) =>
      createUser(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const createForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user" as "user" | "admin",
    },
    onSubmit: async ({ value }) => {
      createMutation.mutate(value);
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user" as "user" | "admin",
    },
    onSubmit: async ({ value }) => {
      if (!selectedUser) return;
      const updateData: any = {
        name: value.name,
        email: value.email,
        role: value.role,
      };
      if (value.password) {
        updateData.password = value.password;
      }
      updateMutation.mutate({ id: selectedUser.id, data: updateData });
    },
  });

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldValue("name", user.name);
    editForm.setFieldValue("email", user.email);
    editForm.setFieldValue("role", user.role);
    editForm.setFieldValue("password", "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page is only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage users and system settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.users.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.users.filter((u) => u.role === "admin").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Administrator accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the system</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createForm.handleSubmit();
                  }}
                >
                  <div className="space-y-4 py-4">
                    <createForm.Field
                      name="name"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="create-name">Name</Label>
                          <Input
                            id="create-name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                      )}
                    />
                    <createForm.Field
                      name="email"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="create-email">Email</Label>
                          <Input
                            id="create-email"
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                      )}
                    />
                    <createForm.Field
                      name="password"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="create-password">Password</Label>
                          <Input
                            id="create-password"
                            type="password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      )}
                    />
                    <createForm.Field
                      name="role"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="create-role">Role</Label>
                          <Select
                            id="create-role"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value as "user" | "admin")}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </Select>
                        </div>
                      )}
                    />
                    {createMutation.isError && (
                      <div className="text-sm text-destructive">
                        {createMutation.error?.message || "Failed to create user"}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(u)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(u)}
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editForm.handleSubmit();
            }}
          >
            <div className="space-y-4 py-4">
              <editForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <editForm.Field
                name="email"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <editForm.Field
                name="password"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}
              />
              <editForm.Field
                name="role"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      id="edit-role"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as "user" | "admin")}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                )}
              />
              {updateMutation.isError && (
                <div className="text-sm text-destructive">
                  {updateMutation.error?.message || "Failed to update user"}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
