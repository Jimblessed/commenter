import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const comments = db
    .prepare(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
        CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.parent_id = ?
      ORDER BY p.created_at ASC`
    )
    .all(user?.id ?? null, user?.id ?? null, params.id);

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 280) {
    return NextResponse.json({ error: "Comment must be 280 characters or less" }, { status: 400 });
  }

  const result = db
    .prepare("INSERT INTO posts (user_id, content, parent_id) VALUES (?, ?, ?)")
    .run(user.id, content.trim(), params.id);

  return NextResponse.json({
    id: result.lastInsertRowid,
    content: content.trim(),
    user_id: user.id,
    username: user.username,
    display_name: user.display_name,
    parent_id: parseInt(params.id),
  });
}
