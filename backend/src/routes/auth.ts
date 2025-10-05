import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword, verifyPassword, createToken } from "../lib/auth";
import { eq } from "drizzle-orm";

const app = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password, name } = c.req.valid("json");

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name,
      role: "user",
    })
    .returning();

  const token = await createToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return c.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    token,
  });
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
});

export default app;
