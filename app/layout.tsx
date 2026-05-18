// app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import SkipLink from "@/components/ui/SkipLink";
import CustomCursor from "@/components/ui/CustomCursor";
import ParticleBackground from "@/components/ui/ParticleBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veera Palla // Sr. React.js / Node.js Developer",
  description:
    "Senior Full Stack Engineer with 11+ years of experience specializing in React 18, Node.js 21, AI/RAG, and Cloud architectures.",
  keywords: [
    "Senior Full Stack Engineer",
    "React 18",
    "Node.js 21",
    "AI Engineering",
    "RAG",
    "Kafka",
    "Cloud Architecture",
    "Veera Palla",
  ],
  authors: [{ name: "Veera Palla" }],
  openGraph: {
    title: "Veera Palla // Sr. React.js / Node.js Developer",
    description: "11+ years of engineering excellence in React, Node.js, and AI systems.",
    type: "website",
  },
};

// Prevents flash of wrong theme before React hydrates
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <ParticleBackground />
        <SkipLink />
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
