import { Context, Next } from "hono";
import { verifyToken } from "../lib/auth";

export type AuthUser = {
  userId: string;
  email: string;
  role: string;
};

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("user", payload as AuthUser);
  await next();
}

export function requireRole(role: "admin" | "user") {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthUser;

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (role === "admin" && user.role !== "admin") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    await next();
  };
}
