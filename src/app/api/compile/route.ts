import { NextResponse } from 'next/server';
import * as esbuild from 'esbuild';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { files, projectId } = await req.json();
    if (!files || Object.keys(files).length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const result = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      format: 'esm',
      plugins: [
        {
          name: 'virtual-fs',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.path === 'index.js') return { path: 'index.js', namespace: 'virtual' };
              
              if (args.path.startsWith('http://') || args.path.startsWith('https://')) {
                return { path: args.path, external: true };
              }
              if (args.path === 'react' || args.path === 'react-dom' || args.path === 'react-dom/client' || args.path === 'react/jsx-runtime' || args.path === 'react/jsx-dev-runtime') {
                return { path: args.path, external: true };
              }
              
              let resolvedPath = args.path;
              if (args.path.startsWith('.')) {
                let basePath = args.importer === 'index.js' ? '' : args.importer;
                const parts = basePath ? basePath.split('/') : [];
                if (parts.length > 0) parts.pop();
                
                const pathParts = args.path.split('/');
                for (const part of pathParts) {
                    if (part === '.') continue;
                    if (part === '..') parts.pop();
                    else parts.push(part);
                }
                resolvedPath = parts.join('/');
              } else if (args.path.startsWith('@/')) {
                  resolvedPath = args.path.substring(2);
              }

              const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.css'];
              for (const ext of extensions) {
                const p = resolvedPath + ext;
                if (files[p] || files[`/${p}`]) {
                  return { path: p, namespace: 'virtual' };
                }
              }

              if (!args.path.startsWith('.') && !args.path.startsWith('/') && !args.path.startsWith('@/')) {
                return { path: `https://esm.sh/${args.path}?external=react,react-dom`, external: true };
              }

              return { path: args.path, namespace: 'virtual' };
            });

            build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
              if (args.path === 'index.js') {
                let appPath = './App.js';
                if (files['App.tsx'] || files['/App.tsx']) appPath = './App.tsx';
                else if (files['src/App.js'] || files['/src/App.js']) appPath = './src/App.js';
                else if (files['src/App.tsx'] || files['/src/App.tsx']) appPath = './src/App.tsx';

                return {
                  contents: `
                    import React from 'react';
                    import { createRoot } from 'react-dom/client';
                    import App from '${appPath}';
                    
                    const root = createRoot(document.getElementById('root'));
                    root.render(React.createElement(App.default || App));
                  `,
                  loader: 'jsx'
                };
              }

              const content = files[args.path] || files[`/${args.path}`];
              if (content) {
                return {
                  contents: content,
                  loader: args.path.endsWith('.css') ? 'css' : (args.path.endsWith('.ts') ? 'ts' : 'jsx'),
                };
              }
            });
          }
        }
      ]
    });

    const bundledCode = result.outputFiles[0].text;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { margin: 0; padding: 0; }</style>
          <script type="importmap">
            {
              "imports": {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom": "https://esm.sh/react-dom@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
                "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
                "react/jsx-dev-runtime": "https://esm.sh/react@18.2.0/jsx-dev-runtime"
              }
            }
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.addEventListener('error', function(e) {
              document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Runtime Error: ' + e.message + '</div>';
              window.parent.postMessage({ type: 'NOVA_RUNTIME_ERROR', message: e.message }, '*');
            });
            
            // Intercept link clicks so the iframe doesn't navigate to 404
            document.addEventListener('click', function(e) {
              var a = e.target.closest('a');
              if (a && a.href) {
                e.preventDefault();
                console.log('Navigation intercepted in preview mode:', a.href);
              }
            });
          </script>
          <script type="module">
            ${bundledCode}
          </script>
        </body>
      </html>
    `;

    // Upload to Supabase Storage if configured
    if (supabase) {
      const fileName = `${projectId || Date.now()}.html`;
      const { data, error } = await supabase.storage
        .from('previews')
        .upload(fileName, html, {
          contentType: 'text/html',
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('previews').getPublicUrl(fileName);
        return NextResponse.json({ url: publicUrlData.publicUrl, html });
      } else {
        console.warn("Supabase storage upload failed, bucket might not exist. Returning raw HTML.", error);
      }
    }

    // Fallback: return raw HTML for srcdoc injection
    return NextResponse.json({ html });

  } catch (error: any) {
    console.error("Server compiler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
