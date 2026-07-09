// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090D13",
};

// geometric-humanist sans in the Google Sans family — carries the whole site
const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});
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
      className={`${figtree.variable} ${jetbrains.variable}`}
      style={{ background: "#090D13" }}
    >
      <head>
        {/* Material Symbols — vector icon font (Google's own icon set) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* display=block: hide the ligature name until the icon glyph is ready */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body style={{ background: "#090D13" }}>{children}</body>
    </html>
  );
}
