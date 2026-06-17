export interface Facts {
  strugglesLogic: boolean;
  strugglesCoreOOP: boolean;
  strugglesAdvancedOOP: boolean;
  strugglesDataStructures: boolean;
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

export const KNOWLEDGE_BASE_RULES = [
  {
    id: "R001",
    name: "Fundamental Logic & Kinesthetic Learning",
    premise: (facts: Facts) => facts.strugglesLogic && facts.learningStyle === "Kinesthetic",
    conclusion: {
      title: "Algorithmic Logic Gap (Hands-on Focus)",
      risk: "Medium",
      explanation: "Mahasiswa mengalami kesulitan pada logika dasar (perulangan/kondisi) dan membutuhkan latihan praktis langsung (coding) untuk memperkuat pemahaman operasional komputer.",
      tasks: [
        "Selesaikan 5 tantangan perulangan dasar di HackerRank/LeetCode",
        "Tulis ulang kode perulangan bersarang menggunakan visualizer debugging IDE",
        "Buat proyek CLI kecil menggunakan switch-case dan conditional branching"
      ]
    }
  },
  {
    id: "R002",
    name: "Fundamental Logic & Visual Learning",
    premise: (facts: Facts) => facts.strugglesLogic && facts.learningStyle === "Visual",
    conclusion: {
      title: "Algorithmic Logic Gap (Visual Mapping Focus)",
      risk: "Medium",
      explanation: "Mahasiswa kesulitan pada alur logika program dan lebih mudah memahami melalui representasi visual seperti diagram alir (flowcharts) atau trace tabel.",
      tasks: [
        "Gambarkan Flowchart lengkap untuk alur perulangan bersarang (nested loops)",
        "Tonton video visualisasi eksekusi program di PythonTutor atau VS Code debugger",
        "Buat infografis mandiri membedakan 'while' vs 'do-while' loop"
      ]
    }
  },
  {
    id: "R003",
    name: "Fundamental Logic & Auditory Learning",
    premise: (facts: Facts) => facts.strugglesLogic && facts.learningStyle === "Auditory",
    conclusion: {
      title: "Algorithmic Logic Gap (Verbal & Explanation Focus)",
      risk: "Medium",
      explanation: "Mahasiswa kesulitan pada konsep logika dan lebih terbantu dengan mendengarkan penjelasan verbal atau mendiskusikan alur program secara interaktif.",
      tasks: [
        "Jelaskan alur sebuah fungsi perulangan kepada rekan belajar (Rubber Duck Debugging)",
        "Dengarkan penjelasan video kuliah tentang perbedaan pencabangan logis",
        "Ikuti sesi asistensi/tutor langsung untuk berdiskusi tentang studi kasus kontrol alur"
      ]
    }
  },
  {
    id: "R004",
    name: "Advanced OOP Concepts & Kinesthetic Learning",
    premise: (facts: Facts) => facts.strugglesAdvancedOOP && facts.learningStyle === "Kinesthetic",
    conclusion: {
      title: "Abstraction & Interface Conception Gap (Hands-on OOP)",
      risk: "High",
      explanation: "Mahasiswa kesulitan membedakan Abstract Class vs Interface. Pendekatan terbaik adalah mengimplementasikan arsitektur ini langsung pada kode pemrograman nyata.",
      tasks: [
        "Implementasikan Class Diagram kalkulator bentuk geometri dengan Abstract Class",
        "Buat kode Interface 'Comparable' dan gunakan untuk mengurutkan List Objek",
        "Refactoring kode yang erat kaitannya (coupled code) menjadi longgar (decoupled) menggunakan interface"
      ]
    }
  },
  {
    id: "R005",
    name: "Advanced OOP Concepts & Visual Learning",
    premise: (facts: Facts) => facts.strugglesAdvancedOOP && facts.learningStyle === "Visual",
    conclusion: {
      title: "Abstraction & Interface Conception Gap (Visual UML)",
      risk: "High",
      explanation: "Mahasiswa kebingungan membedakan relasi pewarisan (extends) dengan realisasi (implements) secara teoritis. Butuh visualisasi bagan kelas (Class Diagram) yang jelas.",
      tasks: [
        "Gambar Class Diagram lengkap dengan notasi pewarisan dan realisasi interface",
        "Gunakan alat pembuat diagram (Mermaid/Lucidchart) untuk memetakan hirarki polimorfisme",
        "Warnai perbedaan atribut dan metode abstract pada diagram rancangan sistem"
      ]
    }
  },
  {
    id: "R006",
    name: "Advanced OOP Concepts & Auditory Learning",
    premise: (facts: Facts) => facts.strugglesAdvancedOOP && facts.learningStyle === "Auditory",
    conclusion: {
      title: "Abstraction & Interface Conception Gap (Conceptual Debate)",
      risk: "High",
      explanation: "Mahasiswa kesulitan memahami konsep polimorfisme lanjut dan butuh diskusi konseptual serta analogi lisan untuk memahami esensi modularitas.",
      tasks: [
        "Dengarkan rekaman podcast/kuliah mengenai 'Kapan menggunakan Abstract Class vs Interface'",
        "Diskusikan analogi kontrak kerja (Interface) dalam kehidupan sehari-hari bersama asisten praktikum",
        "Presentasikan rancangan sistem berorientasi objek yang dibuat di depan kelompok"
      ]
    }
  },
  {
    id: "R007",
    name: "Core OOP & Data Structures Accumulation",
    premise: (facts: Facts) => (facts.strugglesCoreOOP || facts.strugglesDataStructures) && (facts.strugglesLogic || facts.strugglesAdvancedOOP),
    conclusion: {
      title: "Compounded Academic Risk (Multi-layer Concept Gap)",
      risk: "High",
      explanation: "Mahasiswa memiliki kelemahan bertumpuk pada pemodelan objek dasar/struktur data dan dikombinasikan dengan masalah logika/abstraksi. Membutuhkan intervensi segera.",
      tasks: [
        "Selesaikan modul remedi komprehensif tentang Encapsulation dan Array of Objects",
        "Jadwalkan konsultasi tatap muka dengan dosen pengampu mengenai akumulasi kelemahan sub-bab",
        "Lakukan latihan refactoring sederhana memisahkan logika database dan model data"
      ]
    }
  },
  {
    id: "R008",
    name: "Critical All-Round Difficulty",
    premise: (facts: Facts) => facts.strugglesLogic && facts.strugglesCoreOOP && facts.strugglesAdvancedOOP && facts.strugglesDataStructures,
    conclusion: {
      title: "Critical Academic Warning (Fundamental Reset Required)",
      risk: "Critical",
      explanation: "Mahasiswa mengalami kesulitan hampir pada seluruh sub-bab pemrograman dasar dan lanjut. Dibutuhkan bimbingan khusus terstruktur dari awal agar tidak gagal dalam ujian.",
      tasks: [
        "Ikuti kelas remedial terpandu / bootcamp intensif dasar-dasar pemrograman",
        "Wajib bimbingan akademik mingguan dengan dosen wali",
        "Selesaikan lembar kerja portofolio pemrograman mandiri tahap demi tahap"
      ]
    }
  },
  {
    id: "R009",
    name: "Default Safe Learning Progress",
    premise: (facts: Facts) => !facts.strugglesLogic && !facts.strugglesCoreOOP && !facts.strugglesAdvancedOOP && !facts.strugglesDataStructures,
    conclusion: {
      title: "Aman & Siap Ujian (Pencegahan Preventif)",
      risk: "Low",
      explanation: "Mahasiswa tidak memiliki kendala akademik yang berarti. Sistem hanya menyarankan tugas tantangan lanjut untuk mempertahankan pemahaman.",
      tasks: [
        "Tulis artikel teknis pendek/tutorial untuk mengajar teman sekelas",
        "Selesaikan proyek mandiri dengan skala menengah (misal: Sistem Manajemen Buku)",
        "Pelajari materi pengayaan di atas silabus kelas reguler"
      ]
    }
  }
];

interface RuleConclusion {
  title: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  tasks: string[];
}

// Forward Chaining Inference Engine
export function runForwardChaining(facts: Facts): InferenceResult {
  const firedRules: string[] = [];
  const trace: InferenceStep[] = [];
  
  // Default final conclusion if no rules fired
  let finalConclusion: RuleConclusion = {
    title: "General Academic Recommendation",
    risk: "Medium",
    explanation: "Mahasiswa direkomendasikan melakukan review materi praktikum mandiri.",
    tasks: [
      "Review materi praktikum dari awal semester",
      "Diskusikan materi yang membingungkan dengan teman sebaya"
    ]
  };

  // Run over the rule database in a prioritized order
  // (We prioritize critical rules first down to general ones)
  const rulesOrder = ["R008", "R007", "R004", "R005", "R006", "R001", "R002", "R003", "R009"];
  const sortedRules = [...KNOWLEDGE_BASE_RULES].sort((a, b) => {
    return rulesOrder.indexOf(a.id) - rulesOrder.indexOf(b.id);
  });

  for (const rule of sortedRules) {
    // Check if the rule qualifies based on facts
    const isTriggered = rule.premise(facts);
    
    // Document trace
    const factsChecked: string[] = [];
    if (rule.id === "R008") {
      factsChecked.push("strugglesLogic", "strugglesCoreOOP", "strugglesAdvancedOOP", "strugglesDataStructures");
    } else if (rule.id === "R007") {
      factsChecked.push("strugglesCoreOOP", "strugglesDataStructures", "strugglesLogic", "strugglesAdvancedOOP");
    } else if (["R001", "R002", "R003"].includes(rule.id)) {
      factsChecked.push("strugglesLogic", "learningStyle");
    } else if (["R004", "R005", "R006"].includes(rule.id)) {
      factsChecked.push("strugglesAdvancedOOP", "learningStyle");
    } else if (rule.id === "R009") {
      factsChecked.push("strugglesLogic", "strugglesCoreOOP", "strugglesAdvancedOOP", "strugglesDataStructures");
    }

    trace.push({
      ruleId: rule.id,
      ruleName: rule.name,
      triggered: isTriggered,
      factsChecked,
      result: isTriggered ? rule.conclusion.title : undefined
    });

    if (isTriggered) {
      firedRules.push(rule.id);
      
      // Let the most specific rule win (typically the first one that triggers in our prioritized list)
      if (firedRules.length === 1) {
        finalConclusion = rule.conclusion as RuleConclusion;
      }
    }
  }

  // Convert tasks array to standard objects for tracking state
  const formattedTasks = finalConclusion.tasks.map((taskStr, index) => ({
    id: `task-${index}`,
    title: taskStr,
    completed: false,
    source: firedRules[0] || "Default"
  }));

  const diagnosis: Diagnosis = {
    id: firedRules[0] || "DEFAULT_DIAGNOSIS",
    title: finalConclusion.title,
    risk: finalConclusion.risk,
    explanation: finalConclusion.explanation,
    remediationTasks: formattedTasks
  };

  return {
    diagnosis,
    firedRules,
    trace
  };
}
