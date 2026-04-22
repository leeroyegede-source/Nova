'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as esbuild from 'esbuild-wasm';

let initPromise: Promise<void> | null = null;

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = esbuild.initialize({
      worker: false,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm'
    }).catch((err: any) => {
      if (err.message.includes('Cannot call "initialize" more than once') || 
          err.message.includes('multiple times')) {
        return; // Already initialized, safe to ignore
      }
      initPromise = null; // Reset so we can retry on failure
      throw err;
    });
  }
  return initPromise;
};

export default function EsbuildPreview({ files, className = '' }: any) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  // Compile code when files change using lazy initialization
  useEffect(() => {
    if (!files) return;

    const compile = async () => {
      setError('');
      setIsReady(false);
      
      const doBuild = async () => {
        return await esbuild.build({
          entryPoints: ['App.js'],
          bundle: true,
          write: false,
          format: 'esm',
          plugins: [
            {
              name: 'virtual-fs',
              setup(build) {
                build.onResolve({ filter: /.*/ }, (args) => {
                  if (args.path === 'App.js') return { path: args.path, namespace: 'virtual' };
                  
                  let relativePath = args.path.replace('./', '').replace('../', '');
                  if (!relativePath.endsWith('.js') && !relativePath.endsWith('.tsx') && !relativePath.endsWith('.css')) {
                      relativePath += '.js';
                  }
                  
                  if (files[relativePath] || files[`/${relativePath}`]) {
                    return { path: relativePath, namespace: 'virtual' };
                  }
                  
                  if (!args.path.startsWith('.')) {
                    return { path: `https://esm.sh/${args.path}`, external: true };
                  }
                  
                  return { path: args.path, namespace: 'virtual' };
                });

                build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
                  const content = files[args.path] || files[`/${args.path}`];
                  if (content) {
                    return {
                      contents: content,
                      loader: args.path.endsWith('.css') ? 'css' : 'jsx',
                    };
                  }
                });
              }
            }
          ]
        });
      };

      try {
        await ensureInitialized();
        const result = await doBuild();
        const bundledCode = result.outputFiles[0].text;
        setIsReady(true);

        if (iframeRef.current) {
          const html = `
            <html>
              <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { margin: 0; padding: 0; }</style>
              </head>
              <body>
                <div id="root"></div>
                <script type="module">
                  import React from 'https://esm.sh/react@18';
                  import { createRoot } from 'https://esm.sh/react-dom@18/client';
                  
                  try {
                    ${bundledCode}
                    const root = createRoot(document.getElementById('root'));
                    root.render(React.createElement(App.default || App));
                  } catch (err) {
                    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Runtime Error: ' + err.message + '</div>';
                  }
                </script>
              </body>
            </html>
          `;
          iframeRef.current.srcdoc = html;
        }

      } catch (err: any) {
        console.error("Compilation error", err);
        setError(err.message);
        setIsReady(true);
      }
    };

    compile();
  }, [files]);

  return (
    <div className={`relative w-full h-full bg-white flex items-center justify-center ${className}`}>
      {!isReady && !error && <div className="absolute text-gray-400 font-mono text-sm z-50">Initializing Core Engine...</div>}
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-500/10 text-red-500 font-mono text-xs overflow-auto max-h-[50%] z-50 border-b border-red-500/20 shadow-xl backdrop-blur-sm">
          <strong>Build Error:</strong><br />
          {error}
        </div>
      )}
      <iframe 
        ref={iframeRef}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
        title="preview"
      />
    </div>
  );
}
