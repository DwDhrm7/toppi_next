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
    { name: "MQTT Export", path: "/mqtt-export" },
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
            <Image src="/assets/icon/toppi-black.png" alt="TOPPI Logo" width={80} height={28} className="h-[28px] w-auto object-contain hover:opacity-80 transition-opacity" />
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

          {/* Right Side (User & Logout) */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-tr from-gray-100 to-white flex items-center justify-center shadow-inner border border-gray-200">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="text-[13px] font-bold text-gray-800 leading-none mb-1">{username}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{role}</span>
              </div>
            </div>
            <button onClick={logout}
              className="bg-[#F97316] hover:bg-[#E85D04] text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-[0_4px_12px_-4px_rgba(249,115,22,0.4)] active:scale-[0.98]">
              Keluar
            </button>
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
