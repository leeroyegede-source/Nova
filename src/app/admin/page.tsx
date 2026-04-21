"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Server, Zap, Shield, ArrowUpRight, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Basic Admin Authorization Validation Guard
    const auth = localStorage.getItem("nova_auth_token");
    if (auth !== "admin_authenticated") {
      router.push("/login");
    } else {
      setTimeout(() => setIsAdmin(true), 0);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("nova_auth_token");
    router.push("/login");
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col pt-24 px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">Nova OS Console <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span></h1>
              <p className="text-gray-400">System architecture health and global metrics.</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10 rounded-lg text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> End Admin Session
          </button>
        </header>

        {/* Core Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel p-6 border border-white/10">
            <div className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Registered Users</div>
            <div className="text-4xl font-bold mb-2">12,408</div>
            <div className="text-sm text-green-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +240 this week</div>
          </div>
          <div className="glass-panel p-6 border border-white/10">
            <div className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2"><Server className="w-4 h-4" /> Active Sub-Apps</div>
            <div className="text-4xl font-bold mb-2">5,192</div>
            <div className="text-sm text-green-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +84 this week</div>
          </div>
          <div className="glass-panel p-6 border border-white/10 border-blue-500/30 bg-blue-900/10">
            <div className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Global Gateway RPS</div>
            <div className="text-4xl font-bold text-white mb-2">~ 4.2k</div>
            <div className="text-sm text-gray-400">Stable Node Allocation</div>
          </div>
          <div className="glass-panel p-6 border border-white/10 border-red-500/30 bg-red-900/10">
            <div className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Active Incidents</div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-green-400">All systems operational</div>
          </div>
        </div>

        {/* Config & Security settings */}
        <div className="glass-panel border border-white/10 p-8 flex flex-col flex-grow">
          <h2 className="text-xl font-bold mb-6">Service API Configurations</h2>
          
          <div className="space-y-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold mb-1">Gemini Vision Master Key</h3>
                <p className="text-sm text-gray-400">Controls the global quota for all OCR AI extractions.</p>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-2 text-white border border-white/10">
                Update Key <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold mb-1">Resend SMTP Relay Master Key</h3>
                <p className="text-sm text-gray-400">Handles global transactional email allocations per sub-tenant app.</p>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-2 text-white border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Key Active
              </button>
            </div>

            <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold mb-1">AWS IAM & Supabase Master Roles</h3>
                <p className="text-sm text-gray-400">Permissions bridging the Builder Node network into isolated DB schemas.</p>
              </div>
              <button className="whitespace-nowrap px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                Manage Roles
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
