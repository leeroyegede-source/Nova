"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Code2, Globe2 } from "lucide-react";

export default function About() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm mb-6"
        >
          <Globe2 className="w-4 h-4 text-blue-400" /> Our Mission
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Removing the friction from <span className="text-gradient">software creation</span>
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          NovaAI was founded on a simple premise: building production-ready apps shouldn’t require months of configuring backends or stitching together APIs. We've built an autonomous system that designs, writes, and deploys full-stack software from plain English.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-24">
        <div className="glass-panel p-10 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-4">The end of boilerplate</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            We realized that 80% of building a new application is just wiring things together: Setting up the database, plugging in email providers like SendGrid or AWS SES, connecting to an OCR API, configuring user authentication, and establishing an API gateway.
            <br /><br />
            Our Agentic Builder orchestrates all this in seconds. It writes the React code, creates the React Native app, and hooks them directly into our scalable backend infrastructure.
          </p>
        </div>

        <div className="glass-panel p-10 border border-white/10 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50k+</div>
              <div className="text-sm text-gray-400">Apps Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">3.2M</div>
              <div className="text-sm text-gray-400">Transactional Emails Sent</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10M+</div>
              <div className="text-sm text-gray-400">OCR Documents Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.99%</div>
              <div className="text-sm text-gray-400">Gateway Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">Our Global Infrastructure Network</h2>
        <div className="glass-panel w-full h-[400px] border border-white/10 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-contain opacity-20 filter invert" />
          
          <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse" />
          <div className="absolute top-[35%] left-[45%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[40%] left-[75%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="z-10 bg-black/60 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div className="text-left text-sm">
              <div className="font-bold text-white">Distributed App Gateway</div>
              <div className="text-gray-400">Your generated apps scale immediately across our global CDN.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Join our remote-first team</h2>
        <p className="text-xl text-gray-400 mb-8">
          We're looking for engineers who want to build the tools that build the next generation of software.
        </p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full button-gradient font-medium text-lg">
          View Open Roles <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
