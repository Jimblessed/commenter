import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const feed = searchParams.get("feed") || "all";
  const limit = 20;
  const offset = (page - 1) * limit;

  const user = await getCurrentUser();

  let posts;
  if (feed === "following" && user) {
    posts = db
      .prepare(
        `SELECT p.*, u.username, u.display_name,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
          CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.parent_id IS NULL
          AND (p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) OR p.user_id = ?)
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`
      )
      .all(user.id, user.id, user.id, user.id, limit, offset);
  } else {
    posts = db
      .prepare(
        `SELECT p.*, u.username, u.display_name,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM posts WHERE parent_id = p.id) as comment_count,
          CASE WHEN ? IS NOT NULL THEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) ELSE 0 END as liked_by_me
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.parent_id IS NULL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`
      )
      .all(user?.id ?? null, user?.id ?? null, limit, offset);
  }

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 280) {
    return NextResponse.json({ error: "Post must be 280 characters or less" }, { status: 400 });
  }

  const result = db
    .prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)")
    .run(user.id, content.trim());

  return NextResponse.json({
    id: result.lastInsertRowid,
    content: content.trim(),
    user_id: user.id,
    username: user.username,
    display_name: user.display_name,
  });
}
