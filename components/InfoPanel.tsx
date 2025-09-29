import React, { useRef, useEffect } from 'react';
import type { Region, Node } from '../types';

interface InfoPanelProps {
  regions: Region[];
  logs: string[];
  nodes: Node[];
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ regions, logs, nodes }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const regionsPerNode = nodes.map(node => ({
      ...node,
      count: regions.filter(r => r.nodeId === node.id).length,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-400">Total Regions</h3>
            <p className="text-5xl font-bold text-teal-400">{regions.length}</p>
        </div>
        <div className="space-y-2">
            <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">Regions per TiKV</h4>
            {regionsPerNode.map(node => (
                <div key={node.id} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: node.color }}></span>
                        TiKV {node.id}
                    </span>
                    <span className="font-mono font-bold text-gray-200">{node.count}</span>
                </div>
            ))}
        </div>
      </div>
      <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Event Log</h3>
        <div ref={logContainerRef} className="h-48 bg-gray-900 rounded-md p-3 overflow-y-auto font-mono text-sm text-gray-300 space-y-1">
          {logs.map((log, index) => (
            <p key={index} className="whitespace-nowrap">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};