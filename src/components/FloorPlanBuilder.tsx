'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Move, Plus, Trash2, Copy, Lock, Unlock, RotateCw, ZoomIn, ZoomOut, Maximize2,
  Save, Download, Upload, RefreshCw, Layers, Grid, Compass, Check, AlertCircle,
  QrCode, Calendar, Users, Home, Leaf, Sunset, Sparkles, MapPin, Eye, FileText, CheckCircle2, Shield
} from 'lucide-react';
import { FloorPlanLayout, FloorObject, ObjectCategory, ObjectShape, INITIAL_FLOOR_PLAN } from '@/models/FloorPlanModel';
import { getStoredFloorPlan, saveFloorPlan } from '@/lib/db';

interface FloorPlanBuilderProps {
  onSaveSuccess?: () => void;
}

const OBJECT_TYPES: { type: ObjectCategory; label: string; icon: string; defaultWidth: number; defaultHeight: number; shape: ObjectShape; color: string; defaultCapacity?: number }[] = [
  { type: 'table', label: 'Circle Table (2 Seats)', icon: '⭕', defaultWidth: 70, defaultHeight: 70, shape: 'circle', color: '#F5D061', defaultCapacity: 2 },
  { type: 'table', label: 'Square Table (4 Seats)', icon: '🟦', defaultWidth: 80, defaultHeight: 80, shape: 'square', color: '#6B8E5E', defaultCapacity: 4 },
  { type: 'table', label: 'Rectangle Table (6 Seats)', icon: '▭', defaultWidth: 110, defaultHeight: 80, shape: 'rectangle', color: '#E5B82C', defaultCapacity: 6 },
  { type: 'table', label: 'Hexagon VIP Table (8 Seats)', icon: '⬡', defaultWidth: 100, defaultHeight: 100, shape: 'hexagon', color: '#E5B82C', defaultCapacity: 8 },
  { type: 'sofa', label: 'Lounge Sofa', icon: '🛋️', defaultWidth: 120, defaultHeight: 50, shape: 'rectangle', color: '#7A5C3A' },
  { type: 'wall', label: 'Wall Divider', icon: '🧱', defaultWidth: 160, defaultHeight: 16, shape: 'rectangle', color: '#4A5568' },
  { type: 'window', label: 'Glass Window', icon: '🪟', defaultWidth: 140, defaultHeight: 12, shape: 'rectangle', color: '#38BDF8' },
  { type: 'door', label: 'Entrance Door', icon: '🚪', defaultWidth: 70, defaultHeight: 20, shape: 'rectangle', color: '#34D399' },
  { type: 'bar', label: 'Bar Counter', icon: '🍸', defaultWidth: 220, defaultHeight: 60, shape: 'rectangle', color: '#3D2612' },
  { type: 'counter', label: 'Reception / Cashier', icon: '💻', defaultWidth: 120, defaultHeight: 50, shape: 'rectangle', color: '#2A1E14' },
  { type: 'stage', label: 'Live Music Stage', icon: '🎤', defaultWidth: 180, defaultHeight: 70, shape: 'rectangle', color: '#E5B82C' },
  { type: 'kitchen', label: 'Kitchen Pass', icon: '🍳', defaultWidth: 200, defaultHeight: 60, shape: 'rectangle', color: '#1F1810' },
  { type: 'plants', label: 'Garden Plant Decor', icon: '🪴', defaultWidth: 45, defaultHeight: 45, shape: 'circle', color: '#10B981' },
];

