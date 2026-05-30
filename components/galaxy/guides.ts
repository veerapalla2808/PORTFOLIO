// components/galaxy/guides.ts
export interface Guide { handle: string; variant: number; lines: string[]; }

// Narration drafted from lib/data.ts; edit wording freely.
export const GUIDES: Record<string, Guide> = {
  hero:       { handle: 'NAV-0',  variant: 0, lines: ['Booting navigation core…', 'Welcome aboard, operator. Plotting a course through eleven years of signal.'] },
  about:      { handle: 'MEM-1',  variant: 1, lines: ['Decrypting core memory…', 'Origin: a full-stack engineer forged across fintech, health, retail and AI.'] },
  skills:     { handle: 'ARC-2',  variant: 2, lines: ['Arsenal online.', 'Loadout: React, Node, AI/RAG, Kafka, cloud — calibrated for production scale.'] },
  experience: { handle: 'LOG-3',  variant: 3, lines: ['Reading voyage log…', 'Five star systems served — Comerica, UCLA Health, Dillard’s, KeyBank, Foxconn.'] },
  projects:   { handle: 'OPS-4',  variant: 4, lines: ['Mission archive unsealed.', 'Flagship ops: an AI banking assistant and a HIPAA EMR platform.'] },
  education:  { handle: 'EDU-5',  variant: 5, lines: ['Accessing the academy.', 'Credentials verified — certified across Node.js and React.'] },
  blog:       { handle: 'TX-6',   variant: 6, lines: ['Incoming transmissions…', 'Field notes and signals broadcast from the engineering frontier.'] },
  contact:    { handle: 'HAIL-7', variant: 7, lines: ['Channel open.', 'Hailing frequencies clear. Transmit to begin a new mission together.'] },
};
