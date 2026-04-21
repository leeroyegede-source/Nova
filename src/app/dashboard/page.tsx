"use client";

import { useState, useEffect } from "react";
import { 
  Terminal, Search, Copy, Check, LogOut, Code2, 
  Settings, Database, Mail, FileText, LayoutDashboard, Play, Globe, Blocks
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!localStorage.getItem("nova_auth_token")) {
      router.push("/login");
    } else {
      setTimeout(() => setIsAuthenticated(true), 0);
    }
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("nova_auth_token");
    router.push("/login");
  };

  if (!isAuthenticated) return null;

  const codeSnippets = {
    ocr: `import { extractDocumentText } from '@/lib/integrations';

// Execute this inside any Server Action or API Route Handler
export async function handleInvoiceUpload(formData: FormData) {
  const file = formData.get('document') as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const data = await extractDocumentText(buffer, file.type);
  console.log("Extracted AI Text:", data.extractedText);
  return data;
}`,
    email: `import { sendSystemEmail } from '@/lib/integrations';

// Call this from standard Server Actions to notify users
export async function alertUser(email: string) {
  await sendSystemEmail(
    email,
    "Urgent: Action Required",
    "<h1>Please review your account details immediately.</h1>"
  );
}`,
    db: `import { createClient } from '@/utils/supabase/server';

export async function fetchUserData() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data: userConfigs } = await supabase
    .from('configs')
    .select('*')
    .eq('user_id', session?.user.id);
    
  return userConfigs;
}`,
    api: `import { executeApiCall } from '@/lib/integrations';

// Dispatch a secure REST API call to any external service
export async function triggerExternalWebhook() {
  const response = await executeApiCall(
    'https://api.stripe.com/v1/customers', 
    'POST', 
    { metadata: { origin: 'nova_app' } }
  );
  
  if(response.success) {
    console.log("External service triggered!", response.data);
  }
}`,
    oauth: `import { connectPlatformAccount } from '@/lib/integrations';

// Exchange OAuth tokens dynamically to harness third-party platform functionalities
export async function linkExternalPlatform(authCode: string) {
  const integration = await connectPlatformAccount('stripe', authCode);
  
  if (integration.success) {
    // You now possess the Stripe/Google/Slack access_token to begin commanding their functionality APIs.
    console.log("Platform Access Unlocked:", integration.payload.access_token);
    
    // Save to database logic goes here...
  }
}`
  };

  return (
    <div className="flex h-screen bg-black text-white relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar Workspace Menu */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-md">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Nova Workspace</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Workspace Overview
              </button>
              <button 
                onClick={() => router.push('/playground')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Play className="w-4 h-4 text-purple-400" /> Open App Builder (IDE)
              </button>
            </nav>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Backend Tools</div>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('ocr')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'ocr' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <FileText className="w-4 h-4" /> OCR Vision API
              </button>
              <button 
                onClick={() => setActiveTab('email')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'email' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Mail className="w-4 h-4" /> Email SMTP Tool
              </button>
              <button 
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'api' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Globe className="w-4 h-4" /> API Gateway Caller
              </button>
              <button 
                onClick={() => setActiveTab('oauth')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'oauth' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Blocks className="w-4 h-4" /> 3rd-Party App Integrator
              </button>
              <button 
                onClick={() => setActiveTab('db')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'db' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Database className="w-4 h-4" /> Database Schema Integrator
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium rounded-lg text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Control Pane */}
      <main className="flex-1 overflow-y-auto bg-black relative z-10 flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Workspace</span>
            <span className="mx-2">/</span>
            <span className="text-white capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : `${activeTab.toUpperCase()} Integration`}
            </span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search workspace..."
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm outline-none focus:border-blue-500/50 w-64"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-6xl mx-auto w-full flex-grow">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back.</h1>
                    <p className="text-gray-400">Your personal app workspace is healthy. Ready to build.</p>
                  </div>
                  <button 
                    onClick={() => router.push('/playground')}
                    className="button-gradient px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Start New App Build
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400"><Code2 className="w-5 h-5" /></div>
                    <div className="text-sm text-gray-400 mb-1">Generated Apps</div>
                    <div className="text-3xl font-bold">14</div>
                  </div>
                  <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400"><FileText className="w-5 h-5" /></div>
                    <div className="text-sm text-gray-400 mb-1">OCR AI Documents Processed</div>
                    <div className="text-3xl font-bold">2,109</div>
                  </div>
                  <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400"><Mail className="w-5 h-5" /></div>
                    <div className="text-sm text-gray-400 mb-1">Emails Sent</div>
                    <div className="text-3xl font-bold">482</div>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Quick Integrations</h2>
                <p className="text-gray-400 text-sm mb-6">Need to drop backend functionality into an app you're building? Select a tool from the sidebar to instantly grab the logical integration code.</p>
              </motion.div>
            )}

            {/* OCR PANEL */}
            {activeTab === 'ocr' && (
              <motion.div 
                key="ocr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Gemini AI Vision Engine</h1>
                  <p className="text-gray-400 max-w-2xl">Use this code snippet inside any of your Next.js Server Components or API Routes to instantly leverage your globally connected Gemini 1.5 Vision model for reading images and extracting raw text securely.</p>
                </div>
                
                <div className="glass-panel border-white/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.ocr, 'ocr')}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-gray-300"
                    >
                      {copiedStates['ocr'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-400">components/InvoiceUploader.tsx</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">Ready to Copy</span>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-blue-200">
                    {codeSnippets.ocr}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* EMAIL PANEL */}
            {activeTab === 'email' && (
              <motion.div 
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Resend Transactional Utility</h1>
                  <p className="text-gray-400 max-w-2xl">Paste this logic into your backend routes or Server Actions to instantly beam emails to users utilizing your unified .env API key routing.</p>
                </div>
                
                <div className="glass-panel border-white/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.email, 'email')}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-gray-300"
                    >
                      {copiedStates['email'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-400">actions/alerts.ts</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">Ready to Copy</span>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-green-200">
                    {codeSnippets.email}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* DB PANEL */}
            {activeTab === 'db' && (
              <motion.div 
                key="db"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                    <Database className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Supabase Session Hydration</h1>
                  <p className="text-gray-400 max-w-2xl">A foolproof blueprint executing safe Row-Level Security checks over your authenticated user state during Component mounting.</p>
                </div>
                
                <div className="glass-panel border-white/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.db, 'db')}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-gray-300"
                    >
                      {copiedStates['db'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-400">components/UserProfile.tsx</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">Ready to Copy</span>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-gray-200">
                    {codeSnippets.db}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* API CALLER PANEL */}
            {activeTab === 'api' && (
              <motion.div 
                key="api"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6 border border-orange-500/30">
                    <Globe className="w-6 h-6 text-orange-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Secure Weblink API Gateway</h1>
                  <p className="text-gray-400 max-w-2xl">Use this orchestrator to make generic REST API calls (like Webhooks, Stripe billing triggers, or external Data fetches) cleanly. The proxy layer masks your API tokens natively on the server.</p>
                </div>
                
                <div className="glass-panel border-white/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.api, 'api')}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-gray-300"
                    >
                      {copiedStates['api'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-400">lib/gateway.ts</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">Ready to Copy</span>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-orange-200">
                    {codeSnippets.api}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* OAUTH INTEGRATOR PANEL */}
            {activeTab === 'oauth' && (
              <motion.div 
                key="oauth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 border border-pink-500/30">
                    <Blocks className="w-6 h-6 text-pink-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">3rd-Party Platform Integrator</h1>
                  <p className="text-gray-400 max-w-2xl">Effortlessly unlock the full functionalities of native external systems (like Stripe, Google APIs, Slack, GitHub). This snippet exchanges user authorization codes natively behind the server, issuing you an Access Token to drive their API architectures.</p>
                </div>
                
                <div className="glass-panel border-white/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.oauth, 'oauth')}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-gray-300"
                    >
                      {copiedStates['oauth'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-400">actions/platform-connect.ts</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">Ready to Copy</span>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-pink-200">
                    {codeSnippets.oauth}
                  </pre>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
