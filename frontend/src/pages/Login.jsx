import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser, saveSession } from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      saveSession(data.access_token, data.profile);
      navigate("/");
    } catch (err) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-display font-black text-3xl text-[#5E8000]">
              AGRI<span className="text-[#A1C942]">VO</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-neutral-500">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-neutral-700">Password</label>
                <a href="#" className="text-xs text-[#5E8000] font-semibold hover:underline">Lupa password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center mt-5 text-sm text-neutral-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-[#5E8000] hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
