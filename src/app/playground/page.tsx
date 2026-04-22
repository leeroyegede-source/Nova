"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Monitor, Smartphone, Code2, Database, 
  Play, Search, Send, Sparkles, LayoutTemplate,
  Loader2, CheckCircle2, ChevronRight, Download, Zap, Paperclip, X, Save, FolderOpen, Trash2, Image as ImageIcon, Settings, Upload,
  Wand2, Lock, CreditCard, Moon, MoreVertical, Server, Eye, Mail, Network, Plug, MessageSquare, Workflow, Briefcase, ShieldCheck, Key, Webhook
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATE_REGISTRY } from "@/lib/templates";
import { SandpackProvider, SandpackLayout, SandpackPreview, SandpackCodeEditor, useSandpack } from "@codesandbox/sandpack-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DatabasePreview from "@/components/DatabasePreview";
import { ReactFlow, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Mock AI simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function SandpackAutoHealer({ isBuilding, onHealTrigger }: { isBuilding: boolean, onHealTrigger: (msg: string) => void }) {
  const { sandpack } = useSandpack();
  
  useEffect(() => {
    if (!isBuilding && sandpack.error) {
       const timer = setTimeout(() => {
          if (sandpack.error) {
             const sysMsg = `[Automated Diagnostics]: The React compiler encountered a fatal exception during the build lifecycle.\n\nError Trace:\n${sandpack.error.message}\n\nAgent Instruction: Conduct a structured code review of the previous output. Isolate the regression (e.g. unclosed JSX tags, undeclared variables, React hook violations) and strictly emit the corrected modules. Maintain production architectural standards.`;
             onHealTrigger(sysMsg);
          }
       }, 2000);
       return () => clearTimeout(timer);
    }
  }, [sandpack.error, isBuilding]);

  return null;
}

export default function Playground() {
  const [prompt, setPrompt] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, content: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: 'Initialize Nova OS. Waiting for instructions. You can select a template or describe your app manually.' }
  ]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'database' | 'assets'>('preview');
  const [sandboxView, setSandboxView] = useState<'preview' | 'code'>('preview');
  const [previewEngine, setPreviewEngine] = useState<'sandpack' | 'database'>('database');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [projectAssets, setProjectAssets] = useState<{name: string, dataUrl: string}[]>([]);
  const [searchTemplate, setSearchTemplate] = useState("");
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [saveProjectName, setSaveProjectName] = useState("");
  const [deployProjectName, setDeployProjectName] = useState("");
  const [savedProjects, setSavedProjects] = useState<{id: string, name: string, code: string, messages: any[], timestamp: number}[]>([]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [brandContext, setBrandContext] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<'web' | 'mobile'>('web');
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubRepoName, setGithubRepoName] = useState("");
  const [githubToken, setGithubToken] = useState("");

  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = async () => {
    if (Object.keys(generatedFiles).length === 0) return;
    
    setMessages(prev => [...prev, { role: 'agent', content: `[SYSTEM WORKFLOW]: Packaging workspace into a ZIP archive...` }]);
    
    try {
      const zip = new JSZip();

      // Add all generated files to the ZIP
      for (const [path, content] of Object.entries(generatedFiles)) {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        zip.file(cleanPath, content);
      }

      // Automatically add a package.json if it doesn't exist to make it a valid project
      if (!generatedFiles['/package.json'] && !generatedFiles['package.json']) {
        zip.file('package.json', JSON.stringify({
          name: "nova-generated-app",
          version: "1.0.0",
          private: true,
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "lucide-react": "^0.263.1",
            "framer-motion": "^10.16.4"
          },
          scripts: {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
          },
          browserslist: {
            "production": [
              ">0.2%",
              "not dead",
              "not op_mini all"
            ],
            "development": [
              "last 1 chrome version",
              "last 1 firefox version",
              "last 1 safari version"
            ]
          }
        }, null, 2));
      }

      // Add the README.md with installation instructions
      const readmeContent = `# Nova AI Generated Project

This project was autonomously generated by Nova AI.

## Getting Started

1. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the Development Server**:
   \`\`\`bash
   npm start
   \`\`\`
   
## Hosting (cPanel / Shared Hosting)

If you are uploading this to a traditional cPanel or Shared Hosting environment, you will first need to build the project into static files.

1. Run the build command:
   \`\`\`bash
   npm run build
   \`\`\`
2. Zip the contents of the newly created \`build\` or \`dist\` directory.
3. Upload that zip file to your cPanel's \`public_html\` directory and extract it.

*Generated by Nova AI.*`;

      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `NovaApp_${Date.now()}.zip`);
      
      setMessages(prev => [...prev, { role: 'agent', content: `✅ **Download Successful!** Your code has been downloaded as a ZIP file.` }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'agent', content: `⚠️ **Download Failed:** ${e.message}` }]);
    }
  };

  const handleDeployVercel = async (e?: React.MouseEvent) => {
    if (Object.keys(generatedFiles).length === 0) {
      setMessages(prev => [...prev, { role: 'agent', content: "⚠️ **Deployment Error:** No active code architecture was found in the IDE workspace. Please generate or load an application first before deploying!"}]);
      return;
    }
    setDeployProjectName(`nova-app-${Date.now().toString().slice(-4)}`);
    setShowDeployModal(true);
  };

  const confirmDeployVercel = async () => {
    setShowDeployModal(false);
    if (!deployProjectName.trim()) return;

    // Auto-save verification sequence before edge deployment integration
    const currentCodeStr = JSON.stringify(generatedFiles);
    const isSavedAlready = savedProjects.some(p => p.code === currentCodeStr);
    if (!isSavedAlready) {
        const autoSaveName = deployProjectName + " (Auto-Saved pre-deploy)";
        const projects = [...savedProjects, { id: Date.now().toString(), name: autoSaveName, code: currentCodeStr, messages, timestamp: Date.now() }];
        setSavedProjects(projects);
        localStorage.setItem('nova_projects', JSON.stringify(projects));
        setMessages(prev => [...prev, { role: 'agent', content: `[SYSTEM NOTIFICATION]: Current workspace modifications automatically saved under '${autoSaveName}'.`}]);
    }

    setMessages(prev => [...prev, { role: 'agent', content: `[SYSTEM WORKFLOW]: Initiating secure edge deployment to Vercel REST infrastructure for project '${deployProjectName}'...\n\nPackaging multi-file environment...` }]);
    
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: generatedFiles, projectName: deployProjectName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");
      
      setMessages(prev => [...prev, { role: 'agent', content: `🔥 **Edge Deployment Successful!**\n\nThe Vercel cluster has successfully built your unified architecture.\n\n🔗 **Live URL:** [${data.url}](https://${data.url})` }]);
    } catch(e: any) {
      setMessages(prev => [...prev, { role: 'agent', content: `⚠️ **Deployment Terminated:** ${e.message}` }]);
    }
  };

  const confirmPushGithub = async () => {
    setShowGithubModal(false);
    if (!githubRepoName.trim() || !githubToken.trim()) return;

    setMessages(prev => [...prev, { role: 'agent', content: `[SYSTEM WORKFLOW]: Pushing workspace to GitHub repository '${githubRepoName}'...` }]);
    
    try {
      const res = await fetch('/api/deploy/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: generatedFiles, repoName: githubRepoName, token: githubToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GitHub push failed");
      
      setMessages(prev => [...prev, { role: 'agent', content: `✅ **GitHub Push Successful!**\n\nYour code is now in your repository.\n\n🔗 **Repo URL:** [${data.url}](${data.url})` }]);
    } catch(e: any) {
      setMessages(prev => [...prev, { role: 'agent', content: `⚠️ **Push Terminated:** ${e.message}` }]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(generatedFiles).length === 0) {
      const saved = localStorage.getItem('nova_saved_project_files');
      if (saved) {
         try {
            setGeneratedFiles(JSON.parse(saved));
            setShowPreview(true);
         } catch(e) {}
      }
    }
    
    // Load historical workspaces list
    if (typeof window !== 'undefined') {
      const projects = localStorage.getItem('nova_projects');
      if (projects) {
        try { setSavedProjects(JSON.parse(projects)); } catch(e) {}
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

  const handleClearProject = () => {
    setGeneratedFiles({});
    setMessages([]);
    setShowPreview(false);
    localStorage.removeItem('nova_saved_project_files');
    localStorage.removeItem('nova_saved_project_messages');
  };

  useEffect(() => { scrollToBottom() }, [messages, isBuilding]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Sent to conversational context
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            content: `[ATTACHED_IMAGE: ${result}]`
          }]);
          // Stored permanently in Asset Vault for coding
          setProjectAssets(prev => [...prev.filter(a => a.name !== file.name), {
            name: file.name,
            dataUrl: result
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            content: event.target?.result as string
          }]);
        };
        reader.readAsText(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProjectClick = () => {
    if (Object.keys(generatedFiles).length === 0 && messages.length <= 1) {
       alert("No workspace progress to save!");
       return;
    }
    setSaveProjectName(`Workspace - ${new Date().toLocaleDateString()}`);
    setShowSaveModal(true);
  };

  const confirmSaveProject = () => {
    if (!saveProjectName.trim()) return;
    
    const newProject = {
      id: Date.now().toString(),
      name: saveProjectName,
      code: JSON.stringify(generatedFiles),
      messages: messages,
      timestamp: Date.now()
    };
    
    const projects = [...savedProjects, newProject];
    setSavedProjects(projects);
    localStorage.setItem('nova_projects', JSON.stringify(projects));
    setShowSaveModal(false);
    
    // Add brief timeout to allow modal to close before alert blocks the thread
    setTimeout(() => {
      window.alert("Project saved successfully!");
    }, 100);
  };

  const loadProject = (project: any) => {
    try {
      setGeneratedFiles(JSON.parse(project.code));
    } catch {
      setGeneratedFiles({ "/App.js": project.code });
    }
    setMessages(project.messages);
    setShowPreview(true);
    setShowProjectsModal(false);
    localStorage.setItem('nova_saved_project_files', project.code);
  };

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('nova_projects', JSON.stringify(updated));
  };

  const handlePromptSubmit = async (overrideMessage?: string | React.MouseEvent) => {
    const userPrompt = typeof overrideMessage === 'string' ? overrideMessage : prompt.trim();
    if ((!userPrompt && uploadedFiles.length === 0) || isBuilding) return;
    
    let compiledMessage = userPrompt;
    if (uploadedFiles.length > 0) {
      compiledMessage += `\n\n[CONTEXT FILES PROVIDED BY USER IN THIS MESSAGE]:\n` + uploadedFiles.map(f => `--- FILE: ${f.name} ---\n${f.content}\n--- END OF FILE ${f.name} ---`).join('\n\n');
    }
    
    if (projectAssets.length > 0) {
      compiledMessage += `\n\n[SYSTEM NOTIFICATION]: The user has the following images uploaded into the local Project Assets Vault: ${projectAssets.map(a => a.name).join(', ')}. If the user asks you to use them, you MUST import them via \`import { ASSETS } from './NovaAssets';\` and use exactly like \`<img src={ASSETS['filename.ext']} />\`!`;
    }

    const displayPrompt = userPrompt || "[Uploaded Files Provided]";
    setPrompt("");
    setUploadedFiles([]);
    
    const uiMessages = [...messages, { role: 'user', content: displayPrompt }];
    setMessages(uiMessages as any);
    setIsBuilding(true);
    setShowPreview(false);

    try {
      const apiMessages = [...messages, { role: 'user', content: compiledMessage }];
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages, 
          currentCode: Object.keys(generatedFiles).length > 0 ? JSON.stringify(generatedFiles) : null,
          brandContext,
          targetPlatform
        })
      });
      
      if (!response.ok) {
        let msg = "Failed to synthesize app structure.";
        try {
           const errData = await response.json();
           msg = errData.details || errData.error || msg;
        } catch(e) {}
        throw new Error(msg);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";
      let finalFiles: Record<string, string> = {};
      let isCodeFullyClosed = false;
      
      // Initialize agent message
      setMessages(prev => [...prev, { role: 'agent', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
           const chunk = decoder.decode(value, { stream: !done });
           fullText += chunk;

           const closedFilesMatch = [...fullText.matchAll(/<nova-file\s+path="([^"]+)">([\s\S]*?)<\/nova-file>/g)];
           const newFiles: Record<string, string> = {};
           closedFilesMatch.forEach(m => { newFiles[m[1]] = m[2].trim(); });
           
           let displayContent = fullText.replaceAll(/<nova-file[\s\S]*?<\/nova-file>/g, '').trim();

           const remainingText = fullText.replace(/<nova-file[\s\S]*?<\/nova-file>/g, '');
           const unclosedMatch = remainingText.match(/<nova-file\s+path="([^"]+)">([\s\S]*)$/);
           
           isCodeFullyClosed = !unclosedMatch;

           if (unclosedMatch) {
              newFiles[unclosedMatch[1]] = unclosedMatch[2];
              displayContent = remainingText.replace(/<nova-file[\s\S]*$/, '').trim() + "\n\n*Building " + unclosedMatch[1] + "...*";
           } else if (Object.keys(newFiles).length > 0) {
              displayContent += "\n\n*Multi-file workspace compiled...*";
           } else {
              // Backward compatibility fallback
              const codeMatch = fullText.match(/```[a-zA-Z]*\s*\n([\s\S]*?)```/);
              if (codeMatch) {
                 newFiles["/App.js"] = codeMatch[1];
                 isCodeFullyClosed = true;
                 displayContent = fullText.substring(0, codeMatch.index).trim() + "\n\n*Building application workspace...*";
              } else {
                 const partialMatch = fullText.match(/```[a-zA-Z]*\s*\n([\s\S]*)/);
                 if (partialMatch) {
                   newFiles["/App.js"] = partialMatch[1];
                   isCodeFullyClosed = false;
                   displayContent = fullText.substring(0, partialMatch.index).trim() + "\n\n*Building application workspace...*";
                 }
              }
           }
           
           finalFiles = newFiles;

           setMessages(prev => {
             const newMessages = [...prev];
             newMessages[newMessages.length - 1].content = displayContent.trim();
             return newMessages;
           });
        }
      }

      if (Object.keys(finalFiles).length > 0 && isCodeFullyClosed) {
        setGeneratedFiles(prev => {
          const merged = { ...prev, ...finalFiles };
          if (typeof window !== 'undefined') {
            localStorage.setItem('nova_saved_project_files', JSON.stringify(merged));
          }
          return merged;
        });
        setMessages(prev => {
           const newMess = [...prev];
           newMess[newMess.length - 1].content += "\n\n✅ **Done! The multi-file workspace has been updated.**";
           return newMess;
        });
        setShowPreview(true);
      } else if (Object.keys(finalFiles).length > 0 && !isCodeFullyClosed) {
        // Handle stream truncation gracefully without crashing sandbox
        setMessages(prev => {
           const newMess = [...prev];
           newMess[newMess.length - 1].content += "\n\n⚠️ **Warning: Code generation hit API token limit and was truncated!** I have paused the UI compiler to prevent syntax crashes. Please run 'continue generating' to finish the code loop.";
           return newMess;
        });
      } else {
        // Fallback in case AI didn't wrap the output code in backticks
        // or just returned plain text, maybe it thinks it's pure code.
        const cleaned = fullText.trim();
        if (cleaned.includes('import React') || cleaned.includes('export default')) {
           setGeneratedFiles(prev => ({ ...prev, "/App.js": cleaned }));
           setShowPreview(true);
        }
      }

      setIsBuilding(false);
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

  const injectedFiles = {
    ...generatedFiles,
    "/NovaAssets.js": `export const ASSETS = ${JSON.stringify(
      projectAssets.reduce((acc, a) => ({ ...acc, [a.name]: a.dataUrl }), {})
    )};`,
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
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}";
const SUPABASE_KEY = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}";

const isLive = SUPABASE_URL && SUPABASE_KEY;
export const supabase = isLive ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// AUTO-GENERATED NOVA BACKEND SDK (LIVE HYBRID MAPPING)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getStore = (key) => JSON.parse(localStorage.getItem(\`nova_\${key}\`) || '[]');
const setStore = (key, data) => localStorage.setItem(\`nova_\${key}\`, JSON.stringify(data));

export const nova = {
  db: {
    insert: async (table, data) => { 
      if (isLive) {
        const { data: res, error } = await supabase.from(table).insert(data).select().single();
        if (error) { console.error("DB Error:", error); return { success: false, error }; }
        return { success: true, data: res };
      }
      await delay(300);
      const store = getStore(table);
      const record = { id: Math.random().toString(36).substr(2, 9), ...data, created_at: new Date().toISOString() };
      setStore(table, [...store, record]);
      return { success: true, data: record }; 
    },
    select: async (table, query) => { 
      if (isLive) {
        const { data: res, error } = await supabase.from(table).select(query || '*');
        return { data: res || [], error };
      }
      await delay(200);
      return { data: getStore(table) }; 
    },
    update: async (table, id, data) => { 
      if (isLive) {
        const { error } = await supabase.from(table).update(data).eq('id', id);
        return { success: !error, error };
      }
      await delay(300);
      const store = getStore(table);
      setStore(table, store.map(row => row.id === id ? { ...row, ...data } : row));
      return { success: true }; 
    },
    delete: async (table, id) => { 
      if (isLive) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        return { success: !error, error };
      }
      await delay(300);
      setStore(table, getStore(table).filter(r => r.id !== id));
      return { success: true }; 
    }
  },
  auth: {
    signUp: async (email, password) => { 
      if (isLive) return supabase.auth.signUp({ email, password });
      await delay(500); return { data: { user: { id: "u_mock", email } } }; 
    },
    signIn: async (email, password) => { 
      if (isLive) return supabase.auth.signInWithPassword({ email, password });
      await delay(500); return { data: { user: { id: "u_mock", email } } }; 
    },
    signOut: async () => { 
      if (isLive) return supabase.auth.signOut();
      await delay(200); return { error: null }; 
    }
  },
  storage: {
    upload: async (bucket, file) => { 
      if (isLive) return supabase.storage.from(bucket).upload(file.name, file);
      await delay(800); return { url: \`https://nova-storage.com/\${file.name}\` }; 
    }
  },
  automation: {
    triggerEmail: async (to, subject, body) => { await delay(400); console.log(\`[Nova Automation] 📨 Email sent to \${to}: \${subject}\`); return true; },
    fireWebhook: async (url, payload) => { await delay(400); console.log(\`[Nova Automation] 🪝 Webhook fired to \${url}\`); return true; },
  },
  pdf: {
    generate: async (elementId) => { await delay(600); return "blob:pdf-url"; }
  },
  workflow: {
    executeStatusChange: async (recordId, newStatus) => { await delay(300); return true; }
  }
};
`
  };

  const handleApiKeyIntegration = () => {
    handlePromptSubmit("I want to integrate a 3rd-Party API. Please ask me what specific function I want the API to perform, and ask me to securely provide the API Key.");
  };

  const handleWebhookIntegration = () => {
    handlePromptSubmit("I need to set up a secure Webhook Receiver. Please ask me what payload data the webhook will receive, and what backend actions should be triggered upon receiving it.");
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Playground Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-xl z-30 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-md shadow-lg shadow-purple-500/20">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight hidden md:inline">Nova OS</span>
          </div>
        </div>
        
        {/* Center Tabs */}
        <div className="flex overflow-x-auto md:overflow-visible bg-white/5 border border-white/10 rounded-lg p-1 space-x-1 hide-scrollbar">
            <button 
              onClick={() => { setActiveTab('preview'); setSandboxView('preview'); }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'preview' && sandboxView === 'preview' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><Play className="w-4 h-4" /> Preview</div>
            </button>
            <button 
              onClick={() => { setActiveTab('preview'); setSandboxView('code'); }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'preview' && sandboxView === 'code' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><Code2 className="w-4 h-4" /> Code</div>
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'database' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Schema</div>
            </button>
            <button 
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'assets' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Assets</div>
            </button>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Backend Tools Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <Server className="w-4 h-4" /> Backend
            </button>
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
              <div className="bg-[#12121a] border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl">
                <button onClick={() => handlePromptSubmit("Integrate an OCR Vision API to extract text and data from uploaded images.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Eye className="w-4 h-4 text-emerald-400" /> OCR Vision API
                </button>
                <button onClick={() => handlePromptSubmit("Set up a backend Email SMTP tool for sending transactional emails (like welcome or reset password emails).")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Mail className="w-4 h-4 text-blue-400" /> Email SMTP Tool
                </button>
                <button onClick={() => handlePromptSubmit("Create an API Gateway caller to reliably proxy and route external API requests securely.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Network className="w-4 h-4 text-purple-400" /> API Gateway Caller
                </button>
                <button onClick={() => handlePromptSubmit("Build a 3rd-Party App Integrator module to connect to external webhooks and OAuth providers.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Plug className="w-4 h-4 text-yellow-400" /> 3rd-Party Integrator
                </button>
                <button onClick={handleApiKeyIntegration} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Key className="w-4 h-4 text-pink-400" /> API Key Integration
                </button>
                <button onClick={handleWebhookIntegration} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Webhook className="w-4 h-4 text-cyan-400" /> Webhook Receiver Setup
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button onClick={() => handlePromptSubmit("Add a Chat Agent interface and backend logic to allow users to converse with an AI model.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4 text-blue-300" /> Chat Agent
                </button>
                <button onClick={() => handlePromptSubmit("Add a Workflow Agent logic to autonomously execute multi-step background tasks.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Workflow className="w-4 h-4 text-orange-400" /> Workflow Agent
                </button>
                <button onClick={() => handlePromptSubmit("Add a Management Agent logic to orchestrate other sub-agents and handle high-level routing.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Management Agent
                </button>
                <button onClick={() => handlePromptSubmit("Add a Verification Agent logic to autonomously validate user inputs and perform quality assurance.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-green-400" /> Verification Agent
                </button>
              </div>
            </div>
          </div>

          {/* Magic Tools Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
              <Wand2 className="w-4 h-4" /> Magic Tools
            </button>
            <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
              <div className="bg-[#12121a] border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl">
                <button onClick={() => handlePromptSubmit("Implement robust user authentication (Login/Signup/Signout) into the current app architecture.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Lock className="w-4 h-4 text-blue-400" /> Add Authentication
                </button>
                <button onClick={() => handlePromptSubmit("Integrate a Stripe payment checkout flow or pricing tier component into the app.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <CreditCard className="w-4 h-4 text-purple-400" /> Stripe Payments
                </button>
                <button onClick={() => handlePromptSubmit("Add smooth framer-motion entrance and hover animations to all main UI elements.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> Add Animations
                </button>
                <button onClick={() => handlePromptSubmit("Implement a dark/light mode theme toggle using Tailwind classes.")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Moon className="w-4 h-4 text-gray-400" /> Dark Mode
                </button>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative group">
            <button className="flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold transition-all bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 shadow-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
              <div className="bg-[#12121a] border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl">
                <button onClick={handleDeployVercel} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm font-semibold text-white transition-colors">
                  <span className="text-white text-lg leading-none">▲</span> Deploy to Vercel
                </button>
                <button onClick={() => {
                  if (Object.keys(generatedFiles).length === 0) {
                    setMessages(prev => [...prev, { role: 'agent', content: "⚠️ **Push Error:** No active code architecture was found in the IDE workspace!"}]);
                    return;
                  }
                  setGithubRepoName(`nova-app-${Date.now().toString().slice(-4)}`);
                  setShowGithubModal(true);
                }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" /> Push to GitHub
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button onClick={handleDownload} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Download className="w-4 h-4 text-gray-400" /> Export ZIP
                </button>
                <button onClick={() => setShowProjectsModal(true)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <FolderOpen className="w-4 h-4 text-gray-400" /> Load Project
                </button>
                <button onClick={handleSaveProjectClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Save className="w-4 h-4 text-gray-400" /> Save Project
                </button>
                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-gray-200 transition-colors">
                  <Settings className="w-4 h-4 text-gray-400" /> Settings
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button onClick={handleClearProject} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" /> Clear Workspace
                </button>
              </div>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20 ml-2 border border-white/20">
            N
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Left Panel - Chat / Agent Output */}
        <div className="h-[45vh] md:h-auto w-full md:w-[400px] lg:w-[500px] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20 shrink-0">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 font-mono text-xs font-bold relative">
                    {isBuilding && i === messages.length - 1 ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "[N]"
                    )}
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isBuilding && messages[messages.length - 1]?.role !== 'agent' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm italic rounded-tl-sm">
                  Agent is synthesizing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry Area */}
          <div className="p-4 bg-black/40 border-t border-white/10">
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-blue-900/30 text-blue-200 text-xs px-2 py-1.5 rounded-lg border border-blue-500/30">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 relative">
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 mb-1 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Upload context file (txt, json, tsx, md...)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="relative flex-1">
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
                  disabled={(!prompt.trim() && uploadedFiles.length === 0) || isBuilding}
                  className="absolute right-3 bottom-3 p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
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
          {!showPreview && !isBuilding && Object.keys(generatedFiles).length === 0 && (
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
            <div className={`flex-1 flex flex-col relative ${deviceView === 'mobile' ? 'p-8 items-center justify-center bg-[url("https://transparenttextures.com/patterns/cubes.png")] bg-opacity-20' : 'p-0 bg-[#09090b]'}`}>
              
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl">
                  <button 
                    onClick={() => setSandboxView('preview')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${sandboxView === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >Preview</button>
                  <button 
                    onClick={() => setSandboxView('code')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${sandboxView === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >Code</button>
                </div>

                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl">
                  <button 
                    onClick={() => setPreviewEngine('sandpack')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${previewEngine === 'sandpack' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >Sandpack</button>
                  <button 
                    onClick={() => setPreviewEngine('database')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${previewEngine === 'database' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >Supabase DB</button>
                </div>
                
                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl">
                  <button 
                    onClick={() => setDeviceView('desktop')}
                    className={`p-1.5 rounded ${deviceView === 'desktop' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                    title="Desktop View"
                  ><Monitor className="w-4 h-4" /></button>
                  <button 
                    onClick={() => setDeviceView('mobile')}
                    className={`p-1.5 rounded ${deviceView === 'mobile' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                    title="Mobile View"
                  ><Smartphone className="w-4 h-4" /></button>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 z-10 ${
                  deviceView === 'mobile' ? 'w-[375px] h-[812px] rounded-xl border border-white/20' : 'w-full h-full rounded-none border-none'
                }`}
              >
                {/* Live Sandpack execution of real react strings mapped directly without static DOM */}
                <div className="h-full w-full flex-1 relative sandpack-fullscreen flex flex-col">
                  <style dangerouslySetInnerHTML={{__html: `
                    .sandpack-fullscreen .sp-wrapper,
                    .sandpack-fullscreen .sp-layout,
                    .sandpack-fullscreen .sp-stack,
                    .sandpack-fullscreen .sp-preview-container {
                      height: 100% !important;
                      min-height: 100% !important;
                      width: 100% !important;
                      flex: 1;
                    }
                  `}} />
                  <ErrorBoundary>
                    <SandpackProvider 
                      theme="dark" 
                      template="react" 
                      customSetup={{
                        dependencies: {
                          "@supabase/supabase-js": "^2.42.0"
                        }
                      }}
                      files={injectedFiles}
                    >
                      {previewEngine === 'sandpack' ? (
                        <SandpackLayout className="h-full w-full !rounded-none !border-none relative">
                          <SandpackAutoHealer isBuilding={isBuilding} onHealTrigger={(msg) => handlePromptSubmit(msg)} />
                          <div className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${sandboxView === 'code' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                            <SandpackCodeEditor style={{ height: '100%' }} showLineNumbers={true} showTabs={true} />
                          </div>
                          <div className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${sandboxView === 'preview' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                            <SandpackPreview style={{ height: '100%' }} showNavigator={false} />
                          </div>
                        </SandpackLayout>
                      ) : (
                        <div className="h-full w-full flex flex-col relative bg-[#1e1e1e]">
                          <div className={`absolute inset-0 z-10 ${sandboxView === 'code' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                            <SandpackCodeEditor style={{ height: '100%' }} showLineNumbers={true} showTabs={true} />
                          </div>
                          <div className={`absolute inset-0 z-0 ${sandboxView === 'preview' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                            <DatabasePreview 
                              files={injectedFiles} 
                              className="h-full w-full" 
                              isBuilding={isBuilding}
                              onHealTrigger={(msg: string) => handlePromptSubmit(msg)}
                            />
                          </div>
                        </div>
                      )}
                    </SandpackProvider>
                  </ErrorBoundary>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="flex-1 overflow-y-auto flex flex-col font-mono text-sm">
              <div className="p-6 pb-2">
                <div className="mb-4 text-xs font-sans text-gray-500 bg-white/5 border border-white/10 rounded p-3">
                  <strong className="text-blue-400">Architecture Engine:</strong> The agent automatically creates logical schema blueprints. We visualize the parsed tables below.
                </div>
              </div>
              <div className="flex-1 w-full h-full relative p-6 pt-0">
                {(generatedFiles["/schema.sql"] || generatedFiles["schema.sql"] || generatedSchema) ? (() => {
                  const schemaSource = generatedFiles["/schema.sql"] || generatedFiles["schema.sql"] || generatedSchema;
                  // Simple SQL to React Flow parser
                  const nodes: any[] = [];
                  const edges: any[] = [];
                  const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
                  let match;
                  let yOffset = 50;
                  let xOffset = 50;
                  
                  // Reset regex state
                  tableRegex.lastIndex = 0;
                  
                  while ((match = tableRegex.exec(schemaSource)) !== null) {
                    const tableName = match[1];
                    const columnsRaw = match[2].split(/\n|,/).map(c => c.trim()).filter(c => c && !c.startsWith('--'));
                    const columns = columnsRaw.map(c => c.split(' ')[0]).filter(c => c && !c.includes('PRIMARY') && !c.includes('FOREIGN'));
                    
                    nodes.push({
                      id: tableName,
                      position: { x: xOffset, y: yOffset },
                      data: { 
                        label: (
                          <div className="text-left font-sans">
                            <div className="font-bold text-sm border-b border-white/10 pb-1 mb-1 text-blue-400">{tableName}</div>
                            <div className="text-xs text-gray-400 max-h-32 overflow-y-auto no-scrollbar">
                              {columns.map((c, i) => <div key={i}>{c}</div>)}
                            </div>
                          </div>
                        ) 
                      },
                      style: { background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', minWidth: '180px' }
                    });
                    
                    xOffset += 240;
                    if (xOffset > 700) { xOffset = 50; yOffset += 180; }
                  }

                  if (nodes.length > 0) {
                    return (
                      <ReactFlow nodes={nodes} edges={edges} fitView>
                        <Background color="#333" gap={16} />
                        <Controls />
                      </ReactFlow>
                    );
                  }
                  
                  return (
                    <pre className="text-gray-300 h-full overflow-y-auto">
                      <code dangerouslySetInnerHTML={{ __html: schemaSource }} />
                    </pre>
                  );
                })() : (
                  <pre className="text-gray-300">
                    <code>-- Waiting for Schema generation...</code>
                  </pre>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="flex-1 p-8 overflow-y-auto font-sans bg-[#09090b]">
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Project Asset Library</h2>
                  <p className="text-gray-400 text-sm">Upload images securely here. The Agent will compile them natively so you can request them in your apps without needing complex Blob states in your front-end code! (e.g. "Use logo.png as my header background")</p>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all p-12 rounded-2xl flex flex-col items-center justify-center cursor-pointer mb-8"
                >
                  <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                    <ImageIcon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Upload New Asset</h3>
                  <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                </div>

                <div className="space-y-4">
                  {projectAssets.length === 0 ? (
                    <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10 text-gray-500 text-sm">
                      No assets uploaded yet
                    </div>
                  ) : (
                    projectAssets.map((asset, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{asset.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Image / Uploaded</p>
                        </div>
                        <button 
                          onClick={() => setProjectAssets(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Deploy to Vercel Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col pt-2"
            >
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">▲ Launch to Vercel</h3>
              </div>
              <div className="p-4 pb-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Vercel Project Name</label>
                  <input 
                    type="text" 
                    value={deployProjectName}
                    onChange={(e) => setDeployProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/50 text-white"
                    placeholder="e.g. nova-portfolio-123"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">Deployments are pushed directly to Edge endpoints. Unsaved projects will be dynamically auto-saved prior to deployment.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowDeployModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold">Cancel</button>
                  <button onClick={confirmDeployVercel} className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors font-semibold shadow-lg shadow-white/20">Confirm Deploy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col pt-2"
            >
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2"><Save className="w-5 h-5 text-purple-400" /> Save Workspace</h3>
              </div>
              <div className="p-4 pb-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Workspace Name</label>
                  <input 
                    type="text" 
                    value={saveProjectName}
                    onChange={(e) => setSaveProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 text-white"
                    placeholder="Enter a descriptive name..."
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold">Cancel</button>
                  <button onClick={confirmSaveProject} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors font-semibold shadow-lg shadow-purple-500/20">Save Project</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400" /> Project Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Target Platform</label>
                  <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                    <button 
                      onClick={() => setTargetPlatform('web')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${targetPlatform === 'web' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      Web (React)
                    </button>
                    <button 
                      onClick={() => setTargetPlatform('mobile')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${targetPlatform === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      Mobile (React Native)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Brand Context & Design Tokens</label>
                  <textarea 
                    value={brandContext}
                    onChange={(e) => setBrandContext(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 text-white text-sm resize-none"
                    placeholder="e.g., Use primary color #C29D7D, secondary #3E2723. Tone is luxurious, minimalist. Font: 'Inter'..."
                  />
                  <p className="text-xs text-gray-500 mt-2">These instructions are automatically appended to all AI code generations to maintain consistent branding.</p>
                </div>
                <div className="pt-2">
                  <button onClick={() => setShowSettingsModal(false)} className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors font-semibold shadow-lg">Save Settings</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub Push Modal */}
      <AnimatePresence>
        {showGithubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col pt-2"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <h3 className="font-bold text-white text-lg flex items-center gap-2"><Upload className="w-5 h-5 text-white" /> Push to GitHub</h3>
              </div>
              <div className="p-4 pb-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Repository Name</label>
                  <input 
                    type="text" 
                    value={githubRepoName}
                    onChange={(e) => setGithubRepoName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gray-500 text-white"
                    placeholder="my-nova-app"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">GitHub PAT Token</label>
                  <input 
                    type="password" 
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gray-500 text-white"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 mt-2">Requires 'repo' scope.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowGithubModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold">Cancel</button>
                  <button onClick={confirmPushGithub} className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors font-semibold shadow-lg shadow-white/20">Push Repo</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Projects Modal */}
      <AnimatePresence>
        {showProjectsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2"><FolderOpen className="w-5 h-5 text-blue-400" /> Saved Workspaces</h3>
                <button onClick={() => setShowProjectsModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3">
                {savedProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No saved workspaces found.</p>
                ) : (
                  savedProjects.map(p => (
                    <div key={p.id} className="flex flex-col bg-white/5 border border-white/10 p-4 rounded-xl hover:border-blue-500/30 transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-blue-100">{p.name}</h4>
                          <p className="text-xs text-gray-400">{new Date(p.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => loadProject(p)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors rounded-lg text-xs font-semibold">Load</button>
                          <button onClick={() => deleteProject(p.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{p.messages[p.messages.length - 1]?.content.substring(0, 80) || p.name}...</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
