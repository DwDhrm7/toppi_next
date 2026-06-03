"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { loginAsync, isLoading: loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      await loginAsync({ login: email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans antialiased text-gray-800">
      {/* LEFT — Hero Image (Clean, Full Height) */}
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-gray-100">
        <Image
          src="/assets/images/login-bg.png"
          alt="TOPPI Smart Water Meter"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        />
        {/* Elegant overlay for better integration */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
      </div>

      {/* RIGHT — Premium Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 relative bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] z-10">

        <div className="w-full max-w-[440px] flex flex-col justify-center h-full">

          {/* Logo Section */}
          <div className="mb-14">
            <Image
              src="/assets/icon/toppi-black.png"
              alt="TOPPI Logo"
              width={100}
              height={40}
              className="h-10 w-auto object-contain mb-8"
              style={{ width: 'auto' }}
            />
            <h1 className="text-[2.25rem] font-bold text-gray-900 leading-tight tracking-tight mb-2">
              Masuk ke Dashboard
            </h1>
            <p className="text-gray-500 text-[15px] font-medium">
              Gunakan akun yang terdaftar di sistem.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3.5 rounded-xl mb-6 flex items-center gap-3 shadow-sm font-medium">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3.5 rounded-xl mb-6 flex items-center gap-3 shadow-sm font-medium">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">

            {/* Email Field */}
            <div className="flex flex-col">
              <label htmlFor="login-email" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 pl-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full px-5 py-4 border border-gray-200/80 rounded-2xl text-[15px] text-gray-900 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 placeholder-gray-300 transition-all bg-gray-50/50 hover:bg-gray-50 font-medium"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <label htmlFor="login-password" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-5 py-4 border border-gray-200/80 rounded-2xl text-[15px] text-gray-900 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 placeholder-gray-300 transition-all bg-gray-50/50 hover:bg-gray-50 font-medium pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  {showPwd
                    ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#E85D04] hover:from-[#E85D04] hover:to-[#D00000] text-white font-bold py-4 rounded-2xl text-[15px] transition-all duration-300 active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(249,115,22,0.4)] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Masuk"
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-center text-[12px] font-medium text-gray-400">
          © 2026 PT. Bima Sakti Sanjaya <span className="mx-2 opacity-40">•</span> ver 1.0.0
        </div>
      </div>
    </div>
  );
}
