"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "LECTURER">("STUDENT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-[#1E1E1E] selection:bg-[#FEDFD9] selection:text-[#1E1E1E] justify-center items-center px-6 py-12">
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
      <div className="max-w-md w-full border border-[#1E1E1E] p-8 bg-[#FDFCFB] shadow-[5px_5px_0px_0px_#1E1E1E]">
        <h1 className="text-xl font-extrabold mb-6 text-zinc-950">Daftar Akun Baru</h1>

        {errorMsg && (
          <div className="mb-6 p-4 border border-rose-500/20 bg-rose-50 text-xs font-bold text-rose-700 leading-normal">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 border border-emerald-500/20 bg-emerald-50 text-xs font-bold text-emerald-700 leading-normal">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda..."
              className="p-4 border border-[#1E1E1E] bg-[#FDFCFB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@mahasiswa.uns.ac.id"
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
              placeholder="Minimal 6 karakter"
              className="p-4 border border-[#1E1E1E] bg-[#FDFCFB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-3 border border-[#1E1E1E] font-bold text-xs uppercase transition-colors ${
                  role === "STUDENT"
                    ? "bg-[#FEDFD9] border-[#1E1E1E]"
                    : "bg-[#FDFCFB] hover:bg-[#F4F1EC]"
                }`}
              >
                Mahasiswa
              </button>
              <button
                type="button"
                onClick={() => setRole("LECTURER")}
                className={`py-3 border border-[#1E1E1E] font-bold text-xs uppercase transition-colors ${
                  role === "LECTURER"
                    ? "bg-[#FEDFD9] border-[#1E1E1E]"
                    : "bg-[#FDFCFB] hover:bg-[#F4F1EC]"
                }`}
              >
                Dosen
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase transition-colors"
          >
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#1E1E1E]/10 pt-5">
          <span className="text-xs text-zinc-500">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-bold text-[#F86041] hover:underline">
              Masuk Saja
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
