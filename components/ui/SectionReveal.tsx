// components/ui/SectionReveal.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export default function SectionReveal({ children, delay = 0 }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 70, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
