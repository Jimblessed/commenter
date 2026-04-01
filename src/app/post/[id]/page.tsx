"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PostCard from "@/components/PostCard";
import ComposeBox from "@/components/ComposeBox";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const postId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/posts/${postId}/comments`),
        ]);
        const postData = await postRes.json();
        const commentsData = await commentsRes.json();

        if (postRes.ok) setPost(postData.post);
        if (commentsRes.ok) setComments(commentsData.comments);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [postId]);

  const handleNewComment = (comment: Post) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleDeletePost = () => {
    router.push("/");
  };

  const handleDeleteComment = (id: number) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        <p className="text-lg">Post not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-14 z-40 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-[#2F3336]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-4 text-[var(--text-primary)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-xl font-bold">Post</span>
        </button>
      </div>

      <PostCard post={post} onDelete={() => handleDeletePost()} />

      {user && (
        <div className="border-b border-[#2F3336]">
          <ComposeBox onPost={handleNewComment} parentId={post.id} placeholder="Post your reply" />
        </div>
      )}

      {comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <PostCard key={comment.id} post={comment} onDelete={handleDeleteComment} />
          ))}
        </div>
      )}
    </div>
  );
}
