'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as esbuild from 'esbuild-wasm';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export default function EsbuildPreview({ files, className = '' }: any) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  // 1. Initialize esbuild
  useEffect(() => {
    if (isInitialized) {
      setIsReady(true);
      return;
    }

    if (!initPromise) {
      initPromise = esbuild.initialize({
        worker: true,
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm'
      }).then(() => {
        isInitialized = true;
      }).catch((err) => {
        if (err.message.includes('Cannot call "initialize" more than once') || err.message.includes('multiple times')) {
          isInitialized = true;
        } else {
          console.error("Esbuild initialization error:", err);
        }
      });
    }

    initPromise.then(() => setIsReady(true));
  }, []);

  // 2. Compile code when files change
  useEffect(() => {
    if (!isReady || !files) return;

    const compile = async () => {
      setError('');
      try {
        const result = await esbuild.build({
          entryPoints: ['App.js'],
          bundle: true,
          write: false,
          format: 'esm',
          plugins: [
            {
              name: 'virtual-fs',
              setup(build) {
                // Resolve virtual files
                build.onResolve({ filter: /.*/ }, (args) => {
                  if (args.path === 'App.js') return { path: args.path, namespace: 'virtual' };
                  
                  // Handle relative imports matching our files
                  let relativePath = args.path.replace('./', '').replace('../', '');
                  if (!relativePath.endsWith('.js')) relativePath += '.js';
                  
                  if (files[relativePath]) {
                    return { path: relativePath, namespace: 'virtual' };
                  }
                  
                  // Handle npm packages by redirecting to esm.sh
                  if (!args.path.startsWith('.')) {
                    return { path: `https://esm.sh/${args.path}`, external: true };
                  }
                  
                  return { path: args.path, namespace: 'virtual' };
                });

                // Load virtual files
                build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
                  const content = files[args.path] || files[`/${args.path}`];
                  if (content) {
                    return {
                      contents: content,
                      loader: 'jsx',
                    };
                  }
                });
              }
            }
          ]
        });

        const bundledCode = result.outputFiles[0].text;

        // 3. Update iframe
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
                    document.body.innerHTML = '<div style="color:red;padding:20px;">' + err.message + '</div>';
                  }
                </script>
              </body>
            </html>
          `;
          iframeRef.current.srcdoc = html;
        }

      } catch (err) {
        console.error("Compilation error", err);
        setError(err.message);
      }
    };

    compile();
  }, [files, isReady]);

  return (
    <div className={`relative w-full h-full bg-white flex items-center justify-center ${className}`}>
      {!isReady && <div className="absolute text-gray-400">Initializing Core Engine...</div>}
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-500/10 text-red-500 font-mono text-xs overflow-auto max-h-[50%] z-50">
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
