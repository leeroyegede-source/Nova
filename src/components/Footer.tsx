import Link from "next/link";
import { Sparkles, Globe, MessageCircle, Rss } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">NovaAI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The autonomous agent that builds your web and mobile applications, bundled with complete backend infrastructure.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Rss className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#features" className="text-gray-400 text-sm hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 text-sm hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Community</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-gray-400 text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} NovaAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Designed with</span>
            <span className="text-red-500">♥</span>
            <span>for the future.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
