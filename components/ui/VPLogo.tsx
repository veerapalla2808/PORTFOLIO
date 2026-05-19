'use client';
import { motion, useReducedMotion } from 'framer-motion';

interface VPLogoProps { size?: number; }

export default function VPLogo({ size = 60 }: VPLogoProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      style={{ width: size, height: size, perspective: 400, display: 'inline-block' }}
      animate={reduced ? {} : {
        rotateY: [0, 12, 0, -12, 0],
        y:       [0, -4,  0,  -4, 0],
      }}
      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08 }}
    >
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="vp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx="30" cy="30" r="28"
          fill="none"
          stroke="url(#vp-grad)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* VP initials */}
        <text
          x="50%" y="46%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontWeight="900"
          fontSize="22"
          fill="url(#vp-grad)"
          letterSpacing="-1"
        >
          VP
        </text>

        {/* Dev marker */}
        <text
          x="50%" y="72%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontWeight="700"
          fontSize="9"
          fill="var(--text-muted)"
          opacity="0.5"
        >
          {'</>'}
        </text>
      </svg>
    </motion.div>
  );
}
