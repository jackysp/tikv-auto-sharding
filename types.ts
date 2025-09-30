export interface Node {
  id: number;
  color: string;
}

export interface Region {
  id: number;
  startKey: string;
  endKey: string;
  size: number;
  color: string;
  nodeId: number;
}

export type WriteType = 'random' | 'hotspot' | 'delete';

export interface WriteEffect {
  key: string;
  type: WriteType;
}
