"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exclude Navbar and Footer on Workspace routes that require 100vh Full-Screen layouts
  const isWorkspace = pathname?.startsWith('/playground') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <>
      {!isWorkspace && <Navbar />}
      <main className="flex-grow flex flex-col">{children}</main>
      {!isWorkspace && <Footer />}
    </>
  );
}
