"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Monitor, Smartphone, Code2, Database, 
  Play, Search, Send, Sparkles, LayoutTemplate,
  Loader2, CheckCircle2, ChevronRight, Download, Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATE_REGISTRY } from "@/lib/templates";
import { Sandpack } from "@codesandbox/sandpack-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Mock AI simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Playground() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: 'Initialize Nova OS. Waiting for instructions. You can select a template or describe your app manually.' }
  ]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'database'>('preview');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [searchTemplate, setSearchTemplate] = useState("");

  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NovaAppExport.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !generatedCode) {
      const saved = localStorage.getItem('nova_saved_project');
      if (saved) {
        setGeneratedCode(saved);
        setShowPreview(true);
      }
    }
  }, []);

  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const auth = localStorage.getItem("nova_auth_token");
    if (!auth) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => { scrollToBottom() }, [messages, isBuilding]);

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || isBuilding) return;
    
    const userMessage = prompt;
    setPrompt("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsBuilding(true);
    setShowPreview(false);

    // AI Simulation Sequence
    await sleep(800);
    setMessages(prev => [...prev, { role: 'agent', content: 'Analyzing architecture requirements...' }]);
    
    await sleep(1000);
    setMessages(prev => [...prev, { role: 'agent', content: 'Bootstrapping application (Next.js + TailwindCSS + Supabase)...' }]);
    
    await sleep(1500);
    setGeneratedSchema(`
-- Auto-generated Supabase Schema for requested App
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  ocr_content TEXT,
  file_url TEXT,
  parsed_at TIMESTAMP
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own docs" ON documents FOR SELECT USING (auth.uid() = user_id);
    `.trim());

    setMessages(prev => [...prev, { role: 'agent', content: 'Agent synthesizing logic. Compiling codebase via Nova AI...' }]);
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, currentCode: generatedCode || null })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to synthesize app structure.'));
      }
      
      setGeneratedCode(data.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova_saved_project', data.code);
      }
      setMessages(prev => [...prev, { role: 'agent', content: 'Build complete. Infrastructure resolved globally. Booting Sandpack WebContainer...' }]);
      
      await sleep(500);
      setIsBuilding(false);
      setShowPreview(true);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'agent', content: `CRITICAL ERROR: ${e.message}` }]);
      setIsBuilding(false);
    }
  };

  const handleTemplateSelect = (templateName: string) => {
    setPrompt(`Build the ${templateName} template.`);
  };

  const filteredTemplates = TEMPLATE_REGISTRY.filter(t => 
    t.name.toLowerCase().includes(searchTemplate.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTemplate.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Playground Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-md">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Nova OS Playground</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2"><Play className="w-4 h-4" /> Preview</div>
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2"><Code2 className="w-4 h-4" /> Code</div>
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Schema</div>
            </button>
            <button 
              onClick={handleDownload}
              className={`ml-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-500/20`}
            >
              <div className="flex items-center gap-2"><Download className="w-4 h-4" /> Export Code</div>
            </button>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20">
            N
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel - Chat / Agent Output */}
        <div className="w-full md:w-[400px] lg:w-[500px] border-r border-white/10 flex flex-col bg-black/20 shrink-0">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 font-mono text-xs font-bold">
                    [N]
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isBuilding && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm italic rounded-tl-sm">
                  Agent is writing code...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry Area */}
          <div className="p-4 bg-black/40 border-t border-white/10">
            <div className="relative">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePromptSubmit();
                  }
                }}
                placeholder="Describe the app you want to build..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-blue-500/50 text-sm text-white resize-none h-20"
              />
              <button 
                onClick={handlePromptSubmit}
                disabled={!prompt.trim() || isBuilding}
                className="absolute right-3 bottom-3 p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd> to build</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> Powered by Nova-7</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Editors / Preview window */}
        <div className="flex-1 bg-[#09090b] relative overflow-hidden flex flex-col">
          
          {/* Template Registry Overlay (shows if no preview available) */}
          {!showPreview && !isBuilding && generatedCode === "" && (
            <div className="absolute inset-0 z-20 flex flex-col bg-black/40 backdrop-blur-sm p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-blue-400" /> Pre-Configured Architectures</h2>
                    <p className="text-gray-400">Select a template or simply type your desired flow into the agent console.</p>
                  </div>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search templates..."
                      value={searchTemplate}
                      onChange={(e) => setSearchTemplate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Capabilities Matrix */}
                <div className="mb-12">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Natively Supported AI Automations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[
                      { name: "Page / Website Builder", desc: "Landing pages, layouts, nav." },
                      { name: "App / Flow Builder", desc: "Multi-step journeys, conditional steps." },
                      { name: "Database Builder", desc: "Tables, relations, audit logs." },
                      { name: "Workflow Engine", desc: "Scoring, branching, triggers." },
                      { name: "Auth / Roles System", desc: "Login, admin access, RBAC." },
                      { name: "File Upload / Storage", desc: "Images, docs, certificates." },
                      { name: "Integrations Layer", desc: "Maps, OTP, payments, emails." },
                      { name: "Automation Trigger", desc: "Background notifications, status updates." },
                      { name: "Document / PDF Gen", desc: "Certificates, QR outputs." },
                      { name: "API / Webhook Builder", desc: "Serverless endpoints mapping." },
                      { name: "Admin Dashboard", desc: "Review screens, metrics." },
                      { name: "Dynamic Page Builder", desc: "Slug routes like /verify/:id." },
                    ].map((cap, i) => (
                      <div key={i} className="flex flex-col p-3 rounded-lg bg-blue-900/10 border border-blue-500/20">
                        <span className="text-sm font-bold text-blue-100">{cap.name}</span>
                        <span className="text-[10px] text-gray-400 mt-1">{cap.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.slice(0, 12).map(tpl => (
                    <div 
                      key={tpl.id} 
                      onClick={() => handleTemplateSelect(tpl.name)}
                      className="glass-panel p-5 border border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 font-medium">{tpl.category}</span>
                        <div className="flex gap-1">
                          {tpl.database === "Supabase" && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Supabase" />}
                          {tpl.database === "Firebase" && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Firebase" />}
                        </div>
                      </div>
                      <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{tpl.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{tpl.description}</p>
                    </div>
                  ))}
                </div>
                
                {filteredTemplates.length > 12 && (
                  <div className="mt-8 text-center text-gray-500 text-sm">
                    Scroll or search to view {filteredTemplates.length - 12} more templates...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Workspaces */}
          {activeTab === 'preview' && showPreview && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-opacity-20 relative">
              <div className="absolute top-4 right-4 flex bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 z-10">
                <button 
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded ${deviceView === 'desktop' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                ><Monitor className="w-4 h-4" /></button>
                <button 
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded ${deviceView === 'mobile' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                ><Smartphone className="w-4 h-4" /></button>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 border border-white/20 ${
                  deviceView === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full max-w-5xl h-[700px]'
                }`}
              >
                {/* Live Sandpack execution of real react strings mapped directly without static DOM */}
                <div className="h-full w-full flex-1">
                  <ErrorBoundary>
                    <Sandpack 
                      theme="dark" 
                      template="react" 
                      files={{
                        "/App.js": generatedCode,
                        "/public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
                        "/NovaBackend.js": `
// AUTO-GENERATED NOVA BACKEND SDK
// This bridges the internal 12 automation tools seamlessly into Sandpack.

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getStore = (key) => JSON.parse(localStorage.getItem(\`nova_\${key}\`) || '[]');
const setStore = (key, data) => localStorage.setItem(\`nova_\${key}\`, JSON.stringify(data));

export const nova = {
  db: {
    insert: async (table, data) => { 
      await delay(300);
      const store = getStore(table);
      const record = { id: Math.random().toString(36).substr(2, 9), ...data, created_at: new Date().toISOString() };
      setStore(table, [...store, record]);
      console.log(\`[Nova DB] Inserted into \${table}:\`, record); 
      return { success: true, data: record }; 
    },
    select: async (table, query) => { 
      await delay(200);
      console.log(\`[Nova DB] Queried \${table}\`); 
      return { data: getStore(table) }; 
    },
    update: async (table, id, data) => { 
      await delay(300);
      const store = getStore(table);
      const updated = store.map(row => row.id === id ? { ...row, ...data } : row);
      setStore(table, updated);
      console.log(\`[Nova DB] Updated \${table} [\${id}]\`); 
      return { success: true }; 
    },
    delete: async (table, id) => { 
      await delay(300);
      setStore(table, getStore(table).filter(r => r.id !== id));
      console.log(\`[Nova DB] Deleted \${table} [\${id}]\`); 
      return { success: true }; 
    }
  },
  auth: {
    signUp: async (email, password) => { await delay(500); console.log(\`[Nova Auth] Signed up \${email}\`); return { user: { id: "u_123", email } }; },
    signIn: async (email, password) => { await delay(500); console.log(\`[Nova Auth] Signed in \${email}\`); return { user: { id: "u_123", email } }; },
    signOut: async () => { await delay(200); console.log('[Nova Auth] Signed out'); return true; }
  },
  storage: {
    upload: async (bucket, file) => { await delay(800); console.log(\`[Nova Storage] Uploaded to \${bucket}:\`, file.name); return { url: \`https://nova-storage.com/\${file.name}\` }; }
  },
  automation: {
    triggerEmail: async (to, subject, body) => { await delay(400); console.log(\`[Nova Automation] 📨 Email sent to \${to}: \${subject}\`); return true; },
    fireWebhook: async (url, payload) => { await delay(400); console.log(\`[Nova Automation] 🪝 Webhook fired to \${url}\`); return true; },
  },
  pdf: {
    generate: async (elementId) => { await delay(600); console.log(\`[Nova PDF] 📄 PDF Generated from DOM ID \${elementId}\`); return "blob:pdf-url"; }
  },
  workflow: {
    executeStatusChange: async (recordId, newStatus) => { await delay(300); console.log(\`[Nova Workflow] ⚙️ Status for \${recordId} changed to \${newStatus}\`); return true; }
  }
};
`
                      }}
                      options={{ 
                        showNavigator: true, 
                        showTabs: false,
                        editorHeight: "100%",
                        classes: {
                          "sp-wrapper": "h-full w-full",
                          "sp-layout": "h-full w-full",
                          "sp-card": "h-[660px]" // Forces inner container to mimic browser height
                        }
                      }} 
                    />
                  </ErrorBoundary>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm">
              <pre className="text-gray-300">
                <code dangerouslySetInnerHTML={{ __html: generatedCode || "// Waiting for Agent generation..." }} />
              </pre>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm">
              <div className="mb-4 text-xs font-sans text-gray-500 bg-white/5 border border-white/10 rounded p-3">
                <strong className="text-blue-400">Architecture Engine:</strong> The agent automatically creates logical schema blueprints corresponding to the frontend data needs, instantly pushing them to managed Supabase clusters via GraphQL APIs.
              </div>
              <pre className="text-gray-300">
                <code dangerouslySetInnerHTML={{ __html: generatedSchema || "-- Waiting for Schema generation..." }} />
              </pre>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
