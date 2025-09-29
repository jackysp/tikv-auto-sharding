import type { Node } from './types';

export const TOTAL_KEY_SPACE = 1024;
export const INITIAL_MAX_REGION_SIZE = 100;
export const INITIAL_MERGE_THRESHOLD = 40;
export const WRITE_SIZE_INCREASE = 10;
export const WRITE_SIZE_DECREASE = 10;

export const NODES: Node[] = [
  { id: 1, color: '#34d399' }, // emerald-400
  { id: 2, color: '#60a5fa' }, // blue-400
  { id: 3, color: '#f472b6' }, // pink-400
];

export const REGION_COLORS = [
  '#2dd4bf', // teal-400
  '#a78bfa', // violet-400
  '#fbbf24', // amber-400
  '#84cc16', // lime-500
  '#22d3ee', // cyan-400
  '#c084fc', // purple-400
  '#f87171', // red-400
];