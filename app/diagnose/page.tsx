"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { runForwardChaining, Facts, DetailedFacts, InferenceResult } from "@/lib/expert-system";
import Header from "@/app/components/Header";

export default function DiagnosePage() {
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [detailedFacts, setDetailedFacts] = useState<DetailedFacts>({
    g001: false,
    g002: false,
    g003: false,
    g004: false,
    g005: false,
    g006: false,
    g007: false,
    g008: false,
    learningStyle: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((user) => {
        if (user) {
          setStudentName(user.name);
          setUserId(user.id);
        }
      })
      .catch(() => {});
  }, []);

  const [result, setResult] = useState<InferenceResult | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  const handleCheckboxChange = (field: keyof Omit<DetailedFacts, "learningStyle">) => {
    setDetailedFacts((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleStyleChange = (style: "Visual" | "Auditory" | "Kinesthetic") => {
    setDetailedFacts((prev) => ({
      ...prev,
      learningStyle: style,
    }));
  };

  const handleDiagnose = () => {
    if (!studentName.trim()) {
      alert("Silakan masukkan nama Anda terlebih dahulu!");
      return;
    }
    if (!detailedFacts.learningStyle) {
      alert("Silakan pilih gaya belajar Anda terlebih dahulu!");
      return;
    }
    const res = runForwardChaining(detailedFacts);
    setResult(res);

    // Map to database Facts format for Postgres insertion
    const mappedFacts: Facts = {
      strugglesLogic: detailedFacts.g005 || detailedFacts.g007,
      strugglesCoreOOP: detailedFacts.g003 || detailedFacts.g004,
      strugglesAdvancedOOP: detailedFacts.g001 || detailedFacts.g002,
      strugglesDataStructures: detailedFacts.g006 || detailedFacts.g008,
      learningStyle: detailedFacts.learningStyle,
    };

    // Save to PostgreSQL database
    fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: studentName,
        facts: mappedFacts,
        diagnosis: res.diagnosis,
        userId: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          localStorage.setItem("pathify_active_student_id", data.id);
          localStorage.setItem("pathify_active_diagnosis", JSON.stringify(data.diagnosis));
          localStorage.setItem("pathify_active_facts", JSON.stringify(mappedFacts));
        }
      })
      .catch((error) => {
        console.error("Gagal menyimpan ke database:", error);
        // Fallback to local storage
        localStorage.setItem("pathify_active_student_id", "local");
        localStorage.setItem("pathify_active_diagnosis", JSON.stringify(res.diagnosis));
        localStorage.setItem("pathify_active_facts", JSON.stringify(mappedFacts));
      });
  };

  const resetForm = () => {
    setStudentName("");
    setDetailedFacts({
      g001: false,
      g002: false,
      g003: false,
      g004: false,
      g005: false,
      g006: false,
      g007: false,
      g008: false,
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
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Tes Mandiri Diagnosa Kesulitan Belajar
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Pilihlah gejala kendala akademik dan gaya belajar yang Anda rasakan untuk dianalisis oleh basis aturan kecerdasan buatan.
          </p>
        </div>

        {!result ? (
          <div className="flex flex-col gap-8">
            {/* Student Name Input */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[#1E1E1E]">Identitas Mahasiswa</h2>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={!!userId}
                  placeholder="Masukkan nama lengkap Anda..."
                  className="p-4 border border-[#1E1E1E] bg-[#FDFCFB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F86041] rounded-none w-full disabled:opacity-75 disabled:bg-[#F4F1EC]"
                />
              </div>
            </div>

            {/* Step 1: PBO Symptoms */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider">
                  Bagian 1
                </span>
                <h2 className="text-xl font-bold mt-1">
                  Gejala Kesulitan Pemrograman Berorientasi Objek (PBO)
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "g001",
                    code: "G001",
                    title: "Bingung menggunakan Inheritance biasa atau Kelas Abstrak",
                    desc: "Sering salah memilih relasi pewarisan yang tepat saat merancang kelas dasar.",
                  },
                  {
                    id: "g002",
                    code: "G002",
                    title: "Gagal mengimplementasikan metode abstract di kelas anak",
                    desc: "Memicu error kompilasi karena lupa mengimplementasikan metode kosong dari kelas induk.",
                  },
                  {
                    id: "g003",
                    code: "G003",
                    title: "Kesulitan memahami konsep Multiple Inheritance semu (Interface)",
                    desc: "Bingung bagaimana mengimplementasikan banyak interface pada satu kelas Java.",
                  },
                  {
                    id: "g004",
                    code: "G004",
                    title: "Tidak memahami perbedaan keyword extends dan implements",
                    desc: "Sering terbalik dalam menulis sintaks pewarisan class vs implementasi interface.",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-5 border border-[#1E1E1E] flex gap-4 cursor-pointer transition-colors ${
                      detailedFacts[item.id as keyof Omit<DetailedFacts, "learningStyle">]
                        ? "bg-[#FEDFD9]/60"
                        : "bg-[#FDFCFB] hover:bg-[#F4F1EC]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!detailedFacts[item.id as keyof Omit<DetailedFacts, "learningStyle">]}
                      onChange={() =>
                        handleCheckboxChange(item.id as keyof Omit<DetailedFacts, "learningStyle">)
                      }
                      className="w-5 h-5 text-[#F86041] border-[#1E1E1E] focus:ring-[#F86041] rounded-none mt-1 accent-[#F86041] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm block text-[#1E1E1E]">
                        <span className="font-mono text-xs text-[#F86041] mr-2">[{item.code}]</span>
                        {item.title}
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block leading-relaxed">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Logic & DBMS Symptoms */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider">
                  Bagian 2
                </span>
                <h2 className="text-xl font-bold mt-1">
                  Gejala Kesulitan Logika, Struktur Data & DBMS
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "g005",
                    code: "G005",
                    title: "Bingung konsep logika dasar & alur kontrol (looping/branching)",
                    desc: "Kesulitan merancang conditional branching nested if-else atau perulangan bersarang.",
                  },
                  {
                    id: "g006",
                    code: "G006",
                    title: "Kesulitan mengakses alamat memori referensi pointer & ArrayList",
                    desc: "Sering bingung tentang data passing referensi alamat objek PBO dalam memori heap.",
                  },
                  {
                    id: "g007",
                    code: "G007",
                    title: "Kesulitan merancang Entity Relationship Diagram (ERD)",
                    desc: "Kebingungan memetakan relasi kardinalitas (1:M atau M:N) dari deskripsi naratif studi kasus.",
                  },
                  {
                    id: "g008",
                    code: "G008",
                    title: "Bingung menerapkan aturan normalisasi database (1NF hingga 3NF)",
                    desc: "Tidak mengerti cara memecah tabel yang mengalami anomali redundansi data.",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-5 border border-[#1E1E1E] flex gap-4 cursor-pointer transition-colors ${
                      detailedFacts[item.id as keyof Omit<DetailedFacts, "learningStyle">]
                        ? "bg-[#FEDFD9]/60"
                        : "bg-[#FDFCFB] hover:bg-[#F4F1EC]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!detailedFacts[item.id as keyof Omit<DetailedFacts, "learningStyle">]}
                      onChange={() =>
                        handleCheckboxChange(item.id as keyof Omit<DetailedFacts, "learningStyle">)
                      }
                      className="w-5 h-5 text-[#F86041] border-[#1E1E1E] focus:ring-[#F86041] rounded-none mt-1 accent-[#F86041] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm block text-[#1E1E1E]">
                        <span className="font-mono text-xs text-[#F86041] mr-2">[{item.code}]</span>
                        {item.title}
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block leading-relaxed">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Learning Style */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider">
                  Bagian 3
                </span>
                <h2 className="text-xl font-bold mt-1">Gaya Belajar Mahasiswa</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: "Visual",
                    title: "Visual",
                    desc: "Lebih mudah memahami diagram alir (flowchart), gambar UML, dan visualisasi bagan kelas.",
                  },
                  {
                    id: "Auditory",
                    title: "Auditori",
                    desc: "Lebih terbantu dengan mendengarkan penjelasan lisan, diskusi kelompok, atau podcast.",
                  },
                  {
                    id: "Kinesthetic",
                    title: "Kinestetik",
                    desc: "Lebih paham dengan melakukan latihan praktek coding mandiri dan debugging baris-per-baris.",
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStyleChange(style.id as "Visual" | "Auditory" | "Kinesthetic")}
                    className={`p-5 border border-[#1E1E1E] text-left flex flex-col gap-3 transition-colors cursor-pointer ${
                      detailedFacts.learningStyle === style.id
                        ? "bg-[#FEDFD9]/70 border-[#F86041] ring-1 ring-[#F86041]"
                        : "bg-[#FDFCFB] hover:bg-[#F4F1EC]/40"
                    }`}
                  >
                    <span className="font-bold text-sm block text-[#1E1E1E]">{style.title}</span>
                    <span className="text-xs text-zinc-500 leading-relaxed">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#1E1E1E] pt-8 gap-4">
              <span className="text-xs text-zinc-500">
                Pilih minimal satu gejala kesulitan dan gaya belajar Anda untuk menjalankan inferensi.
              </span>
              <button
                onClick={handleDiagnose}
                className="w-full sm:w-auto px-8 py-4 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-sm font-bold uppercase transition-colors shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none active:translate-y-1"
              >
                Jalankan Inferensi Forward Chaining
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10 animate-fade-in-up">
            {/* Diagnosis Result View */}
            <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E1E] pb-6">
                <div>
                  <span className="text-xs font-bold text-[#F86041] uppercase tracking-wider block">
                    Hasil Diagnosis Cerdas
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1E1E1E] mt-1">
                    {result.diagnosis.title}
                  </h2>
                </div>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border ${getRiskBadge(result.diagnosis.risk)}`}>
                  Risiko: {result.diagnosis.risk}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#1E1E1E] mb-2">Akar Masalah Kesulitan</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{result.diagnosis.explanation}</p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#1E1E1E] mb-4">Rekomendasi Rencana Aksi (Remediation Tasks)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.diagnosis.remediationTasks.map((task, idx) => (
                    <div key={task.id} className="p-5 border border-[#1E1E1E] bg-[#FEDFD9]/35 flex items-start gap-4">
                      <div className="w-6 h-6 border border-[#1E1E1E] bg-[#F86041] flex items-center justify-center text-xs font-bold text-[#FDFCFB] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-[#1E1E1E] leading-relaxed font-semibold">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 border-t border-[#1E1E1E] pt-8">
                <Link
                  href="/dashboard"
                  className="px-6 py-4 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase text-center transition-colors shadow-[3px_3px_0px_0px_#1E1E1E]"
                >
                  Buka Dasbor Pelacak Belajar
                </Link>
                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className="px-6 py-4 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9]/40 text-[#1E1E1E] text-xs font-bold uppercase transition-colors"
                >
                  {showTrace ? "Sembunyikan Jalur Logika" : "Tampilkan Jalur Inferensi"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-4 border border-[#1E1E1E] bg-[#F4F1EC] hover:bg-[#E5E2DD] text-zinc-600 text-xs font-bold uppercase transition-colors sm:ml-auto"
                >
                  Ulangi Diagnosis
                </button>
              </div>
            </div>

            {/* Inference Trace view */}
            {showTrace && (
              <div className="border border-[#1E1E1E] p-8 bg-[#FDFCFB] flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-lg text-[#1E1E1E]">
                    Jejak Forward Chaining (Inference Trace Log)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Evaluasi aturan logis (IF-THEN) yang dicocokkan secara sekuensial dari basis pengetahuan.
                  </p>
                </div>

                <div className="flex flex-col border-l border-[#1E1E1E] ml-2">
                  {result.trace.map((step, idx) => (
                    <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[9px] top-1.5 w-4.5 h-4.5 border border-[#1E1E1E] ${
                        step.triggered ? "bg-[#F86041]" : "bg-[#FDFCFB]"
                      }`} />
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FEDFD9] border border-[#1E1E1E] text-[#1E1E1E]">
                            {step.ruleId}
                          </span>
                          <span className="font-bold text-sm text-[#1E1E1E]">{step.ruleName}</span>
                          <span className={`text-xs font-bold uppercase tracking-wider ml-auto ${
                            step.triggered ? "text-[#F86041]" : "text-zinc-400"
                          }`}>
                            {step.triggered ? "Fired" : "Skipped"}
                          </span>
                        </div>

                        {step.result && (
                          <div className="text-zinc-600 mt-1 font-medium text-xs leading-relaxed border-l-2 border-[#F86041] pl-3 py-1 bg-[#FEDFD9]/15">
                            {step.result}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
