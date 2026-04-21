import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { MASTER_BUILDER_PROMPT } from '@/lib/agent-prompt';

export const maxDuration = 60; // Allow sufficient LLM processing time

export async function POST(req: Request) {
  try {
    const { prompt, messages, currentCode } = await req.json();

    if (!prompt && (!messages || messages.length === 0)) {
      return new Response(JSON.stringify({ success: false, error: "Prompt or messages required" }), { status: 400 });
    }

    const conversationHistory = messages || [{ role: 'user', content: prompt }];
    const lastUserMessage = conversationHistory[conversationHistory.length - 1].content;

    const systemContext = `
${MASTER_BUILDER_PROMPT}
You are an elite, God-tier autonomous full-stack software engineer. Your target environment is a Sandpack React WebContainer.
    
CRITICAL NEW INSTRUCTIONS:
You are now highly interactive and conversational. 
1. DO NOT immediately generate code if the user's request is vague, implies changes that need approval, or if they haven't given you the clear go-ahead. Instead, discuss the plan and ASK FOR APPROVAL.
2. If the user presents you with an idea, suggest improvements or optimizations, then ask if they'd like you to proceed with them.
3. If you analyze the \`currentCode\` or the user's logic and spot bugs, performance bottlenecks, or errors, you MUST proactively identify them. Explain clearly why it is a problem, why it is important to fix, and ask the user if you should fix it along with their request.
4. **MILESTONE PIPELINE**: Before building the architecture, you MUST break the project down into manageable Milestones (e.g., Phase 1: Core Layout, Phase 2: Internal Logic, Phase 3: Backend DB Mapping). Present this roadmap to the user.
5. You MUST execute these milestones **one by one**. Do not build the entire app at once! Generate the code for Milestone 1, then natively ask the user: "Milestone 1 complete. Does this look good? Shall I proceed to inject Milestone 2?"
6. If you are ONLY conversing/asking questions, simply output your normal markdown response without any \`\`\`jsx blocks.
7. ONLY when the user has approved the plan or asked directly for the UI/code, you should output the final code.

FORMAT REQUIREMENTS FOR CODE GENERATION (WHEN APPROVED):
1. First, provide your detailed thoughts and explanations in normal text.
2. Finally, wrap your actual code in exactly \`\`\`jsx ... \`\`\`.
2. Finally, when you are ready to provide the code, you MUST wrap it in exactly \`\`\`jsx ... \`\`\`. 
3. The code MUST be a single default exported React component (export default function App() {...}). Do not put extra code outside the one component block unless it's imports.

CRITICAL CONSTRAINT 1: You MUST explicitly include \`import React, { useState, useEffect } from 'react';\` at the very top of your snippet.
CRITICAL CONSTRAINT 2: To use database, auth, storage, pdf generation, workflow engine, or email automations, you MUST import the internal SDK: \`import { nova } from './NovaBackend';\`. Do NOT fetch external APIs for these. Use \`nova.db.insert('table', data)\`, etc. Attach these to your buttons and forms!
CRITICAL CONSTRAINT 3: You have a strict output token limit. Prioritize writing clean, concise components. Do NOT write overly long code blobs, dummy data arrays, or repeating UI sections that exceed 350 lines, or your code will get cut off! Use array maps where possible.
CRITICAL CONSTRAINT 4: The generated layout MUST be fully mobile responsive out of the box. Use Tailwind's 'md:', 'sm:', and 'lg:' classes extensively. Stack Sidebars, adjust flex directions, and scale padding down for mobile views seamlessly.
CRITICAL CONSTRAINT 5: If the user requests a change/prompt and there is ALREADY an active project context (the currentCode block is not empty), you MUST explicitly ask them if this prompt is meant to CONTINUE modifying the ongoing project or if you should start a new build from scratch. DO NOT rewrite everything from scratch without asking, unless explicitly instructed.
CRITICAL CONSTRAINT 6: NEVER use blank gray divs, SVG wireframes, or empty borders for images! You MUST fetch breathtaking, hyper-realistic, contextual photography from "https://loremflickr.com/1200/800/{keyword}" (e.g., /architecture, /portrait, /coffee, /abstract) for ALL backgrounds, hero sections, avatars, and \`<img>\` tags! The webapps you build must look like artistic premium layouts immediately!

${currentCode ? `THE USER ALREADY HAS A GENERATED APP. THEY ARE REQUESTING AN EDIT.
CURRENT APP CODE:
\`\`\`javascript
${currentCode}
\`\`\`
Modify this code to satisfy their new requests. Ensure you map everything properly without losing core functionality.` : ``}
`;

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        function emit(text: string) {
          controller.enqueue(encoder.encode(text));
        }

        try {
          if (process.env.CLAUDE_API_KEY) {
            console.log("Routing Agent Request through Claude 3.5 Engine...");
            const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
            let stream;
            
            const modelsToTry = [
              "claude-sonnet-4-6",
              "claude-opus-4-7",
              "claude-haiku-4-5-20251001",
              "claude-3-5-sonnet-20241022"
            ];

            const anthropicMessages = conversationHistory.map((m: any) => {
              const r = m.role === 'agent' ? 'assistant' : m.role;
              if (m.role === 'user' && m.content.includes('[ATTACHED_IMAGE:')) {
                const imageRegex = /\[ATTACHED_IMAGE:\s*(data:image\/([^;]+);base64,([a-zA-Z0-9+/=]+))\]/g;
                const textContent = m.content.replace(imageRegex, '').trim();
                const blocks = [];
                
                const matches = [...m.content.matchAll(imageRegex)];
                for (const match of matches) {
                  blocks.push({
                    type: "image",
                    source: { type: "base64", media_type: `image/${match[2]}`, data: match[3] }
                  });
                }
                if (textContent) blocks.push({ type: "text", text: textContent });
                
                return { role: r, content: blocks };
              }
              return { role: r, content: m.content };
            });

            for (const modelString of modelsToTry) {
              try {
                stream = await anthropic.messages.create({
                  model: modelString,
                  max_tokens: 8192,
                  system: systemContext,
                  messages: anthropicMessages,
                  stream: true
                });
                // If create succeeds, it means no HTTP error was thrown
                break; 
              } catch (e: any) {
                console.warn(`Claude Model ${modelString} stream rejected. Attempting fallback...`);
                stream = null;
              }
            }
            
            if (stream) {
              for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta && chunk.delta.type === 'text_delta') {
                  emit(chunk.delta.text);
                }
              }
            } else {
               console.warn("Anthropic blocked execution or models failed. Injecting contextual mock UI...");
               emit("I'm analyzing your request now. Proceeding to bootstrap the requested architecture framework... Give me a moment to synthesize the UI logic.\n\n");
               
               const isCoffeeShop = lastUserMessage.toLowerCase().includes('coffee');
               
               let mockCode = "";
               if (isCoffeeShop) {
                 mockCode = `import React, { useEffect } from 'react';

export default function CoffeeShopApp() {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-800 font-sans selection:bg-[#C29D7D]/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#EADDCE]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-[#5A3825]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18,9V7h-2V4.5C16,3.12,14.88,2,13.5,2h-6C6.12,2,5,3.12,5,4.5V7H3v2h2v2C5,13.76,7.24,16,10,16v2H8v2h8v-2h-2v-2c2.76,0,5-2.24,5-5v-2h1c1.1,0,2-0.9,2-2S21.1,9,20,9H18z M15,4.5C15,4.78,14.78,5,14.5,5h-4C10.22,5,10,4.78,10,4.5S10.22,4,10.5,4h4C14.78,4,15,4.22,15,4.5z M20,11h-2V9h2V11z"/>
            </svg>
            <span className="font-serif text-2xl font-bold tracking-tighter text-[#3E2723]">TEN11<span className="text-[#C29D7D]">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#5A3825]">
            <a href="#" className="hover:text-[#C29D7D] transition-colors">Our Coffee</a>
            <a href="#" className="hover:text-[#C29D7D] transition-colors">Menu</a>
            <a href="#" className="hover:text-[#C29D7D] transition-colors">Locations</a>
            <a href="#" className="hover:text-[#C29D7D] transition-colors">Visit Us</a>
          </div>
          <button className="bg-[#3E2723] hover:bg-[#5A3825] transition-colors text-[#FDFBF7] px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#3E2723]/20">
            Order Ahead
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 animate-[fadeIn_1s_ease-out]">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADDCE] text-[#5A3825] text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#C29D7D] animate-pulse"></span>
            Now Open in Abraka
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-[#3E2723] leading-[1.1] tracking-tight">
            Coffee crafted for <br />
            <span className="text-[#C29D7D] italic">the daily grind.</span>
          </h1>
          <p className="text-lg text-[#5A3825]/80 max-w-md leading-relaxed">
            Experience premium, ethically-sourced beans roasted to absolute perfection. 
            TEN11 is the modern cafe destination for your everyday fuel.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="bg-[#3E2723] text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-[#3E2723]/20 hover:scale-105 transition-transform">
              View Menu
            </button>
            <button className="px-8 py-4 rounded-full font-bold text-[#3E2723] border-2 border-[#EADDCE] hover:bg-[#EADDCE]/50 transition-colors">
              Find Location
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-[#3E2723]/10">
          <img 
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop" 
            alt="Artisan pouring latte art" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Signature</p>
                <p className="text-xl font-serif">Vanilla Oat Latte</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Featured Menu Elements */}
      <section className="bg-[#3E2723] text-[#FDFBF7] py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-2xl font-serif font-bold text-[#C29D7D]">01. Espresso</h3>
            <p className="text-white/70">Rich, intense, and perfectly balanced. The pure foundation of every great drink we make.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-2xl font-serif font-bold text-[#C29D7D]">02. Pour Over</h3>
            <p className="text-white/70">Slow-crafted for maximum clarity. Featuring rotating single-origin beans globally sourced.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl bg-[#C29D7D] text-[#3E2723] shadow-lg shadow-[#C29D7D]/20">
            <h3 className="text-2xl font-serif font-bold">03. Pastries</h3>
            <p className="opacity-90">Baked fresh locally every morning. From butter croissants to artisanal sourdough toasts.</p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: " @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } "}} />
    </div>
  );
}`;
               } else {
                 mockCode = `import React, { useEffect, useState } from 'react';

export default function DashboardApp() {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">N</div>
              <span className="font-bold text-xl tracking-tight">Nova<span className="text-indigo-400">Sphere</span></span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, Admin</h1>
          <p className="text-slate-400">Here's a live AI-generated application architecture running inside WebAssembly.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors shadow-xl shadow-black/20 text-center flex flex-col justify-center">
            <h3 className="text-sm font-bold text-emerald-400 mb-1">YOUR OMNI-BUILDER IS ALIVE</h3>
            <p className="text-xs text-slate-400">Add an active API key to generate completely custom layouts like this one via text on demand.</p>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: " @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } "}} />
    </div>
  );
}`;
               }
               
               // Inject the mock code properly wrapped so client frontend parser can extract it
               emit("I have assembled the requested architecture based on the mock fallbacks! Here is the code.\n\n```jsx\n");
               emit(mockCode);
               emit("\n```");
            }

          } else if (process.env.OPENAI_API_KEY) {
            console.log("Routing Agent Request through OpenAI GPT-4o Engine...");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const openaiMessages = [
              { role: "system", content: systemContext },
              ...conversationHistory.map((m: any) => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
              }))
            ];
            const stream = await openai.chat.completions.create({
              model: "gpt-4o",
              stream: true,
              messages: openaiMessages as any
            });
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) emit(text);
            }
          } else if (process.env.GEMINI_API_KEY) {
            console.log("Routing Agent Request through Google Gemini Engine...");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: systemContext });
            
            const geminiHistory = conversationHistory.slice(0, -1).map((m: any) => ({
              role: m.role === 'agent' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }));
            const chat = model.startChat({ history: geminiHistory });
            
            const streamResult = await chat.sendMessageStream(lastUserMessage);
            for await (const chunk of streamResult.stream) {
              emit(chunk.text());
            }
          } else {
            emit("Error: No LLM Provider Keys (Claude, OpenAI, Gemini) found in Environment.");
          }
        } catch (e: any) {
          console.error("Stream Error:", e);
          emit(`\n\n[Agent Error]: ${e.message}`);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    });

  } catch (error: any) {
    console.error('Nova Agent Engine Error:', error);
    return new Response(JSON.stringify({ error: 'Agent engine compilation failure', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

