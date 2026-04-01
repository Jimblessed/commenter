"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PostCard from "@/components/PostCard";

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  created_at: string;
  post_count: number;
  following_count: number;
  follower_count: number;
  is_following: boolean;
  is_me: boolean;
}

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

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`/api/users/${username}`),
          fetch(`/api/users/${username}/posts`),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.user);
          setFollowing(data.user.is_following);
          setEditName(data.user.display_name);
          setEditBio(data.user.bio || "");
        }
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) return;
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    setFollowing(data.following);
    setProfile((prev) =>
      prev
        ? { ...prev, follower_count: prev.follower_count + (data.following ? 1 : -1) }
        : prev
    );
  };

  const handleSaveProfile = async () => {
    await fetch(`/api/users/${username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: editName, bio: editBio }),
    });
    setProfile((prev) => (prev ? { ...prev, display_name: editName, bio: editBio } : prev));
    setEditing(false);
  };

  const handleDeletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        <p className="text-lg">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-brand/30 to-brand-dark/30" />
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end -mt-10 mb-3">
            <div className="w-20 h-20 rounded-full bg-brand/20 border-4 border-black flex items-center justify-center text-brand font-bold text-2xl">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            {profile.is_me ? (
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-1.5 rounded-full border border-[#2F3336] text-sm font-bold text-[var(--text-primary)] hover:bg-[#16181C] transition-colors"
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            ) : currentUser ? (
              <button
                onClick={handleFollow}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  following
                    ? "border border-[#2F3336] text-[var(--text-primary)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50"
                    : "bg-[var(--text-primary)] text-black hover:bg-[var(--text-primary)]/90"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            ) : null}
          </div>

          {editing ? (
            <div className="space-y-3 mb-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
                className="w-full px-3 py-2 rounded-lg bg-transparent border border-[#2F3336] text-[var(--text-primary)] focus:border-brand transition-colors"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio"
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 rounded-lg bg-transparent border border-[#2F3336] text-[var(--text-primary)] resize-none focus:border-brand transition-colors"
              />
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded-full bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
              <p className="text-[var(--text-secondary)]">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-[var(--text-primary)]">{profile.bio}</p>}
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Joined {new Date(profile.created_at + "Z").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </>
          )}

          <div className="flex gap-4 mt-3">
            <span className="text-sm">
              <span className="font-bold text-[var(--text-primary)]">{profile.following_count}</span>{" "}
              <span className="text-[var(--text-secondary)]">Following</span>
            </span>
            <span className="text-sm">
              <span className="font-bold text-[var(--text-primary)]">{profile.follower_count}</span>{" "}
              <span className="text-[var(--text-secondary)]">Followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-[#2F3336]">
        <div className="px-4 py-3 border-b border-[#2F3336]">
          <span className="font-bold text-[var(--text-primary)]">Posts</span>
          <span className="ml-2 text-sm text-[var(--text-secondary)]">{profile.post_count}</span>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>No posts yet</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
}
