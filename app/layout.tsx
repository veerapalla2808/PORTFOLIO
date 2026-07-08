// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0E14",
};

// display — opinionated, high-personality grotesque for the name and headings
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
// body — warm, readable grotesque (not Inter)
const hanken = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});
// technical labels
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veera Palla — Full-Stack Developer",
  description:
    "Full-stack developer. Front-end and back-end as two interfaces — pick a side. React + TypeScript on the light side, Java 17 + Spring Boot + AWS on the dark side.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable} ${jetbrains.variable}`}
      style={{ background: "#0B0E14" }}
    >
      <body style={{ background: "#0B0E14" }}>{children}</body>
    </html>
  );
}
