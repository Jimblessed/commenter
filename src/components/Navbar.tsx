"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2F3336] bg-black/80 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-brand">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
          <span className="text-xl font-bold text-[var(--text-primary)]">Commenter</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-[#16181C] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-secondary)]">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline hover:no-underline"
              >
                @{user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-full border border-[#2F3336] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="text-sm px-4 py-1.5 rounded-full border border-[#2F3336] text-[var(--text-primary)] hover:bg-[#16181C] transition-colors no-underline hover:no-underline"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 rounded-full bg-brand text-white hover:bg-brand-dark transition-colors no-underline hover:no-underline"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
