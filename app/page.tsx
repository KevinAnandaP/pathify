import Header from "@/app/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-[#1E1E1E] selection:bg-[#FEDFD9] selection:text-[#1E1E1E]">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-20 flex flex-col justify-center gap-12">
        <div className="max-w-3xl flex flex-col gap-6 animate-fade-in-up">
          <div className="inline-block self-start px-3 py-1 border border-[#1E1E1E] bg-[#FEDFD9] text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">
            Tugas Akhir Kecerdasan Buatan - Kelompok 2
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-zinc-950">
            Analisis Kesulitan Belajar dengan Rule-Based Reasoning
          </h1>

          <p className="text-lg text-zinc-700 leading-relaxed max-w-2xl mt-2">
            Sistem pakar diagnosis kesulitan akademik mahasiswa pemrograman menggunakan metode Forward Chaining. Menghasilkan peta rencana remedi dan dasbor pelacak belajar mandiri secara preventif sebelum ujian.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              href="/diagnose"
              className="px-8 py-4 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-sm font-bold uppercase text-center transition-colors shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none active:translate-y-1"
            >
              Mulai Diagnosis Baru
            </Link>
            <Link
              href="/analytics"
              className="px-8 py-4 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-[#1E1E1E] text-sm font-bold uppercase text-center transition-colors"
            >
              Analisis Dataset Kelas
            </Link>
          </div>
        </div>

        {/* Flat Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Card 1 */}
          <div className="border border-[#1E1E1E] p-8 flex flex-col gap-5 bg-[#FDFCFB] hover:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all">
            <div className="w-12 h-12 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center text-[#F86041] font-bold text-lg">
              01
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Diagnosis Granular</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Mendeteksi kendala akademik pada tingkat sub-bab mata kuliah untuk mengetahui letak kelemahan konsep.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-[#1E1E1E] p-8 flex flex-col gap-5 bg-[#FEDFD9] hover:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all">
            <div className="w-12 h-12 border border-[#1E1E1E] bg-[#F86041] flex items-center justify-center text-[#FDFCFB] font-bold text-lg">
              02
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Learning Tracker</h3>
              <p className="text-[#1E1E1E] text-sm leading-relaxed">
                Mengonversi diagnosis menjadi daftar tugas terarah yang dipantau melalui indikator tingkat kesiapan ujian.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-[#1E1E1E] p-8 flex flex-col gap-5 bg-[#FDFCFB] hover:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all">
            <div className="w-12 h-12 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center text-[#F86041] font-bold text-lg">
              03
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Analisis Kelas</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Portal pengunggah dataset kelas untuk memetakan statistik kendala dan klaster risiko akademik secara kolektif.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
