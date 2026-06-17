"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Diagnosis, Facts } from "@/lib/expert-system";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis | null>(null);
  const [activeFacts, setActiveFacts] = useState<Facts | null>(null);
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const loadDefaultStudent = () => {
    const defaultStudent = MOCK_STUDENTS[0];
    setActiveDiagnosis(defaultStudent.diagnosis);
    setActiveFacts(defaultStudent.facts);
    setTasks(defaultStudent.diagnosis.remediationTasks);
  };

  // Load diagnosis from localstorage/database or use a default mock student
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedId = localStorage.getItem("pathify_active_student_id");
      const storedDiag = localStorage.getItem("pathify_active_diagnosis");
      const storedFacts = localStorage.getItem("pathify_active_facts");

      if (storedId && storedId !== "local") {
        // Fetch from database
        fetch(`/api/students/${storedId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Database fetch failed");
            return res.json();
          })
          .then((data) => {
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
          })
          .catch(() => {
            // Fallback to local storage if DB call fails
            loadFromLocalStorage(storedDiag, storedFacts);
          });
      } else {
        loadFromLocalStorage(storedDiag, storedFacts);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadFromLocalStorage = (storedDiag: string | null, storedFacts: string | null) => {
    if (storedDiag && storedFacts) {
      try {
        const diag = JSON.parse(storedDiag) as Diagnosis;
        setActiveDiagnosis(diag);
        setActiveFacts(JSON.parse(storedFacts) as Facts);
        setTasks(diag.remediationTasks);
      } catch {
        loadDefaultStudent();
      }
    } else {
      loadDefaultStudent();
    }
  };

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

    // 2. Sync with local storage
    if (activeDiagnosis) {
      const updatedDiag = {
        ...activeDiagnosis,
        remediationTasks: updated.map((t) => ({ ...t, source: activeDiagnosis.id })),
      };
      setActiveDiagnosis(updatedDiag);
      localStorage.setItem("pathify_active_diagnosis", JSON.stringify(updatedDiag));
    }

    // 3. Sync with PostgreSQL Database
    const storedId = localStorage.getItem("pathify_active_student_id");
    if (storedId && storedId !== "local") {
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
      {/* Header */}
      <header className="border-b border-[#1E1E1E] bg-[#FDFCFB] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-base">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">
              Pathify
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-[#F86041] hover:underline">
              Beranda
            </Link>
            <Link href="/diagnose" className="hover:text-[#F86041] hover:underline">
              Mulai Diagnosis
            </Link>
            <Link href="/dashboard" className="text-[#F86041] hover:underline">
              Dashboard Tracker
            </Link>
            <Link href="/analytics" className="hover:text-[#F86041] hover:underline">
              Analisis Dataset
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E1E1E] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 border border-[#1E1E1E]" />
              <span className="text-[10px] font-bold text-[#F86041] uppercase tracking-wider">
                Pemantauan Remedi Aktif
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E] mt-0.5">
              Dasbor Pelacak Belajar Mandiri
            </h1>
          </div>
          <Link
            href="/diagnose"
            className="self-start px-4 py-2.5 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-xs font-bold uppercase transition-colors"
          >
            Ulangi Diagnosis
          </Link>
        </div>

        {activeDiagnosis ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Diagnosis info and tasks) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Active Diagnosis Info */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB]">
                <div className="flex items-start justify-between gap-4 border-b border-[#1E1E1E] pb-4">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                      DIAGNOSIS TERAKHIR
                    </span>
                    <h2 className="text-lg font-bold text-[#1E1E1E] mt-0.5">
                      {activeDiagnosis.title}
                    </h2>
                  </div>
                  {activeFacts && (
                    <span className="px-2 py-0.5 border border-[#1E1E1E] bg-[#FEDFD9] text-[9px] font-bold uppercase tracking-wider">
                      Gaya Belajar: {activeFacts.learningStyle}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-4 leading-relaxed">
                  {activeDiagnosis.explanation}
                </p>
              </div>

              {/* Task board / list */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-[#1E1E1E]">Papan Rencana Aksi</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Selesaikan rencana aksi remedi mandiri ini sebelum pelaksanaan masa ujian semester.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 border border-[#1E1E1E] transition-colors cursor-pointer flex items-center justify-between gap-3 select-none ${
                        task.completed ? "bg-[#FEDFD9]/30 text-zinc-500" : "bg-[#FDFCFB] hover:bg-[#F4F1EC]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-4.5 h-4.5 border border-[#1E1E1E] flex items-center justify-center shrink-0 transition-colors ${
                          task.completed ? "bg-[#F86041]" : "bg-[#FDFCFB]"
                        }`}>
                          {task.completed && (
                            <svg className="w-3 h-3 text-[#FDFCFB]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs leading-relaxed ${task.completed ? "line-through text-zinc-500" : "text-[#1E1E1E]"}`}>
                          {task.title}
                        </span>
                      </div>

                      <span className={`text-[8px] font-bold border border-[#1E1E1E] px-1.5 py-0.5 tracking-wider uppercase shrink-0 ${
                        task.completed ? "bg-[#F4F1EC] text-zinc-500" : "bg-[#FEDFD9] text-[#1E1E1E]"
                      }`}>
                        {task.completed ? "Selesai" : "Tunda"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Metrics, Early Warning, and Syllabus) */}
            <div className="flex flex-col gap-6">
              {/* Exam Readiness Flat progress */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 border-b border-[#1E1E1E] pb-3">
                  Kesiapan Ujian (Readiness)
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tracking-tighter text-[#F86041]">{readiness}%</span>
                    <span className="text-[9px] font-bold text-zinc-500">TERPENUHI</span>
                  </div>

                  {/* Minimal flat progress bar */}
                  <div className="h-5 w-full bg-[#F4F1EC] border border-[#1E1E1E] overflow-hidden">
                    <div
                      style={{ width: `${readiness}%` }}
                      className="h-full bg-[#F86041] border-r border-[#1E1E1E] transition-all duration-300"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-zinc-600 italic mt-1">{getProgressMessage(readiness)}</p>
              </div>

              {/* Early Warning System Panel */}
              {riskDetails && (
                <div className={`border p-4 bg-[#FDFCFB] flex flex-col gap-3 ${riskDetails.border}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-current rounded-full" />
                    <span className="font-extrabold text-[10px] tracking-wider uppercase">
                      {riskDetails.label}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {riskDetails.message}
                  </p>
                  <div className="h-px bg-[#1E1E1E] opacity-10 my-1" />
                  <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-600">
                    <div className="flex justify-between">
                      <span>KEHADIRAN KULIAH:</span>
                      <span className="font-bold text-[#1E1E1E]">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RATA-RATA TUGAS:</span>
                      <span className="font-bold text-[#1E1E1E]">72.4 (C)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Syllabus Outline */}
              <div className="border border-[#1E1E1E] p-4 bg-[#FDFCFB] flex flex-col gap-3">
                <h4 className="font-bold text-xs">Hirarki Capaian Sub-bab</h4>
                <div className="flex flex-col gap-1.5">
                  {[
                    { name: "PBO - Kontrol Alur Dasar", active: activeFacts?.strugglesLogic },
                    { name: "PBO - Enkapsulasi & Pewarisan", active: activeFacts?.strugglesCoreOOP },
                    { name: "PBO - Abstraksi & Polimorfisme", active: activeFacts?.strugglesAdvancedOOP },
                    { name: "PBO - ArrayList & Referensi", active: activeFacts?.strugglesDataStructures },
                  ].map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between p-2 border border-[#1E1E1E] bg-[#F4F1EC]/40 text-[10px]">
                      <span className="text-[#1E1E1E] font-medium">{sub.name}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                        sub.active ? "bg-[#FFF0F2] text-[#D61C4E] border-[#D61C4E]" : "bg-[#EAF7F0] text-[#1B8755] border-[#1B8755]"
                      }`}>
                        {sub.active ? "Lemah" : "Kuasai"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-[#1E1E1E] py-16 text-center bg-[#FDFCFB]">
            <p className="text-xs text-zinc-500">Tidak ada data diagnosis yang ditemukan.</p>
          </div>
        )}
      </main>

      {/* Footer
      <footer className="border-t border-[#1E1E1E] bg-[#F4F1EC] py-8 text-center text-[10px] text-zinc-500 mt-auto">
        <p>© 2026 Pathify Kelompok 2. Informatika Universitas Sebelas Maret. Hak Cipta Dilindungi.</p>
      </footer> */}
    </div>
  );
}
