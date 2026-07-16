import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, ShieldAlert, Loader2, ArrowLeft, Leaf, ShoppingBag } from "lucide-react";
import { registerUser } from "../utils/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [role, setRole] = useState("petani"); // default to petani
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
      await registerUser({
        email,
        password,
        fullName,
        phone,
        whatsappNumber,
        role,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Silakan periksa kembali input Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-[#f7f9f4] grid-bg overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-secondary-green/10 blur-3xl pointer-events-none" />

      {/* Register Card */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-neutral-100 p-8 rounded-3xl shadow-xl shadow-primary-green/5 animate-fade-in relative z-10 my-4">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-primary-green transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-green/10 mb-4">
            <UserPlus className="w-8 h-8 text-primary-green" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-display">Buat Akun</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Bergabunglah dengan ekosistem pertanian digital <span className="font-semibold text-primary-green">TaniTech</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-secondary-green/10 border border-secondary-green/20 flex items-start gap-3 animate-fade-in">
            <span className="text-xl">🎉</span>
            <div className="text-sm font-medium text-primary-green">
              Registrasi Berhasil! Mengalihkan ke halaman login...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Petani */}
              <button
                type="button"
                onClick={() => setRole("petani")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "petani"
                    ? "border-primary-green bg-primary-green/5 text-primary-green"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-500"
                }`}
              >
                <Leaf className={`w-6 h-6 mb-1.5 ${role === "petani" ? "text-primary-green" : "text-neutral-400"}`} />
                <span className="font-bold text-sm">Petani</span>
                <span className="text-xxs opacity-70 mt-0.5">Dapatkan Rekomendasi & AI</span>
              </button>

              {/* Konsumen */}
              <button
                type="button"
                onClick={() => setRole("konsumen")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "konsumen"
                    ? "border-primary-green bg-primary-green/5 text-primary-green"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-500"
                }`}
              >
                <ShoppingBag className={`w-6 h-6 mb-1.5 ${role === "konsumen" ? "text-primary-green" : "text-neutral-400"}`} />
                <span className="font-bold text-sm">Konsumen</span>
                <span className="text-xxs opacity-70 mt-0.5">Belanja Hasil Tani Segar</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
              placeholder="nama@email.com"
            />
          </div>

          {/* Grid: Phone & Whatsapp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                No. Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                placeholder="081234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                No. WhatsApp
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                placeholder="6281234567890"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2.5 text-xs text-neutral-500">
            <input 
              type="checkbox" 
              required
              className="mt-0.5 rounded border-neutral-300 text-primary-green focus:ring-primary-green/30" 
            />
            <span>
              Saya menyetujui <a href="#" className="font-semibold text-primary-green hover:underline">Ketentuan Layanan</a> dan <a href="#" className="font-semibold text-primary-green hover:underline">Kebijakan Privasi</a> TaniTech.
            </span>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="relative w-full py-3.5 px-4 rounded-xl bg-primary-green text-white font-bold text-base shadow-lg shadow-primary-green/20 hover:bg-[#4d6900] active:scale-[0.98] transition-all duration-200 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Baru</span>
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Switch Link */}
        <p className="mt-8 text-center text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <Link 
            to="/login" 
            className="font-bold text-primary-green hover:underline decoration-2 transition-all"
          >
            Masuk ke Akun Anda
          </Link>
        </p>
      </div>
    </div>
  );
}
