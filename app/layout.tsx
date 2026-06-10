// app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const vt323 = VT323({ weight: "400", variable: "--font-vt", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Veera Palla — follow the white rabbit",
  description:
    "Sr. React.js / Node.js Developer — 11+ years building scalable, high-performance systems across fintech, healthcare, retail and AI. Enter the construct.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${vt323.variable}`}>
      <body>{children}</body>
    </html>
  );
}
