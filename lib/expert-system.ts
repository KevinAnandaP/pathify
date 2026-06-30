export interface Facts {
  strugglesLogic: boolean;
  strugglesCoreOOP: boolean;
  strugglesAdvancedOOP: boolean;
  strugglesDataStructures: boolean;
  learningStyle: "Visual" | "Auditory" | "Kinesthetic" | "";
}

export interface DetailedFacts {
  g001: boolean;
  g002: boolean;
  g003: boolean;
  g004: boolean;
  g005: boolean;
  g006: boolean;
  g007: boolean;
  g008: boolean;
  learningStyle: "Visual" | "Auditory" | "Kinesthetic" | "";
}

export interface Diagnosis {
  id: string;
  title: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  remediationTasks: { id: string; title: string; completed: boolean; source: string }[];
}

export interface InferenceStep {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  factsChecked: string[];
  result?: string;
}

export interface InferenceResult {
  diagnosis: Diagnosis;
  firedRules: string[];
  trace: InferenceStep[];
}

interface Rule {
  id: string;
  name: string;
  premise: (wm: Record<string, boolean>) => boolean;
  conclusion: string; // e.g. "S001"
  explanation: string;
}

const RULES: Rule[] = [
  {
    id: "RULE_1",
    name: "Deteksi Hambatan Kelas Abstrak (RULE 1)",
    premise: (wm) => !!(wm["g001"] && wm["g002"]),
    conclusion: "S001",
    explanation: "Jika mahasiswa bingung memilih Inheritance vs Kelas Abstrak (G001) dan gagal mengimplementasikan metode abstract (G002), maka didiagnosa kesulitan Abstract Class (S001)."
  },
  {
    id: "RULE_2",
    name: "Deteksi Hambatan Interface (RULE 2)",
    premise: (wm) => !!(wm["g003"] && wm["g004"]),
    conclusion: "S002",
    explanation: "Jika mahasiswa kesulitan memahami Multiple Inheritance semu (G003) dan bingung extends vs implements (G004), maka didiagnosa kesulitan Interface (S002)."
  },
  {
    id: "RULE_3",
    name: "Evaluasi Paket Remediasi OOP Lanjut (RULE 3)",
    premise: (wm) => !!(wm["S001"] && wm["S002"]),
    conclusion: "S003",
    explanation: "Jika mahasiswa terdiagnosa mengalami kesulitan Abstract Class (S001) dan Interface (S002), maka disimpulkan membutuhkan Paket Remediasi OOP Lanjut (S003)."
  },
  {
    id: "RULE_4",
    name: "Deteksi Hambatan Basis Data / DBMS (RULE 4)",
    premise: (wm) => !!(wm["g007"] && wm["g008"]),
    conclusion: "S004",
    explanation: "Jika mahasiswa kesulitan merancang ERD (G007) dan bingung menerapkan aturan normalisasi (G008), maka didiagnosa kesulitan Basis Data / DBMS (S004)."
  },
  {
    id: "RULE_5",
    name: "Deteksi Kelemahan Logika & Struktur Data (RULE 5)",
    premise: (wm) => !!(wm["g005"] && wm["g006"]),
    conclusion: "S005",
    explanation: "Jika mahasiswa bingung alur logika dasar (G005) dan kesulitan referensi alamat memori/ArrayList (G006), maka didiagnosa kelemahan Logika & Struktur Data (S005)."
  },
  {
    id: "RULE_6",
    name: "Evaluasi Risiko Akademik Komprehensif (RULE 6)",
    premise: (wm) => !!(wm["S003"] && wm["S004"]),
    conclusion: "S006",
    explanation: "Jika mahasiswa membutuhkan Paket Remediasi OOP Lanjut (S003) dan kesulitan DBMS (S004), maka disimpulkan berisiko tinggi dan memerlukan Rencana Remediasi Komprehensif (S006)."
  }
];

interface DiagnosticOutcome {
  title: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  tasks: Record<string, string[]>;
}

