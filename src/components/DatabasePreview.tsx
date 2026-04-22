'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function DatabasePreview({ files, projectId, className = '' }: any) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) return;

    // Debounce to prevent spamming the server on every keystroke
    const timer = setTimeout(async () => {
      setIsCompiling(true);
      setError('');
      
      try {
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files, projectId: projectId || Date.now() })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Server compilation failed');
        }

        if (data.url) {
          // It successfully uploaded to Supabase Storage!
          setPreviewUrl(data.url);
          if (iframeRef.current) {
             iframeRef.current.src = data.url;
          }
        } else if (data.html) {
          // Fallback if Supabase isn't configured
          setPreviewUrl('');
          if (iframeRef.current) {
             iframeRef.current.srcdoc = data.html;
          }
        }
        
      } catch (err: any) {
        console.error("Database Playground Error:", err);
        setError(err.message);
      } finally {
        setIsCompiling(false);
      }
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timer);
  }, [files, projectId]);

  return (
    <div className={`relative w-full h-full bg-white flex items-center justify-center ${className}`}>
      {isCompiling && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-md text-xs font-mono z-50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Server Compiling...
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-500/10 text-red-500 font-mono text-xs overflow-auto max-h-[50%] z-50 border-b border-red-500/20 shadow-xl backdrop-blur-sm">
          <strong>Database Compiler Error:</strong><br />
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
