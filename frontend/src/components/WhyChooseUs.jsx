import React from "react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const CARDS = [
  {
    id: "mudah",
    image: "/img/Foto1.png",
    title: "Mudah digunakan",
    desc: "Aplikasi mudah digunakan karena Asisten pribadi membantu para petani dengan mengarahkan apa yang ingin mereka lakukan.",
  },
  {
    id: "inovasi",
    image: "/img/Foto2.png",
    title: "Membantu inovasi petani",
    desc: "Petani mampu mendapatkan inovasi yang lebih menarik dengan bantuan AI.",
  },
  {
    id: "konsumen",
    image: "/img/Foto3.png",
    title: "Membantu petani mencari konsumen",
    desc: "Para petani mampu mendapatkan konsumen dengan sistem yang mudah dan adil.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="kenapa" style={{ fontFamily: "Poppins, sans-serif" }} className="w-full mt-15 px-4 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center text-center mb-10  gap-2">
            <h2 className="font-inter text-center text-[30px] font-semibold text-[#1F1B0E] sm:text-[38px]">
                Kenapa memilih kami?
            </h2>
            <div className="bg-[#5E8000] h-1 rounded-full w-40 lg:w-60"></div>
        </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="group relative h-[380px] overflow-hidden rounded-2xl shadow-md shadow-black/10 sm:h-[440px]"
          >
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* base gradient so nothing looks flat/naked without hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent transition-opacity duration-500 group-hover:from-black/80" />

            {/* text panel, slides up and fades in on hover */}
            <div className="absolute inset-x-0 bottom-0 translate-y-3 p-6 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:p-7">
              <h3 className=" text-[20px] font-semibold leading-snug text-white sm:text-[22px]">
                {card.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/85 sm:text-[14px]">
                {card.desc}
              </p>
              <div className="mt-4 h-[3px] w-10 rounded-full bg-[#FFC000]" />
            </div>

            {/* small always-visible label, fades out on hover so it doesn't collide with the full text */}
            <div className="absolute inset-x-0 bottom-0 p-6 opacity-100 transition-opacity duration-300 group-hover:opacity-0 sm:p-7">
              <h3 className=" text-[19px] font-semibold text-white sm:text-[21px]">
                {card.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}