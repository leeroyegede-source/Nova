export const generateSupabaseIntegreation = (projectName: string) => {
  return {
    "utils/supabase/client.ts": `
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
    `.trim(),
    "utils/supabase/server.ts": `
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
    `.trim(),
    "schema.sql": `
-- Default Supabase Schema for ${projectName}
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT,
  full_name TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
    `.trim()
  }
}

export const generateFirebaseIntegration = () => {
  return {
    "utils/firebase/client.ts": `
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
    `.trim()
  }
}

export const generateNovaServices = () => {
  return {
    "utils/nova/gateway.ts": `
// Automatically linked to Nova API Gateway for proxy routing
export const fetchProxy = async (endpoint: string, options: RequestInit) => {
  // In a real deployed environment, this routes dynamically to your managed APIs
  return fetch(\`/api/proxy\${endpoint}\`, {
    ...options,
    headers: {
      ...options.headers,
      'x-nova-key': process.env.NOVA_SECRET_KEY!
    }
  });
}
    `.trim(),
    "utils/nova/ocr.ts": `
// Pre-integrated OCR Pipeline System using app serverless routes
export const extractDocumentText = async (fileBuffer: Buffer, mimeType: string) => {
  const formData = new FormData();
  formData.append('document', new Blob([fileBuffer], { type: mimeType }));

  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: formData
  });
  return response.json();
}
    `.trim(),
    "utils/nova/email.ts": `
// Orchestrated Email Sender Service
export const sendSystemEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch('/api/email', {
    method: 'POST',
    body: JSON.stringify({ to, subject, html }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
    `.trim(),
    "utils/nova/api-caller.ts": `
// Generic API Weblink Caller through secure Gateway
export const executeApiCall = async (targetUrl: string, method: string = 'GET', payload?: any) => {
  const response = await fetch('/api/gateway', {
    method: 'POST',
    body: JSON.stringify({ targetUrl, method, payload }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
    `.trim(),
    "utils/nova/oauth-integrator.ts": `
// Platform 3rd-Party OAuth Orchestrator
export const connectPlatformAccount = async (platformName: 'google' | 'stripe' | 'slack', authCode: string) => {
  const response = await fetch('/api/oauth', {
    method: 'POST',
    body: JSON.stringify({ platform: platformName, authorizationCode: authCode }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
    `.trim(),
    "utils/nova/engine/storage.ts": `
// 6. Native File Upload & Bucket Storage Pipeline
export const uploadAppAsset = async (bucket: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
}
    `.trim(),
    "utils/nova/engine/pdf-generator.ts": `
// 9. Automated PDF & Certificate Generation Engine
export const generatePdfDocument = async (htmlTemplate: string, filename: string) => {
  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    body: JSON.stringify({ html: htmlTemplate, filename }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json(); // Returns a secure download URL
}
    `.trim(),
    "utils/nova/engine/workflow.ts": `
// 4 & 8. Workflow Automation and Rules Engine Evaluator
export const evaluateWorkflowRules = async (workflowId: string, currentData: Record<string, any>) => {
  // Dispatches to internal evaluation graph
  const response = await fetch('/api/workflow/execute', {
    method: 'POST',
    body: JSON.stringify({ workflowId, currentData }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
    `.trim(),
    "utils/nova/engine/verification.ts": `
// 7. Identity & Integrations Layer (OTP, NIN, Validation)
export const dispatchVerificationOTP = async (phoneOrEmail: string, channel: 'sms' | 'email') => {
  const response = await fetch('/api/integrations/otp', {
    method: 'POST',
    body: JSON.stringify({ target: phoneOrEmail, channel }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
    `.trim()
  }
}
