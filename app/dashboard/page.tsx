"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Diagnosis, Facts } from "@/lib/expert-system";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis | null>(null);
  const [activeFacts, setActiveFacts] = useState<Facts | null>(null);
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  // Load diagnosis from localstorage/database or use a default mock student
  useEffect(() => {
    const loadDefaultStudent = () => {
      const defaultStudent = MOCK_STUDENTS[0];
      setActiveDiagnosis(defaultStudent.diagnosis);
      setActiveFacts(defaultStudent.facts);
      setTasks(defaultStudent.diagnosis.remediationTasks);
    };

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
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-lg">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">
              Pathify
            </span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-bold">
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E1E1E] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 border border-[#1E1E1E]" />
              <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider">
                Pemantauan Remedi Aktif
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1E1E1E] mt-1.5">
              Dasbor Pelacak Belajar Mandiri
            </h1>
          </div>
          <Link
            href="/diagnose"
            className="self-start px-6 py-3.5 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-xs font-bold uppercase transition-colors shadow-[3px_3px_0px_0px_#1E1E1E]"
          >
            Ulangi Diagnosis
          </Link>
        </div>

        {activeDiagnosis ? (
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
                <p className="text-sm text-zinc-600 mt-6 leading-relaxed">
                  {activeDiagnosis.explanation}
                </p>
              </div>

              {/* Task board / list */}
              <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-lg text-[#1E1E1E]">Papan Rencana Aksi</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Selesaikan rencana aksi remedi mandiri ini sebelum pelaksanaan masa ujian semester.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-5 border border-[#1E1E1E] transition-colors cursor-pointer flex items-center justify-between gap-4 select-none ${
                        task.completed ? "bg-[#FEDFD9]/20 text-zinc-500" : "bg-[#FDFCFB] hover:bg-[#F4F1EC]/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 w-5 h-5 border border-[#1E1E1E] flex items-center justify-center shrink-0 transition-colors ${
                          task.completed ? "bg-[#F86041]" : "bg-[#FDFCFB]"
                        }`}>
                          {task.completed && (
                            <svg className="w-3.5 h-3.5 text-[#FDFCFB]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm leading-relaxed ${task.completed ? "line-through text-zinc-400 font-normal" : "text-[#1E1E1E] font-medium"}`}>
                          {task.title}
                        </span>
                      </div>

                      <span className={`text-xs font-bold border border-[#1E1E1E] px-2 py-0.5 tracking-wider uppercase shrink-0 ${
                        task.completed ? "bg-[#F4F1EC] text-zinc-400" : "bg-[#FEDFD9] text-[#1E1E1E]"
                      }`}>
                        {task.completed ? "Selesai" : "Tunda"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Metrics, Early Warning, and Syllabus) */}
            <div className="flex flex-col gap-8">
              {/* Exam Readiness Flat progress */}
              <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 border-b border-[#1E1E1E] pb-3">
                  Kesiapan Ujian (Readiness)
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-extrabold tracking-tighter text-[#F86041]">{readiness}%</span>
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

                <p className="text-xs text-zinc-600 italic mt-1 leading-normal">{getProgressMessage(readiness)}</p>
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
                  <div className="h-px bg-[#1E1E1E] opacity-10 my-2" />
                  <div className="flex flex-col gap-2 text-xs font-mono text-zinc-600">
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
        ) : (
          <div className="border border-[#1E1E1E] py-20 text-center bg-[#FDFCFB]">
            <p className="text-sm text-zinc-500">Tidak ada data diagnosis yang ditemukan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
