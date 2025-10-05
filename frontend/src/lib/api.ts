const API_URL = "http://localhost:3000/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

export async function getMe(token: string): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export async function getAllUsers(token: string): Promise<{ users: User[] }> {
  const response = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function createUser(
  token: string,
  data: { email: string; password: string; name: string; role: "user" | "admin" }
): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }

  return response.json();
}

export async function updateUser(
  token: string,
  userId: string,
  data: { email?: string; password?: string; name?: string; role?: "user" | "admin" }
): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

export async function deleteUser(token: string, userId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }

  return response.json();
}
