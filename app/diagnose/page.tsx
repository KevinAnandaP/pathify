"use client";

import { useState } from "react";
import Link from "next/link";
import { runForwardChaining, Facts, InferenceResult } from "@/lib/expert-system";

export default function DiagnosePage() {
  const [studentName, setStudentName] = useState("");
  const [facts, setFacts] = useState<Facts>({
    strugglesLogic: false,
    strugglesCoreOOP: false,
    strugglesAdvancedOOP: false,
    strugglesDataStructures: false,
    learningStyle: "",
  });

  const [result, setResult] = useState<InferenceResult | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  const handleCheckboxChange = (field: keyof Omit<Facts, "learningStyle">) => {
    setFacts((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleStyleChange = (style: "Visual" | "Auditory" | "Kinesthetic") => {
    setFacts((prev) => ({
      ...prev,
      learningStyle: style,
    }));
  };

  const handleDiagnose = () => {
    if (!studentName.trim()) {
      alert("Silakan masukkan nama Anda terlebih dahulu!");
      return;
    }
    if (!facts.learningStyle) {
      alert("Silakan pilih gaya belajar Anda terlebih dahulu!");
      return;
    }
    const res = runForwardChaining(facts);
    setResult(res);

    // Save to PostgreSQL database
    fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: studentName,
        facts,
        diagnosis: res.diagnosis,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          localStorage.setItem("pathify_active_student_id", data.id);
          localStorage.setItem("pathify_active_diagnosis", JSON.stringify(data.diagnosis));
          localStorage.setItem("pathify_active_facts", JSON.stringify(facts));
        }
      })
      .catch((error) => {
        console.error("Gagal menyimpan ke database:", error);
        // Fallback to local storage
        localStorage.setItem("pathify_active_student_id", "local");
        localStorage.setItem("pathify_active_diagnosis", JSON.stringify(res.diagnosis));
        localStorage.setItem("pathify_active_facts", JSON.stringify(facts));
      });
  };

  const resetForm = () => {
    setStudentName("");
    setFacts({
      strugglesLogic: false,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: false,
      learningStyle: "",
    });
    setResult(null);
    setShowTrace(false);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return "badge-low";
      case "Medium":
        return "badge-medium";
      case "High":
        return "badge-high";
      case "Critical":
        return "badge-critical";
      default:
        return "border border-[#1E1E1E] bg-[#F4F1EC] text-[#6B6862]";
    }
  };

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
            <Link href="/diagnose" className="text-[#F86041] hover:underline">
              Mulai Diagnosis
            </Link>
            <Link href="/dashboard" className="hover:text-[#F86041] hover:underline">
              Dashboard Tracker
            </Link>
            <Link href="/analytics" className="hover:text-[#F86041] hover:underline">
              Analisis Dataset
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Tes Mandiri Diagnosa Kesulitan Belajar
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pilihlah gejala kendala akademik dan gaya belajar yang Anda rasakan untuk dianalisis oleh basis aturan.
          </p>
        </div>

        {!result ? (
          <div className="flex flex-col gap-8">
            {/* Student Name Input */}
            <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-3">
              <h2 className="text-sm font-bold text-[#1E1E1E]">Identitas Mahasiswa</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda..."
                  className="p-3 border border-[#1E1E1E] bg-[#FDFCFB] text-xs focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full"
                />
              </div>
            </div>

            {/* Step 1 */}
            <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#F86041] uppercase tracking-wider">
                  Bagian 1
                </span>
                <h2 className="text-md font-bold mt-0.5">
                  Kendala Akademik Sub-bab Pemrograman
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "strugglesLogic",
                    title: "Logika Dasar & Kontrol Alur",
                    desc: "Perulangan (loops), percabangan (if-else), nested loop, runtutan alur program.",
                  },
                  {
                    id: "strugglesCoreOOP",
                    title: "Konsep Dasar OOP",
                    desc: "Pembuatan objek, enkapsulasi data (private/public), pewarisan sifat kelas.",
                  },
                  {
                    id: "strugglesAdvancedOOP",
                    title: "OOP Lanjut & Abstraksi",
                    desc: "Perbedaan abstract class dengan interface, polimorfisme, implementasi modular.",
                  },
                  {
                    id: "strugglesDataStructures",
                    title: "Struktur Data & Koleksi Objek",
                    desc: "ArrayList, Array of Objects, pengaksesan referensi pointer alamat memori.",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-4 border border-[#1E1E1E] flex gap-3 cursor-pointer transition-colors ${
                      facts[item.id as keyof Omit<Facts, "learningStyle">]
                        ? "bg-[#FEDFD9]"
                        : "bg-[#FDFCFB] hover:bg-[#F4F1EC]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!facts[item.id as keyof Omit<Facts, "learningStyle">]}
                      onChange={() =>
                        handleCheckboxChange(item.id as keyof Omit<Facts, "learningStyle">)
                      }
                      className="w-4 h-4 text-[#F86041] border-[#1E1E1E] focus:ring-[#F86041] rounded-none mt-0.5 accent-[#F86041] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#1E1E1E]">{item.title}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block leading-normal">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#F86041] uppercase tracking-wider">
                  Bagian 2
                </span>
                <h2 className="text-md font-bold mt-0.5">Gaya Belajar Mahasiswa</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: "Visual",
                    title: "Visual",
                    desc: "Mempelajari UML, diagram, visualisasi run debugger.",
                  },
                  {
                    id: "Auditory",
                    title: "Auditori",
                    desc: "Penjelasan verbal, rekaman kuliah, diskusi asisten.",
                  },
                  {
                    id: "Kinesthetic",
                    title: "Kinestetik",
                    desc: "Menulis langsung kode di IDE, debugging lab praktikum.",
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStyleChange(style.id as "Visual" | "Auditory" | "Kinesthetic")}
                    className={`p-4 border border-[#1E1E1E] text-left flex flex-col gap-2 transition-colors cursor-pointer ${
                      facts.learningStyle === style.id ? "bg-[#FEDFD9]" : "bg-[#FDFCFB] hover:bg-[#F4F1EC]"
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#1E1E1E]">{style.title}</span>
                    <span className="text-[10px] text-zinc-500 leading-normal">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-[#1E1E1E] pt-6">
              <span className="text-[10px] text-zinc-500">
                Pilih gaya belajar dan minimal satu kendala untuk memulai inferensi.
              </span>
              <button
                onClick={handleDiagnose}
                className="px-6 py-3 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase transition-colors shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none active:translate-y-0.5"
              >
                Jalankan Mesin Inferensi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            {/* Diagnosis Result View */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E1E] pb-6">
                <div>
                  <span className="text-[10px] font-bold text-[#F86041] uppercase tracking-wider block">
                    Hasil Diagnosis
                  </span>
                  <h2 className="text-xl font-extrabold text-[#1E1E1E] mt-0.5">
                    {result.diagnosis.title}
                  </h2>
                </div>
                <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(result.diagnosis.risk)}`}>
                  Risiko: {result.diagnosis.risk}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#1E1E1E] mb-1">Akar Masalah Kesulitan</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{result.diagnosis.explanation}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#1E1E1E] mb-3">Rekomendasi Rencana Aksi (Action Plan)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.diagnosis.remediationTasks.map((task, idx) => (
                    <div key={task.id} className="p-4 border border-[#1E1E1E] bg-[#FEDFD9]/30 flex items-start gap-3">
                      <div className="w-5 h-5 border border-[#1E1E1E] bg-[#F86041] flex items-center justify-center text-[10px] font-bold text-[#FDFCFB] shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-[#1E1E1E] leading-relaxed font-medium">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 border-t border-[#1E1E1E] pt-6">
                <Link
                  href="/dashboard"
                  className="px-5 py-3 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase text-center transition-colors"
                >
                  Buka Dasbor Pelacak Belajar
                </Link>
                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className="px-5 py-3 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-[#1E1E1E] text-xs font-bold uppercase transition-colors"
                >
                  {showTrace ? "Sembunyikan Jejak Logika" : "Tampilkan Jalur Inferensi"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-3 border border-[#1E1E1E] bg-[#F4F1EC] hover:bg-[#E5E2DD] text-zinc-600 text-xs font-bold uppercase transition-colors sm:ml-auto"
                >
                  Ulangi Diagnosis
                </button>
              </div>
            </div>

            {/* Inference Trace view */}
            {showTrace && (
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-sm text-[#1E1E1E]">
                    Jejak Forward Chaining (Inference Trace)
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Evaluasi aturan logis (IF-THEN) yang dicocokkan dari memori fakta.
                  </p>
                </div>

                <div className="flex flex-col border-l border-[#1E1E1E] ml-2">
                  {result.trace.map((step, idx) => (
                    <div key={idx} className="relative pl-6 pb-6 last:pb-0">
                      {/* Timeline dot */}
                      <div className={`absolute -left-1.5 top-1.5 w-3.5 h-3.5 border border-[#1E1E1E] ${
                        step.triggered ? "bg-[#F86041]" : "bg-[#FDFCFB]"
                      }`} />
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-[#FEDFD9] border border-[#1E1E1E] text-[#1E1E1E]">
                            {step.ruleId}
                          </span>
                          <span className="font-bold text-xs text-[#1E1E1E]">{step.ruleName}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ml-auto ${
                            step.triggered ? "text-[#F86041]" : "text-zinc-400"
                          }`}>
                            {step.triggered ? "Fired" : "Skipped"}
                          </span>
                        </div>

                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          <span className="text-zinc-400 font-bold block mb-0.5">Pemeriksaan Premis:</span>
                          {step.factsChecked.map((f, fIdx) => (
                            <span key={fIdx} className="text-zinc-600">
                              {f}: <strong className="text-zinc-800 font-medium">{String(facts[f as keyof Facts])}</strong>
                              {fIdx < step.factsChecked.length - 1 ? " | " : ""}
                            </span>
                          ))}
                          {step.result && (
                            <div className="text-[#F86041] mt-1 font-bold">
                              Konklusi: {step.result}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
