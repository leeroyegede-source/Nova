"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code2, Smartphone, Mail, FileText, Zap, Blocks, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  { icon: <Blocks className="w-6 h-6 text-blue-400" />, title: "Agentic App Builder", description: "Describe your app, and our AI agent builds the full stack: Frontend, Backend, and Database." },
  { icon: <Smartphone className="w-6 h-6 text-indigo-400" />, title: "Web & Mobile Ready", description: "Instantly generate responsive web applications and cross-platform mobile apps (React Native)." },
  { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: "API Gateway System", description: "Built-in API provisioning. Whenever your app needs an external API, our system automatically routes and scales it." },
  { icon: <Mail className="w-6 h-6 text-pink-400" />, title: "Integrated Email Service", description: "Out-of-the-box infrastructure for transactional emails, login verifications, and user notifications." },
  { icon: <FileText className="w-6 h-6 text-teal-400" />, title: "AI OCR Integration", description: "Easily plug in advanced AI document extraction and OCR APIs directly into your generated applications." },
  { icon: <Code2 className="w-6 h-6 text-purple-400" />, title: "Full Code Ownership", description: "You own the generated code. Export it, modify it, and deploy anywhere you choose." }
];

const faqs = [
  { question: "Can I build both web and mobile apps?", answer: "Yes! The agent can build Next.js/React web applications as well as React Native mobile applications simultaneously from the same prompt." },
  { question: "How does the built-in API system work?", answer: "When your app requests external functionality (like weather, payments, or specialized AI), our platform acts as an API gateway, securely managing requests and keys so you don't have to build intermediate backends." },
  { question: "Is the email system ready to use?", answer: "Absolutely. Login notifications, magic links, and transactional emails are automatically orchestrated for the apps you build." },
  { question: "Are my documents secure with the OCR system?", answer: "We enforce strict zero-data-retention policies on all API and OCR requests. Your documents are processed in memory and immediately discarded." }
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            V3 Agent Builder is Online
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            The AI Agent that <br className="hidden md:block" />
            <span className="text-gradient">builds software for you</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Prompt sophisticated web and mobile apps into existence. Pre-integrated with Email Systems, an automated API Gateway, and highly advanced OCR pipelines.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/playground" className="w-full sm:w-auto px-8 py-4 rounded-full button-gradient font-medium text-lg flex items-center justify-center gap-2">
              Start building your app <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Product Preview */}
      <section id="preview" className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-gray-500 ml-4 font-mono">Agentic Generation Interface</div>
          </div>
          <div className="p-6 md:p-10 bg-black/60 font-mono text-sm leading-relaxed flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="text-gray-400">{'// User Prompt'}</div>
              <div className="text-yellow-300">"Build me a Mobile SaaS app for document management. It needs user auth, email notifications, and an AI OCR feature to extract text from uploaded invoices."</div>
              <div className="text-gray-500 mt-4 animate-pulse">Agent is thinking...</div>
              
              <div className="text-blue-400 mt-2">{'▶'} Provisioning Next.js frontend...</div>
              <div className="text-blue-400">{'▶'} Generating React Native mobile app...</div>
              <div className="text-green-400">{'▶'} Integrating Notification System (Email via SMTP)...</div>
              <div className="text-purple-400">{'▶'} Orchestrating AI OCR Gateway Pipeline...</div>
              <div className="text-white font-bold mt-4">✓ Deployment Ready!</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built-in Infrastructure</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our agent doesn't just write frontend code. It wires up the backend services required for production apps to function flawlessly from day one.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={fadeIn} className="glass-panel p-8 hover:bg-white/[0.08] transition-colors group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-black relative border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">From idea to functional app in minutes</h2>
            <p className="text-gray-400 text-lg">We abstract away the backend complexity and the boilerplate code.</p>
          </div>

          <div className="space-y-16">
            {[
              { step: "01", title: "Describe your Vision", desc: "Use natural language to explain the web or mobile app you want our agent to build." },
              { step: "02", title: "Agent Provisioning", desc: "Our platform writes the code, connects the database, and secures API pathways (OCR, Email, Auth)." },
              { step: "03", title: "Deploy and Scale", desc: "Instantly publish your app to the web or an app store, powered entirely by our resilient API Gateway." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full border border-white/10 bg-white/5 text-3xl font-bold text-gray-500 shrink-0">
                  {item.step}
                </div>
                <div className="flex-grow glass-panel p-8 md:p-10 hover:border-white/20 transition-colors w-full">
                  <div className="md:hidden text-blue-500 font-bold mb-2">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently asked questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between font-medium text-left focus:outline-none"
              >
                <span className="text-lg">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-4xl h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to build your next startup?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Stop worrying about integrations and backend scaling. Let our agent build it for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/playground" className="px-10 py-5 rounded-full button-gradient font-bold text-lg inline-flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Enter the Playground
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
