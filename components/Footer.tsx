"use client";

import { personal } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="container-wide flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
             <span className="text-black font-black text-xs">V</span>
           </div>
           <span className="font-mono text-[10px] font-bold tracking-tighter text-white/40">
             VEERA PALLA // SENIOR SOFTWARE ENGINEER // 2026
           </span>
        </div>

        <div className="flex gap-8">
          {[
            { label: "MEDIUM", href: personal.medium },
            { label: "LINKEDIN", href: personal.linkedin },
            { label: "RESUME", href: personal.resumeUrl }
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-[10px] font-black tracking-[0.3em] text-white/20 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
          ESTABLISHED IN 2013 // CONTINUOUSLY EVOLVING
        </div>
      </div>
    </footer>
  );
}
