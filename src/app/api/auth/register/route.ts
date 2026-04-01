import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, password, display_name } = await req.json();

  if (!username || !password || !display_name) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: "Username must be 3-20 characters" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)")
    .run(username.toLowerCase(), display_name, hash);

  await setSessionCookie(Number(result.lastInsertRowid));

  return NextResponse.json({
    id: result.lastInsertRowid,
    username: username.toLowerCase(),
    display_name,
  });
}
