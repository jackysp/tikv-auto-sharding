export interface Node {
  id: number;
  color: string;
}

export interface Region {
  id: number;
  startKey: number;
  endKey: number;
  size: number;
  color: string;
  nodeId: number;
}

export type WriteType = 'random' | 'hotspot' | 'delete';

export interface WriteEffect {
  key: number;
  type: WriteType;
}