"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface ComposeBoxProps {
  onPost: (post: { id: number; content: string; username: string; display_name: string; user_id: number; created_at: string; like_count: number; comment_count: number; liked_by_me: number; parent_id: number | null }) => void;
  parentId?: number;
  placeholder?: string;
}

export default function ComposeBox({ onPost, parentId, placeholder }: ComposeBoxProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const url = parentId ? `/api/posts/${parentId}/comments` : "/api/posts";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post");
        return;
      }

      const data = await res.json();
      onPost({
        ...data,
        created_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        liked_by_me: 0,
        parent_id: parentId || null,
      });
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-[#2F3336]">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-sm shrink-0">
          {user.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || "What's happening?"}
            maxLength={280}
            rows={3}
            className="w-full bg-transparent text-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none border-none p-0 mt-1"
          />
          {error && <p className="text-sm text-[var(--danger)] mt-1">{error}</p>}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#2F3336]">
            <span className={`text-sm ${content.length > 260 ? (content.length > 280 ? "text-[var(--danger)]" : "text-yellow-500") : "text-[var(--text-secondary)]"}`}>
              {content.length}/280
            </span>
            <button
              type="submit"
              disabled={!content.trim() || content.length > 280 || submitting}
              className="px-5 py-1.5 rounded-full bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : parentId ? "Reply" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
