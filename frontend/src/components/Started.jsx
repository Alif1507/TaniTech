import { Sparkles, Search } from "lucide-react";

export default function Started() {
  return (
    <div id="buat-konsumen" className="flex flex-wrap items-center gap-5 py-12 justify-center">
      <button
        type="button"
        className="group cursor-pointer relative overflow-hidden rounded-2xl px-8 py-4
          bg-gradient-to-r from-[#FFC000] via-yellow-500 to-[#A1C964]
          shadow-[0_8px_24px_-6px_rgba(202,165,0,0.55)]
          transition-all duration-300 ease-out
          hover:shadow-[0_12px_32px_-6px_rgba(202,165,0,0.7)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]"
      >
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
        />
        <span className="relative flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-white drop-shadow-sm transition-transform duration-500 group-hover:rotate-12" />
          <span className="text-white font-semibold text-base tracking-wide">
            Mulai dengan AI
          </span>
        </span>
      </button>

      <button
        type="button"
        className="group relative cursor-pointer overflow-hidden rounded-2xl px-8 py-4
          bg-white border-2 border-yellow-400/70
          shadow-[0_4px_14px_-4px_rgba(202,165,0,0.25)]
          transition-all duration-300 ease-out
          hover:border-yellow-500 hover:bg-yellow-50/60
          hover:shadow-[0_8px_22px_-6px_rgba(202,165,0,0.4)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]"
      >
        <span className="relative flex items-center gap-2.5">
          <Search className="w-5 h-5 text-yellow-500 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-yellow-600 font-semibold text-base tracking-wide">
            Cari konsumen
          </span>
        </span>
      </button>
    </div>
  );
}