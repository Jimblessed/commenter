import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();
  const user = db
    .prepare(
      `SELECT id, username, display_name, bio, created_at FROM users WHERE username = ?`
    )
    .get(params.username) as { id: number; username: string; display_name: string; bio: string; created_at: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stats = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM posts WHERE user_id = ? AND parent_id IS NULL) as post_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as follower_count`
    )
    .get(user.id, user.id, user.id) as { post_count: number; following_count: number; follower_count: number };

  let is_following = false;
  if (currentUser && currentUser.id !== user.id) {
    const follow = db
      .prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?")
      .get(currentUser.id, user.id);
    is_following = !!follow;
  }

  return NextResponse.json({
    user: { ...user, ...stats, is_following, is_me: currentUser?.id === user.id },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.username !== params.username) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { display_name, bio } = await req.json();
  if (display_name) {
    db.prepare("UPDATE users SET display_name = ?, bio = ? WHERE id = ?").run(
      display_name,
      bio || "",
      currentUser.id
    );
  }

  return NextResponse.json({ ok: true });
}
