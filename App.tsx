import React, { useState, useCallback } from 'react';
import { useTiKVAnimation } from './hooks/useTiKVAnimation';
import { KeySpaceVisualizer } from './components/KeySpaceVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { InfoPanel } from './components/InfoPanel';
import { INITIAL_MAX_REGION_SIZE, INITIAL_MERGE_THRESHOLD, NODES } from './constants';
import { getRandomKey, getMidpointKey } from './utils/keyUtils';

export default function App() {
  const [maxRegionSize, setMaxRegionSize] = useState<number>(INITIAL_MAX_REGION_SIZE);
  const [mergeThreshold, setMergeThreshold] = useState<number>(INITIAL_MERGE_THRESHOLD);
  const [hotspotKey, setHotspotKey] = useState<string | null>(null);
  const [autoMerge, setAutoMerge] = useState<boolean>(true);

  const {
    regions,
    logs,
    addWrite,
    addDelete,
    resetSimulation,
    setWriteEffect,
    writeEffect,
  } = useTiKVAnimation({ maxRegionSize, mergeThreshold, autoMerge });

  const handleAddWrite = useCallback(() => {
    const key = getRandomKey();
    setHotspotKey(null);
    setWriteEffect({ key, type: 'random' });
    addWrite(key);
  }, [addWrite, setWriteEffect]);

  const handleAddHotspotWrite = useCallback(() => {
    let currentHotspotKey = hotspotKey;
    if (currentHotspotKey === null || !regions.some(r => currentHotspotKey >= r.startKey && currentHotspotKey < r.endKey)) {
      const targetRegionIndex = Math.floor(Math.random() * regions.length);
      const targetRegion = regions[targetRegionIndex];
      currentHotspotKey = getMidpointKey(targetRegion.startKey, targetRegion.endKey);
      setHotspotKey(currentHotspotKey);
    }
    setWriteEffect({ key: currentHotspotKey, type: 'hotspot' });
    addWrite(currentHotspotKey);
  }, [hotspotKey, addWrite, regions, setWriteEffect]);

  const handleAddDelete = useCallback(() => {
    const key = getRandomKey();
    setHotspotKey(null);
    setWriteEffect({ key, type: 'delete' });
    addDelete(key);
  }, [addDelete, setWriteEffect]);

  const handleReset = useCallback(() => {
    setHotspotKey(null);
    resetSimulation();
  }, [resetSimulation]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-4 md:p-8 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-400">TiKV Auto-Sharding Visualizer</h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          An interactive animation of TiKV's range-based sharding in a 64-bit hexadecimal key space.
        </p>
      </header>
      
      <main className="flex-grow flex flex-col gap-8">
        <ControlPanel
          onAddWrite={handleAddWrite}
          onAddHotspotWrite={handleAddHotspotWrite}
          onAddDelete={handleAddDelete}
          onReset={handleReset}
          maxRegionSize={maxRegionSize}
          setMaxRegionSize={setMaxRegionSize}
          mergeThreshold={mergeThreshold}
          setMergeThreshold={setMergeThreshold}
          autoMerge={autoMerge}
          setAutoMerge={setAutoMerge}
        />
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-700">
           <KeySpaceVisualizer regions={regions} nodes={NODES} writeEffect={writeEffect} />
        </div>
        
        <InfoPanel regions={regions} logs={logs} nodes={NODES} />
      </main>

      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Built by a world-class senior frontend React engineer.</p>
      </footer>
    </div>
  );
}
