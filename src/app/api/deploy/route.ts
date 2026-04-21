import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { files, projectName } = await request.json();

    if (!process.env.VERCEL_API_TOKEN) {
      return NextResponse.json(
        { error: 'VERCEL_API_TOKEN is not configured in Environment variables. Please add it to deploy directly to the Edge.' },
        { status: 400 }
      );
    }

    // Mapping files to Vercel Deploy API structure format
    const vercelFiles = Object.entries(files).map(([path, content]) => {
      // Clean path if it starts with leading slash
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return {
        file: `src/${cleanPath}`,
        data: content as string,
        encoding: 'utf-8'
      };
    });

    // Add necessary boilerplate for a Vite React compilation pipeline
    vercelFiles.push({
      file: 'index.html',
      data: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      encoding: 'utf-8'
    });

    vercelFiles.push({
      file: 'src/main.jsx',
      data: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      encoding: 'utf-8'
    });

    vercelFiles.push({
      file: 'package.json',
      data: JSON.stringify({
        name: projectName || "nova-app",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "latest",
          "framer-motion": "latest",
          "@supabase/supabase-js": "^2.39.3"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.2.1",
          "vite": "^5.1.0"
        }
      }),
      encoding: 'utf-8'
    });

    vercelFiles.push({
      file: 'vite.config.js',
      data: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`,
      encoding: 'utf-8'
    });

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName || 'nova-generated-app',
        projectSettings: {
          framework: 'vite'
        },
        files: vercelFiles
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vercel Deploy Error:', data);
      throw new Error(data.error?.message || 'Failed to trigger Vercel pipeline');
    }

    return NextResponse.json({
      success: true,
      url: data.url,
      inspectorUrl: data.inspectorUrl
    });

  } catch (error: any) {
    console.error('Deployment Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
