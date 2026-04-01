import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = await getCurrentUser();

  const post = db
    .prepare(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
        CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`
    )
    .get(user?.id ?? null, user?.id ?? null, id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(params.id) as { user_id: number } | undefined;
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  db.prepare("DELETE FROM posts WHERE id = ?").run(params.id);
  return NextResponse.json({ ok: true });
}
