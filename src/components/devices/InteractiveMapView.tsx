import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, ZoomIn, ZoomOut, Compass, Layers, ShieldCheck, Crosshair } from 'lucide-react';
import { AppDeviceLocation } from '../../types';

interface InteractiveMapViewProps {
  locations: AppDeviceLocation[];
  selectedLocation: AppDeviceLocation | null;
  onSelectLocation: (loc: AppDeviceLocation) => void;
  isLoading?: boolean;
}

// Convert Lat/Lng to OpenStreetMap slippy map tile coordinates
function lon2tile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

function lat2tile(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom);
}

// Convert tile coordinates to relative pixels within map container
export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  isLoading = false,
}) => {
  const [zoom, setZoom] = useState<number>(14);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 10.5276, lng: 76.2144 }); // Default Kerala/Thrissur Sitaram region
  const [mapType, setMapType] = useState<'standard' | 'humanitarian'>('standard');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Focus center on selected location or first available location
  useEffect(() => {
    if (selectedLocation) {
      setCenter({ lat: selectedLocation.latitude, lng: selectedLocation.longitude });
      setZoom(15);
    } else if (locations.length > 0) {
      // Calculate center of all locations
      const avgLat = locations.reduce((sum, l) => sum + l.latitude, 0) / locations.length;
      const avgLng = locations.reduce((sum, l) => sum + l.longitude, 0) / locations.length;
      setCenter({ lat: avgLat, lng: avgLng });
    }
  }, [selectedLocation, locations]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 3));

  const handleResetCenter = () => {
    if (selectedLocation) {
      setCenter({ lat: selectedLocation.latitude, lng: selectedLocation.longitude });
    } else if (locations.length > 0) {
      setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
    }
  };

  // Dragging support for panning the map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Approximate lat/lng delta per pixel at current zoom
    const scale = Math.pow(2, zoom);
    const dLng = -(dx / 256 / scale) * 360;
    const dLat = (dy / 256 / scale) * 180;

    setCenter(prev => ({
      lat: Math.max(-85, Math.min(85, prev.lat + dLat)),
      lng: ((prev.lng + dLng + 180) % 360) - 180,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Compute tile URLs around the center
  const centerTileX = lon2tile(center.lng, zoom);
  const centerTileY = lat2tile(center.lat, zoom);
  const tileXInt = Math.floor(centerTileX);
  const tileYInt = Math.floor(centerTileY);

  const containerWidth = 800;
  const containerHeight = 450;
  const offsetX = (centerTileX - tileXInt) * 256;
  const offsetY = (centerTileY - tileYInt) * 256;

  // Render 3x3 or 4x3 grid of tiles around center
  const tiles: { x: number; y: number; left: number; top: number; url: string }[] = [];
  const maxTile = Math.pow(2, zoom);

  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const tx = (tileXInt + dx + maxTile) % maxTile;
      const ty = tileYInt + dy;
      if (ty >= 0 && ty < maxTile) {
        const left = containerWidth / 2 - offsetX + dx * 256;
        const top = containerHeight / 2 - offsetY + dy * 256;
        const sub = ['a', 'b', 'c'][(tx + ty) % 3];
        const url = mapType === 'standard'
          ? `https://${sub}.tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`
          : `https://${sub}.tile.openstreetmap.fr/hot/${zoom}/${tx}/${ty}.png`;
        tiles.push({ x: tx, y: ty, left, top, url });
      }
    }
  }

  // Calculate pixel position for each location marker
  const markerPositions = locations.map(loc => {
    const locTileX = lon2tile(loc.longitude, zoom);
    const locTileY = lat2tile(loc.latitude, zoom);
    const px = containerWidth / 2 + (locTileX - centerTileX) * 256;
    const py = containerHeight / 2 + (locTileY - centerTileY) * 256;
    return {
      location: loc,
      px,
      py,
      isSelected: selectedLocation?.id ? selectedLocation.id === loc.id : selectedLocation?.installationId === loc.installationId,
    };
  });

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#23493C] bg-[#0A1F17] shadow-xl">
      
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#081C13]/90 backdrop-blur-md border border-[#23493C] px-3 py-1.5 rounded-xl pointer-events-auto shadow-md">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-200">
            Authorized Map View ({locations.length} {locations.length === 1 ? 'Record' : 'Records'})
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
            OSM Live Tiles
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map Style Toggle */}
          <button
            onClick={() => setMapType(prev => prev === 'standard' ? 'humanitarian' : 'standard')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#081C13]/90 hover:bg-[#0D281C] border border-[#23493C] text-xs text-gray-300 hover:text-white transition shadow-md"
            title="Toggle Map Tile Theme"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium hidden sm:inline">{mapType === 'standard' ? 'Standard' : 'Humanitarian'}</span>
          </button>

          {/* Reset / Center Button */}
          <button
            onClick={handleResetCenter}
            className="p-1.5 rounded-xl bg-[#081C13]/90 hover:bg-[#0D281C] border border-[#23493C] text-emerald-300 hover:text-white transition shadow-md"
            title="Center on Selected / First Location"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-xl bg-[#081C13]/90 hover:bg-[#0D281C] border border-[#23493C] text-gray-200 hover:text-white transition shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-xl bg-[#081C13]/90 hover:bg-[#0D281C] border border-[#23493C] text-gray-200 hover:text-white transition shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Tile Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-[450px] overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ backgroundColor: '#092117' }}
      >
        {/* Render Map Tiles */}
        <div className="absolute inset-0 pointer-events-none opacity-90 transition-opacity">
          {tiles.map(tile => (
            <img
              key={`${tile.x}-${tile.y}-${zoom}`}
              src={tile.url}
              alt=""
              className="absolute w-[256px] h-[256px] filter brightness-90 contrast-105"
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
              }}
              loading="lazy"
              onError={(e) => {
                // If OpenStreetMap tile fails to load, gracefully hide tile
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ))}
        </div>

        {/* Subtle Dark Vignette Overlay for Emerald Theme Integration */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#081C13]/60 via-transparent to-[#081C13]/30" />

        {/* Render Location Markers */}
        {markerPositions.map(({ location, px, py, isSelected }, idx) => {
          // Skip markers positioned far outside the viewport
          if (px < -60 || px > containerWidth + 60 || py < -60 || py > containerHeight + 60) return null;

          const isPrecise = location.locationPrecision === 'precise';

          return (
            <div
              key={location.id || idx}
              style={{ left: `${px}px`, top: `${py}px` }}
              className="absolute -translate-x-1/2 -translate-y-full z-10 cursor-pointer pointer-events-auto group"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLocation(location);
              }}
            >
              {/* Accuracy halo circle */}
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all ${
                  isPrecise
                    ? 'w-10 h-10 bg-emerald-500/20 border border-emerald-400/50'
                    : 'w-20 h-20 bg-amber-500/15 border border-amber-400/40 border-dashed'
                } ${isSelected ? 'scale-125 ring-2 ring-emerald-400' : ''}`}
              />

              {/* Pin Icon */}
              <div
                className={`relative p-2 rounded-full shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-emerald-500 text-white scale-125 ring-4 ring-emerald-400/40'
                    : isPrecise
                    ? 'bg-emerald-700 text-emerald-100 hover:scale-110'
                    : 'bg-amber-600 text-amber-100 hover:scale-110'
                }`}
              >
                <MapPin className="w-5 h-5 fill-current" />
              </div>

              {/* Pin Tooltip / Badge */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-30 pointer-events-none">
                <div className="bg-[#081C13] border border-[#23493C] text-white text-[11px] rounded-lg px-2.5 py-1 shadow-xl whitespace-nowrap">
                  <p className="font-bold font-mono text-emerald-300">
                    {location.installationId.slice(0, 16)}...
                  </p>
                  <p className="text-[10px] text-gray-300">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} ({location.locationPrecision})
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#081C13]/70 backdrop-blur-xs flex items-center justify-center z-30">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D281C] border border-[#23493C]">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-emerald-300 font-mono">Loading telemetry coordinates...</span>
            </div>
          </div>
        )}

        {/* No Locations Empty State inside Map */}
        {locations.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-[#081C13]/90 border border-[#23493C] rounded-2xl p-6 text-center max-w-sm pointer-events-auto shadow-2xl">
              <Compass className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-gray-200">No Location Records Available</h4>
              <p className="text-xs text-emerald-400/70 mt-1">
                No verified GPS coordinates have been uploaded by registered devices matching your active filters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Selected Location Info Bar & External Service Launchers */}
      <div className="p-3 bg-[#081C13] border-t border-[#23493C] flex flex-wrap items-center justify-between gap-3 text-xs">
        {selectedLocation ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-100">Selected Coordinate:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                  selectedLocation.locationPrecision === 'precise'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}>
                  {selectedLocation.locationPrecision}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate">
                Device: <code className="text-emerald-400">{selectedLocation.installationId}</code> &bull; Accuracy: {selectedLocation.accuracy ? `±${Math.round(selectedLocation.accuracy)}m` : 'Unknown'} &bull; Source: {selectedLocation.locationSource || 'gps'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Select a marker on the map or record from the table below to view exact precision data.</span>
          </div>
        )}

        {/* External Map Buttons */}
        {selectedLocation && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition shadow-xs cursor-pointer text-xs font-medium"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>

            <a
              href={`https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=16/${selectedLocation.latitude}/${selectedLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-emerald-300 hover:text-white transition shadow-xs cursor-pointer text-xs font-medium"
            >
              <span>OpenStreetMap</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
        )}
      </div>

    </div>
  );
};
