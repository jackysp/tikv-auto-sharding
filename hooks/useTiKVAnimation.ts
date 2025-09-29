import { useState, useCallback, useRef, useEffect } from 'react';
import type { Region, WriteEffect } from '../types';
import { TOTAL_KEY_SPACE, REGION_COLORS, WRITE_SIZE_INCREASE, WRITE_SIZE_DECREASE, NODES } from '../constants';

interface UseTiKVAnimationProps {
  maxRegionSize: number;
  mergeThreshold: number;
  autoMerge: boolean;
}

const getInitialRegions = (): Region[] => [
  {
    id: 1,
    startKey: 0,
    endKey: TOTAL_KEY_SPACE,
    size: 0,
    color: REGION_COLORS[0],
    nodeId: 1, // Assign to the first node
  },
];

export const useTiKVAnimation = ({ maxRegionSize, mergeThreshold, autoMerge }: UseTiKVAnimationProps) => {
  const [regions, setRegions] = useState<Region[]>(getInitialRegions);
  const [logs, setLogs] = useState<string[]>(['Simulation started. Initial region created on TiKV 1.']);
  const [writeEffect, setWriteEffect] = useState<WriteEffect | null>(null);

  const nextRegionId = useRef(2);
  // Fix: Provide an initial value to `useRef` to resolve "Expected 1 arguments, but got 0" error.
  const prevAutoMergeRef = useRef<boolean | undefined>(undefined);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 100)]);
  }, []);

  const splitRegion = useCallback((regionToSplit: Region) => {
    const splitKey = Math.floor((regionToSplit.startKey + regionToSplit.endKey) / 2);

    setRegions(prevRegions => {
      // Find the least loaded node to move one of the new regions to
      const nodeLoads = NODES.map(node => ({
        nodeId: node.id,
        count: prevRegions.filter(r => r.nodeId === node.id).length,
      }));

      // Prefer moving to a different node
      const otherNodes = nodeLoads.filter(n => n.nodeId !== regionToSplit.nodeId);
      const leastLoadedNode = otherNodes.length > 0 
        ? otherNodes.reduce((a, b) => (a.count <= b.count ? a : b))
        : nodeLoads.find(n => n.nodeId === regionToSplit.nodeId)!;

      const newRegion1: Region = {
        ...regionToSplit,
        endKey: splitKey,
        size: Math.floor(regionToSplit.size / 2),
        id: nextRegionId.current++,
        color: REGION_COLORS[nextRegionId.current % REGION_COLORS.length],
        nodeId: regionToSplit.nodeId, // First new region stays on the original node
      };
      
      const newRegion2: Region = {
        ...regionToSplit,
        startKey: splitKey,
        size: Math.ceil(regionToSplit.size / 2),
        id: nextRegionId.current++,
        color: REGION_COLORS[nextRegionId.current % REGION_COLORS.length],
        nodeId: leastLoadedNode.nodeId, // Second new region moves to the least loaded node
      };

      const index = prevRegions.findIndex(r => r.id === regionToSplit.id);
      if (index === -1) return prevRegions;
      
      const newRegions = [...prevRegions];
      newRegions.splice(index, 1, newRegion1, newRegion2);
      
      addLog(`Region ${regionToSplit.id} split at key ${splitKey} into Region ${newRegion1.id} (TiKV ${newRegion1.nodeId}) and ${newRegion2.id} (TiKV ${newRegion2.nodeId}).`);
      if (newRegion1.nodeId !== newRegion2.nodeId) {
        addLog(`Region ${newRegion2.id} moved to TiKV ${newRegion2.nodeId} for load balancing.`);
      }

      return newRegions;
    });
  }, [addLog]);


  const addWrite = useCallback((key: number) => {
    let targetRegion: Region | undefined;
    let targetIndex = -1;

    setRegions(prevRegions => {
      const newRegions = [...prevRegions];
      targetIndex = newRegions.findIndex(r => key >= r.startKey && key < r.endKey);
      
      if (targetIndex !== -1) {
        targetRegion = { ...newRegions[targetIndex] };
        targetRegion.size += WRITE_SIZE_INCREASE;
        newRegions[targetIndex] = targetRegion;
        addLog(`Write to key ${key} in Region ${targetRegion.id} on TiKV ${targetRegion.nodeId}. New size: ${targetRegion.size}.`);
      } else {
        addLog(`Write to key ${key} failed. No region found.`);
      }
      return newRegions;
    });

    setTimeout(() => {
        if (targetRegion && targetRegion.size > maxRegionSize) {
            splitRegion(targetRegion);
        }
    }, 100); // Delay split to allow UI to update
    
  }, [addLog, maxRegionSize, splitRegion]);

  const addDelete = useCallback((key: number) => {
    setRegions(prevRegions => {
        const newRegions = [...prevRegions];
        const targetIndex = newRegions.findIndex(r => key >= r.startKey && key < r.endKey);

        if (targetIndex !== -1) {
            const targetRegion = { ...newRegions[targetIndex] };
            targetRegion.size = Math.max(0, targetRegion.size - WRITE_SIZE_DECREASE);
            newRegions[targetIndex] = targetRegion;
            addLog(`Delete from key ${key} in Region ${targetRegion.id} on TiKV ${targetRegion.nodeId}. New size: ${targetRegion.size}.`);
        } else {
            addLog(`Delete from key ${key} failed. No region found.`);
        }
        return newRegions;
    });
  }, [addLog]);

  const triggerMergeScan = useCallback(() => {
    addLog('Starting merge scan...');
    setRegions(prevRegions => {
        let regionsChanged = false;
        let currentRegions = [...prevRegions];

        if (currentRegions.length <= 1) {
            addLog('Merge scan complete. No potential merges.');
            return currentRegions;
        }

        let newRegions = [...currentRegions];
        
        for (let i = 0; i < newRegions.length - 1; i++) {
            const region1 = newRegions[i];
            const region2 = newRegions[i+1];

            // Check if both adjacent regions are below the merge threshold
            if (region1.size < mergeThreshold && region2.size < mergeThreshold) {
                // Case 1: Regions are on the same node -> MERGE
                if (region1.nodeId === region2.nodeId) {
                    const mergedRegion: Region = {
                        id: nextRegionId.current++,
                        startKey: region1.startKey,
                        endKey: region2.endKey,
                        size: region1.size + region2.size,
                        color: REGION_COLORS[nextRegionId.current % REGION_COLORS.length],
                        nodeId: region1.nodeId,
                    };
                    addLog(`Merging Region ${region1.id} and ${region2.id} on TiKV ${region1.nodeId} into new Region ${mergedRegion.id}.`);
                    newRegions.splice(i, 2, mergedRegion);
                    regionsChanged = true;
                    break; // A merge happened, restart scan
                } 
                // Case 2: Regions are on different nodes -> SCHEDULE (move region2 to region1's node)
                else {
                    addLog(`Scheduling: Moving Region ${region2.id} from TiKV ${region2.nodeId} to TiKV ${region1.nodeId} to prepare for merge with Region ${region1.id}.`);
                    const movedRegion2 = { ...region2, nodeId: region1.nodeId };
                    newRegions.splice(i + 1, 1, movedRegion2);
                    regionsChanged = true;
                    break; // A move happened, restart scan
                }
            }
        }
        
        if (!regionsChanged) {
            addLog('Merge scan complete. No mergeable regions found.');
        }

        return regionsChanged ? newRegions : prevRegions;
    });
  }, [addLog, mergeThreshold]);
  
  useEffect(() => {
    if (prevAutoMergeRef.current !== autoMerge) {
        addLog(autoMerge ? 'Auto-merge enabled. Scanning periodically...' : 'Auto-merge disabled.');
    }
    prevAutoMergeRef.current = autoMerge;
    
    if (autoMerge) {
      const intervalId = setInterval(() => {
        triggerMergeScan();
      }, 5000); // Scan every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [autoMerge, triggerMergeScan, addLog]);


  const resetSimulation = useCallback(() => {
    setRegions(getInitialRegions());
    nextRegionId.current = 2;
    setLogs(['Simulation reset.']);
  }, []);

  return { regions, logs, addWrite, addDelete, resetSimulation, setWriteEffect, writeEffect };
};