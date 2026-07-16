import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { getSession, clearSession } from "../utils/api";

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Kenapa", href: "/#kenapa" },
  { label: "Saran", href: "/#saran" },
  { label: "Buat & Konsumen", href: "/#buat-konsumen" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Load session status
  useEffect(() => {
    setSession(getSession());
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm shadow-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/img/Logo.png"
            alt="Benih - Rumah Bibit Berkualitas"
            className="h-11 w-auto"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.target.style.display = "none";
            }}
          />
          <span className="font-display font-black text-2xl tracking-tight text-primary-green flex items-center gap-1">
            Tani<span className="text-secondary-green">Tech</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative text-[15px] font-semibold text-neutral-600 transition-colors duration-200 hover:text-primary-green"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-primary-green transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Desktop Authentication / User State */}
        <div className="hidden lg:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-4">
              {/* User badge */}
              <div className="flex items-center gap-2 bg-neutral-50 px-3.5 py-2 rounded-2xl border border-neutral-100">
                <div className="w-8 h-8 rounded-full bg-primary-green/10 flex items-center justify-center font-bold text-primary-green text-sm">
                  {session.profile.full_name ? session.profile.full_name[0].toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-neutral-400 capitalize">{session.profile.role}</div>
                  <div className="text-sm font-bold text-neutral-800 leading-tight">{session.profile.full_name}</div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2.5 text-[14px] font-bold text-neutral-600 hover:bg-neutral-50 hover:text-red-600 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full bg-primary-green px-6 py-2.5 text-[15px] font-bold text-white shadow-md shadow-primary-green/10 hover:-translate-y-0.5 hover:bg-[#4d6900] transition-all duration-200 cursor-pointer"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-full border-2 border-primary-green px-6 py-2 text-[15px] font-bold text-primary-green hover:-translate-y-0.5 hover:bg-primary-green hover:text-white transition-all duration-200 cursor-pointer"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Menu Icon */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-neutral-100 lg:hidden cursor-pointer"
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

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 top-20 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-x-0 top-20 z-40 origin-top overflow-hidden bg-white shadow-xl transition-all duration-300 ease-out lg:hidden ${
          isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-5">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: isOpen ? `${i * 60 + 80}ms` : "0ms" }}
              className={`rounded-xl px-3 py-3 text-base font-semibold text-neutral-700 transition-all duration-300 ease-out hover:bg-primary-green/10 hover:text-primary-green ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              {link.label}
            </a>
          ))}

          {/* Mobile Auth / Session section */}
          <div className="mt-3 flex flex-col gap-3 border-t border-neutral-100 pt-4">
            {session ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center font-bold text-primary-green text-base">
                    {session.profile.full_name ? session.profile.full_name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-800">{session.profile.full_name}</div>
                    <div className="text-xs font-semibold text-neutral-400 capitalize">{session.profile.role}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  style={{ transitionDelay: isOpen ? "320ms" : "0ms" }}
                  className={`rounded-xl border border-neutral-200 px-6 py-3 text-center text-base font-bold text-neutral-600 active:scale-95 transition-all duration-300 ease-out hover:text-red-600 ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  }`}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  style={{ transitionDelay: isOpen ? "320ms" : "0ms" }}
                  className={`rounded-xl bg-primary-green px-6 py-3 text-center text-base font-bold text-white transition-all duration-300 ease-out active:scale-95 ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  }`}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  style={{ transitionDelay: isOpen ? "380ms" : "0ms" }}
                  className={`rounded-xl border-2 border-primary-green px-6 py-2.5 text-center text-base font-bold text-primary-green transition-all duration-300 ease-out active:scale-95 ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  }`}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}