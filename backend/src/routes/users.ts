import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { authMiddleware, requireRole, type AuthUser } from "../middleware/auth";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";

const app = new Hono();

// Get current user
app.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("user") as AuthUser;

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.userId),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user });
});

// Admin only - Get all users
app.get("/", authMiddleware, requireRole("admin"), async (c) => {
  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return c.json({ users: allUsers });
});

// Admin only - Create new user
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["user", "admin"]),
});

app.post("/", authMiddleware, requireRole("admin"), zValidator("json", createUserSchema), async (c) => {
  const { email, password, name, role } = c.req.valid("json");

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return c.json({ error: "User with this email already exists" }, 400);
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name,
      role,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    });

  return c.json({ user: newUser }, 201);
});

// Admin only - Update user
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(2).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

app.patch("/:id", authMiddleware, requireRole("admin"), zValidator("json", updateUserSchema), async (c) => {
  const userId = c.req.param("id");
  const updates = c.req.valid("json");

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  // Check if email is being changed and if it's already taken
  if (updates.email && updates.email !== existingUser.email) {
    const emailTaken = await db.query.users.findFirst({
      where: eq(users.email, updates.email),
    });

    if (emailTaken) {
      return c.json({ error: "Email already in use" }, 400);
    }
  }

  // Prepare update data
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.email) updateData.email = updates.email;
  if (updates.name) updateData.name = updates.name;
  if (updates.role) updateData.role = updates.role;
  if (updates.password) updateData.password = await hashPassword(updates.password);

  // Update user
  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return c.json({ user: updatedUser });
});

// Admin only - Delete user
app.delete("/:id", authMiddleware, requireRole("admin"), async (c) => {
  const userId = c.req.param("id");
  const authUser = c.get("user") as AuthUser;

  // Prevent self-deletion
  if (userId === authUser.userId) {
    return c.json({ error: "Cannot delete your own account" }, 400);
  }

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  // Delete user
  await db.delete(users).where(eq(users.id, userId));

  return c.json({ message: "User deleted successfully" });
});

export default app;
