"use client";

import Link from "next/link";
import { Sparkles, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the login is an admin
    if (email === "admin@nova.ai") {
      localStorage.setItem("nova_auth_token", "admin_authenticated");
      router.push("/admin");
    } else {
      localStorage.setItem("nova_auth_token", "authenticated");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-10 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Enter your details to access your account</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600"
              />
            </div>
            
            <button className="w-full py-3 mt-4 rounded-xl button-gradient font-medium text-white">
              Sign In
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-grow" />
            <span className="text-xs text-gray-500 uppercase">Or continue with</span>
            <div className="h-px bg-white/10 flex-grow" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
              <Globe className="w-4 h-4" /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account? <Link href="/signup" className="text-white font-medium hover:text-blue-400 transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
