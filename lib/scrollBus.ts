// lib/scrollBus.ts — frame-rate flight signals shared across the canvas tree
// without per-frame React state. Written by CameraRig, read everywhere.
export const scrollBus = { offset: 0, delta: 0, warp: 0 };

// story bands registered for proximity fade (mutated outside React state)
export interface StoryBand { el: HTMLElement; o: number; fade: number }
export const storyBands: StoryBand[] = [];