export default function FloorPlanBuilder({ onSaveSuccess }: FloorPlanBuilderProps) {
  const [layout, setLayout] = useState<FloorPlanLayout>(INITIAL_FLOOR_PLAN);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(1);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Undo / Redo history
  const [history, setHistory] = useState<FloorPlanLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load stored layout on mount
  useEffect(() => {
    getStoredFloorPlan().then((data) => {
      if (data && Array.isArray(data.objects)) {
        setLayout(data);
      }
    });
  }, []);

  // Record history state
  const pushHistory = (newLayout: FloorPlanLayout) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(JSON.parse(JSON.stringify(newLayout)));
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLayout(JSON.parse(JSON.stringify(prev)));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLayout(JSON.parse(JSON.stringify(next)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Add Object
  const handleAddObject = (template: typeof OBJECT_TYPES[0]) => {
    const nextTableNum = template.type === 'table' ? `T${layout.objects.filter(o => o.type === 'table').length + 1}` : undefined;
    const newObj: FloorObject = {
      id: `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: template.type,
      name: template.type === 'table' ? `Table ${nextTableNum}` : template.label,
      tableNumber: nextTableNum,
      shape: template.shape,
      x: 100 + Math.floor(Math.random() * 150),
      y: 100 + Math.floor(Math.random() * 150),
      width: template.defaultWidth,
      height: template.defaultHeight,
      rotation: 0,
      capacity: template.defaultCapacity || (template.type === 'table' ? 4 : undefined),
      color: template.color,
      status: 'free',
      bookingEnabled: template.type === 'table',
      area: selectedAreaFilter === 'all' ? 'indoor' : selectedAreaFilter,
      floor: 'Ground Floor',
    };

    const nextLayout = {
      ...layout,
      updatedAt: new Date().toISOString(),
      objects: [...layout.objects, newObj],
    };

    setLayout(nextLayout);
    setSelectedId(newObj.id);
    pushHistory(nextLayout);
  };

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent, obj: FloorObject) => {
    if (obj.isLocked) return;
    e.stopPropagation();
    setSelectedId(obj.id);
    setDraggingId(obj.id);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let rawX = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
    let rawY = (e.clientY - canvasRect.top) / zoom - dragOffset.y;

    if (snapToGrid) {
      rawX = Math.round(rawX / gridSize) * gridSize;
      rawY = Math.round(rawY / gridSize) * gridSize;
    }

    rawX = Math.max(0, Math.min(rawX, layout.canvasWidth - 40));
    rawY = Math.max(0, Math.min(rawY, layout.canvasHeight - 40));

    setLayout((prev) => ({
      ...prev,
      objects: prev.objects.map((o) => (o.id === draggingId ? { ...o, x: rawX, y: rawY } : o)),
    }));
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
      pushHistory(layout);
    }
  };

  // Selected Object Properties Updater
  const updateSelectedObject = (updates: Partial<FloorObject>) => {
    if (!selectedId) return;
    const updated = {
      ...layout,
      objects: layout.objects.map((o) => (o.id === selectedId ? { ...o, ...updates } : o)),
    };
    setLayout(updated);
    pushHistory(updated);
  };

  const handleDuplicate = () => {
    const target = layout.objects.find((o) => o.id === selectedId);
    if (!target) return;
    const isTable = target.type === 'table';
    const nextTableNum = isTable ? `T${layout.objects.filter(o => o.type === 'table').length + 1}` : undefined;

    const dup: FloorObject = {
      ...target,
      id: `obj-${Date.now()}`,
      name: isTable ? `Table ${nextTableNum}` : `${target.name} (Copy)`,
      tableNumber: isTable ? nextTableNum : target.tableNumber,
      x: target.x + 20,
      y: target.y + 20,
    };
    const updated = { ...layout, objects: [...layout.objects, dup] };
    setLayout(updated);
    setSelectedId(dup.id);
    pushHistory(updated);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const updated = {
      ...layout,
      objects: layout.objects.filter((o) => o.id !== selectedId),
    };
    setLayout(updated);
    setSelectedId(null);
    pushHistory(updated);
  };

  // Save to D1 / Storage
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const success = await saveFloorPlan(layout);
    setIsSaving(false);
    if (success) {
      setSaveMessage('✓ Floor Plan Layout Saved to D1 Database & Synced!');
      setTimeout(() => setSaveMessage(''), 3500);
      if (onSaveSuccess) onSaveSuccess();
    } else {
      setSaveMessage('✗ Save failed. Retrying local storage...');
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(layout, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wings-floor-plan-${Date.now()}.json`;
    a.click();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && Array.isArray(parsed.objects)) {
          setLayout(parsed);
          pushHistory(parsed);
          setSaveMessage('✓ Layout JSON Imported!');
          setTimeout(() => setSaveMessage(''), 3000);
        }
      } catch {
        alert('Invalid Floor Plan JSON File.');
      }
    };
    reader.readAsText(file);
  };

  // Generate QR Code URL
  const selectedObj = layout.objects.find((o) => o.id === selectedId);

  const filteredObjects = selectedAreaFilter === 'all'
    ? layout.objects
    : layout.objects.filter((o) => !o.area || o.area === 'general' || o.area === selectedAreaFilter);

  return (
    <div className="flex flex-col h-full bg-[#120B08] text-white rounded-3xl border border-[#F5D061]/30 overflow-hidden shadow-2xl">

      {/* ── TOP TOOLBAR ──────────────────────────────────────────────── */}
      <div className="bg-[#1F1810] border-b border-[#F5D061]/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3">

        {/* Left: Brand & Area Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] flex items-center justify-center text-[#120B08] font-bold shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#F8E7A1]">Restaurant Floor Plan Builder</h3>
            <p className="text-[10px] text-[#D4C4A0]/80">Drag-and-Drop Seat &amp; Layout Designer</p>
          </div>

          <div className="ml-4 flex items-center gap-1 bg-[#120B08] p-1 rounded-xl border border-[#F5D061]/25">
            {[
              { id: 'all', label: 'All Areas' },
              { id: 'indoor', label: 'Indoor AC' },
              { id: 'garden', label: 'Open Garden' },
              { id: 'rooftop', label: 'Rooftop Deck' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAreaFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedAreaFilter === tab.id
                    ? 'bg-[#F5D061] text-[#120B08] shadow'
                    : 'text-[#D4C4A0]/80 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#120B08] rounded-xl border border-[#F5D061]/20 p-1 text-xs">
            <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} className="p-1 hover:text-[#F5D061]"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="px-2 font-mono font-bold text-[11px]">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} className="p-1 hover:text-[#F5D061]"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          {/* Snap Grid Toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              snapToGrid ? 'bg-[#6B8E5E]/20 border-[#6B8E5E] text-[#98A886]' : 'bg-[#120B08] border-gray-700 text-gray-400'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Snap Grid
          </button>

          {/* Export JSON */}
          <button onClick={handleExportJSON} className="px-2.5 py-1.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/30 text-[#F5D061] text-xs font-bold flex items-center gap-1 hover:bg-[#3D291C]">
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          {/* Save Layout to D1 */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save to D1'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-[#6B8E5E] text-white text-xs font-bold px-4 py-1.5 text-center flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {saveMessage}
        </div>
      )}

      {/* ── MAIN DESIGNER WORKSPACE ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT PALETTE: OBJECT LIBRARY ───────────────────────────── */}
        <div className="w-64 bg-[#1A1209] border-r border-[#F5D061]/20 p-4 overflow-y-auto space-y-4 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5D061] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Object Palette
          </h4>
          <p className="text-[10px] text-[#D4C4A0]/70">Click any element below to insert onto your restaurant floor plan.</p>

          <div className="space-y-2">
            {OBJECT_TYPES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleAddObject(tmpl)}
                className="w-full p-2.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/20 hover:border-[#F5D061] hover:bg-[#3D291C] text-left flex items-center justify-between text-xs font-semibold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{tmpl.icon}</span>
                  <span className="text-[#F5EBE0] group-hover:text-[#F8E7A1]">{tmpl.label}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#F5D061] opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        {/* ── CENTER WORKSPACE: INTERACTIVE CANVAS ───────────────────── */}
        <div
          className="flex-1 overflow-auto p-6 bg-[#0B0C0E] flex items-center justify-center relative select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Canvas Board */}
          <div
            ref={canvasRef}
            style={{
              width: layout.canvasWidth * zoom,
              height: layout.canvasHeight * zoom,
              backgroundImage: snapToGrid ? 'radial-gradient(circle, rgba(245,208,97,0.15) 1px, transparent 1px)' : 'none',
              backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
            }}
            className="relative bg-[#17130F] rounded-2xl border-2 border-[#F5D061]/40 shadow-2xl overflow-hidden transition-all"
          >
            {/* Background Gomti River Banner */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-[#0D1E2F] via-[#1A3550] to-[#0D1E2F] flex items-center justify-center text-[11px] font-bold text-[#7BB8D4] border-b border-[#4A7DA0]/40">
              🌊 GOMTI RIVERFRONT PROMENADE &amp; WATERFRONT DECK
            </div>

            {/* Render Objects */}
            {filteredObjects.map((obj) => {
              const isSelected = selectedId === obj.id;
              const isTable = obj.type === 'table';

              // Color based on table status
              let bg = obj.color || '#E5B82C';
              if (isTable) {
                if (obj.status === 'free') bg = '#6B8E5E';
                else if (obj.status === 'eating') bg = '#F5D061';
                else if (obj.status === 'reserved') bg = '#DC2626';
                else if (obj.status === 'blocked') bg = '#64748B';
              }

              return (
                <div
                  key={obj.id}
                  onMouseDown={(e) => handleMouseDown(e, obj)}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
                  style={{
                    left: obj.x * zoom,
                    top: obj.y * zoom,
                    width: obj.width * zoom,
                    height: obj.height * zoom,
                    transform: `rotate(${obj.rotation}deg)`,
                    backgroundColor: bg,
                    borderRadius: obj.shape === 'circle' ? '50%' : obj.shape === 'hexagon' ? '18px' : '12px',
                  }}
                  className={`absolute flex flex-col items-center justify-center cursor-move text-center p-1 font-bold shadow-lg transition-all border-2 ${
                    isSelected ? 'ring-4 ring-[#FFF8E7] border-white scale-105 z-30' : 'border-[#120B08]/40 hover:scale-102 z-10'
                  } ${obj.isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <span className="text-xs font-mono text-[#120B08] font-extrabold truncate px-1">
                    {obj.tableNumber || obj.name}
                  </span>
                  {isTable && obj.capacity && (
                    <span className="text-[9px] text-[#120B08]/80 font-bold">
                      {obj.capacity} Seats
                    </span>
                  )}
                  {obj.isLocked && <Lock className="w-3 h-3 text-[#120B08] absolute top-1 right-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: PROPERTIES INSPECTOR ───────────────────────── */}
        <div className="w-72 bg-[#1A1209] border-l border-[#F5D061]/20 p-4 overflow-y-auto space-y-4 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5D061] flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Properties Inspector
          </h4>

          {selectedObj ? (
            <div className="space-y-3.5 text-xs">
              {/* Name / Table Number */}
              <div>
                <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Object Name / Table Number</label>
                <input
                  type="text"
                  value={selectedObj.tableNumber || selectedObj.name}
                  onChange={(e) => updateSelectedObject({ name: e.target.value, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                />
              </div>

              {/* Area Assignment */}
              <div>
                <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Assigned Dining Area</label>
                <select
                  value={selectedObj.area || 'indoor'}
                  onChange={(e) => updateSelectedObject({ area: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                >
                  <option value="indoor">Indoor AC Hall</option>
                  <option value="garden">Open Garden Area</option>
                  <option value="rooftop">Rooftop Upper Deck</option>
                  <option value="general">General / Outdoor Promenade</option>
                </select>
              </div>

              {/* Capacity */}
              {selectedObj.type === 'table' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Guest Capacity (Seats)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={selectedObj.capacity || 4}
                    onChange={(e) => updateSelectedObject({ capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                  />
                </div>
              )}

              {/* Status */}
              {selectedObj.type === 'table' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Status Color State</label>
                  <select
                    value={selectedObj.status || 'free'}
                    onChange={(e) => updateSelectedObject({ status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                  >
                    <option value="free">Available (Pista Green)</option>
                    <option value="eating">Occupied (Golden Yellow)</option>
                    <option value="reserved">Reserved (Crimson Red)</option>
                    <option value="blocked">Blocked / Maintenance (Slate Gray)</option>
                  </select>
                </div>
              )}

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={selectedObj.width}
                    onChange={(e) => updateSelectedObject({ width: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={selectedObj.height}
                    onChange={(e) => updateSelectedObject({ height: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-[10px] font-bold text-[#D4C4A0] uppercase mb-1">Rotation Angle ({selectedObj.rotation}°)</label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={selectedObj.rotation}
                    onChange={(e) => updateSelectedObject({ rotation: Number(e.target.value) })}
                    className="w-full accent-[#F5D061]"
                  />
                  <button
                    onClick={() => updateSelectedObject({ rotation: (selectedObj.rotation + 45) % 360 })}
                    className="p-1.5 rounded-lg bg-[#2A1D0E] border border-[#F5D061]/40 text-[#F5D061] shrink-0"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lock Position */}
              <button
                onClick={() => updateSelectedObject({ isLocked: !selectedObj.isLocked })}
                className={`w-full py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedObj.isLocked ? 'bg-amber-900/40 border-amber-500 text-amber-300' : 'bg-[#2A1D0E] border-[#F5D061]/40 text-white'
                }`}
              >
                {selectedObj.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {selectedObj.isLocked ? 'Position Locked' : 'Lock Position'}
              </button>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[#F5D061]/20">
                <button onClick={handleDuplicate} className="flex-1 py-2 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-white font-bold flex items-center justify-center gap-1 hover:bg-[#3D291C]">
                  <Copy className="w-3.5 h-3.5 text-[#F5D061]" /> Duplicate
                </button>
                <button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-900/40 border border-red-500 text-red-300 font-bold flex items-center justify-center gap-1 hover:bg-red-800">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#2A1D0E]/50 rounded-2xl border border-[#F5D061]/20 text-center text-[#D4C4A0]/60 space-y-2">
              <Move className="w-8 h-8 mx-auto text-[#F5D061]/40" />
              <p className="text-xs">Click any table or object on the canvas to edit its properties, position, capacity, or status.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
