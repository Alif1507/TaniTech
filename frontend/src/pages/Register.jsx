import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Leaf, ShoppingBag } from "lucide-react";
import { registerUser } from "../utils/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [role, setRole] = useState("petani");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ email, password, fullName, phone: whatsappNumber, whatsappNumber, role });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f3] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-display font-black text-3xl text-[#5E8000]">
              AGRI<span className="text-[#A1C942]">VO</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-neutral-500">Buat akun baru</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-medium">
              Akun berhasil dibuat! Mengalihkan ke login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Daftar sebagai</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("petani")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === "petani"
                      ? "border-[#5E8000] bg-[#5E8000]/5 text-[#5E8000]"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }`}
                >
                  <Leaf className="w-4 h-4 shrink-0" />
                  Petani
                </button>
                <button
                  type="button"
                  onClick={() => setRole("konsumen")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === "konsumen"
                      ? "border-[#5E8000] bg-[#5E8000]/5 text-[#5E8000]"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  Konsumen
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] transition-all bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] transition-all bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">No. WhatsApp</label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="6281234567890"
                className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] transition-all bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] transition-all bg-neutral-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#5E8000] focus:ring-[#5E8000]/30 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-neutral-500 leading-relaxed cursor-pointer select-none">
                Saya menyetujui{" "}
                <a href="#" className="text-[#5E8000] font-semibold hover:underline">Ketentuan Layanan</a>
                {" "}dan{" "}
                <a href="#" className="text-[#5E8000] font-semibold hover:underline">Kebijakan Privasi</a>
                {" "}Agrivo.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</>
              ) : (
                "Buat Akun"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-[#5E8000] hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
