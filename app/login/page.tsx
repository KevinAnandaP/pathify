"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }

      // Success, route based on role
      if (data.role === "LECTURER") {
        router.push("/analytics");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-[#1E1E1E] selection:bg-[#FEDFD9] selection:text-[#1E1E1E] justify-center items-center px-6">
      {/* Brand Header */}
      <div className="mb-8 text-center flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-xl">
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Pathify</span>
        </Link>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
          Sistem Diagnostik Cerdas
        </p>
      </div>

      {/* Card Form */}
      <div className="max-w-md w-full border border-[#1E1E1E] p-8 bg-[#FDFCFB] shadow-[5px_5px_0px_0px_#1E1E1E] animate-fade-in-up">
        <h1 className="text-xl font-extrabold mb-6 text-zinc-950">Masuk Akun</h1>

        {errorMsg && (
          <div className="mb-6 p-4 border border-rose-500/20 bg-rose-50 text-xs font-bold text-rose-700 leading-normal">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="p-4 border border-[#1E1E1E] bg-[#FDFCFB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="p-4 border border-[#1E1E1E] bg-[#FDFCFB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase transition-colors"
          >
            {loading ? "Memproses..." : "Masuk ke Aplikasi"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#1E1E1E]/10 pt-5">
          <span className="text-xs text-zinc-500">
            Belum memiliki akun?{" "}
            <Link href="/register" className="font-bold text-[#F86041] hover:underline">
              Daftar Baru
            </Link>
          </span>
        </div>
      </div>

      {/* Footer Link */}
      <Link href="/" className="mt-8 text-xs font-bold text-zinc-500 hover:text-[#F86041] hover:underline">
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
