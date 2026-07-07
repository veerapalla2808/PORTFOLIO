// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Archivo_Black, Shojumaru } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F4EF",
};

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
// the loud one — neo-brutalist display
const archivo = Archivo_Black({ weight: "400", variable: "--font-display", subsets: ["latin"], display: "swap" });
// the brush one — Japanese-styled accents
const shojumaru = Shojumaru({ weight: "400", variable: "--font-jp", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Veera Palla — Full-Stack Developer",
  description:
    "Full-Stack Developer: React, TypeScript, Java 17, Spring Boot, AWS. ~4 years across retail, airline and e-commerce. Currently shipping at Walmart.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${archivo.variable} ${shojumaru.variable}`}
      style={{ background: "#F5F4EF" }}
    >
      <body style={{ background: "#F5F4EF" }}>{children}</body>
    </html>
  );
}
