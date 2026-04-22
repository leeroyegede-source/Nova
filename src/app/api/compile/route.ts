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
              if (args.path === 'App.js' || args.path === './App.js') return { path: 'App.js', namespace: 'virtual' };
              
              let relativePath = args.path.replace('./', '').replace('../', '');
              if (!relativePath.endsWith('.js') && !relativePath.endsWith('.tsx') && !relativePath.endsWith('.css')) {
                  relativePath += '.js';
              }
              
              if (files[relativePath] || files[`/${relativePath}`]) {
                return { path: relativePath, namespace: 'virtual' };
              }
              
              if (args.path.startsWith('http://') || args.path.startsWith('https://')) {
                return { path: args.path, external: true };
              }
              if (!args.path.startsWith('.')) {
                let pkg = args.path;
                if (pkg === 'react') pkg = 'react@18';
                if (pkg === 'react-dom' || pkg === 'react-dom/client') pkg = 'react-dom@18/client';
                if (pkg === 'react-dom/server') pkg = 'react-dom@18/server';
                
                return { path: `https://esm.sh/${pkg}?deps=react@18,react-dom@18`, external: true };
              }
              
              return { path: args.path, namespace: 'virtual' };
            });

            build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
              if (args.path === 'index.js') {
                return {
                  contents: `
                    import React from 'https://esm.sh/react@18?deps=react@18,react-dom@18';
                    import { createRoot } from 'https://esm.sh/react-dom@18/client?deps=react@18,react-dom@18';
                    import App from './App.js';
                    
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
                  loader: args.path.endsWith('.css') ? 'css' : 'jsx',
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
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.addEventListener('error', function(e) {
              document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Runtime Error: ' + e.message + '</div>';
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
