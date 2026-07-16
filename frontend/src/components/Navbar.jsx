import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const NAV_LINKS = [
  { label: "Tentang", href: "#about" },
  { label: "Kenapa", href: "#kenapa" },
  { label: "Saran", href: "#saran" },
  { label: "Buat & Konsumen", href: "#buat-konsumen" },
];

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
  });
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header style={{ fontFamily: "Poppins, sans-serif" }} className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/img/Logo.png"
            alt="Benih - Rumah Bibit Berkualitas"
            className="h-20 w-auto"
          />
        </a>

        <div className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              onClick={() => scrollToSection(link.href.replace("#", ""))}
              className="group cursor-pointer relative text-[16px] font-medium transition-colors duration-200 hover:text-[#4C6B30]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[#4C6B30] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#login"
            className="rounded-full bg-[#4C6B30] px-6 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3d5626] hover:shadow-lg hover:shadow-[#4C6B30]/25 active:translate-y-0"
          >
            Login
          </a>
          <a
            href="#register"
            className="rounded-full border-2 border-[#4C6B30] px-6 py-2 text-[15px] font-medium text-[#4C6B30] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4C6B30] hover:text-white active:translate-y-0"
          >
            Register
          </a>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-neutral-100 lg:hidden"
        >
          <Menu
            className={`absolute h-6 w-6 text-neutral-800 transition-all duration-300 ${
              isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
            }`}
          />
          <X
            className={`absolute h-6 w-6 text-neutral-800 transition-all duration-300 ${
              isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
            }`}
          />
        </button>
      </nav>

      <div
        className={`fixed inset-0 top-20 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed inset-x-0 top-20 z-40 origin-top overflow-hidden bg-white shadow-xl transition-all duration-300 ease-out lg:hidden ${
          isOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-5">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: isOpen ? `${i * 60 + 80}ms` : "0ms" }}
              className={`rounded-xl px-3 py-3 text-base font-medium text-neutral-800 transition-all duration-300 ease-out hover:bg-[#4C6B30]/10 hover:text-[#4C6B30] ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="mt-3 flex flex-col gap-3 border-t border-neutral-100 pt-4">
            <a
              href="#login"
              style={{ transitionDelay: isOpen ? "320ms" : "0ms" }}
              className={`rounded-full bg-[#4C6B30] px-6 py-3 text-center text-base font-medium text-white transition-all duration-300 ease-out active:scale-95 ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              Login
            </a>
            <a
              href="#register"
              style={{ transitionDelay: isOpen ? "380ms" : "0ms" }}
              className={`rounded-full border-2 border-[#4C6B30] px-6 py-2.5 text-center text-base font-medium text-[#4C6B30] transition-all duration-300 ease-out active:scale-95 ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}