const OUTCOMES: Record<string, DiagnosticOutcome> = {
  S001: {
    title: "Kesulitan Kelas Abstrak (Abstract Class)",
    risk: "Medium",
    explanation: "Mahasiswa terdeteksi mengalami kesulitan konseptual dalam memahami Abstract Class (RULE 1 dipicu). Direkomendasikan pengenalan kembali hirarki pewarisan.",
    tasks: {
      Visual: [
        "Gambar diagram hirarki kelas abstrak dan kelas anak",
        "Tonton video visualisasi runtime static vs dynamic binding",
        "Buat tabel komparasi method abstract vs concrete"
      ],
      Auditory: [
        "Jelaskan konsep inheritance abstract class ke rekan belajar (Rubber Ducking)",
        "Dengarkan rekaman kuliah PBO tentang perbedaan abstract class",
        "Ikuti diskusi praktikum kelompok mengenai overriding"
      ],
      Kinesthetic: [
        "Implementasikan Class Diagram geometris dengan Abstract Class di IDE",
        "Tulis ulang kode perulangan yang mewarisi class abstract",
        "Buat simulasi kode CLI overriding abstract method"
      ],
      "": [
        "Gambar diagram hirarki kelas abstrak dan kelas anak",
        "Implementasikan Class Diagram geometris dengan Abstract Class di IDE"
      ]
    }
  },
  S002: {
    title: "Kesulitan Antarmuka (Interface)",
    risk: "Medium",
    explanation: "Mahasiswa terdeteksi mengalami kendala membedakan extends dan implements serta polimorfisme interface (RULE 2 dipicu).",
    tasks: {
      Visual: [
        "Gambarkan class diagram relasi implements interface",
        "Buat infografis extends vs implements",
        "Petakan hirarki polimorfisme interface menggunakan bagan"
      ],
      Auditory: [
        "Diskusikan konsep 'kontrak interface' dengan asisten",
        "Dengarkan podcast edukasi tentang modularitas interface",
        "Presentasikan rancangan modular polymorphism di depan kelompok"
      ],
      Kinesthetic: [
        "Buat kode interface Comparable untuk sorting objek",
        "Refactoring coupled code menjadi decoupled menggunakan interface",
        "Tulis interface event handler sederhana di proyek CLI"
      ],
      "": [
        "Gambarkan class diagram relasi implements interface",
        "Refactoring coupled code menjadi decoupled menggunakan interface"
      ]
    }
  },
  S003: {
    title: "Kesulitan Komprehensif OOP Lanjut",
    risk: "High",
    explanation: "Mahasiswa terdeteksi mengalami kendala pada Abstract Class dan Interface secara bersamaan (RULE 3 dipicu). Diperlukan penguatan arsitektur OOP terstruktur.",
    tasks: {
      Visual: [
        "Rancang UML Class Diagram lengkap dengan Abstract Class dan Interface",
        "Simulasikan diagram objek memori polymorphism",
        "Warnai relasi extends (solid) vs implements (dashed) di rancangan"
      ],
      Auditory: [
        "Bahas tuntas arsitektur PBO modular dengan dosen wali",
        "Jelaskan rancangan OOP lanjut Anda di depan kelas",
        "Ikuti kelompok belajar khusus PBO lanjutan"
      ],
      Kinesthetic: [
        "Bangun mini proyek CLI (e.g. library system) menggunakan Abstract Class dan Interface",
        "Lakukan latihan refactoring total kode coupled",
        "Buat unit test sederhana untuk memverifikasi behavior interface"
      ],
      "": [
        "Rancang UML Class Diagram lengkap dengan Abstract Class dan Interface",
        "Bangun mini proyek CLI menggunakan Abstract Class dan Interface"
      ]
    }
  },
  S004: {
    title: "Kesulitan DBMS & Normalisasi",
    risk: "High",
    explanation: "Mahasiswa terdeteksi mengalami kendala merancang ERD dan membagi entitas/tabel sesuai kaidah normalisasi database (RULE 4 dipicu).",
    tasks: {
      Visual: [
        "Gambar ERD lengkap dengan relasi kardinalitas (1:N, N:M)",
        "Buat tabel skema relasi dari ERD",
        "Buat peta diagram transisi 1NF ke 3NF"
      ],
      Auditory: [
        "Bahas kasus normalisasi tabel anomali bersama teman kelompok",
        "Diskusikan perbedaan primary key vs foreign key dengan asisten",
        "Presentasikan rancangan skema database di depan kelas"
      ],
      Kinesthetic: [
        "Normalisasikan tabel transaksi real-world menjadi 3NF",
        "Tulis script SQL DDL lengkap dengan foreign key constraints",
        "Uji anomali INSERT/UPDATE di database lokal"
      ],
      "": [
        "Gambar ERD lengkap dengan relasi kardinalitas (1:N, N:M)",
        "Normalisasikan tabel transaksi real-world menjadi 3NF"
      ]
    }
  },
  S005: {
    title: "Kesulitan Logika & Struktur Data",
    risk: "Medium",
    explanation: "Mahasiswa terdeteksi memiliki kendala dalam alur logika bercabang serta pengaksesan ArrayList referensi pointer alamat memori (RULE 5 dipicu).",
    tasks: {
      Visual: [
        "Gambarkan flowchart perulangan bersarang (nested loops)",
        "Tonton eksekusi visual memori ArrayList di PythonTutor",
        "Buat diagram blok referensi alamat memori pointer"
      ],
      Auditory: [
        "Rubber duck: terangkan alur looping bersarang ke bebek mainan",
        "Diskusikan kompleksitas memori ArrayList bersama kelompok",
        "Dengarkan rekaman rekursi dasar"
      ],
      Kinesthetic: [
        "Tulis 5 program rekursi dan nested loops dasar di LeetCode",
        "Buat program CRUD sederhana memakai ArrayList of Objects",
        "Debug program baris-per-baris menggunakan VS Code Debugger"
      ],
      "": [
        "Gambarkan flowchart perulangan bersarang (nested loops)",
        "Debug program baris-per-baris menggunakan VS Code Debugger"
      ]
    }
  },
  S006: {
    title: "Risiko Akademik Sangat Kritis",
    risk: "Critical",
    explanation: "Mahasiswa memiliki kelemahan bertumpuk pada OOP, basis data, dan logika pemrograman (RULE 6 dipicu). Diperlukan bimbingan akademik intensif segera.",
    tasks: {
      Visual: [
        "Buat diagram alur integrasi sistem PBO dan DBMS",
        "Gambar peta koneksi relasional database ke model objek",
        "Buat resume visual seluruh modul praktikum"
      ],
      Auditory: [
        "Wajib bimbingan akademik mingguan dengan dosen wali",
        "Konsultasi intensif dengan asisten praktikum",
        "Diskusi studi kasus integrasi OOP-DBMS"
      ],
      Kinesthetic: [
        "Ikuti kelas remedial terpandu / bootcamp intensif dasar coding",
        "Selesaikan lembar kerja portofolio pemrograman mandiri",
        "Selesaikan proyek mini CRUD database PBO dari nol"
      ],
      "": [
        "Wajib bimbingan akademik mingguan dengan dosen wali",
        "Selesaikan proyek mini CRUD database PBO dari nol"
      ]
    }
  },
  DEFAULT: {
    title: "Aman & Siap Ujian (Pencegahan Preventif)",
    risk: "Low",
    explanation: "Mahasiswa tidak menunjukkan kendala belajar yang signifikan. Disarankan melakukan latihan tantangan lanjut untuk memantapkan pemahaman.",
    tasks: {
      Visual: [
        "Pelajari Class Diagram pola desain (Design Patterns) populer",
        "Gambarkan skema optimasi indeks tabel basis data"
      ],
      Auditory: [
        "Jelaskan materi polimorfisme kepada teman kelas yang kesulitan",
        "Ikuti seminar teknologi tentang clean code dan arsitektur microservices"
      ],
      Kinesthetic: [
        "Tulis tutorial pemrograman OOP di Medium atau blog pribadi",
        "Implementasikan pola desain Singleton/Factory di proyek sederhana"
      ],
      "": [
        "Tulis tutorial pemrograman OOP di Medium atau blog pribadi",
        "Implementasikan pola desain Singleton/Factory di proyek sederhana"
      ]
    }
  }
};

