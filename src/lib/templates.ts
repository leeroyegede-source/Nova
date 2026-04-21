export interface TemplateItem {
  id: string;
  name: string;
  category: "E-commerce" | "SaaS" | "Dashboard" | "Blog/Docs" | "Web3" | "AI Native" | "Mobile App";
  stack: "Next.js" | "React" | "React Native";
  database: "Supabase" | "Firebase" | "Vercel Postgres" | "Prisma" | "None";
  description: string;
  sourceUrl?: string;
}

export const TEMPLATE_REGISTRY: TemplateItem[] = [
  {
    id: "tpl-1",
    name: "Next.js Commerce (by Vercel)",
    category: "E-commerce",
    stack: "Next.js",
    database: "None",
    description: "The all-in-one React starter kit for high-performance e-commerce sites. Features Shopify/BigCommerce integrations, edge caching, and optimal SEO.",
    sourceUrl: "https://github.com/vercel/commerce"
  },
  {
    id: "tpl-2",
    name: "Taxonomy (by shadcn)",
    category: "SaaS",
    stack: "Next.js",
    database: "Prisma",
    description: "An open source application built using the new router, server components, and everything new in Next.js. Features fully styled Radix UI components.",
    sourceUrl: "https://github.com/shadcn-ui/taxonomy"
  },
  {
    id: "tpl-3",
    name: "Next.js App Router Dashboard",
    category: "Dashboard",
    stack: "Next.js",
    database: "Vercel Postgres",
    description: "The official Next.js Dashboard App demonstrating Server Actions, streaming, and database integration.",
    sourceUrl: "https://github.com/vercel/next-learn/tree/main/dashboard"
  },
  {
    id: "tpl-4",
    name: "Novel AI Editor Workspace",
    category: "AI Native",
    stack: "Next.js",
    database: "Vercel Postgres",
    description: "A Notion-style WYSIWYG editor with AI-powered autocompletion natively integrated using the Vercel AI SDK.",
    sourceUrl: "https://github.com/steven-tey/novel"
  },
  {
    id: "tpl-5",
    name: "Nextra Documentation Site",
    category: "Blog/Docs",
    stack: "Next.js",
    database: "None",
    description: "Simple, powerful, and flexible site generation framework with Markdown/MDX mapping for creating beautiful documentation.",
    sourceUrl: "https://github.com/shuding/nextra"
  },
  {
    id: "tpl-6",
    name: "Supabase Next.js Starter",
    category: "SaaS",
    stack: "Next.js",
    database: "Supabase",
    description: "The official Supabase starter with pre-configured SSR authentication, protected routing, and database schema mapping over Row-Level Security.",
    sourceUrl: "https://github.com/supabase/supabase/tree/master/examples/auth/nextjs"
  },
  {
    id: "tpl-7",
    name: "Create T3 App",
    category: "SaaS",
    stack: "Next.js",
    database: "Prisma",
    description: "The best way to start a full-stack, typesafe Next.js app. Includes tRPC, Tailwind CSS, NextAuth.js, and Prisma.",
    sourceUrl: "https://github.com/t3-oss/create-t3-app"
  },
  {
    id: "tpl-8",
    name: "Firebase Chat Connect",
    category: "Mobile App",
    stack: "React Native",
    database: "Firebase",
    description: "Real-time chat schema implementing Firebase Firestore websockets alongside Firebase native auth on Expo.",
    sourceUrl: "https://github.com/expo/examples"
  }
];
