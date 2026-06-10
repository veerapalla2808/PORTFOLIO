// lib/scrollBus.ts — frame-rate scroll signals shared across the canvas tree
// without per-frame React state. Written by ActTracker, read by Effects.
export const scrollBus = { offset: 0, delta: 0 };

// story bands registered for proximity fade (mutated outside React state)
export interface StoryBand { el: HTMLElement; o: number; fade: number }
export const storyBands: StoryBand[] = [];
