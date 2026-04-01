"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import ComposeBox from "@/components/ComposeBox";
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

export default function Home() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [feed, setFeed] = useState<"all" | "following">("all");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  const latestPostId = useRef<number>(0);

  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?feed=${feed}`);
      const data = await res.json();
      if (silent && data.posts.length > 0) {
        const newestId = data.posts[0].id;
        if (latestPostId.current > 0 && newestId > latestPostId.current) {
          const newCount = data.posts.filter((p: Post) => p.id > latestPostId.current).length;
          setNewPostsAvailable(newCount);
          return; // Don't replace posts yet, let user click to see them
        }
      }
      setPosts(data.posts);
      setNewPostsAvailable(0);
      if (data.posts.length > 0) {
        latestPostId.current = data.posts[0].id;
      }
    } finally {
      if (!silent) setLoadingPosts(false);
    }
  }, [feed]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Poll for new posts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const showNewPosts = () => {
    setNewPostsAvailable(0);
    fetchPosts();
  };

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    if (post.id > latestPostId.current) {
      latestPostId.current = post.id;
    }
  };

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-14 z-40 bg-black/80 backdrop-blur-md border-b border-[#2F3336]">
        <div className="flex">
          <button
            onClick={() => setFeed("all")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              feed === "all" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[#16181C]"
            }`}
          >
            For you
            {feed === "all" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-brand" />
            )}
          </button>
          {user && (
            <button
              onClick={() => setFeed("following")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                feed === "following" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[#16181C]"
              }`}
            >
              Following
              {feed === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-brand" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Compose */}
      {user && <ComposeBox onPost={handleNewPost} />}

      {/* New posts banner */}
      {newPostsAvailable > 0 && (
        <button
          onClick={showNewPosts}
          className="w-full py-3 text-brand text-sm hover:bg-[#16181C] transition-colors border-b border-[#2F3336]"
        >
          Show {newPostsAvailable} new post{newPostsAvailable > 1 ? "s" : ""}
        </button>
      )}

      {/* Posts */}
      {loadingPosts ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">{user ? "Be the first to post something!" : "Sign up to start posting!"}</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
