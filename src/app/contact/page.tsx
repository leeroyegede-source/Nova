"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left Side - Info */}
        <div className="flex-1 lg:max-w-md">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h1>
            <p className="text-lg text-gray-400 mb-12">
              Have questions about our enterprise plans, custom models, or need technical support? Our team is here to help.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Chat with sales</h3>
                  <p className="text-gray-400 text-sm mb-2">Speak directly with our enterprise team about your use case.</p>
                  <span className="text-blue-400 text-sm font-medium">SEARCH4LEE</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Technical Support</h3>
                  <p className="text-gray-400 text-sm mb-2">Help migrating from OpenAI or debugging integration issues.</p>
                  <a href="#" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">support@nova-ai.dev</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Headquarters</h3>
                  <p className="text-gray-400 text-sm">
                    NO.5 DR SC EGEDE CRESCENT,<br />
                    UDU DELTA STATE<br />
                    Nigeria
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-8 md:p-10 border border-white/10"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane" 
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Work Email</label>
                <input 
                  type="email" 
                  placeholder="jane@company.com" 
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Subject</label>
                <select className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all appearance-none cursor-pointer">
                  <option value="sales">Enterprise Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about your project and needs..." 
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all placeholder:text-gray-600 resize-none"
                />
              </div>

              <button className="w-full py-4 rounded-xl button-gradient font-medium text-white flex items-center justify-center gap-2">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
