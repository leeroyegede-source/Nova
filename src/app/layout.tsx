import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NovaAI - Autonomous App Builder",
  description: "Prompt sophisticated web and mobile apps into existence. Built-in API gateway, Email Services, and AI OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-black text-white selection:bg-indigo-500/30`}>
        <NavigationWrapper>{children}</NavigationWrapper>
      </body>
    </html>
  );
}
