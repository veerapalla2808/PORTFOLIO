// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, VT323, Shojumaru } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030308",
};

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const vt323 = VT323({ weight: "400", variable: "--font-vt", subsets: ["latin"], display: "swap" });
// Latin glyphs drawn like katakana — the display face of the grid
const zen = Shojumaru({ weight: "400", variable: "--font-zen", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Veera Palla — follow the white rabbit",
  description:
    "Sr. React.js / Node.js Developer — 11+ years building scalable, high-performance systems across fintech, healthcare, retail and AI. Enter the construct.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${vt323.variable} ${zen.variable}`}
      style={{ background: '#04050A' }}
    >
      {/* inline backgrounds guarantee a dark first paint — no white flash */}
      <body style={{ background: '#04050A' }}>{children}</body>
    </html>
  );
}
