export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 md:px-14 md:py-15">
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #A1C942 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 w-[380px] h-[380px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #FFC000 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div className="flex flex-col gap-7">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(90deg, #5E8000, #A1C942)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 3c-4 3-6 7-6 11a6 6 0 0 0 12 0c0-4-2-8-6-11Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Agrivo
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] text-gray-900">
            Ciptakan pertanian dengan{" "}
            <span
              className="relative inline-block bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #D4AF37, #5E8000)" }}
            >
              teknologi saat ini
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="10"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q50 0 100 6 T200 6"
                  stroke="#A1C942"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            , lebih mudah dan cerdas
          </h1>

         

          <div className="flex flex-wrap items-center gap-4 mt-1">
            <button
              type="button"
              className="group relative overflow-hidden rounded-2xl px-8 py-4
                shadow-[0_10px_28px_-6px_rgba(94,128,0,0.5)]
                transition-all duration-300 ease-out
                hover:shadow-[0_14px_36px_-6px_rgba(94,128,0,0.65)]
                hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, #FFC000, #A1C942)" }}
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/50 to-transparent
                  group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
              />
              <span className="relative flex items-center gap-2 text-white font-semibold text-base tracking-wide">
                Mulai sekarang
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>

          
        </div>

        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-30"
          />
          <div className="relative rounded-[2rem]">
            <img
              src="/img/Hero-sec.png"
              alt=""
              className="w-full object-cover"
            />
           
          </div>

          
        </div>
      </div>
    </section>
  );
}