// Forward Chaining Inference Engine supporting PBO and DBMS symptoms
export function runForwardChaining(facts: Facts | DetailedFacts): InferenceResult {
  // If it's a generic Facts object, map it to a DetailedFacts object for backward compatibility
  const detailed: DetailedFacts = {
    g001: "g001" in facts ? (facts as DetailedFacts).g001 : (facts as Facts).strugglesAdvancedOOP,
    g002: "g002" in facts ? (facts as DetailedFacts).g002 : (facts as Facts).strugglesAdvancedOOP,
    g003: "g003" in facts ? (facts as DetailedFacts).g003 : (facts as Facts).strugglesCoreOOP,
    g004: "g004" in facts ? (facts as DetailedFacts).g004 : (facts as Facts).strugglesCoreOOP,
    g005: "g005" in facts ? (facts as DetailedFacts).g005 : (facts as Facts).strugglesLogic,
    g006: "g006" in facts ? (facts as DetailedFacts).g006 : (facts as Facts).strugglesDataStructures,
    g007: "g007" in facts ? (facts as DetailedFacts).g007 : (facts as Facts).strugglesLogic,
    g008: "g008" in facts ? (facts as DetailedFacts).g008 : (facts as Facts).strugglesDataStructures,
    learningStyle: facts.learningStyle
  };

  // Working memory starts with the symptoms
  const wm: Record<string, boolean> = {
    g001: detailed.g001,
    g002: detailed.g002,
    g003: detailed.g003,
    g004: detailed.g004,
    g005: detailed.g005,
    g006: detailed.g006,
    g007: detailed.g007,
    g008: detailed.g008,
  };

  const firedRules: string[] = [];
  const trace: InferenceStep[] = [];
  
  let changed = true;
  let iterations = 0;
  const maxIterations = 10;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const rule of RULES) {
      if (firedRules.includes(rule.id)) continue;

      const triggered = rule.premise(wm);
      if (triggered) {
        wm[rule.conclusion] = true;
        firedRules.push(rule.id);
        
        // Document trace
        const factsChecked = Object.keys(wm).filter(k => k.startsWith("g") || k.startsWith("S"));
        trace.push({
          ruleId: rule.id,
          ruleName: rule.name,
          triggered: true,
          factsChecked,
          result: rule.explanation
        });
        
        changed = true;
      }
    }
  }

  // If no rules fired, let's still add trace steps for rules that checked but failed
  if (firedRules.length === 0) {
    for (const rule of RULES) {
      trace.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        factsChecked: Object.keys(wm).filter(k => k.startsWith("g"))
      });
    }
  }

  // Find the highest concluded fact
  let finalConclusionId = "DEFAULT";
  if (wm["S006"]) finalConclusionId = "S006";
  else if (wm["S003"]) finalConclusionId = "S003";
  else if (wm["S004"]) finalConclusionId = "S004";
  else if (wm["S005"]) finalConclusionId = "S005";
  else if (wm["S001"]) finalConclusionId = "S001";
  else if (wm["S002"]) finalConclusionId = "S002";

  const outcome = OUTCOMES[finalConclusionId] || OUTCOMES["DEFAULT"];
  const style = detailed.learningStyle || "";
  const selectedTasks = outcome.tasks[style] || outcome.tasks[""];

  const formattedTasks = selectedTasks.map((taskStr, index) => ({
    id: `task-${index}`,
    title: taskStr,
    completed: false,
    source: finalConclusionId
  }));

  const diagnosis: Diagnosis = {
    id: finalConclusionId,
    title: outcome.title,
    risk: outcome.risk,
    explanation: outcome.explanation,
    remediationTasks: formattedTasks
  };

  return {
    diagnosis,
    firedRules,
    trace
  };
}
