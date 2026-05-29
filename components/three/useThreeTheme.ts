// components/three/useThreeTheme.ts
'use client';
import { useState, useEffect } from 'react';
import { Color } from 'three';

function readColor(varName: string, fallback: string): Color {
  const cs = getComputedStyle(document.documentElement);
  const raw = cs.getPropertyValue(varName).trim() || fallback;
  return new Color(raw);
}

export function useThreeTheme() {
  const [colors, setColors] = useState(() => ({
    accent: new Color('#7b6fff'),
    accent2: new Color('#c084fc'),
  }));

  useEffect(() => {
    const read = () =>
      setColors({
        accent: readColor('--accent', '#7b6fff'),
        accent2: readColor('--accent-2', '#c084fc'),
      });
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return colors;
}
