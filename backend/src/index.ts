import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5174"],
    credentials: true,
  })
);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);

// Health check
app.get("/", (c) => {
  return c.json({ message: "API is running" });
});

// 404
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

const port = process.env.PORT || 3000;

console.log(`🚀 Server running on http://localhost:${port}`);

export type AppType = typeof app;

export default {
  port,
  fetch: app.fetch,
};
