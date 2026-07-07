// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101318",
};

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
// editorial display face — carries the personality on both panes
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Veera Palla — Full-Stack Developer",
  description:
    "Full-Stack Developer: React + TypeScript on one side, Java 17 + Spring Boot + AWS on the other. ~4 years across retail, airline and e-commerce. Currently at Walmart.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${fraunces.variable}`}
      style={{ background: "#101318" }}
    >
      <body style={{ background: "#101318" }}>{children}</body>
    </html>
  );
}
