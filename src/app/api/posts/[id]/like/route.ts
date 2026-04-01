import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const postId = parseInt(params.id);
  const existing = db
    .prepare("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?")
    .get(user.id, postId);

  if (existing) {
    db.prepare("DELETE FROM likes WHERE user_id = ? AND post_id = ?").run(user.id, postId);
    return NextResponse.json({ liked: false });
  } else {
    db.prepare("INSERT INTO likes (user_id, post_id) VALUES (?, ?)").run(user.id, postId);
    return NextResponse.json({ liked: true });
  }
}
