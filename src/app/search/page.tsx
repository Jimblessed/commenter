"use client";

import { useState } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";

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

interface UserResult {
  id: number;
  username: string;
  display_name: string;
  bio: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [tab, setTab] = useState<"posts" | "people">("posts");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setPosts(data.posts);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky top-14 z-40 bg-black/80 backdrop-blur-md border-b border-[#2F3336]">
        <form onSubmit={handleSearch} className="px-4 py-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#16181C] border border-transparent focus-within:border-brand focus-within:bg-transparent transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-secondary)] shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Commenter"
              className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border-none text-sm"
            />
          </div>
        </form>

        {searched && (
          <div className="flex">
            <button
              onClick={() => setTab("posts")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                tab === "posts" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[#16181C]"
              }`}
            >
              Posts
              {tab === "posts" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-brand" />
              )}
            </button>
            <button
              onClick={() => setTab("people")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                tab === "people" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[#16181C]"
              }`}
            >
              People
              {tab === "people" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-brand" />
              )}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !searched ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <p>Search for posts and people</p>
        </div>
      ) : tab === "posts" ? (
        posts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>No posts found</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <p>No people found</p>
        </div>
      ) : (
        users.map((u) => (
          <Link
            key={u.id}
            href={`/profile/${u.username}`}
            className="block px-4 py-3 border-b border-[#2F3336] hover:bg-[#080808] transition-colors no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-sm">
                {u.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)]">{u.display_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">@{u.username}</p>
                {u.bio && <p className="text-sm text-[var(--text-primary)] mt-0.5">{u.bio}</p>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
