import React, { useState } from 'react';
import type { Region, WriteEffect, Node, WriteType } from '../types';
import { getKeyAsPercentage, formatKey, MIN_KEY, MAX_KEY } from '../utils/keyUtils';

interface RegionBlockProps {
  region: Region;
  isHotspot: boolean;
}

const RegionBlock: React.FC<RegionBlockProps> = ({ region, isHotspot }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const left = getKeyAsPercentage(region.startKey);
  const end = getKeyAsPercentage(region.endKey);
  const width = end - left;

  return (
    <div
      key={region.id}
      className="absolute h-full group"
      style={{ left: `${left}%`, width: `${width}%` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        className={`h-full rounded-md border-2 border-gray-900 transition-all duration-500 ease-in-out flex items-center justify-center text-xs font-mono font-bold text-gray-900 overflow-hidden ${isHotspot ? 'animate-flash' : ''}`}
        style={{ backgroundColor: region.color }}
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
          {region.id}
        </span>
      </div>
      {showTooltip && (
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 left-1/2 -translate-x-1/2">
          <p><span className="font-bold text-teal-400">Region ID:</span> {region.id}</p>
          <p><span className="font-bold text-teal-400">TiKV ID:</span> {region.nodeId}</p>
          <p><span className="font-bold text-teal-400">Keys:</span> [{formatKey(region.startKey)}, {formatKey(region.endKey)})</p>
          <p><span className="font-bold text-teal-400">Size:</span> {region.size}</p>
        </div>
      )}
    </div>
  );
};

interface WritePingProps {
  writeEffect: WriteEffect;
}

const WritePing: React.FC<WritePingProps> = ({ writeEffect }) => {
    const left = getKeyAsPercentage(writeEffect.key);
    
    const getPingColor = (type: WriteType) => {
        switch (type) {
            case 'hotspot':
                return '#f87171'; // red-400
            case 'delete':
                return '#fbbf24'; // amber-400
            case 'random':
            default:
                return '#ffffff';
        }
    };

    return (
        <div 
            key={Date.now()} 
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full animate-pingWrite pointer-events-none"
            style={{ left: `${left}%`, backgroundColor: getPingColor(writeEffect.type) }}
        >
        </div>
    );
};


interface KeySpaceVisualizerProps {
  regions: Region[];
  nodes: Node[];
  writeEffect: WriteEffect | null;
}

export const KeySpaceVisualizer: React.FC<KeySpaceVisualizerProps> = ({ regions, nodes, writeEffect }) => {
    const writeRegion = writeEffect ? regions.find(r => writeEffect.key >= r.startKey && writeEffect.key < r.endKey) : null;
    const writeNodeId = writeRegion?.nodeId;

  return (
    <div className="w-full">
      <div className="flex justify-between font-mono text-xs text-gray-400 mb-2 pl-[5.5rem]">
        <span>Start Key: {formatKey(MIN_KEY)}</span>
        <span>End Key: {formatKey(MAX_KEY)}</span>
      </div>
       <div className="flex flex-col gap-2">
        {nodes.map((node) => {
          const nodeRegions = regions.filter(r => r.nodeId === node.id);
          const showPing = writeEffect && writeNodeId === node.id;
          
          return (
            <div key={node.id} className="flex items-center gap-4">
              <div className="w-20 font-mono text-sm text-right text-gray-400 flex items-center justify-end gap-2 shrink-0">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: node.color }}></span>
                <span>TiKV {node.id}</span>
              </div>
              <div className="relative flex-grow h-12 bg-gray-700 rounded-lg overflow-hidden">
                {nodeRegions.map(region => {
                   const isHotspot = writeEffect?.type === 'hotspot' && !!writeRegion && writeRegion.id === region.id;
                   return <RegionBlock key={region.id} region={region} isHotspot={isHotspot} />;
                })}
                {showPing && <WritePing writeEffect={writeEffect} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
