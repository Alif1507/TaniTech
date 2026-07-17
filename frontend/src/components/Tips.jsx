import { useState } from "react";

const items = [
  {
    title: "Sistem Irigasi dan Fertigasi Otomatis Berbasis IoT",
    desc: "Kamu bisa menggunakan sensor kelembapan tanah, suhu, dan pH yang dihubungkan ke mikrokontroler untuk mengatur pompa air dan penyaluran pupuk secara otomatis. Data dari sensor ini dikirimkan ke dashboard web atau aplikasi mobile, sehingga kondisi lahan bisa dipantau secara real-time dan penggunaan air menjadi jauh lebih presisi.",
  },
  {
    title: "Monitoring Lahan dan Tanaman Menggunakan Drone",
    desc: "Memanfaatkan drone yang dilengkapi kamera multispektral untuk memetakan seluruh area lahan dengan cepat. Teknologi ini mampu mendeteksi area yang terserang hama atau kekurangan nutrisi sejak dini tanpa harus memeriksa tanaman satu per satu secara manual. Drone khusus juga bisa digunakan untuk penyemprotan pupuk cair atau pestisida secara merata dan hemat waktu.",
  },
  {
    title: "Greenhouse Pintar dengan Kontrol Mikroklimat",
    desc: "Membangun ekosistem tanaman tertutup yang kondisi lingkungan di dalamnya diatur sepenuhnya oleh sistem otomatis. Sensor akan membaca suhu dan kelembapan udara, lalu secara otomatis menyalakan mist blower (pengabut air), kipas pendingin, atau menutup atap jika cuaca terlalu panas. Sistem ini sangat efektif untuk budidaya tanaman bernilai tinggi yang sensitif terhadap perubahan cuaca ekstrim.",
  },
  {
    title: "Platform Analisis Data Prediksi Panen dan Pasar",
    desc: "Mengembangkan aplikasi yang memanfaatkan data analytics untuk mengintegrasikan data cuaca historis, tren pasar, dan kondisi tanaman guna memprediksi waktu panen terbaik serta estimasi volume hasilnya. Platform ini juga bisa langsung menghubungkan petani dengan pembeli skala besar (B2B) untuk memotong rantai distribusi yang panjang dan menjaga stabilitas harga jual.",
  },
];



function Card({ title, desc, open, onToggle }) {
  return (
    <div
      style={{ fontFamily: "Poppins, sans-serif" }}
      className={`relative w-full bg-white rounded-2xl shadow-md overflow-hidden
        transition-shadow duration-300 ease-out
        ${open ? "shadow-lg ring-1 ring-lime-200" : "hover:shadow-lg"}`}
    >
      <img
        src="/img/bulat.png"
        alt=""
        className={`absolute top-0 right-0 w-9 h-9 pointer-events-none
          transition-transform duration-500 ease-out
          ${open ? "scale-110" : "scale-100"}`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap- cursor-pointer
          transition-colors duration-200 active:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 pr-2">{title}</h3>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`bg-lime-700 text-white text-sm leading-relaxed px-6 py-4
              transition-all duration-400 ease-out
              ${open ? "opacity-100 translate-y-0 delay-100" : "opacity-0 -translate-y-2"}`}
          >
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tips() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section id="saran" style={{ fontFamily: "Poppins, sans-serif" }} className="w-full max-w-2xl mx-auto py-10 px-4">
     <div className="flex flex-col items-center justify-center text-center mb-10  gap-2">
            <h2 className="font-inter text-center text-[30px] font-semibold text-[#1F1B0E] sm:text-[38px]">
                Saran untuk petani
            </h2>
            <div className="bg-[#5E8000] h-1 rounded-full lg:w-60 w-40"></div>
    </div>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <Card
            key={item.title}
            title={item.title}
            desc={item.desc}
            open={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </section>
  );
}