import React, { useState } from "react";
import { Sprout, Eye, Target } from "lucide-react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const SECTIONS = [
  {
    id: "about",
    label: "Tentang",
    icon: Sprout,
    render: () => (
      <p className="mt-5 max-w-md font-inter text-[15px] leading-[1.8] text-[#1F1B0E]/80 sm:text-[16px]">
        TaniTech adalah aplikasi yang dirancang untuk membantu para petani lokal yang ingin menggunakan teknolgi pada pertanian dengan mudah, bukan hanya itu tanitech juga membantu para petani mencari para konsumen yang membutuhkan hasil pangan mereka, dan konsumen tentu juga terbantu dalam mencari pangan
      </p>
    ),
  },
  {
    id: "visi",
    label: "Visi",
    icon: Eye,
    render: () => (
      <p className="mt-5 max-w-md font-inter text-[15px] leading-[1.8] text-[#1F1B0E]/80 sm:text-[16px]">
       Menjadi platform AI dan IoT terdepan yang memberdayakan petani Indonesia untuk meningkatkan produktivitas pertanian melalui teknologi tepat guna, sekaligus menghubungkan mereka langsung dengan konsumen perkotaan untuk distribusi pangan yang lebih efisien dan berkelanjutan.
      </p>
    ),
  },
  {
    id: "misi",
    label: "Misi",
    icon: Target,
    render: () => (
      <p className="mt-5 max-w-md space-y-3 font-inter text-[15px] leading-[1.7] text-[#1F1B0E]/80 sm:text-[16px]">Menyediakan rekomendasi solusi IoT yang terjangkau dan disesuaikan dengan kondisi lahan, budget, dan kebutuhan spesifik setiap petani
Menghilangkan hambatan akses informasi teknologi pertanian melalui AI Assistant yang mudah digunakan</p>
    ),
  },
];

export default function AboutSection() {
  const [active, setActive] = useState("about");

  return (
    <section id="about" style={{ fontFamily: "Poppins, sans-serif" }} className="w-full px-3 py-8 sm:px-6 sm:py-14 lg:px-10 font-inter">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#4C6B00] shadow-2xl shadow-black/40">
        <div className="flex flex-col sm:h-[460px] sm:flex-row">
          {SECTIONS.map((section, idx) => {
            const isActive = active === section.id;
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                aria-expanded={isActive}
                style={{ flexGrow: isActive ? 5 : 1, flexBasis: 0 }}
                className={[
                  "group text-xl cursor-pointer relative flex text-[#1F1B0E] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1B0E]/40 focus-visible:ring-inset",
                  idx !== 0
                    ? "border-t border-black/10 sm:border-t-0 sm:border-l"
                    : "",
                  isActive
                    ? "flex-col items-start justify-end gap-0 bg-[#D4AF37] px-7 py-8 text-left sm:px-11 sm:py-11"
                    : "items-center gap-4 px-6 py-6 hover:bg-black/5 sm:min-w-[100px] sm:flex-col sm:justify-between sm:px-4 sm:py-10",
                ].join(" ")}
              >
                {!isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-4 top-4 hidden gap-[3px] sm:flex sm:flex-col"
                  >
                    {[0, 1, 2].map((r) => (
                      <div
                        key={r}
                        className="h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent"
                      />
                    ))}
                  </div>
                )}

                <div
                  className={[
                    "flex items-center gap-3",
                    isActive ? "sm:mb-auto" : "sm:flex-col sm:gap-3",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                      isActive
                        ? "h-11 w-11 border-[#1F1B0E]/25 bg-[#1F1B0E]/[0.06]"
                        : "h-10 w-10 border-white/25 bg-white/[0.04] group-hover:border-white/40",
                    ].join(" ")}
                  >
                    <Icon
                      className={isActive ? "h-5 w-5 text-[#1F1B0E]" : "h-[18px] w-[18px] text-white/85"}
                      strokeWidth={1.75}
                    />
                  </span>

                  
                </div>

                <div
                  className={[
                    "flex items-baseline gap-3",
                    isActive ? "mt-6 sm:mt-8" : "mt-0 sm:mt-4 sm:flex-col sm:items-center sm:gap-2",
                  ].join(" ")}
                >
                 
                  <span
                    className={[
                      "font-serif font-medium whitespace-nowrap",
                      isActive
                        ? "text-[#1F1B0E] text-[32px] sm:text-[44px] lg:text-[50px]"
                        : "text-white text-[17px] sm:text-[25px] sm:[writing-mode:vertical-rl] sm:rotate-180 sm:tracking-wide",
                    ].join(" ")}
                  >
                    {section.label}
                  </span>
                </div>

                {isActive && (
                  <div className="w-full animate-[riseIn_0.5s_cubic-bezier(0.22,1,0.36,1)]">
                    {section.render()}
                    <div className="mt-7 h-px w-14 bg-[#1F1B0E]/30" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}