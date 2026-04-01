import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(params.username) as { id: number } | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const posts = db
    .prepare(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
        CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.parent_id IS NULL
      ORDER BY p.created_at DESC
      LIMIT 50`
    )
    .all(currentUser?.id ?? null, currentUser?.id ?? null, user.id);

  return NextResponse.json({ posts });
}
