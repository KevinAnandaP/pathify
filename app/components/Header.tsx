"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "LECTURER";
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        
        // Segregation check: Students cannot access LECTURER analytics page
        if (data.role === "STUDENT" && pathname === "/analytics") {
          router.push("/dashboard");
        }
      })
      .catch(() => {
        setUser(null);
        // If they are on a protected page, redirect to login
        if (pathname === "/dashboard" || pathname === "/diagnose" || pathname === "/analytics") {
          router.push("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("pathify_active_student_id");
      localStorage.removeItem("pathify_active_diagnosis");
      localStorage.removeItem("pathify_active_facts");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Gagal keluar:", err);
    }
  };

  if (loading) {
    return (
      <header className="border-b border-[#1E1E1E] bg-[#FDFCFB] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-lg">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">Pathify</span>
          </div>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Memuat sesi...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-[#1E1E1E] bg-[#FDFCFB] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-lg">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">Pathify</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link
            href="/"
            className={`${pathname === "/" ? "text-[#F86041]" : "text-[#1E1E1E]"} hover:underline`}
          >
            Beranda
          </Link>

          {/* Student-only Links */}
          {(!user || user.role === "STUDENT") && (
            <>
              <Link
                href="/diagnose"
                className={`${pathname === "/diagnose" ? "text-[#F86041]" : "text-[#1E1E1E]"} hover:underline`}
              >
                Mulai Diagnosis
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`${pathname === "/dashboard" ? "text-[#F86041]" : "text-[#1E1E1E]"} hover:underline`}
                >
                  Dashboard Tracker
                </Link>
              )}
            </>
          )}

          {/* Lecturer-only Links */}
          {user && user.role === "LECTURER" && (
            <Link
              href="/analytics"
              className={`${pathname === "/analytics" ? "text-[#F86041]" : "text-[#1E1E1E]"} hover:underline`}
            >
              Analisis Dataset
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-zinc-600 hidden sm:inline">
                Hai, {user.name} ({user.role === "LECTURER" ? "Dosen" : "Mahasiswa"})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-xs font-bold uppercase transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-xs font-bold uppercase transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border border-[#1E1E1E] bg-[#F86041] text-[#FDFCFB] hover:bg-[#1E1E1E] hover:text-[#FDFCFB] text-xs font-bold uppercase transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
