"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Diagnosis, Facts } from "@/lib/expert-system";
import Header from "@/app/components/Header";

export default function DashboardPage() {
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis | null>(null);
  const [activeFacts, setActiveFacts] = useState<Facts | null>(null);
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);

  // Load user profile and their linked student diagnosis record
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((user) => {
        setCurrentUser(user);
        if (user.role === "STUDENT") {
          return fetch(`/api/students?userId=${user.id}`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch student data");
              return res.json();
            })
            .then((data) => {
              if (data && data.id) {
                setActiveDiagnosis({
                  id: data.id,
                  title: data.diagnosisTitle,
                  risk: data.riskLevel,
                  explanation: data.explanation,
                  remediationTasks: data.tasks,
                });
                setActiveFacts({
                  strugglesLogic: data.strugglesLogic,
                  strugglesCoreOOP: data.strugglesCoreOOP,
                  strugglesAdvancedOOP: data.strugglesAdvancedOOP,
                  strugglesDataStructures: data.strugglesDataStructures,
                  learningStyle: data.learningStyle,
                });
                setTasks(data.tasks);
              } else {
                setActiveDiagnosis(null);
                setActiveFacts(null);
                setTasks([]);
              }
            });
        }
      })
      .catch((err) => {
        console.error("Dashboard initialization error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Recalculate exam readiness percentage during render instead of using a separate effect
  const readiness = tasks.length === 0
    ? 0
    : Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

  const toggleTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedCompleted = !targetTask.completed;

    // 1. Update UI state immediately
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: updatedCompleted };
      }
      return t;
    });
    setTasks(updated);

    // 2. Sync with database
    if (activeDiagnosis && activeDiagnosis.id) {
      fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedCompleted }),
      })
        .then((res) => {
          if (!res.ok) console.error("Gagal sinkronisasi tugas ke database.");
        })
        .catch((err) => {
          console.error("Gagal menghubungi server untuk sinkronisasi tugas:", err);
        });
    }
  };

  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case "Low":
        return {
          label: "RISIKO RENDAH (AMAN)",
          border: "border-emerald-600 bg-emerald-50 text-emerald-800",
          message: "Progress belajar Anda stabil. Pertahankan performa ini dan tetap lakukan latihan mandiri.",
        };
      case "Medium":
        return {
          label: "RISIKO SEDANG (WASPADA)",
          border: "border-amber-600 bg-amber-50 text-amber-800",
          message: "Ada beberapa sub-bab yang belum Anda kuasai. Mulailah mengerjakan rencana remedi agar tidak menumpuk.",
        };
      case "High":
        return {
          label: "RISIKO TINGGI (RAWAN)",
          border: "border-orange-600 bg-orange-50 text-orange-800",
          message: "Tingkat pemahaman materi praktikum Anda rendah. Disarankan berkonsultasi dengan asisten dosen.",
        };
      case "Critical":
        return {
          label: "PERINGATAN DINI (KRITIS)",
          border: "border-rose-600 bg-rose-50 text-rose-800",
          message: "Wajib mengambil remedi intensif segera. Hubungi dosen wali Anda.",
        };
      default:
        return {
          label: "UNKNOWN",
          border: "border-zinc-800 bg-[#F4F1EC] text-zinc-600",
          message: "Silakan selesaikan diagnosis terlebih dahulu.",
        };
    }
  };

  const getProgressMessage = (pct: number) => {
    if (pct === 100) return "Siap 100% menghadapi ujian!";
    if (pct >= 67) return "Pemahaman sangat baik, pertahankan!";
    if (pct >= 34) return "Bagus, Anda mulai memahami konsep!";
    return "Tugas remedi harus segera diselesaikan.";
  };

  const riskDetails = activeDiagnosis ? getRiskDetails(activeDiagnosis.risk) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-[#1E1E1E] selection:bg-[#FEDFD9] selection:text-[#1E1E1E]">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E1E1E] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 border border-[#1E1E1E]" />
              <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider">
                Pemantauan Remedi Hack
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1E1E1E] mt-1.5">
              Dasbor Pelacak Belajar Mandiri
            </h1>
          </div>
          {activeDiagnosis && currentUser?.role === "STUDENT" && (
            <Link
              href="/diagnose"
              className="self-start px-6 py-3.5 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-xs font-bold uppercase transition-colors shadow-[3px_3px_0px_0px_#1E1E1E]"
            >
              Ulangi Diagnosis
            </Link>
          )}
        </div>

        {loading ? (
          <div className="border border-[#1E1E1E] py-20 text-center bg-[#FDFCFB]">
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
              Memuat Data Tracker...
            </p>
          </div>
        ) : currentUser?.role === "LECTURER" ? (
          <div className="border border-[#1E1E1E] py-20 text-center bg-[#FDFCFB] flex flex-col items-center gap-4 px-6">
            <p className="text-sm text-zinc-500">
              Anda masuk sebagai <strong>Dosen</strong>. Dasbor Rencana Aksi Belajar Mandiri hanya tersedia bagi Mahasiswa.
            </p>
            <Link
              href="/analytics"
              className="px-6 py-3 border border-[#1E1E1E] bg-[#F86041] text-[#FDFCFB] hover:bg-[#1E1E1E] text-xs font-bold uppercase transition-colors"
            >
              Ke Pusat Analisis Dataset
            </Link>
          </div>
        ) : !activeDiagnosis ? (
          <div className="border border-[#1E1E1E] py-20 text-center bg-[#FDFCFB] flex flex-col items-center gap-6 px-6 shadow-[3px_3px_0px_0px_#1E1E1E]">
            <div className="max-w-md flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#FEDFD9]/60 border border-[#1E1E1E] flex items-center justify-center font-bold text-[#F86041] text-2xl">
                !
              </div>
              <h3 className="text-lg font-bold mt-2">Belum Ada Hasil Diagnosis</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Anda belum melakukan tes diagnosis kesulitan belajar mandiri. Lakukan diagnosa untuk mendapatkan analisis sub-bab dan rencana aksi remedi yang personal.
              </p>
            </div>
            <Link
              href="/diagnose"
              className="px-8 py-4 border border-[#1E1E1E] bg-[#F86041] text-[#FDFCFB] hover:bg-[#1E1E1E] text-xs font-bold uppercase transition-colors shadow-[3px_3px_0px_0px_#1E1E1E]"
            >
              Mulai Diagnosis Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Diagnosis info and tasks) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Active Diagnosis Info */}
              <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB]">
                <div className="flex items-start justify-between gap-4 border-b border-[#1E1E1E] pb-4">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      DIAGNOSIS TERAKHIR
                    </span>
                    <h2 className="text-xl font-bold text-[#1E1E1E] mt-1">
                      {activeDiagnosis.title}
                    </h2>
                  </div>
                  {activeFacts && (
                    <span className="px-3 py-1 border border-[#1E1E1E] bg-[#FEDFD9] text-xs font-bold uppercase tracking-wider">
                      Gaya Belajar: {activeFacts.learningStyle}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Analisis Penyebab Kesulitan:
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700 bg-[#F4F1EC]/30 p-5 border border-[#1E1E1E]">
                    {activeDiagnosis.explanation}
                  </p>
                </div>
              </div>

              {/* Action Plan Tasks Board */}
              <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1E1E1E]">
                    Papan Rencana Aksi (Remedi)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Selesaikan tugas-tugas di bawah ini secara bertahap untuk memperbaiki pemahaman Anda pada sub-bab terkait.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Tidak ada tugas remedi yang direkomendasikan.</p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-5 border border-[#1E1E1E] flex items-start gap-4 cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_0px_#1E1E1E] ${
                          task.completed
                            ? "bg-[#EAF7F0]/40 opacity-75 line-through decoration-zinc-400 decoration-1"
                            : "bg-[#FDFCFB] hover:translate-x-1"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 border border-[#1E1E1E] mt-0.5 flex items-center justify-center font-bold text-xs ${
                            task.completed ? "bg-[#1B8755] text-[#FDFCFB]" : "bg-[#FDFCFB]"
                          }`}
                        >
                          {task.completed && "✓"}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${task.completed ? "text-zinc-500" : "text-[#1E1E1E]"}`}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Metrics and Syllabus) */}
            <div className="flex flex-col gap-8">
              {/* Progress Summary Card */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4 shadow-[3px_3px_0px_0px_#1E1E1E]">
                <h4 className="font-bold text-xs tracking-wider uppercase text-zinc-500">
                  Kesiapan Evaluasi Ujian
                </h4>

                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-extrabold tracking-tighter text-[#F86041]">
                      {readiness}%
                    </span>
                    <span className="text-xs font-bold text-zinc-500">TERPENUHI</span>
                  </div>

                  {/* Minimal flat progress bar */}
                  <div className="h-6 w-full bg-[#F4F1EC] border border-[#1E1E1E] overflow-hidden">
                    <div
                      style={{ width: `${readiness}%` }}
                      className="h-full bg-[#F86041] border-r border-[#1E1E1E] transition-all duration-300"
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-600 italic mt-1 leading-normal">
                  {getProgressMessage(readiness)}
                </p>
              </div>

              {/* Early Warning System Panel */}
              {riskDetails && (
                <div className={`border p-6 bg-[#FDFCFB] flex flex-col gap-4 ${riskDetails.border}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-current rounded-full" />
                    <span className="font-extrabold text-xs tracking-wider uppercase">
                      {riskDetails.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {riskDetails.message}
                  </p>
                </div>
              )}

              {/* Syllabus Outline */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4">
                <h4 className="font-bold text-sm">Hirarki Capaian Sub-bab</h4>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const struggles = [
                      { name: "Logika Dasar & Kontrol Alur", active: activeFacts?.strugglesLogic },
                      { name: "Konsep Dasar OOP (PBO)", active: activeFacts?.strugglesCoreOOP },
                      { name: "OOP Lanjut & Abstraksi (PBO)", active: activeFacts?.strugglesAdvancedOOP },
                      { name: "Struktur Data & Basis Data (DBMS)", active: activeFacts?.strugglesDataStructures },
                    ].filter(sub => sub.active);

                    if (struggles.length === 0) {
                      return (
                        <p className="text-xs text-zinc-500 italic leading-relaxed">
                          Tidak ada kelemahan akademis spesifik yang terdeteksi. Semua kompetensi belajar terpantau aman.
                        </p>
                      );
                    }

                    return struggles.map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between p-3 border border-[#1E1E1E] bg-[#FFF0F2]/40 text-xs">
                        <span className="text-[#1E1E1E] font-medium">{sub.name}</span>
                        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider border bg-[#FFF0F2] text-[#D61C4E] border-[#D61C4E]">
                          Lemah
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
