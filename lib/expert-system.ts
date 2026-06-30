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
    name: "Deteksi Hambatan Literasi Konten (RULE 1)",
    premise: (wm) => !!(wm["g001"] && wm["g002"]),
    conclusion: "S001",
    explanation: "Jika mahasiswa jarang mengakses materi utama (G001) and kesulitan konsep teoritis mandiri (G002), maka disimpulkan mengalami Hambatan Literasi Konten (S001)."
  },
  {
    id: "RULE_2",
    name: "Deteksi Hambatan Evaluasi Praktis (RULE 2)",
    premise: (wm) => !!(wm["g003"] && wm["g004"]),
    conclusion: "S002",
    explanation: "Jika mahasiswa sering terlambat mengumpulkan tugas (G003) and nilai kuis rendah (G004), maka disimpulkan mengalami Hambatan Evaluasi Praktis (S002)."
  },
  {
    id: "RULE_3",
    name: "Evaluasi Paket Pendampingan Akademik Intensif (RULE 3)",
    premise: (wm) => !!(wm["S001"] && wm["S002"]),
    conclusion: "S003",
    explanation: "Jika mahasiswa terdiagnosa mengalami Hambatan Literasi Konten (S001) and Hambatan Evaluasi Praktis (S002), maka disimpulkan membutuhkan Paket Pendampingan Akademik Intensif (S003)."
  },
  {
    id: "RULE_4",
    name: "Deteksi Hambatan Manajemen & Konsistensi Belajar (RULE 4)",
    premise: (wm) => !!(wm["g007"] && wm["g008"]),
    conclusion: "S004",
    explanation: "Jika mahasiswa memiliki log masuk VLE sangat rendah (G007) and cenderung belajar SKS (G008), maka disimpulkan mengalami Hambatan Manajemen & Konsistensi Belajar (S004)."
  },
  {
    id: "RULE_5",
    name: "Deteksi Hambatan Partisipasi Kolaboratif (RULE 5)",
    premise: (wm) => !!(wm["g005"] && wm["g006"]),
    conclusion: "S005",
    explanation: "Jika mahasiswa tidak aktif kontribusi forum (G005) and jarang membaca postingan rekan (G006), maka disimpulkan mengalami Hambatan Partisipasi Kolaboratif (S005)."
  },
  {
    id: "RULE_6",
    name: "Evaluasi Risiko Perkembangan Akademik Sangat Tinggi (RULE 6)",
    premise: (wm) => !!(wm["S003"] && wm["S004"]),
    conclusion: "S006",
    explanation: "Jika mahasiswa membutuhkan Paket Pendampingan Akademik Intensif (S003) and mengalami Hambatan Konsistensi Belajar (S004), maka disimpulkan memiliki Risiko Perkembangan Akademik Sangat Tinggi (S006)."
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
    title: "Hambatan Literasi Konten",
    risk: "Medium",
    explanation: "Mahasiswa terdeteksi mengalami kesulitan memahami materi bacaan utama secara mandiri (RULE 1 dipicu). Direkomendasikan penguatan pemahaman teori dasar secara terpandu.",
    tasks: {
      Visual: [
        "Buat peta konsep/mindmap ringkasan dari materi slide kuliah",
        "Warnai poin-poin penting pada modul membaca menggunakan highlighter",
        "Buat tabel intisari bab materi ajar"
      ],
      Auditory: [
        "Jelaskan ringkasan materi kuliah ke rekan belajar (Rubber Ducking)",
        "Dengarkan rekaman kuliah online untuk memperjelas konsep teoretis",
        "Ikuti sesi tanya jawab interaktif bersama asisten dosen"
      ],
      Kinesthetic: [
        "Tulis ulang rangkuman materi dengan bahasa sendiri dalam bentuk flashcard",
        "Praktikkan langsung konsep yang dibaca pada lingkungan kerja (lab/editor)",
        "Kerjakan latihan soal teori mandiri secara berkala"
      ],
      "": [
        "Buat peta konsep/mindmap ringkasan dari materi slide kuliah",
        "Tulis ulang rangkuman materi dengan bahasa sendiri dalam bentuk flashcard"
      ]
    }
  },
  S002: {
    title: "Hambatan Evaluasi Praktis",
    risk: "Medium",
    explanation: "Mahasiswa terdeteksi mengalami kendala dalam menyelesaikan penugasan praktis dan kuis berkala (RULE 2 dipicu).",
    tasks: {
      Visual: [
        "Petakan instruksi tugas menggunakan diagram alur (flowchart) sebelum mulai pengerjaan",
        "Buat diagram pencapaian skor tugas mingguan sebagai motivasi visual",
        "Pelajari contoh penyelesaian tugas (worked examples) yang disajikan dalam visual"
      ],
      Auditory: [
        "Diskusikan instruksi pengerjaan tugas bersama kelompok belajar",
        "Dengarkan ulasan kesalahan tugas dari asisten praktikum",
        "Tanyakan bagian tugas yang tidak dimengerti secara verbal saat sesi tanya jawab"
      ],
      Kinesthetic: [
        "Kerjakan tugas-tugas latihan mandiri di luar kelas",
        "Lakukan refactoring/modifikasi pada tugas lama yang mendapat skor kurang maksimal",
        "Ikuti latihan simulasi kuis berwaktu secara berkala"
      ],
      "": [
        "Petakan instruksi tugas menggunakan diagram alur (flowchart) sebelum mulai pengerjaan",
        "Kerjakan tugas-tugas latihan mandiri di luar kelas"
      ]
    }
  },
  S003: {
    title: "Hambatan Penguasaan Akademik Utama",
    risk: "High",
    explanation: "Mahasiswa terdeteksi mengalami kendala pemahaman materi dan penugasan sekaligus (RULE 3 dipicu). Diperlukan pendampingan akademik terstruktur.",
    tasks: {
      Visual: [
        "Buat bagan relasi antara materi kuliah dengan penugasan praktis terkait",
        "Susun jadwal belajar visual harian di meja belajar",
        "Rancang infografis ringkasan seluruh bab materi untuk UTS/UAS"
      ],
      Auditory: [
        "Konsultasi tatap muka langsung dengan dosen pengampu mengenai perkembangan belajar",
        "Ikuti forum diskusi interaktif intensif membahas materi dan tugas sulit",
        "Bahas tuntas penyelesaian latihan soal bersama kelompok belajar khusus"
      ],
      Kinesthetic: [
        "Bangun mini-proyek mandiri untuk menggabungkan pemahaman teori dan praktik",
        "Lakukan simulasi ujian mandiri dengan batasan waktu",
        "Selesaikan latihan soal komprehensif dari bab awal hingga akhir"
      ],
      "": [
        "Buat bagan relasi antara materi kuliah dengan penugasan praktis terkait",
        "Bangun mini-proyek mandiri untuk menggabungkan pemahaman teori dan praktik"
      ]
    }
  },
  S004: {
    title: "Hambatan Manajemen Waktu & Konsistensi Belajar",
    risk: "High",
    explanation: "Mahasiswa terdeteksi mengalami kendala manajemen waktu, dicirikan oleh rendahnya akses platform belajar VLE dan kecenderungan belajar SKS (RULE 4 dipicu).",
    tasks: {
      Visual: [
        "Gunakan kalender visual untuk menandai tenggat waktu tugas dan jadwal belajar harian",
        "Buat grafik log belajar mingguan untuk memantau konsistensi akses",
        "Pasang pengingat visual (sticky notes) di laptop mengenai target harian"
      ],
      Auditory: [
        "Dengarkan alarm/pengingat waktu otomatis untuk memulai sesi belajar",
        "Minta teman atau asisten menjadi partner akuntabilitas belajar (peer study partner)",
        "Diskusikan kendala manajemen waktu bersama konselor atau mentor akademik"
      ],
      Kinesthetic: [
        "Terapkan teknik Pomodoro (25 menit belajar aktif, 5 menit istirahat)",
        "Bagi pengerjaan tugas besar menjadi sub-tugas kecil yang dikerjakan setiap hari",
        "Unduh aplikasi pelacak waktu (time tracker) dan catat durasi belajar secara berkala"
      ],
      "": [
        "Gunakan kalender visual untuk menandai tenggat waktu tugas",
        "Terapkan teknik Pomodoro (25 menit belajar aktif, 5 menit istirahat)"
      ]
    }
  },
  S005: {
    title: "Hambatan Partisipasi Kolaboratif",
    risk: "Medium",
    explanation: "Mahasiswa kurang aktif berkontribusi di forum diskusi kelas dan kurang membalas postingan rekan (RULE 5 dipicu).",
    tasks: {
      Visual: [
        "Buat sketsa diagram alur diskusi forum sebelum menulis postingan",
        "Tandai postingan diskusi rekan yang menarik menggunakan fitur penanda buku (bookmark)",
        "Petakan kontribusi diskusi kelas dalam peta pikiran sosial"
      ],
      Auditory: [
        "Ikuti sesi diskusi verbal/diskusi kelompok kecil di luar kelas",
        "Dengarkan pendapat rekan lain di kelas dan catat intisarinya",
        "Gunakan voice note untuk menyusun gagasan sebelum memposting di forum"
      ],
      Kinesthetic: [
        "Tulis minimal 1 postingan pertanyaan atau jawaban di forum diskusi kelas setiap minggu",
        "Balas minimal 2 tanggapan rekan kelas di forum dengan argumen konstruktif",
        "Selesaikan tugas kolaboratif kelompok secara aktif"
      ],
      "": [
        "Buat sketsa diagram alur diskusi forum sebelum menulis postingan",
        "Tulis minimal 1 postingan pertanyaan atau jawaban di forum diskusi kelas setiap minggu"
      ]
    }
  },
  S006: {
    title: "Risiko Perkembangan Akademik Sangat Tinggi",
    risk: "Critical",
    explanation: "Mahasiswa memiliki kelemahan bertumpuk pada pemahaman materi, penugasan praktis, dan manajemen waktu belajar (RULE 6 dipicu). Diperlukan rencana intervensi komprehensif segera.",
    tasks: {
      Visual: [
        "Buat peta jalan (roadmap) visual pemulihan progres belajar komprehensif",
        "Susun checklist visual harian tugas-tugas remedi yang tersisa",
        "Gambar infografis alur integrasi konsep teoretis, praktis, dan log belajar"
      ],
      Auditory: [
        "Wajib mengikuti bimbingan akademik mingguan terstruktur dengan dosen wali",
        "Diskusikan progres rencana aksi remedi secara teratur dengan mentor",
        "Ikuti kelas pendampingan lisan tambahan (tutorial session) setiap minggu"
      ],
      Kinesthetic: [
        "Selesaikan program bootcamp belajar terpandu (guided learning paths) dasar",
        "Lengkapi seluruh portofolio rencana remedi visual dari minggu ke minggu",
        "Selesaikan seluruh modul mini-proyek intervensi gabungan mandiri"
      ],
      "": [
        "Wajib mengikuti bimbingan akademik mingguan terstruktur dengan dosen wali",
        "Selesaikan seluruh modul mini-proyek intervensi gabungan mandiri"
      ]
    }
  },
  DEFAULT: {
    title: "Aman & Siap Perkembangan Lanjut",
    risk: "Low",
    explanation: "Mahasiswa menunjukkan tingkat partisipasi dan pemahaman mandiri yang sangat baik. Disarankan pengayaan materi lanjut.",
    tasks: {
      Visual: [
        "Pelajari bagan arsitektur sistem berskala besar atau desain pola lanjutan",
        "Buat resume visual materi pengayaan mandiri"
      ],
      Auditory: [
        "Jelaskan topik materi kuliah lanjutan kepada rekan kelas yang mengalami kesulitan",
        "Ikuti seminar/webinar teknologi luar untuk memperluas wawasan akademik"
      ],
      Kinesthetic: [
        "Tulis artikel atau tutorial di media sosial / blog pribadi mengenai topik mata kuliah",
        "Rancang proyek mandiri berskala menengah untuk melatih skill tingkat lanjut"
      ],
      "": [
        "Tulis artikel atau tutorial di media sosial / blog pribadi mengenai topik mata kuliah",
        "Rancang proyek mandiri berskala menengah untuk melatih skill tingkat lanjut"
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
