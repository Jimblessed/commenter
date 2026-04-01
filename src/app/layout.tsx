import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Commenter",
  description: "Share your thoughts with the world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-2xl mx-auto border-x border-[#2F3336] min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
