# DOKUMENTASI SISTEM PAKAR & INFERENSI FORWARD CHAINING (PATHIFY)

Dokumen ini disusun untuk menjelaskan secara mendalam aspek teoritis Kecerdasan Buatan (Artificial Intelligence) yang diterapkan pada proyek **Pathify**, serta menyajikan bedah kode menyeluruh terhadap modul utama sistem pakar di [expert-system.ts](file:///c:/Vinneth/College/SEMESTER-4/AI/pathify/lib/expert-system.ts).

---

## I. TEORI AI: SISTEM PAKAR & METODE INFERENSI

Pathify menerapkan salah satu cabang klasik dalam Kecerdasan Buatan simbolis (*Symbolic AI*), yaitu **Sistem Pakar (Expert System)** berbasis aturan (**Rule-Based System**). 

Sistem pakar dirancang untuk meniru keahlian penalaran (*reasoning*) seorang pakar manusia (dalam hal ini, dosen wali atau konselor akademik) ke dalam sistem komputer untuk mendiagnosis kendala belajar mahasiswa secara otomatis dan memberikan rencana intervensi terstruktur.

### A. Komponen Utama Sistem Pakar Pathify

Mesin kecerdasan buatan Pathify terbagi menjadi tiga blok arsitektur utama:

```
+-------------------------------------------------------------------------+
|                               PATHIFY AI                                |
+-------------------------------------------------------------------------+
|                                                                         |
|  +-----------------------+       Pemicuan Fakta       +--------------+  |
|  |    WORKING MEMORY     | <────────────────────────> |  INFERENCE   |  |
|  |     (Basis Fakta)     |                            |    ENGINE    |  |
|  |  [G001, G002... S001] |                            |   (Mesin     |  |
|  +-----------------------+                            |  Inferensi)  |  |
|                                                       |   Forward    |  |
|  +-----------------------+       Pattern Match        |   Chaining   |  |
|  |    KNOWLEDGE BASE     | ─────────────────────────> |   Process    |  |
|  |     (Basis Aturan)    |                            +--------------+  |
|  | [RULE 1 ... RULE 6]   |                                              |
|  +-----------------------+                                              |
+-------------------------------------------------------------------------+
```

1. **Working Memory (Basis Fakta)**: Tempat penyimpanan sementara untuk fakta-fakta yang valid saat program dijalankan. Fakta ini berupa gejala-gejala awal belajar mahasiswa yang dikumpulkan dari kuesioner atau log e-learning ($G001 \dots G008$) serta kesimpulan diagnosis sementara ($S001 \dots S006$) yang berhasil dibuktikan selama proses inferensi berjalan.
2. **Knowledge Base (Basis Pengetahuan)**: Tempat menyimpan aturan-aturan formal deklaratif berbentuk implikasi kondisional **IF-THEN** (`RULES`). Aturan-aturan ini bertindak sebagai logika akademis yang menghubungkan gejala belajar dengan diagnosis hambatan kognitif.
3. **Inference Engine (Mesin Inferensi)**: Algoritma penalaran yang mengendalikan alur pembuktian fakta. Mesin inferensi Pathify menggunakan metode **Forward Chaining** (Runut Maju).

---

### B. Konsep Penalaran Forward Chaining (Runut Maju)

Forward Chaining adalah metode pencarian terpandu data (**Data-Driven Search**). Penalaran dimulai dari kumpulan fakta masukan (gejala awal) yang ada di Working Memory, kemudian sistem bergerak maju mencocokkan fakta tersebut dengan aturan-aturan implikasi guna melahirkan fakta baru, hingga akhirnya mencapai kesimpulan akhir (diagnosis).

Proses ini bekerja dengan mengeksekusi siklus **Match-Resolve-Act** secara berulang:

```
              ┌─────────────────────────────────────────┐
              │      Working Memory (Fakta Gejala)      │
              └────────────────────┬────────────────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │       1. MATCH (Pencocokan Aturan)      │
              │  Mencocokkan fakta aktif dengan premis  │
              └────────────────────┬────────────────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │         2. CONFLICT RESOLUTION          │
              │   Abaikan aturan yang sudah terpicu   │
              └────────────────────┬────────────────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │     3. ACT (Eksekusi Aturan / Fire)     │
              │   Tambah fakta baru ke Working Memory   │
              └────────────────────┬────────────────────┘
                                   │
            Ada fakta baru?  ──────┴──────> YA (Ulangi Siklus)
            (Selesai jika TIDAK)
```

1. **Match**: Mesin mencari seluruh aturan yang kondisi premisnya (`IF`) bernilai `true` (terpenuhi) berdasarkan fakta-fakta yang saat ini ada di Working Memory.
2. **Conflict Resolution**: Jika terdapat lebih dari satu aturan yang cocok, sistem menyelesaikannya dengan menggunakan pendekatan *Rule Ordering* (berurutan) dan *Refractory Marker*. Aturan yang sudah pernah dipicu (*fired*) ditandai agar tidak dieksekusi kembali pada iterasi berikutnya, mencegah terjadinya perulangan tanpa henti (*infinite loop*).
3. **Act**: Aturan yang terpilih akan dieksekusi (*fired*). Bagian konsekuensi (`THEN`) dari aturan tersebut ditambahkan sebagai fakta baru ke dalam Working Memory, yang kemudian dapat memicu aturan lain di iterasi berikutnya.

---

### C. Graf Inferensi & Aturan Berlapis (Chained Rules)

Kekuatan utama mesin inferensi ini adalah kemampuannya memproses **Aturan Berlapis (Chained Rules)**, di mana kesimpulan antara dari suatu aturan bertindak sebagai premis (pemicu) bagi aturan lainnya.

Berikut adalah representasi graf pohon penalaran (*Inference Graph*) sistem pakar Pathify:

```
[G001: Jarang Baca] ──┐
                      ├──(RULE 1)──> [S001: Hambatan Literasi] ──┐
[G002: Sulit Teori] ──┘                                          │
                                                                 ├──(RULE 3)──> [S003: Pendampingan] ──┐
[G003: Telat Tugas] ──┐                                          │                                     │
                      ├──(RULE 2)──> [S002: Hambatan Praktis] ───┘                                     │
[G004: Kuis Rendah] ──┘                                                                                ├──(RULE 6)──> [S006: Risiko Kritikal]
                                                                                                       │
[G007: Log VLE Rendah] ──┐                                                                             │
                         ├──(RULE 4)───────────────────────────────────> [S004: Hambatan Konsistensi] ─┘
[G008: Belajar SKS] ─────┘

[G005: Forum Pasif] ──┐
                      ├──(RULE 5)──> [S005: Hambatan Kolaboratif]
[G006: Forum View] ───┘
```

#### Simulasi Runtutan Iterasi (Inference Trace):
* **Fakta Awal (Input)**: Mahasiswa memiliki gejala $G001, G002, G003, G004, G007, G008$.
* **Iterasi 1**:
  * Premis `RULE 1` ($G001 \land G002$) terpenuhi $\rightarrow$ Aturan terpicu (*fire*) $\rightarrow$ Working Memory mendapat fakta baru: **`S001`**.
  * Premis `RULE 2` ($G003 \land G004$) terpenuhi $\rightarrow$ Aturan terpicu (*fire*) $\rightarrow$ Working Memory mendapat fakta baru: **`S002`**.
  * Premis `RULE 4` ($G007 \land G008$) terpenuhi $\rightarrow$ Aturan terpicu (*fire*) $\rightarrow$ Working Memory mendapat fakta baru: **`S004`**.
* **Iterasi 2**:
  * Penanda perubahan mendeteksi adanya fakta baru (`S001`, `S002`, `S004`).
  * Premis `RULE 3` ($S001 \land S002$) dievaluasi. Karena fakta `S001` dan `S002` sekarang ada di Working Memory, premis terpenuhi $\rightarrow$ Aturan terpicu (*fire*) $\rightarrow$ Working Memory mendapat fakta baru: **`S003`**.
* **Iterasi 3**:
  * Penanda perubahan kembali aktif karena adanya fakta baru (`S003`).
  * Premis `RULE 6` ($S003 \land S004$) dievaluasi. Karena fakta `S003` dan `S004` terpenuhi $\rightarrow$ Aturan terpicu (*fire*) $\rightarrow$ Working Memory mendapat fakta baru: **`S006`**.
* **Iterasi 4**:
  * Pemindaian dijalankan kembali, namun tidak ada aturan baru yang terpenuhi. Siklus inferensi berhenti dengan diagnosis akhir berupa **`S006` (Risiko Perkembangan Akademik Sangat Tinggi)**.

---

## II. BEDAH KODE MENYELURUH: `lib/expert-system.ts`

Berkas [expert-system.ts](file:///c:/Vinneth/College/SEMESTER-4/AI/pathify/lib/expert-system.ts) ditulis dengan pendekatan modular yang memisahkan definisi data aturan, data diagnosis, dan mesin pencari inferensi.

### A. Struktur Data & Kontrak Logika (Baris 1 - 50)
Berkas mendefinisikan antarmuka TypeScript untuk menjamin keselamatan tipe (*type safety*):
* `Facts` & `DetailedFacts`: Menyimpan variabel masukan gejala (kategori legacy database vs kategori e-learning modular $G001 \dots G008$).
* `Rule`: Mendefinisikan tipe data aturan formal. Bagian terpenting adalah:
  * `premise: (wm: Record<string, boolean>) => boolean;`
  Fungsi ini merupakan callback predikat. Mesin inferensi akan mengirimkan Working Memory (`wm`) ke fungsi ini untuk mengevaluasi apakah kondisi aturan terpenuhi.

---

### B. Representasi Aturan (`RULES`) (Baris 51 - 94)
Variabel `RULES` adalah representasi dari basis pengetahuan. Ditulis sebagai array berurutan berisi objek bertipe `Rule`:
```typescript
const RULES: Rule[] = [
  {
    id: "RULE_1",
    name: "Deteksi Hambatan Literasi Konten (RULE 1)",
    premise: (wm) => !!(wm["g001"] && wm["g002"]),
    conclusion: "S001",
    explanation: "Jika mahasiswa jarang mengakses materi utama (G001) and kesulitan konsep teoritis mandiri (G002), maka disimpulkan mengalami Hambatan Literasi Konten (S001)."
  },
  ...
];
```
* **Kelebihan Implementasi**: Penggunaan fungsi anonim `(wm) => ...` memungkinkan evaluasi logika premis dilakukan secara instan tanpa perlu mem-parsing teks aturan (*string parsing*), sehingga menaikkan efisiensi waktu eksekusi program.

---

### C. Kamus Intervensi Akademik (`OUTCOMES`) (Baris 103 - 283)
Variabel `OUTCOMES` mendefinisikan asosiasi pemetaan antara hasil diagnosis final sistem pakar ($S001 \dots S006$) dengan program remediasi terarah.
* **Personalisasi Gaya Belajar**: Setiap kode hambatan memiliki daftar penugasan spesifik untuk gaya belajar `Visual`, `Auditory`, dan `Kinesthetic`.
  * *Visual*: Fokus pada mindmap, infografis, diagram alur.
  * *Auditory*: Fokus pada rubber ducking, rekaman audio, diskusi kelompok kecil verbal.
  * *Kinesthetic*: Fokus pada pengerjaan mini-proyek mandiri, latihan editor praktis, flashcard fisik.

---

### D. Algoritma Mesin Inferensi (`runForwardChaining`) (Baris 286 - 391)
Fungsi `runForwardChaining` mengeksekusi penalaran maju dengan tahapan terstruktur:

#### 1. Pemetaan Gejala (Backward Compatibility Mapping)
Fungsi menerima parameter bertipe `Facts | DetailedFacts`. Jika masukan menggunakan skema `Facts` lama, fungsi memetakannya terlebih dahulu ke gejala modular `g001`-`g008`:
```typescript
const detailed: DetailedFacts = {
  g001: "g001" in facts ? (facts as DetailedFacts).g001 : (facts as Facts).strugglesAdvancedOOP,
  g003: "g003" in facts ? (facts as DetailedFacts).g003 : (facts as Facts).strugglesCoreOOP,
  ...
};
```

#### 2. Loop Utama Penalaran (Forward Chaining Execution)
Sistem melakukan iterasi untuk mencocokkan fakta di Working Memory (`wm`):
```typescript
let changed = true;
let iterations = 0;
const maxIterations = 10;

while (changed && iterations < maxIterations) {
  changed = false;
  iterations++;

  for (const rule of RULES) {
    // Lewati aturan jika sudah pernah dieksekusi (fire)
    if (firedRules.includes(rule.id)) continue;

    // Evaluasi kecocokan fakta dengan premis aturan (MATCH)
    const triggered = rule.premise(wm);
    if (triggered) {
      // Simpan kesimpulan aturan sebagai fakta baru (ACT)
      wm[rule.conclusion] = true;
      firedRules.push(rule.id);
      
      // Catat jejak langkah inferensi untuk visualisasi trace log
      trace.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: true,
        factsChecked: Object.keys(wm).filter(k => k.startsWith("g") || k.startsWith("S")),
        result: rule.explanation
      });
      
      changed = true; // Tandai adanya fakta baru untuk iterasi berikutnya
    }
  }
}
```

#### 3. Log Audit Tambahan (Fallback Trace)
Jika dari hasil pemindaian tidak ditemukan gejala sama sekali yang memicu aturan (`firedRules.length === 0`), sistem secara proaktif merekam jejak aturan yang gagal sebagai informasi audit transparansi logika bagi pengguna:
```typescript
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
```

#### 4. Resolusi Konflik Konklusi & Personalisasi Tugas
Terakhir, fungsi memindai kesimpulan tertinggi untuk menentukan diagnosis utama, menyaring tugas remediasi berdasarkan preferensi gaya belajar, dan mengembalikan objek `InferenceResult`.

---

## III. KRITIK & EVALUASI STRUKTUR AI (UNTUK TANYA JAWAB DOSEN)

Saat ditanya mengenai kekuatan dan kelemahan teoretis sistem ini, berikut analisis formalnya:

1. **Kekuatan (Explainability & Modularity)**:
   * Mesin inferensi beroperasi secara bersih terpisah dari data aturan. Dosen penguji dapat menambahkan aturan baru di variabel `RULES` tanpa perlu memodifikasi alur perulangan `runForwardChaining`.
   * Sistem mencatat *Trace Log* penalaran yang interaktif, memenuhi aspek keterbacaan keputusan AI (*Explainable AI*).
2. **Kelemahan (Crisp Logic Constraint)**:
   * Menggunakan logika tegas (Boolean), sistem ini mengabaikan ketidakpastian. Mahasiswa yang nilai kuisnya tepat di angka KKM (misal 74.9 vs 75.0) akan dinilai secara hitam-putih.
   * *Solusi Akademik*: Sistem dapat dikembangkan lebih lanjut dengan menggabungkan metode penalaran berbasis ketidakpastian seperti **Fuzzy Logic** atau **Certainty Factor (CF)** untuk mengalkulasi tingkat keyakinan diagnosis.
3. **Pra-pemrosesan Data (Feature Discretization)**:
   * Karena Forward Chaining membutuhkan data kategorikal tegas, data numerik (seperti nilai tugas dan keaktifan forum) harus melalui pra-pemrosesan (klasifikasi diskrit) terlebih dahulu sebelum dimasukkan sebagai fakta gejala.
