import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

export default function Footer() {
  return (
    <footer  style={{ fontFamily: "Poppins, sans-serif" }} className="w-full mt-15 bg-gradient-to-r from-[#FFC000] via-[#D4AF37] to-[#A1C942] px-8 md:px-14 pt-5 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 ">
        <div className="flex flex-col gap-6 items-start">
          <img src="/img/Logo.png" alt="Benih" className="h-30 w-auto object-contain" />

          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#3F3300]">
            <a href="#about" className="hover:text-[#5E8000] transition-colors">
              About
            </a>
            <a href="#kenapa-kami" className="hover:text-[#5E8000] transition-colors">
              Kenapa Kami
            </a>
            <a href="#saran-petani" className="hover:text-[#5E8000] transition-colors">
              Saran Petani
            </a>
            <a href="#buat-ide" className="hover:text-[#5E8000] transition-colors">
              Buat Ide
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-3 lg:items-start">
          <p className="text-sm font-medium text-[#3F3300]">
            Kirim pesan ataupun saran untuk kami kedepannya
          </p>
          <form className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Kirim saran dan pesan.."
              className="w-64 sm:w-72 rounded-lg border-none bg-white px-4 py-2.5 text-sm text-gray-700
                placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#5E8000] px-6 py-2.5 text-sm font-semibold text-white
                shadow-sm transition-all duration-200 hover:bg-[#4a6600] hover:-translate-y-0.5
                active:translate-y-0"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 border-t border-black/20 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#3F3300]/80">
          <a href="#terms" className="hover:text-[#3F3300] transition-colors">
            Terms &amp; Conditions
          </a>
          <span className="text-[#3F3300]/40">|</span>
          <a href="#privacy" className="hover:text-[#3F3300] transition-colors">
            Privacy Policy
          </a>
          <span className="text-[#3F3300]/40">|</span>
          <a href="#legal" className="hover:text-[#3F3300] transition-colors">
            Legal
          </a>
        </div>
      </div>
    </footer>
  );
}