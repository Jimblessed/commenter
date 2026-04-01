import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const user = await getCurrentUser();

  if (!q.trim()) {
    return NextResponse.json({ posts: [], users: [] });
  }

  const searchTerm = `%${q}%`;

  const posts = db
    .prepare(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
        CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ? AND p.parent_id IS NULL
      ORDER BY p.created_at DESC
      LIMIT 50`
    )
    .all(user?.id ?? null, user?.id ?? null, searchTerm);

  const users = db
    .prepare(
      `SELECT id, username, display_name, bio FROM users
      WHERE username LIKE ? OR display_name LIKE ?
      LIMIT 20`
    )
    .all(searchTerm, searchTerm);

  return NextResponse.json({ posts, users });
}
