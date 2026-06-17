import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-[#1E1E1E] selection:bg-[#FEDFD9] selection:text-[#1E1E1E]">
      {/* Header */}
      <header className="border-b border-[#1E1E1E] bg-[#FDFCFB] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F86041] border border-[#1E1E1E] flex items-center justify-center font-bold text-[#FDFCFB] text-base">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">
              Pathify
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-[#F86041] hover:underline">
              Beranda
            </Link>
            <Link href="/diagnose" className="hover:text-[#F86041] hover:underline">
              Mulai Diagnosis
            </Link>
            <Link href="/dashboard" className="hover:text-[#F86041] hover:underline">
              Dashboard Tracker
            </Link>
            <Link href="/analytics" className="hover:text-[#F86041] hover:underline border border-[#1E1E1E] px-3 py-1 bg-[#FEDFD9]">
              Analisis Dataset
            </Link>
          </nav>

          <Link
            href="/diagnose"
            className="px-4 py-2 border border-[#1E1E1E] bg-[#F86041] text-[#FDFCFB] hover:bg-[#1E1E1E] hover:text-[#FDFCFB] text-xs font-bold uppercase transition-colors"
          >
            Tes Mandiri
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="max-w-2xl flex flex-col gap-6 animate-fade-in-up">
          <div className="inline-block self-start px-2 py-0.5 border border-[#1E1E1E] bg-[#FEDFD9] text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">
            Tugas Akhir Kecerdasan Buatan - Kelompok 2
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-950">
            Analisis Kesulitan Belajar dengan Rule-Based Reasoning
          </h1>

          <p className="text-base text-zinc-700 leading-relaxed max-w-xl">
            Sistem pakar diagnosis kesulitan akademik mahasiswa pemrograman menggunakan metode Forward Chaining. Menghasilkan peta rencana remedi dan dasbor pelacak belajar mandiri secara preventif sebelum ujian.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              href="/diagnose"
              className="px-6 py-3 border border-[#1E1E1E] bg-[#F86041] hover:bg-[#1E1E1E] text-[#FDFCFB] text-xs font-bold uppercase text-center transition-colors shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none active:translate-y-0.5"
            >
              Mulai Diagnosis Baru
            </Link>
            <Link
              href="/analytics"
              className="px-6 py-3 border border-[#1E1E1E] bg-[#FDFCFB] hover:bg-[#FEDFD9] text-[#1E1E1E] text-xs font-bold uppercase text-center transition-colors"
            >
              Analisis Dataset
            </Link>
          </div>
        </div>

        {/* Flat Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Card 1 */}
          <div className="border border-[#1E1E1E] p-6 flex flex-col gap-4 bg-[#FDFCFB] hover:shadow-[3px_3px_0px_0px_#1E1E1E] transition-all">
            <div className="w-10 h-10 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center text-[#F86041] font-bold">
              01
            </div>
            <div>
              <h3 className="text-md font-bold mb-1">Diagnosis Granular</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Mendeteksi kendala akademik pada tingkat sub-bab mata kuliah untuk mengetahui letak kelemahan konsep.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-[#1E1E1E] p-6 flex flex-col gap-4 bg-[#FEDFD9] hover:shadow-[3px_3px_0px_0px_#1E1E1E] transition-all">
            <div className="w-10 h-10 border border-[#1E1E1E] bg-[#F86041] flex items-center justify-center text-[#FDFCFB] font-bold">
              02
            </div>
            <div>
              <h3 className="text-md font-bold mb-1">Learning Tracker</h3>
              <p className="text-[#1E1E1E] text-xs leading-relaxed">
                Mengonversi diagnosis menjadi daftar tugas terarah yang dipantau melalui indikator tingkat kesiapan ujian.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-[#1E1E1E] p-6 flex flex-col gap-4 bg-[#FDFCFB] hover:shadow-[3px_3px_0px_0px_#1E1E1E] transition-all">
            <div className="w-10 h-10 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center text-[#F86041] font-bold">
              03
            </div>
            <div>
              <h3 className="text-md font-bold mb-1">Analisis Kelas</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Portal pengunggah dataset CSV kelas untuk memetakan statistik kendala dan klaster risiko akademik secara kolektif.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mt-24 border-t border-[#1E1E1E] pt-12">
          <div className="mb-8">
            <h2 className="text-xl font-bold">Tim Pengembang</h2>
            <p className="text-xs text-zinc-500 mt-1">Dosen Pengampu: Prof. Dr. Wiharto S.T., M.Kom.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Daniel Ferdian Napitupulu", nim: "NIM. L0124008" },
              { name: "Kevin Ananda Putra", nim: "NIM. L0124103" },
              { name: "Rafif Adyatma Setyawan", nim: "NIM. L0124117" },
            ].map((member, idx) => (
              <div key={idx} className="border border-[#1E1E1E] p-4 flex items-center gap-4 bg-[#FDFCFB]">
                <div className="w-10 h-10 border border-[#1E1E1E] bg-[#FEDFD9] flex items-center justify-center font-bold text-xs text-[#F86041]">
                  K2
                </div>
                <div>
                  <h4 className="font-bold text-xs">{member.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{member.nim}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer
      <footer className="border-t border-[#1E1E1E] bg-[#F4F1EC] py-8 text-center text-[10px] text-zinc-500">
        <div className="max-w-6xl mx-auto px-6">
          <p>© 2026 Pathify Kelompok 2. Informatika Universitas Sebelas Maret. Hak Cipta Dilindungi.</p>
        </div>
      </footer> */}
    </div>
  );
}
