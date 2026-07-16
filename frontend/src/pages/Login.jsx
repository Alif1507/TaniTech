import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { loginUser, saveSession } from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const data = await loginUser(email, password);
      saveSession(data.access_token, data.profile);
      setSuccess(true);
      setTimeout(() => {
        // Redirect to dashboard or landing page
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-[#f7f9f4] grid-bg overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-green/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-neutral-100 p-8 rounded-3xl shadow-xl shadow-primary-green/5 animate-fade-in relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-primary-green transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Brand/Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-green/10 mb-4">
            <LogIn className="w-8 h-8 text-primary-green" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-display">Selamat Datang</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Masuk ke akun <span className="font-semibold text-primary-green">TaniTech</span> Anda
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-secondary-green/10 border border-secondary-green/20 flex items-start gap-3 animate-fade-in">
            <span className="text-xl">🎉</span>
            <div className="text-sm font-medium text-primary-green">
              Login Berhasil! Mengalihkan Anda...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
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

          {/* Password input */}
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
                placeholder="••••••••"
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

          {/* Remember & Forgot options */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-neutral-300 text-primary-green focus:ring-primary-green/30" 
              />
              <span>Ingat saya</span>
            </label>
            <a href="#" className="font-semibold text-primary-green hover:text-primary-green/80 transition-colors">
              Lupa kata sandi?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="relative w-full py-3.5 px-4 rounded-xl bg-primary-green text-white font-bold text-base shadow-lg shadow-primary-green/20 hover:bg-[#4d6900] active:scale-[0.98] transition-all duration-200 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 overflow-hidden group"
          >
            {/* Glossy overlay effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-neutral-500">
          Belum punya akun?{" "}
          <Link 
            to="/register" 
            className="font-bold text-primary-green hover:underline decoration-2 transition-all"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
