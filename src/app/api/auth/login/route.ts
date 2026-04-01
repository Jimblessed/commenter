import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = db
    .prepare("SELECT id, username, display_name, password_hash FROM users WHERE username = ?")
    .get(username.toLowerCase()) as { id: number; username: string; display_name: string; password_hash: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
  });
}
