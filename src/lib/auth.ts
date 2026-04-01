import { cookies } from "next/headers";
import db from "./db";

const SESSION_COOKIE = "commenter_session";

interface User {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  created_at: string;
}

// Simple token-based auth using a cookie with the user ID
// In production, use proper JWT or session tokens
export function createSession(userId: number): string {
  const token = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString("base64");
  // Store token in a sessions table or just encode user ID
  return `${userId}`;
}

export async function setSessionCookie(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) return null;

    const userId = parseInt(sessionCookie.value, 10);
    if (isNaN(userId)) return null;

    const user = db
      .prepare(
        "SELECT id, username, display_name, bio, created_at FROM users WHERE id = ?"
      )
      .get(userId) as User | undefined;

    return user || null;
  } catch {
    return null;
  }
}
