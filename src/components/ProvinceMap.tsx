/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Province, Faction, Army } from '../types';
import { FACTION_COLORS, UI_COLORS, MAJOR_CITIES, PROVINCE_ADJACENCY } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw, Swords } from 'lucide-react';
import * as d3 from 'd3';

interface ProvinceMapProps {
  provinces: { [key: string]: Province };
  armies: Army[];
  selectedId: string | null;
  selectedArmyId: string | null;
  selectedArmyIds: string[];
  onSelect: (id: string | null) => void;
  onSelectArmy: (id: string | null, isShift?: boolean) => void;
  onMoveArmy: (armyId: string, targetProvinceId: string) => void;
}

interface InsetConfig {
  ids: string[];
  match: (name: string) => boolean;
  scale: number;
  label: string;
  box: { x: number; y: number; w: number; h: number };
  collapsedBox?: { x: number; y: number; w: number; h: number };
}

const DIMENSIONS = { width: 800, height: 600 };

export const ProvinceMap: React.FC<ProvinceMapProps> = ({ 
  provinces, 
  armies, 
  selectedId, 
  selectedArmyId,
  selectedArmyIds = [],
  onSelect, 
  onSelectArmy,
  onMoveArmy
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [riverData, setRiverData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  
  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([-3.7, 39.5]) 
      .scale(2600) // Adjusted for more prominent view
      .translate([DIMENSIONS.width / 2, DIMENSIONS.height / 2]);
  }, []);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Pre-calculated centers for armies
  const provinceCenters = useMemo(() => {
    if (!geoData || !pathGenerator) return {};
    const centers: Record<string, [number, number]> = {};
    
    geoData.features.forEach((feature: any) => {
      const properties = feature.properties || {};
      const provinceName = properties.name || properties.name_es || properties.NAME_1 || properties.ID_1 || '';
      
      const provinceId = Object.keys(provinces).find(id => {
        const province = provinces[id];
        const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedProvName = (province.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedInName = provinceName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedInNameEs = (properties.name_es || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return normalizedId === normalizedInName || normalizedProvName === normalizedInName ||
               normalizedId === normalizedInNameEs || normalizedProvName === normalizedInNameEs;
      });

      if (provinceId) {
        centers[provinceId] = pathGenerator.centroid(feature) as [number, number];
      }
    });

    return centers;
  }, [geoData, provinces]);

  const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({
    canarias: false,
    azores: true,
    madeira: true,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [normalizedPaths, setNormalizedPaths] = useState<any[]>([]);

  // Function to redraw canvas based on current transformRef
  const drawCanvas = (t: d3.ZoomTransform) => {
    const canvas = canvasRef.current;
    if (!canvas || !geoData || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset for clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const canvasPath = d3.geoPath().projection(projection).context(ctx);

    // Draw Grid
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 0.5;
    const gridSize = 60;
    ctx.beginPath();
    // Grid alignment correction
    const startX = (t.x % (gridSize * t.k)) / t.k;
    const startY = (t.y % (gridSize * t.k)) / t.k;
    
    for (let x = -gridSize; x < DIMENSIONS.width / t.k + gridSize; x += gridSize) {
      ctx.moveTo(x, -gridSize);
      ctx.lineTo(x, DIMENSIONS.height / t.k + gridSize);
    }
    for (let y = -gridSize; y < DIMENSIONS.height / t.k + gridSize; y += gridSize) {
      ctx.moveTo(-gridSize, y);
      ctx.lineTo(DIMENSIONS.width / t.k + gridSize, y);
    }
    ctx.stroke();

    // Draw world background
    if (worldData) {
      ctx.fillStyle = "#EAE6D6";
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.3 / t.k;
      ctx.beginPath();
      canvasPath(worldData);
      ctx.fill();
      ctx.stroke();
    }

    // Draw rivers
    if (riverData) {
      ctx.strokeStyle = "#6B9BA5";
      ctx.lineWidth = 0.8 / t.k;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      canvasPath(riverData);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  // Canvas drawing for static elements (world background and rivers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !geoData || loading) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = DIMENSIONS.width * dpr;
    canvas.height = DIMENSIONS.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    drawCanvas(transformRef.current);
  }, [geoData, worldData, riverData, projection, loading]);

  useEffect(() => {
    const urls = [
      '/data/iberia-complete.geojson',
      '/data/morocco-spanish-protectorate.geojson',
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson',
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
    ];

    Promise.all(urls.map(url => 
      fetch(url).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
      })
    ))
    .then(([iberia, morocco, globalRivers, worldCountries]) => {
      setGeoData({
        type: 'FeatureCollection',
        features: [...(iberia?.features || []), ...(morocco?.features || [])]
      });

      // Filter neighboring land to show as background
      const neighbors = (worldCountries?.features || []).filter((f: any) => {
        const name = (f.properties.NAME || f.properties.name || '').toLowerCase();
        return ['france', 'morocco', 'algeria', 'tunisia', 'andorra', 'gibraltar'].includes(name);
      });
      setWorldData({ type: 'FeatureCollection', features: neighbors });

      // Filter rivers for the Iberia/Morocco area to improve performance
      const filteredRivers = {
        type: 'FeatureCollection',
        features: (globalRivers?.features || []).filter((f: any) => {
          const type = f.geometry?.type;
          const coords = f.geometry?.coordinates;
          if (!coords) return false;
          
          const isInView = (p: number[]) => p[0] > -11 && p[0] < 6 && p[1] > 34 && p[1] < 45;
          
          if (type === 'LineString') {
            return coords.some(isInView);
          } else if (type === 'MultiLineString') {
            return coords.some((line: any) => line.some(isInView));
          }
          return false;
        })
      };
      setRiverData(filteredRivers);
      setLoading(false);
    })
    .catch(err => {
      console.error('Map loading error:', err);
      setLoading(false);
    });
  }, []);
  
  // Inset Map Configuration
  const INSET_CONFIG = useMemo<Record<string, InsetConfig>>(() => ({
    canarias: { 
      ids: ['laspalmas', 'santacruzdetenerife', 'canarias'], 
      match: (name: string) => /palmas|tenerife|canaria|hierro|gomera|lanzarote|fuerteventura/i.test(name),
      scale: 1.0, 
      label: 'ISLAS CANARIAS',
      box: { x: 20, y: 380, w: 220, h: 120 },
      collapsedBox: { x: 20, y: 470, w: 100, h: 30 }
    },
    azores: { 
      ids: ['azores'], 
      match: (name: string) => /azores|açores/i.test(name),
      scale: 0.8, // Slightly smaller to fit span
      label: 'AÇORES',
      box: { x: 20, y: 40, w: 140, h: 100 },
      collapsedBox: { x: 20, y: 40, w: 80, h: 30 }
    },
    madeira: { 
      ids: ['madeira'], 
      match: (name: string) => /madeira/i.test(name),
      scale: 3.5, 
      label: 'MADEIRA',
      box: { x: 20, y: 200, w: 100, h: 80 },
      collapsedBox: { x: 20, y: 250, w: 80, h: 30 }
    }
  }), []);

  const toggleInset = (key: string) => {
    setCollapsedStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Path Normalization: Pre-calculate all SVG paths when data or projection changes
  useEffect(() => {
    if (!geoData || !pathGenerator) return;
    
    const paths = geoData.features.map((feature: any) => {
      const properties = feature.properties || {};
      const provinceName = properties.name || properties.name_es || properties.NAME_1 || properties.ID_1 || '';
      
      const provinceId = Object.keys(provinces).find(id => {
        const province = provinces[id];
        const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedProvName = (province.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedInName = provinceName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedInNameEs = (properties.name_es || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return normalizedId === normalizedInName || normalizedProvName === normalizedInName ||
               normalizedId === normalizedInNameEs || normalizedProvName === normalizedInNameEs;
      });

      return {
        feature,
        id: feature.id || provinceName,
        provinceId,
        provinceName,
        path: pathGenerator(feature) || ''
      };
    });

    setNormalizedPaths(paths);
  }, [geoData, pathGenerator, provinces]);

  // Zoom Setup
  const zoom = useMemo(() => {
    return d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) 
      .translateExtent([[0, 0], [DIMENSIONS.width, DIMENSIONS.height]]) 
      .filter((event: any) => {
        if (currentScale <= 1.05 && (event.type === 'mousedown' || event.type === 'touchstart')) {
          return false;
        }
        return !event.ctrlKey && !event.button;
      })
      .on('zoom', (event) => {
        const t = event.transform;
        transformRef.current = t;
        
        // Direct DOM update for SVG group
        if (gRef.current) {
          gRef.current.setAttribute('transform', t.toString());
        }
        
        // Direct update for Canvas
        drawCanvas(t);

        // Update React state for scale-dependent elements (throttled/avoided if possible)
        // We update state here BUT it will be faster because we are bypassing state-driven transform
        setCurrentScale(t.k);
      });
  }, [currentScale]);

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).call(zoom);
  }, [loading, zoom]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoom.scaleBy as any, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoom.scaleBy as any, 0.7);
  };

  const handleReset = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(zoom.transform as any, d3.zoomIdentity);
  };

  if (loading) {
    return (
      <div className="w-[900px] max-w-[95%] aspect-[4/3] bg-[#D7D2BF] rounded-lg flex items-center justify-center border-2 border-[#8B7355] selection:bg-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A67C52] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif italic text-sm uppercase tracking-widest text-[#8B7355]">Consulting Imperial Archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-[900px] max-w-[95%] aspect-[4/3] rounded-lg border-2 border-[#5C4D32] shadow-[inset_0_0_50px_rgba(0,0,0,0.15)] overflow-hidden group"
      style={{ backgroundColor: UI_COLORS.ocean }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${DIMENSIONS.width} ${DIMENSIONS.height}`}
        className={`relative z-10 w-full h-full ${currentScale > 1.05 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        <defs>
          {/* Inner shadow for provinces */}
          <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feOffset dy="1" dx="1" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="black" floodOpacity="0.3" />
            <feComposite in2="shadowDiff" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>

          {/* Paper texture overlay - Standard coordinates to ensure full coverage */}
          <filter id="paper-texture-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2">
              <feDistantLight azimuth="45" elevation="45" />
            </feDiffuseLighting>
          </filter>

        </defs>
        
        {/* Basic Ocean Layer - Canvas handles background land now */}
        {/* We keep paper texture in SVG as they are cheap (patterns/filters) */}
        {!geoData && <rect width="100%" height="100%" fill={UI_COLORS.ocean} />}
        
        {/* Texture Layer - Multiplied over everything beneath it */}
        <rect width="100%" height="100%" filter="url(#paper-texture-filter)" style={{ mixBlendMode: 'multiply', opacity: 0.25 }} pointerEvents="none" />

        <g ref={gRef} transform={transformRef.current.toString()} style={{ willChange: 'transform' }}>
          {/* Background Land and Rivers are now on Canvas layer */}

          {/* Background Labels for neighboring regions */}
          <g className="world-labels opacity-20 pointer-events-none select-none" style={{ fill: '#000', fontFamily: 'serif', fontStyle: 'italic' }}>
            {(() => {
              const francePos = projection([2, 46.5]);
              
              return (
                <>
                  {francePos && (
                    <text 
                      x={francePos[0]} y={francePos[1]} 
                      transform={`rotate(5, ${francePos[0]}, ${francePos[1]})`} 
                      style={{ fontSize: '24px', letterSpacing: '0.5em' }}
                      textAnchor="middle"
                    >
                      FRANCIA
                    </text>
                  )}
                </>
              );
            })()}
          </g>

          {/* Main Map Features */}
          {normalizedPaths.filter((p: any) => {
            return !(Object.values(INSET_CONFIG) as InsetConfig[]).some(config => config.match(p.provinceName));
          }).map((p: any) => {
            const gameProvince = p.provinceId ? provinces[p.provinceId] : null;
            const owner = gameProvince?.owner || Faction.NEUTRAL;
            const color = FACTION_COLORS[owner];
            const isSelected = selectedId === p.provinceId;
            const isHovered = hoveredProvince === p.provinceName;
            
            // Highlight possible moves if an army is selected
            const selectedArmy = armies.find(a => a.id === selectedArmyId);
            const isPossibleMove = selectedArmy && p.provinceId && PROVINCE_ADJACENCY[selectedArmy.provinceId]?.includes(p.provinceId);

            return (
              <g key={p.id}>
                <motion.path
                  d={p.path}
                  fill={color}
                  stroke={isSelected ? UI_COLORS.accent : isPossibleMove ? '#FFF' : isHovered ? '#000' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={(isSelected ? 2 : isPossibleMove ? 1.5 : isHovered ? 1.5 : 0.5) / currentScale}
                  strokeDasharray={isPossibleMove ? '3, 2' : 'none'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onMouseEnter={() => setHoveredProvince(p.provinceName)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!p.provinceId) return;
                    onSelect(p.provinceId);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (p.provinceId && selectedArmyId && isPossibleMove) {
                      onMoveArmy(selectedArmyId, p.provinceId);
                    }
                  }}
                  className="transition-colors duration-300"
                  style={{ 
                    filter: isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'url(#inner-shadow)',
                    cursor: p.provinceId ? 'pointer' : 'default'
                  }}
                />
              </g>
            );
          })}

          {/* Armies Layer */}
          <g className="armies-layer">
            {(() => {
              const provinceArmyCount: Record<string, number> = {};
              return armies.map((army) => {
                const center = provinceCenters[army.provinceId];
                if (!center) return null;
                
                // Stacking logic
                const stackIndex = provinceArmyCount[army.provinceId] || 0;
                provinceArmyCount[army.provinceId] = stackIndex + 1;
                const offset = stackIndex * (4 / currentScale);
                
                const isSelected = selectedArmyIds.includes(army.id);
                const factionColor = FACTION_COLORS[army.faction];
                
                return (
                  <g 
                    key={army.id} 
                    transform={`translate(${center[0] + offset}, ${center[1] + offset})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectArmy(army.id, e.shiftKey);
                    }}
                    className="cursor-pointer"
                  >
                    <motion.g
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: isSelected ? 1.2 : 1, y: 0 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {/* Shadow */}
                      <ellipse 
                        cx={0} cy={12 / currentScale} 
                        rx={8 / currentScale} ry={3 / currentScale} 
                        fill="black" opacity={0.2} 
                      />

                      {/* Glow effect for selected army */}
                      {isSelected && (
                        <circle r={14 / currentScale} fill={factionColor} opacity={0.4}>
                          <animate attributeName="r" values={`${14/currentScale};${18/currentScale};${14/currentScale}`} dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      
                      {/* Main Counter Body (3D look) */}
                      <rect 
                        x={-12 / currentScale} 
                        y={-10 / currentScale} 
                        width={24 / currentScale} 
                        height={16 / currentScale} 
                        fill={factionColor}
                        stroke="#1A1A1A"
                        strokeWidth={1.5 / currentScale}
                        rx={1 / currentScale}
                        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}
                      />
                      
                      {/* NATO Symbol (Standard Infantry) */}
                      <g opacity={0.8}>
                        <rect 
                          x={-8 / currentScale} 
                          y={-7 / currentScale} 
                          width={16 / currentScale} 
                          height={10 / currentScale} 
                          fill="none"
                          stroke="#000"
                          strokeWidth={0.8 / currentScale}
                        />
                        <line 
                          x1={-8 / currentScale} y1={-7 / currentScale} 
                          x2={8 / currentScale} y2={3 / currentScale} 
                          stroke="#000" strokeWidth={0.8 / currentScale} 
                        />
                        <line 
                          x1={8 / currentScale} y1={-7 / currentScale} 
                          x2={-8 / currentScale} y2={3 / currentScale} 
                          stroke="#000" strokeWidth={0.8 / currentScale} 
                        />
                      </g>

                      {/* Move Indicator Dots */}
                      <g transform={`translate(0, ${10 / currentScale})`}>
                        <text 
                          textAnchor="middle" 
                          style={{ fontSize: `${8/currentScale}px`, fontWeight: 'bold', fontFamily: 'serif' }}
                          fill="#000"
                        >
                          {Array(army.movesLeft).fill('•').join(' ')}
                        </text>
                      </g>

                      {/* Health/Manpower visual bar (minimalist) */}
                      <rect 
                        x={-12 / currentScale} 
                        y={6 / currentScale} 
                        width={24 / currentScale} 
                        height={1.5 / currentScale} 
                        fill="rgba(0,0,0,0.3)"
                      />
                      <rect 
                        x={-12 / currentScale} 
                        y={6 / currentScale} 
                        width={(24 / currentScale) * (army.manpower / (army.maxManpower || 10000))}
                        height={1.5 / currentScale} 
                        fill="#4ade80"
                      />
                    </motion.g>
                  </g>
                );
              });
            })()}
          </g>

          {/* City Markers and Labels */}
          <g className="cities-layer">
            {MAJOR_CITIES.map((city) => {
              const [x, y] = projection(city.coords as [number, number]) || [0, 0];
              if (x === 0 && y === 0) return null;

              return (
                <g key={`city-${city.name}`} transform={`translate(${x}, ${y})`}>
                  {/* City Marker */}
                  <circle 
                    r={city.isCapital ? 2.5 / currentScale : 1.2 / currentScale}
                    fill={UI_COLORS.ink}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={0.5 / currentScale}
                    className="drop-shadow-sm"
                  />
                  {city.isCapital && (
                    <circle 
                      r={4 / currentScale}
                      fill="none"
                      stroke={UI_COLORS.ink}
                      strokeWidth={0.3 / currentScale}
                      opacity={0.6}
                    />
                  )}
                  {/* City Label */}
                  <text
                    y={-5 / currentScale}
                    textAnchor="middle"
                    className="select-none pointer-events-none fill-[#2A2621] font-serif"
                    style={{ 
                      fontSize: `${(city.isCapital ? 10 : 8) / currentScale}px`,
                      fontWeight: city.isCapital ? 'bold' : 'normal',
                      letterSpacing: '-0.01em',
                      paintOrder: 'stroke',
                      stroke: 'rgba(255,255,255,0.7)',
                      strokeWidth: 2.5 / currentScale,
                      strokeLinejoin: 'round'
                    }}
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* Fixed Inset Group (Temporarily disabled) */}
        {/*
        <g className="insets-fixed">
          ... (omitted content)
        </g>
        */}
      </svg>
      
      {/* Zoom Controls */}
      <div className="absolute top-20 left-4 z-50 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-white/80 hover:bg-white border border-[#8B7355] rounded-md shadow-md text-[#8B7355] transition-all hover:scale-105 active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-white/80 hover:bg-white border border-[#8B7355] rounded-md shadow-md text-[#8B7355] transition-all hover:scale-105 active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleReset}
          className="p-2 bg-white/80 hover:bg-white border border-[#8B7355] rounded-md shadow-md text-[#8B7355] transition-all hover:scale-105 active:scale-95"
          title="Reset Map"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Floating Tactical Display */}
      <AnimatePresence>
        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-50 bg-[#F2F0E6] text-[#2A2621] p-4 rounded-sm border-2 border-[#8B7355] font-serif shadow-xl pointer-events-none max-w-[200px]"
          >
            <div className="text-[#8B7355] font-bold border-b-2 border-[#8B7355]/30 pb-1 mb-2 uppercase tracking-tighter text-lg">{hoveredProvince}</div>
            {geoData?.features.find((f: any) => (f.properties.name || f.properties.NAME_1) === hoveredProvince) && 
             Object.keys(provinces).some(id => {
               const normalizedPathName = hoveredProvince.toLowerCase().replace(/[^a-z0-9]/g, '');
               const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
               return normalizedId === normalizedPathName || id.toLowerCase() === hoveredProvince.toLowerCase();
             }) ? (
              <div className="text-[#5C7C52] italic font-medium">Strategic Intel Available</div>
            ) : (
              <div className="text-gray-500 italic">Neutral / Unknown Sector</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
