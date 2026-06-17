"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Facts, runForwardChaining, Diagnosis } from "@/lib/expert-system";
import { MOCK_STUDENTS, SAMPLE_CSV_STRING } from "@/lib/mock-data";

interface ParsedStudent {
  name: string;
  facts: Facts;
  diagnosis: Diagnosis;
  isOULAD?: boolean;
  ouladInfo?: {
    gender: string;
    highestEducation: string;
    finalResult: string;
    credits: number;
  };
}

interface DbStudent {
  id: string;
  name: string;
  strugglesLogic: boolean;
  strugglesCoreOOP: boolean;
  strugglesAdvancedOOP: boolean;
  strugglesDataStructures: boolean;
  learningStyle: "Visual" | "Auditory" | "Kinesthetic";
  diagnosisTitle: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  tasks: { id: string; title: string; completed: boolean }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<ParsedStudent[]>(() => {
    return MOCK_STUDENTS.map(std => ({
      name: std.name,
      facts: std.facts,
      diagnosis: std.diagnosis
    }));
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [datasetType, setDatasetType] = useState<"pathify" | "oulad">("pathify");
  const [convertedJson, setConvertedJson] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");

  // Fetch from PostgreSQL database on mount
  useEffect(() => {
    fetch("/api/students")
      .then(res => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((std: DbStudent) => ({
            name: std.name,
            facts: {
              strugglesLogic: std.strugglesLogic,
              strugglesCoreOOP: std.strugglesCoreOOP,
              strugglesAdvancedOOP: std.strugglesAdvancedOOP,
              strugglesDataStructures: std.strugglesDataStructures,
              learningStyle: std.learningStyle
            },
            diagnosis: {
              id: std.id,
              title: std.diagnosisTitle,
              risk: std.riskLevel,
              explanation: std.explanation,
              remediationTasks: std.tasks.map(t => ({
                id: t.id,
                title: t.title,
                completed: t.completed,
                source: "Database"
              }))
            }
          }));
          setStudents(formatted);
        }
      })
      .catch(err => {
        console.warn("Gagal mengambil data dari database, menggunakan data mock bawaan:", err);
      });
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_STRING], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_kesulitan_pathify.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic robust CSV parser handling quotes
  const parseCSVLines = (text: string) => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine.trim());
        currentLine = "";
      } else if (char === '\r') {
        // Skip carriage returns
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    return lines;
  };

  const splitCSVLine = (line: string) => {
    const result: string[] = [];
    let currentVal = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal.trim());
    return result;
  };

  const parseCSVData = (text: string) => {
    try {
      const lines = parseCSVLines(text);
      if (lines.length <= 1) {
        setErrorMsg("Berkas CSV kosong atau tidak memiliki baris data.");
        setSuccessMsg(null);
        return;
      }

      const headers = splitCSVLine(lines[0]).map(h => 
        h.replace(/^"|"$/g, '').trim().toLowerCase()
      );

      // Check if it is OULAD dataset (studentInfo.csv)
      const isOULAD = headers.includes("id_student") && headers.includes("final_result");
      const requiredPathify = ["nama", "struggleslogic", "strugglescoreoop", "strugglesadvancedoop", "strugglesdatastructures", "learningstyle"];
      
      if (!isOULAD) {
        const missing = requiredPathify.filter(req => !headers.includes(req));
        if (missing.length > 0) {
          setErrorMsg(`Format CSV tidak dikenal. Untuk templat Pathify, kurang kolom: ${missing.join(", ")}`);
          setSuccessMsg(null);
          return;
        }
      }

      const newStudents: ParsedStudent[] = [];
      
      // Limit parsing to 3000 rows to prevent any browser UI block, which is plenty for aggregate stats!
      const maxRows = Math.min(lines.length, 3001);

      for (let i = 1; i < maxRows; i++) {
        const cols = splitCSVLine(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length < headers.length) continue;

        const rowData: Record<string, string> = {};
        headers.forEach((header, idx) => {
          rowData[header] = cols[idx];
        });

        if (isOULAD) {
          // Map OULAD data to Pathify facts
          const studentId = rowData["id_student"];
          const name = `Mhs #${studentId}`;
          const finalResult = rowData["final_result"];
          const highestEducation = rowData["highest_education"];
          const credits = parseInt(rowData["studied_credits"]) || 60;
          const gender = rowData["gender"];
          const prevAttempts = parseInt(rowData["num_of_prev_attempts"]) || 0;
          const disability = rowData["disability"];

          // Heuristics mapping OULAD attributes to programming difficulty indicators
          const strugglesLogic = highestEducation.toLowerCase().includes("lower than") || highestEducation.toLowerCase().includes("no formal");
          const strugglesCoreOOP = prevAttempts > 0;
          const strugglesDataStructures = credits > 100;
          const strugglesAdvancedOOP = disability === "Y";

          // Deterministic learning style mapping based on studentId last digit
          const lastDigit = parseInt(studentId[studentId.length - 1]) || 0;
          const learningStyle = lastDigit % 3 === 0 
            ? "Visual" 
            : lastDigit % 3 === 1 
              ? "Auditory" 
              : "Kinesthetic";

          const facts: Facts = {
            strugglesLogic,
            strugglesCoreOOP,
            strugglesAdvancedOOP,
            strugglesDataStructures,
            learningStyle
          };

          // Override rule matching based on finalResult for alignment
          const diagnosisResult = runForwardChaining(facts);
          if (finalResult === "Fail" || finalResult === "Withdrawn") {
            diagnosisResult.diagnosis.risk = finalResult === "Withdrawn" ? "Critical" : "High";
          } else if (finalResult === "Distinction") {
            diagnosisResult.diagnosis.risk = "Low";
          }

          newStudents.push({
            name,
            facts,
            diagnosis: diagnosisResult.diagnosis,
            isOULAD: true,
            ouladInfo: {
              gender,
              highestEducation,
              finalResult,
              credits
            }
          });
        } else {
          // Standard Pathify CSV parsing
          const name = rowData["nama"] || `Mahasiswa #${i}`;
          const strugglesLogic = rowData["struggleslogic"].toLowerCase() === "true";
          const strugglesCoreOOP = rowData["strugglescoreoop"].toLowerCase() === "true";
          const strugglesAdvancedOOP = rowData["strugglesadvancedoop"].toLowerCase() === "true";
          const strugglesDataStructures = rowData["strugglesdatastructures"].toLowerCase() === "true";
          
          let learningStyle = rowData["learningstyle"] as "Visual" | "Auditory" | "Kinesthetic";
          if (!["Visual", "Auditory", "Kinesthetic"].includes(learningStyle)) {
            learningStyle = "Visual";
          }

          const facts: Facts = {
            strugglesLogic,
            strugglesCoreOOP,
            strugglesAdvancedOOP,
            strugglesDataStructures,
            learningStyle
          };

          const result = runForwardChaining(facts);

          newStudents.push({
            name,
            facts,
            diagnosis: result.diagnosis
          });
        }
      }

      if (newStudents.length === 0) {
        setErrorMsg("Tidak ada data valid yang berhasil diproses.");
        setSuccessMsg(null);
        setConvertedJson(null);
      } else {
        setStudents(newStudents);
        setDatasetType(isOULAD ? "oulad" : "pathify");
        setErrorMsg(null);
        setSuccessMsg(`Berhasil memproses ${newStudents.length} baris data student.`);
        setConvertedJson(JSON.stringify(newStudents, null, 2));

        // Sync with PostgreSQL
        fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: newStudents.slice(0, 1000) }), // Slice to 1000 to prevent payload limit issues
        })
          .then(res => {
            if (res.ok) {
              setSuccessMsg(`Berhasil memproses ${newStudents.length} data & disimpan ke Database.`);
            } else {
              console.warn("Gagal menyimpan ke database");
            }
          })
          .catch(err => {
            console.error("Gagal melakukan impor ke database:", err);
          });
      }
    } catch {
      setErrorMsg("Terjadi kesalahan teknis saat parsing berkas CSV.");
      setSuccessMsg(null);
      setConvertedJson(null);
    }
  };

  const parseJSONData = (text: string, filename: string) => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        setErrorMsg("Format JSON tidak valid. Data harus berupa array.");
        setSuccessMsg(null);
        setConvertedJson(null);
        return;
      }

      if (data.length === 0) {
        setErrorMsg("Berkas JSON kosong.");
        setSuccessMsg(null);
        setConvertedJson(null);
        return;
      }

      // Check if data is already in ParsedStudent format: [{ name: "...", facts: {...}, diagnosis: {...} }]
      const isParsedStudentFormat = data.every(item => 
        item && 
        typeof item === "object" && 
        "name" in item && 
        "facts" in item && 
        "diagnosis" in item
      );

      if (isParsedStudentFormat) {
        const formatted = data.map((item: ParsedStudent) => ({
          name: item.name,
          facts: item.facts,
          diagnosis: item.diagnosis,
          isOULAD: item.isOULAD,
          ouladInfo: item.ouladInfo
        }));

        setStudents(formatted);
        const hasOulad = formatted.some(f => f.isOULAD) || filename.toLowerCase().includes("studentinfo") || filename.toLowerCase().includes("oulad");
        setDatasetType(hasOulad ? "oulad" : "pathify");
        setErrorMsg(null);
        setSuccessMsg(`Berhasil memuat ${formatted.length} data mahasiswa dari berkas JSON.`);
        setConvertedJson(null);

        // Sync with PostgreSQL
        fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: formatted.slice(0, 1000) }),
        })
          .then(res => {
            if (res.ok) {
              setSuccessMsg(`Berhasil memproses ${formatted.length} data & disimpan ke Database.`);
            } else {
              console.warn("Gagal menyimpan ke database");
            }
          })
          .catch(err => {
            console.error("Gagal melakukan impor ke database:", err);
          });
        return;
      }

      // Otherwise, the JSON contains raw rows/objects. Let's process them exactly like CSV columns!
      const firstItem = data[0];
      const keys = Object.keys(firstItem).map(k => k.toLowerCase());
      const isOULAD = keys.includes("id_student") && keys.includes("final_result");
      const requiredPathify = ["nama", "struggleslogic", "strugglescoreoop", "strugglesadvancedoop", "strugglesdatastructures", "learningstyle"];

      if (!isOULAD) {
        const missing = requiredPathify.filter(req => !keys.includes(req));
        if (missing.length > 0) {
          setErrorMsg(`Format JSON tidak dikenal. Kolom/kunci yang dibutuhkan kurang: ${missing.join(", ")}`);
          setSuccessMsg(null);
          setConvertedJson(null);
          return;
        }
      }

      const newStudents: ParsedStudent[] = [];
      const maxRows = Math.min(data.length, 3000);

      for (let i = 0; i < maxRows; i++) {
        const row = data[i];
        const rowData: Record<string, string | number | boolean> = {};
        Object.entries(row as Record<string, string | number | boolean>).forEach(([k, v]) => {
          rowData[k.toLowerCase()] = v;
        });

        if (isOULAD) {
          const studentId = String(rowData["id_student"]);
          const name = `Mhs #${studentId}`;
          const finalResult = String(rowData["final_result"]);
          const highestEducation = String(rowData["highest_education"]);
          const credits = parseInt(String(rowData["studied_credits"])) || 60;
          const gender = String(rowData["gender"]);
          const prevAttempts = parseInt(String(rowData["num_of_prev_attempts"])) || 0;
          const disability = String(rowData["disability"]);

          const strugglesLogic = highestEducation.toLowerCase().includes("lower than") || highestEducation.toLowerCase().includes("no formal");
          const strugglesCoreOOP = prevAttempts > 0;
          const strugglesDataStructures = credits > 100;
          const strugglesAdvancedOOP = disability === "Y";

          const lastDigit = parseInt(studentId[studentId.length - 1]) || 0;
          const learningStyle = lastDigit % 3 === 0 
            ? "Visual" 
            : lastDigit % 3 === 1 
              ? "Auditory" 
              : "Kinesthetic";

          const facts: Facts = {
            strugglesLogic,
            strugglesCoreOOP,
            strugglesAdvancedOOP,
            strugglesDataStructures,
            learningStyle
          };

          const diagnosisResult = runForwardChaining(facts);
          if (finalResult === "Fail" || finalResult === "Withdrawn") {
            diagnosisResult.diagnosis.risk = finalResult === "Withdrawn" ? "Critical" : "High";
          } else if (finalResult === "Distinction") {
            diagnosisResult.diagnosis.risk = "Low";
          }

          newStudents.push({
            name,
            facts,
            diagnosis: diagnosisResult.diagnosis,
            isOULAD: true,
            ouladInfo: {
              gender,
              highestEducation,
              finalResult,
              credits
            }
          });
        } else {
          const name = String(rowData["nama"] || `Mahasiswa #${i + 1}`);
          const strugglesLogic = String(rowData["struggleslogic"]).toLowerCase() === "true" || rowData["struggleslogic"] === true;
          const strugglesCoreOOP = String(rowData["strugglescoreoop"]).toLowerCase() === "true" || rowData["strugglescoreoop"] === true;
          const strugglesAdvancedOOP = String(rowData["strugglesadvancedoop"]).toLowerCase() === "true" || rowData["strugglesadvancedoop"] === true;
          const strugglesDataStructures = String(rowData["strugglesdatastructures"]).toLowerCase() === "true" || rowData["strugglesdatastructures"] === true;
          
          let learningStyle = String(rowData["learningstyle"]) as "Visual" | "Auditory" | "Kinesthetic";
          if (!["Visual", "Auditory", "Kinesthetic"].includes(learningStyle)) {
            learningStyle = "Visual";
          }

          const facts: Facts = {
            strugglesLogic,
            strugglesCoreOOP,
            strugglesAdvancedOOP,
            strugglesDataStructures,
            learningStyle
          };

          const result = runForwardChaining(facts);

          newStudents.push({
            name,
            facts,
            diagnosis: result.diagnosis
          });
        }
      }

      if (newStudents.length === 0) {
        setErrorMsg("Tidak ada data valid yang berhasil diproses.");
        setSuccessMsg(null);
        setConvertedJson(null);
      } else {
        setStudents(newStudents);
        setDatasetType(isOULAD ? "oulad" : "pathify");
        setErrorMsg(null);
        setSuccessMsg(`Berhasil memproses ${newStudents.length} baris data student dari JSON.`);
        setConvertedJson(null);

        // Sync with database
        fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: newStudents.slice(0, 1000) }),
        })
          .then(res => {
            if (res.ok) {
              setSuccessMsg(`Berhasil memproses ${newStudents.length} data & disimpan ke Database.`);
            } else {
              console.warn("Gagal menyimpan ke database");
            }
          })
          .catch(err => {
            console.error("Gagal melakukan impor ke database:", err);
          });
      }
    } catch (e) {
      const error = e as Error;
      setErrorMsg(`Terjadi kesalahan parsing berkas JSON: ${error.message}`);
      setSuccessMsg(null);
      setConvertedJson(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith(".json")) {
        parseJSONData(text, file.name);
      } else {
        parseCSVData(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFilename(file.name);
      if (file.name.endsWith(".csv") || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (file.name.endsWith(".json")) {
            parseJSONData(text, file.name);
          } else {
            parseCSVData(text);
          }
        };
        reader.readAsText(file);
      } else {
        setErrorMsg("Sistem hanya menerima unggahan dokumen .csv atau .json");
        setSuccessMsg(null);
        setConvertedJson(null);
      }
    }
  };

  const downloadConvertedJson = () => {
    if (!convertedJson) return;
    const blob = new Blob([convertedJson], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const baseName = uploadedFilename.replace(/\.csv$/i, "") || "converted_dataset";
    link.setAttribute("href", url);
    link.setAttribute("download", `${baseName}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculation
  const totalCount = students.length;
  const countRisk = (risk: string) => students.filter(s => s.diagnosis.risk === risk).length;
  const riskStats = {
    Low: countRisk("Low"),
    Medium: countRisk("Medium"),
    High: countRisk("High"),
    Critical: countRisk("Critical")
  };

  const countStruggle = (field: keyof Omit<Facts, "learningStyle">) => 
    students.filter(s => s.facts[field]).length;

  const struggleStats = {
    Logic: countStruggle("strugglesLogic"),
    CoreOOP: countStruggle("strugglesCoreOOP"),
    AdvancedOOP: countStruggle("strugglesAdvancedOOP"),
    DataStructures: countStruggle("strugglesDataStructures")
  };

  const countStyle = (style: string) => students.filter(s => s.facts.learningStyle === style).length;
  const styleStats = {
    Visual: countStyle("Visual"),
    Auditory: countStyle("Auditory"),
    Kinesthetic: countStyle("Kinesthetic")
  };

  // Find most difficult topic
  const getMostDifficultTopic = () => {
    if (totalCount === 0) return "-";
    const entries = Object.entries(struggleStats);
    entries.sort((a, b) => b[1] - a[1]);
    const names: Record<string, string> = {
      Logic: "Logika Dasar",
      CoreOOP: "Konsep OOP",
      AdvancedOOP: "OOP Abstraksi",
      DataStructures: "Struktur Data"
    };
    return names[entries[0][0]] || "-";
  };

  // Find dominant learning style
  const getDominantStyle = () => {
    if (totalCount === 0) return "-";
    const entries = Object.entries(styleStats);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const handleSimulate = (student: ParsedStudent) => {
    localStorage.setItem("pathify_active_student_id", student.diagnosis.id || "local");
    localStorage.setItem("pathify_active_diagnosis", JSON.stringify(student.diagnosis));
    localStorage.setItem("pathify_active_facts", JSON.stringify(student.facts));
    router.push("/dashboard");
  };

  const getRiskBadgeColor = (risk: string) => {
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
            <Link href="/diagnose" className="hover:text-[#F86041] hover:underline">
              Mulai Diagnosis
            </Link>
            <Link href="/dashboard" className="hover:text-[#F86041] hover:underline">
              Dashboard Tracker
            </Link>
            <Link href="/analytics" className="text-[#F86041] hover:underline">
              Analisis Dataset
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Title */}
        <div className="border-b border-[#1E1E1E] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E]">
              Pusat Analisis Dataset
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Impor berkas CSV mahasiswa (seperti berkas OULAD <code className="font-mono text-zinc-800">studentInfo.csv</code> atau templat Pathify) untuk dianalisis.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="px-3.5 py-2 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-[10px] font-bold uppercase transition-colors"
            >
              Unduh Templat CSV
            </button>
            <button
              onClick={() => {
                const formatted = MOCK_STUDENTS.map(s => ({ name: s.name, facts: s.facts, diagnosis: s.diagnosis }));
                setStudents(formatted);
                setDatasetType("pathify");
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className="px-3.5 py-2 border border-[#1E1E1E] bg-[#F4F1EC] hover:bg-[#E5E2DD] text-[10px] font-bold uppercase transition-colors text-zinc-600"
            >
              Data Bawaan (Default)
            </button>
          </div>
        </div>

        {/* Drag & Drop */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-[#1E1E1E] p-8 flex flex-col items-center justify-center gap-4 transition-colors ${
            dragActive ? "bg-[#FEDFD9]/30" : "bg-[#FDFCFB] hover:bg-[#F4F1EC]/20"
          }`}
        >
          <input
            type="file"
            id="csv-uploader"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-10 h-10 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center text-[#F86041]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-[#1E1E1E]">Seret berkas CSV atau JSON ke area ini</p>
            <p className="text-[10px] text-zinc-500 mt-1">Mendukung berkas OULAD studentInfo.csv/json atau templat kesulitan belajar Pathify</p>
          </div>
          <label
            htmlFor="csv-uploader"
            className="px-4 py-2 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-[10px] font-bold uppercase cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#1E1E1E]"
          >
            Pilih Dokumen CSV / JSON
          </label>

          {successMsg && (
            <div className="mt-2 text-[10px] font-bold text-emerald-700 border border-emerald-500/20 bg-emerald-50 px-3 py-1.5">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mt-2 text-[10px] font-bold text-rose-700 border border-rose-500/20 bg-rose-50 px-3 py-1.5">
              {errorMsg}
            </div>
          )}

          {convertedJson && (
            <button
              onClick={downloadConvertedJson}
              className="mt-3 px-4 py-2.5 border border-[#1E1E1E] bg-[#FEDFD9] hover:bg-[#F86041] hover:text-[#FDFCFB] text-[#1E1E1E] text-[10px] font-extrabold uppercase transition-colors shadow-[2px_2px_0px_0px_#1E1E1E] flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Hasil Konversi JSON
            </button>
          )}
        </div>

        {totalCount > 0 ? (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-[#1E1E1E] p-5 bg-[#FDFCFB] flex flex-col gap-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Total Sampel</span>
                <span className="text-2xl font-extrabold">{totalCount} Mahasiswa</span>
              </div>
              <div className="border border-[#1E1E1E] p-5 bg-[#FDFCFB] flex flex-col gap-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Gaya Belajar Dominan</span>
                <span className="text-2xl font-extrabold text-[#F86041] capitalize">{getDominantStyle()}</span>
              </div>
              <div className="border border-[#1E1E1E] p-5 bg-[#FDFCFB] flex flex-col gap-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Sub-bab Bermasalah</span>
                <span className="text-2xl font-extrabold text-[#1E1E1E] capitalize">{getMostDifficultTopic()}</span>
              </div>
              <div className="border border-[#1E1E1E] p-5 bg-[#FDFCFB] flex flex-col gap-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Kategori Rawan (Tinggi/Kritis)</span>
                <span className="text-2xl font-extrabold text-rose-600">{riskStats.Critical + riskStats.High} Mhs</span>
              </div>
            </div>

            {/* Custom SVG Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Struggles */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-5">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                    {datasetType === "oulad" ? "Faktor Risiko Terdeteksi (OULAD)" : "Persentase Kesulitan per Sub-bab"}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Proporsi indikasi kendala yang terpetakan dari dataset.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { label: datasetType === "oulad" ? "Pendidikan di bawah A Level" : "Logika Dasar & Kontrol Alur", count: struggleStats.Logic },
                    { label: datasetType === "oulad" ? "Memiliki Riwayat Mengulang" : "Konsep Dasar OOP", count: struggleStats.CoreOOP },
                    { label: datasetType === "oulad" ? "Beban Kredit Tinggi (>100)" : "Struktur Data & Ref Objek", count: struggleStats.DataStructures },
                    { label: datasetType === "oulad" ? "Memiliki Keterbatasan Fisik" : "OOP Abstraksi Lanjut", count: struggleStats.AdvancedOOP },
                  ].map((item, idx) => {
                    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{item.label}</span>
                          <span className="text-zinc-500 font-mono">{item.count} Mhs ({percentage}%)</span>
                        </div>
                        {/* Minimal flat progress indicator */}
                        <div className="h-3.5 w-full bg-[#F4F1EC] border border-[#1E1E1E]">
                          <div
                            style={{ width: `${percentage}%` }}
                            className="h-full bg-[#F86041] border-r border-[#1E1E1E]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Risk Groups */}
              <div className="border border-[#1E1E1E] p-6 bg-[#FDFCFB] flex flex-col gap-5">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Klaster Kerawanan Akademik</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Pengelompokan profil risiko kelulusan ujian semester.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { label: "Risiko Rendah (Low)", count: riskStats.Low, fill: "bg-emerald-600" },
                    { label: "Waspada (Medium)", count: riskStats.Medium, fill: "bg-amber-500" },
                    { label: "Rawan (High)", count: riskStats.High, fill: "bg-orange-500" },
                    { label: "Kritis (Critical)", count: riskStats.Critical, fill: "bg-rose-600" },
                  ].map((item, idx) => {
                    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{item.label}</span>
                          <span className="text-zinc-500 font-mono">{item.count} Mhs ({percentage}%)</span>
                        </div>
                        <div className="h-3.5 w-full bg-[#F4F1EC] border border-[#1E1E1E]">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full ${item.fill} border-r border-[#1E1E1E]`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-[#1E1E1E] bg-[#FDFCFB]">
              <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase">Rincian Hasil Diagnosa Aggregat ({datasetType === "oulad" ? "OULAD Dataset" : "Pathify Dataset"})</h3>
                <span className="text-[9px] font-mono border border-[#1E1E1E] px-1.5 py-0.5 bg-[#FEDFD9] font-bold uppercase">{totalCount} Mahasiswa terproses</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1E1E1E] bg-[#F4F1EC]/60 text-zinc-500 font-bold uppercase">
                      <th className="p-3 pl-4">ID / Nama Mahasiswa</th>
                      <th className="p-3">Gaya Belajar</th>
                      <th className="p-3">Diagnosis Utama</th>
                      <th className="p-3">Status Risiko</th>
                      <th className="p-3 text-right pr-4">Aksi Pelacakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E1E]/20">
                    {students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F1EC]/20 transition-colors">
                        <td className="p-3 pl-4 font-bold text-[#1E1E1E]">{student.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 border border-[#1E1E1E] bg-[#FEDFD9] text-[9px] font-bold uppercase tracking-wider">
                            {student.facts.learningStyle}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-600 max-w-[240px] truncate">{student.diagnosis.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border ${getRiskBadgeColor(student.diagnosis.risk)}`}>
                            {student.diagnosis.risk}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => handleSimulate(student)}
                            className="px-3 py-1 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] hover:text-[#FDFCFB] text-[#FDFCFB] text-[8px] font-bold uppercase transition-colors"
                          >
                            Simulasikan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-[#1E1E1E] py-16 text-center bg-[#FDFCFB]">
            <p className="text-xs text-zinc-500">Berkas CSV belum dimuat. Silakan seret berkas CSV di atas.</p>
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
