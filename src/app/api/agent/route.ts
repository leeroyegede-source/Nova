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
4. **MILESTONES & VERIFICATION**: Briefly outline a phased plan. Execute one phase at a time. After each phase, perform a brief self-verification (e.g., "Self-Check Passed: Hooks, UI, and imports verified"). Ask for approval before proceeding to the next phase.
5. If you are ONLY conversing/asking questions, simply output your normal markdown response without any \`\`\`jsx blocks.
6. ONLY when the user has approved the plan or asked directly for the UI/code, you should output the final code.

FORMAT REQUIREMENTS FOR CODE GENERATION (WHEN APPROVED):
1. First, provide your detailed thoughts and explanations in normal text.
2. Finally, when you are ready to provide the code, you MUST use the multi-file XML architecture! Wrap EVERY file you create inside a \`<nova-file path="/filename.js">\` node! Do NOT use standard markdown \`\`\`jsx blocks anymore. 
For example:
<nova-file path="/App.js">
import React from 'react';
import Header from './components/Header';
export default function App() { return <Header /> }
</nova-file>
<nova-file path="/components/Header.js">
export default function Header() { return <div>Header</div> }
</nova-file>

CRITICAL CONSTRAINT 1: You MUST explicitly include \`import React, { useState, useEffect } from 'react';\` at the very top of your snippet.
CRITICAL CONSTRAINT 2: To use database, auth, storage, pdf generation, workflow engine, or email automations, you MUST import the internal SDK: \`import { nova } from './NovaBackend';\`. Do NOT fetch external APIs for these. Use \`nova.db.insert('table', data)\`, etc. Attach these to your buttons and forms!
CRITICAL CONSTRAINT 3: You have a strict output token limit. Prioritize writing clean, concise components across multiple files. Do NOT write overly long code blobs, dummy data arrays, or repeating UI sections that exceed 350 lines per file, or your code will get cut off! Use array maps where possible.
CRITICAL CONSTRAINT 4: The generated layout MUST be fully mobile responsive out of the box. Use Tailwind's 'md:', 'sm:', and 'lg:' classes extensively. Stack Sidebars, adjust flex directions, and scale padding down for mobile views seamlessly.
CRITICAL CONSTRAINT 5: If the user requests a change/prompt and there is ALREADY an active project context (the currentCode block is not empty), you MUST explicitly ask them if this prompt is meant to CONTINUE modifying the ongoing project or if you should start a new build from scratch. DO NOT rewrite everything from scratch without asking, unless explicitly instructed.
CRITICAL CONSTRAINT 6: NEVER use blank gray divs, SVG wireframes, or empty borders for images! You MUST fetch breathtaking, hyper-realistic, contextual photography from "https://loremflickr.com/1200/800/{keyword}" (e.g., /architecture, /portrait, /coffee, /abstract) for ALL backgrounds, hero sections, avatars, and \`<img>\` tags! The webapps you build must look like artistic premium layouts immediately!
CRITICAL CONSTRAINT 7: If the user explicitly asks you to use an image they uploaded or attached, you MUST use the internal UI Asset Library! Import the uploaded assets dictionary exactly like this: \`import { ASSETS } from './NovaAssets';\` and map it into your \`src\` or \`backgroundImage\` tags perfectly: \`<img src={ASSETS['filename.jpg']} />\`. Do not hallucinate URLs!
CRITICAL CONSTRAINT 8: TO AVOID TOKEN LIMITS: When editing an existing project, ONLY output the \`<nova-file>\` blocks for the specific files you are changing or creating! DO NOT output the code for files that remain unchanged. The system will automatically preserve any existing files you do not explicitly overwrite.

${currentCode ? `THE USER ALREADY HAS A GENERATED APP. THEY ARE REQUESTING AN EDIT.
CURRENT APP CODE:
\`\`\`javascript
${currentCode}
\`\`\`
Modify this code to satisfy their new requests. ONLY output the \`<nova-file>\` blocks for the files you modified.` : ``}
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
            const anthropic = new Anthropic({ 
              apiKey: process.env.CLAUDE_API_KEY,
              defaultHeaders: { 'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15' }
            });
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
             emit("Anthropic blocked execution or models failed. Injecting contextual mock UI...");
             const isCoffeeShop = lastUserMessage.toLowerCase().includes('coffee');
             
              let mockCode = "";
              if (isCoffeeShop) {
                mockCode = `<nova-file path="/App.js">import React, { useEffect } from 'react';

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
      <nav className="fixed w-full z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#EADDCE]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tighter text-[#3E2723]">TEN11<span className="text-[#C29D7D]">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#5A3825]">
            <a href="#" className="hover:text-[#C29D7D] transition-colors">Our Coffee</a>
          </div>
        </div>
      </nav>
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 animate-[fadeIn_1s_ease-out]">
        <div className="flex-1 space-y-8">
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-[#3E2723] leading-[1.1] tracking-tight">
            Coffee crafted for <br />
            <span className="text-[#C29D7D] italic">the daily grind.</span>
          </h1>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: " @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } "}} />
    </div>
  );
}</nova-file>`;
              } else {
                mockCode = `<nova-file path="/App.js">import React, { useEffect, useState } from 'react';

export default function DashboardApp() {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl tracking-tight">Nova<span className="text-indigo-400">Sphere</span></span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors shadow-xl shadow-black/20 text-center flex flex-col justify-center">
            <h3 className="text-sm font-bold text-emerald-400 mb-1">YOUR OMNI-BUILDER IS ALIVE</h3>
            <p className="text-xs text-slate-400">Add an active API key to generate completely custom layouts safely mapped to multi-file logic.</p>
          </div>
        </div>
      </main>
    </div>
  );
}</nova-file>`;
              }
               
               // Inject the mock code properly wrapped so client frontend parser can extract it
               emit("I have assembled the requested architecture based on the mock fallbacks! Here is the code.\n\n");
               emit(mockCode);
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
              max_tokens: 16384,
              messages: openaiMessages as any
            });
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) emit(text);
            }
          } else if (process.env.GEMINI_API_KEY) {
            console.log("Routing Agent Request through Google Gemini Engine...");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
              model: "gemini-1.5-pro", 
              systemInstruction: systemContext,
              generationConfig: { maxOutputTokens: 8192 }
            });
            
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

