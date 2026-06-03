"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("Admin Demo");
  const [role, setRole] = useState("Superadmin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const u = localStorage.getItem("username");
      const r = localStorage.getItem("role");
      if (u) setUsername(u);
      if (r) setRole(r);
    };
    initAuth();
  }, []);

  const logout = () => { localStorage.clear(); router.push("/login"); };

  type NavItem = {
    name: string;
    path?: string;
    subItems?: { name: string; path: string }[];
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "TOPPI Log", path: "/toppi-log" },
    { name: "MQTT Log", path: "/mqtt-log" },
    { name: "Mapping", path: "/mapping" },
    { 
      name: "More", 
      subItems: [
        { name: "TOPPI", path: "/device-toppi" },
        { name: "Perusahaan", path: "/companies" },
      ]
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200/80 sticky top-0 z-50 shadow-sm shrink-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px]">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center shrink-0 cursor-pointer">
            <Image src="/assets/icon/toppi-black.png" alt="TOPPI Logo" width={80} height={28} className="h-[28px] w-auto object-contain hover:opacity-80 transition-opacity" style={{ width: 'auto' }} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(n => {
              if (n.subItems) {
                const isActive = n.subItems.some(sub => pathname === sub.path || pathname.startsWith(sub.path + "/"));
                return (
                  <div key={n.name} className="relative group h-full flex items-center">
                    <button className={`h-full flex items-center text-[14px] font-bold tracking-wide transition-all px-2 ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-700"}`}>
                      {n.name}
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F97316] rounded-t-full shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />}
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute top-[72px] left-0 mt-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                      <div className="p-2 space-y-1">
                        {n.subItems.map(sub => {
                          const isSubActive = pathname === sub.path || pathname.startsWith(sub.path + "/");
                          return (
                            <Link key={sub.name} href={sub.path} className={`block px-4 py-2.5 rounded-xl text-[13px] font-bold ${isSubActive ? "bg-orange-50 text-[#F97316]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"} transition-colors`}>
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = n.path ? (pathname === n.path || pathname.startsWith(n.path + "/")) : false;
              return (
                <Link key={n.name} href={n.path || "#"}
                  className={`h-full flex items-center text-[14px] font-bold tracking-wide transition-all relative px-2 ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                  {n.name}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F97316] rounded-t-full shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />}
                </Link>
              );
            })}
          </div>

          {/* Right Side (User Profile Dropdown) */}
          <div className="hidden md:flex items-center gap-5 shrink-0 relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors focus:outline-none"
            >
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-tr from-gray-100 to-white flex items-center justify-center shadow-inner border border-gray-200">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="flex flex-col items-start justify-center text-left">
                <span className="text-[13px] font-bold text-gray-800 leading-none mb-1">{username}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{role}</span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Backdrop for closing */}
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute top-[56px] right-0 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden transform transition-all">
                  <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{username}</p>
                  </div>
                  
                  <div className="p-2 border-b border-gray-100">
                    {["RAW-DEV-V1", "RAW-PROD-V1", "RAW-STAG-V2", "RAW-PROD-V2"].map((acc) => (
                      <button key={acc} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors text-left">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="text-sm font-bold">{acc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); window.location.reload(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <span className="text-sm font-bold">REFRESH PAGE</span>
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left mt-1"
                    >
                      <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="text-sm font-bold">LOG OUT</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white absolute top-[72px] left-0 right-0 shadow-lg max-h-[calc(100vh-72px)] overflow-y-auto">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map(n => {
              if (n.subItems) {
                return (
                  <div key={n.name} className="py-2">
                    <button 
                      onClick={() => setIsMoreOpen(!isMoreOpen)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide text-gray-500 hover:bg-gray-50"
                    >
                      <span>{n.name}</span>
                      <svg className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isMoreOpen && (
                      <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-orange-100 ml-4 mt-1">
                        {n.subItems.map(sub => {
                          const isSubActive = pathname === sub.path || pathname.startsWith(sub.path + "/");
                          return (
                            <Link key={sub.name} href={sub.path} onClick={() => setIsMobileMenuOpen(false)}
                              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-wide ${isSubActive ? "bg-orange-50 text-[#F97316]" : "text-gray-500 hover:bg-gray-50"}`}>
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = n.path ? (pathname === n.path || pathname.startsWith(n.path + "/")) : false;
              return (
                <Link key={n.name} href={n.path || "#"} onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide ${isActive ? "bg-orange-50 text-[#F97316]" : "text-gray-500 hover:bg-gray-50"}`}>
                  {n.name}
                </Link>
              );
            })}
            <div className="border-t border-gray-100 my-2 pt-2">
              <button onClick={logout} className="block w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
