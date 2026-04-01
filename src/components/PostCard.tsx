"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: number;
  content: string;
  username: string;
  display_name: string;
  user_id: number;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me: number;
  parent_id: number | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr + "Z");
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PostCard({ post, onDelete }: { post: Post; onDelete?: (id: number) => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [liked, setLiked] = useState(post.liked_by_me > 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDelete?.(post.id);
  };

  return (
    <Link href={`/post/${post.id}`} className="block no-underline hover:no-underline">
      <article className="px-4 py-3 border-b border-[#2F3336] hover:bg-[#080808] transition-colors cursor-pointer">
        <div className="flex gap-3">
          <Link
            href={`/profile/${post.username}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-sm">
              {post.display_name.charAt(0).toUpperCase()}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-sm">
              <Link
                href={`/profile/${post.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-[var(--text-primary)] hover:underline no-underline"
              >
                {post.display_name}
              </Link>
              <Link
                href={`/profile/${post.username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[var(--text-secondary)] no-underline hover:no-underline"
              >
                @{post.username}
              </Link>
              <span className="text-[var(--text-secondary)]">·</span>
              <span className="text-[var(--text-secondary)]">{timeAgo(post.created_at)}</span>
            </div>

            <p className="mt-1 text-[15px] text-[var(--text-primary)] whitespace-pre-wrap break-words">
              {post.content}
            </p>

            <div className="flex items-center gap-6 mt-3 -ml-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/post/${post.id}`); }}
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-brand transition-colors group"
              >
                <div className="p-1.5 rounded-full group-hover:bg-brand/10 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-xs">{post.comment_count || ""}</span>
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors group ${
                  liked ? "text-[#F91880]" : "text-[var(--text-secondary)] hover:text-[#F91880]"
                }`}
              >
                <div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <span className="text-xs">{likeCount || ""}</span>
              </button>

              {user && user.id === post.user_id && (
                <button
                  onClick={handleDelete}
                  className="flex items-center text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors group ml-auto"
                >
                  <div className="p-1.5 rounded-full group-hover:bg-[var(--danger)]/10 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
