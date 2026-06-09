import React, { useState } from 'react'
import { PenTool, Layers, Grid3x3, ZoomIn, ZoomOut, RotateCcw, Save, Download, Eraser, Circle, Square, Minus } from 'lucide-react'

const CANVAS_TOOLS = [
  { id: 'pen', label: 'Bút vẽ', icon: PenTool },
  { id: 'eraser', label: 'Tẩy', icon: Eraser },
  { id: 'line', label: 'Đường thẳng', icon: Minus },
  { id: 'circle', label: 'Hình tròn', icon: Circle },
  { id: 'rect', label: 'Hình chữ nhật', icon: Square },
]

const BRUSH_SIZES = [2, 4, 8, 12, 20]
const PRESET_COLORS = [
  '#1a1a1a', '#ffffff', '#E63946', '#457B9D', '#2A9D8F',
  '#E9C46A', '#F4A261', '#264653', '#6D6875', '#B5838D',
]

const LAYER_LIST = [
  { id: 'layer_bg', name: 'Background', visible: true, locked: false },
  { id: 'layer_ink', name: 'Line Art', visible: true, locked: false },
  { id: 'layer_sfx', name: 'SFX', visible: true, locked: false },
  { id: 'layer_color', name: 'Coloring', visible: true, locked: true },
]

export default function DrawingPage() {
  const [activeTool, setActiveTool] = useState('pen')
  const [activeColor, setActiveColor] = useState('#1a1a1a')
  const [brushSize, setBrushSize] = useState(4)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [layers, setLayers] = useState(LAYER_LIST)
  const [activeLayer, setActiveLayer] = useState('layer_ink')
  const [showSaveMsg, setShowSaveMsg] = useState(false)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 30))

  const toggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const handleSave = () => {
    setShowSaveMsg(true)
    setTimeout(() => setShowSaveMsg(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto pb-4">
      {/* Page title */}
      <div className="mb-5">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">VẼ & CHỈNH SỬA</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>

      {/* Save message */}
      {showSaveMsg && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500 p-3 mb-4 manga-shadow-sm">
          <Save className="w-4 h-4 text-green-600" />
          <p className="font-bold text-green-800 text-sm">Đã lưu bản vẽ thành công!</p>
        </div>
      )}

      {/* Editor layout */}
      <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Left tool panel */}
        <div className="w-14 bg-white border-2 border-manga-ink flex flex-col items-center py-3 gap-2 flex-shrink-0 manga-shadow-sm">
          {CANVAS_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                title={tool.label}
                onClick={() => setActiveTool(tool.id)}
                className={`w-9 h-9 flex items-center justify-center border-2 transition-colors ${
                  activeTool === tool.id
                    ? 'bg-manga-ink text-white border-manga-ink'
                    : 'bg-white text-manga-ink border-transparent hover:border-manga-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}

          <div className="w-8 h-0.5 bg-gray-200 my-1" />

          {/* Brush sizes */}
          {BRUSH_SIZES.map(size => (
            <button
              key={size}
              title={`Cỡ bút: ${size}px`}
              onClick={() => setBrushSize(size)}
              className={`w-9 h-9 flex items-center justify-center border-2 transition-colors ${
                brushSize === size
                  ? 'bg-manga-red border-manga-ink'
                  : 'bg-white border-transparent hover:border-manga-ink'
              }`}
            >
              <div
                className="rounded-full bg-manga-ink"
                style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
              />
            </button>
          ))}
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col gap-0 border-2 border-manga-ink overflow-hidden manga-shadow-sm">
          {/* Canvas toolbar */}
          <div className="bg-white border-b-2 border-manga-ink px-4 py-2 flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button onClick={handleZoomOut} className="w-7 h-7 flex items-center justify-center border border-manga-ink hover:bg-gray-100 transition-colors">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-manga-ink min-w-[48px] text-center">{zoom}%</span>
              <button onClick={handleZoomIn} className="w-7 h-7 flex items-center justify-center border border-manga-ink hover:bg-gray-100 transition-colors">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-5 w-0.5 bg-gray-200" />

            <button
              onClick={() => setShowGrid(g => !g)}
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border transition-colors ${
                showGrid ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
              }`}
            >
              <Grid3x3 className="w-3.5 h-3.5" /> Lưới
            </button>

            <button className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border border-manga-ink hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Hoàn tác
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-manga-ink text-white border-2 border-manga-ink hover:bg-manga-red transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Lưu
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border-2 border-manga-ink bg-white hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Xuất file
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-[#f0f0f0] overflow-auto flex items-center justify-center relative">
            <div
              className="relative bg-white shadow-2xl"
              style={{ width: `${zoom}%`, maxWidth: 800, aspectRatio: '4/5' }}
            >
              {/* Grid overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }} />
              )}

              {/* Panel guides */}
              <div className="absolute inset-4 border-2 border-dashed border-gray-300 pointer-events-none" />

              {/* Placeholder canvas content */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <PenTool className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">Kéo, vẽ hoặc nhập ảnh để bắt đầu</p>
                </div>
              </div>

              {/* Cursor hint */}
              <div className="absolute inset-0 cursor-crosshair" />
            </div>
          </div>
        </div>

        {/* Right panel: colors + layers */}
        <div className="w-52 flex flex-col gap-3 flex-shrink-0">
          {/* Color picker */}
          <div className="bg-white border-2 border-manga-ink p-3 manga-shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Màu sắc</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 border-2 border-manga-ink flex-shrink-0" style={{ backgroundColor: activeColor }} />
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="flex-1 h-8 border-2 border-manga-ink cursor-pointer bg-transparent"
              />
            </div>
            <div className="grid grid-cols-5 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`w-7 h-7 border-2 transition-transform hover:scale-110 ${activeColor === color ? 'border-manga-red scale-110' : 'border-manga-ink'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Layers panel */}
          <div className="bg-white border-2 border-manga-ink manga-shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="border-b-2 border-manga-ink px-3 py-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-manga-red" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Layers</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {[...layers].reverse().map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${activeLayer === layer.id ? 'bg-blue-50' : ''}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }}
                    className={`w-4 h-4 flex-shrink-0 border border-manga-ink flex items-center justify-center transition-colors ${layer.visible ? 'bg-manga-ink' : 'bg-white'}`}
                  >
                    {layer.visible && <div className="w-1.5 h-1.5 bg-white" />}
                  </button>
                  <span className={`text-xs font-bold flex-1 ${activeLayer === layer.id ? 'text-manga-ink' : 'text-gray-600'}`}>
                    {layer.name}
                  </span>
                  {layer.locked && <span className="text-[9px] text-gray-400 font-bold">🔒</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
