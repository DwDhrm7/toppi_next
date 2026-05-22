"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-[#E2542E]">
      <Image
        src="/assets/icon/toppi-white.png"
        alt="TOPPI Logo"
        width={300}
        height={120}
        className="h-[120px] w-auto object-contain"
      />
    </div>
  );
}
