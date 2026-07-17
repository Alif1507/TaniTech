import React from "react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

export default function HeroSection() {
  return (
    <section
      style={{ fontFamily: "Poppins, sans-serif" }}
      className="relative w-full h-[560px] sm:h-[520px] md:h-[600px] lg:h-[680px] overflow-hidden rounded-b-2xl md:rounded-b-3xl shadow-lg md:shadow-2xl"
    >
      <img
        src="/img/Hero-sec.png"
        alt="Petani menggunakan aplikasi Agrivo di sawah"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-12 flex items-center justify-between gap-5 sm:gap-10 lg:gap-20">
        {/* mx-auto + text-center: teks jadi rata tengah di mobile.
            md:mx-0 md:text-left: balik rata kiri begitu masuk desktop. */}
        <div className="max-w-xl mx-auto text-center md:mx-0 md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-2 md:mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            Agrivo
          </h1>

          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white leading-snug mb-3 md:mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Ciptakan pertanian dengan teknologi saat ini, lebih mudah dan
            cerdas
          </h2>

          <p className="hidden sm:block text-sm md:text-base text-white/90 leading-relaxed mb-5 md:mb-7 max-w-md mx-auto md:mx-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            Petani adalah pahlawan pangan yang bekerja dengan penuh dedikasi
            untuk menghasilkan hasil panen terbaik di bumi. Setiap pekerjaan
            yang mereka lakukan menyimpan kerja keras, ketekunan, dan
            perjuangan para petani demi menjaga keberlangsungan kehidupan.
          </p>

          <p className="sm:hidden text-sm text-white/90 leading-relaxed mb-5 max-w-xs mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            Petani, pahlawan pangan yang menjaga keberlangsungan kehidupan
            dengan kerja keras dan ketekunan.
          </p>

          <button className="bg-gradient-to-r from-[#FFC000] via-yellow-500 to-[#A1C964] text-white font-semibold text-sm md:text-base px-6 md:px-8 py-2.5 md:py-3 rounded-2xl shadow-lg">
            Mulai Sekarang
          </button>
        </div>

        <div className="hidden absolute right-0 -bottom-16 md:flex h-full items-end shrink-0 self-end">
          <img
            src="/img/orang.png"
            alt="Petani memegang smartphone menampilkan aplikasi Agrivo"
            className="max-h-full w-auto object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}