import React from 'react';
import { PlayIcon, FireIcon, ArrowPathIcon, TrashIcon } from './icons';

interface ControlPanelProps {
  onAddWrite: () => void;
  onAddHotspotWrite: () => void;
  onAddDelete: () => void;
  onReset: () => void;
  maxRegionSize: number;
  setMaxRegionSize: (value: number) => void;
  mergeThreshold: number;
  setMergeThreshold: (value: number) => void;
  autoMerge: boolean;
  setAutoMerge: (value: boolean) => void;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; title: string }> = ({ onClick, children, className = '', title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white rounded-md shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${enabled ? 'bg-teal-500 focus:ring-teal-400' : 'bg-gray-600 focus:ring-gray-500'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddWrite,
  onAddHotspotWrite,
  onAddDelete,
  onReset,
  maxRegionSize,
  setMaxRegionSize,
  mergeThreshold,
  setMergeThreshold,
  autoMerge,
  setAutoMerge,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 col-span-1 lg:col-span-3">
          <ControlButton onClick={onAddWrite} className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" title="Add a single random write">
            <PlayIcon /> Random Write
          </ControlButton>
          <ControlButton onClick={onAddDelete} className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500" title="Add a single random delete operation">
            <TrashIcon /> Random Delete
          </ControlButton>
          <ControlButton onClick={onAddHotspotWrite} className="bg-red-600 hover:bg-red-700 focus:ring-red-500" title="Add writes to a single 'hot' region">
            <FireIcon /> Hotspot Write
          </ControlButton>
          <ControlButton onClick={onReset} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" title="Reset the simulation to its initial state">
            <ArrowPathIcon /> Reset
          </ControlButton>
        </div>

        {/* Sliders & Toggles */}
        <div className="space-y-4 col-span-1 lg:col-span-2">
            <ToggleSwitch
                label="Auto-Merge"
                enabled={autoMerge}
                onChange={setAutoMerge}
            />
            <div className="flex flex-col">
                <label htmlFor="max-region-size" className="mb-1 text-sm font-medium text-gray-300">
                    Split Threshold (Size &gt; {maxRegionSize})
                </label>
                <input
                    id="max-region-size"
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={maxRegionSize}
                    onChange={(e) => setMaxRegionSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="merge-threshold" className="mb-1 text-sm font-medium text-gray-300">
                    Merge Threshold (Size &lt; {mergeThreshold})
                </label>
                <input
                    id="merge-threshold"
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={mergeThreshold}
                    onChange={(e) => setMergeThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
      </div>
    </div>
  );
};