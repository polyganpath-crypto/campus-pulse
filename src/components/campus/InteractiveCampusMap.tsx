import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CampusLocation,
  CampusLocationCategory
} from '../../types';
import {
  NavigationRoute,
  campusNavService
} from '../../services/campusNavService';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  Phone,
  Info,
  ArrowRight,
  CheckCircle2,
  X,
  Building,
  Crosshair,
  Footprints,
  Map as MapIcon,
  ShieldCheck,
  AlertCircle,
  ArrowUpDown,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Utensils,
  Trophy,
  Stethoscope,
  Briefcase,
  DoorOpen,
  Eye,
  Maximize2
} from 'lucide-react';

interface InteractiveCampusMapProps {
  locations: CampusLocation[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: CampusLocation) => void;
  onRequestDirections?: (fromId: string, toId: string) => void;
}

// Guru Nanak Institutions Campus Geo-Coordinates (Ibrahimpatnam, Telangana)
const GNI_CENTER = { lat: 17.16126, lng: 78.658515 };

export const InteractiveCampusMap: React.FC<InteractiveCampusMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  onRequestDirections
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [themeMode, setThemeMode] = useState<'blueprint-dark' | 'campus-light'>('blueprint-dark');
  const [selectedLoc, setSelectedLoc] = useState<CampusLocation | null>(() => {
    if (selectedLocationId) {
      return locations.find((l) => l.id === selectedLocationId) || locations[0];
    }
    return locations[0] || null;
  });

  const [originLocationId, setOriginLocationId] = useState<string>('gni-gate-1');
  const [destinationLocationId, setDestinationLocationId] = useState<string>(
    selectedLocationId || 'gnitc-block-1-main'
  );
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);

  // Zoom & Pan Canvas Transform State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live GPS states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distanceToCampusKm, setDistanceToCampusKm] = useState<number | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (selectedLocationId) {
      const match = locations.find((l) => l.id === selectedLocationId);
      if (match) {
        setSelectedLoc(match);
        setDestinationLocationId(match.id);
        // Gently pan to center on selected location
        if (match.coordinates) {
          const targetX = (50 - match.coordinates.x) * 4;
          const targetY = (50 - match.coordinates.y) * 4;
          setPanOffset({ x: targetX, y: targetY });
        }
      }
    }
  }, [selectedLocationId, locations]);

  const mapCategories = [
    'All',
    'Academic Block',
    'Laboratory',
    'Library',
    'Examination Cell',
    'Canteen',
    'Placement Cell',
    'Auditorium',
    'Hostel',
    'Sports Ground',
    'Main Gate',
    'Medical Room'
  ];

  const filteredLocations = useMemo(() => {
    if (activeCategory === 'All') return locations;
    return locations.filter((l) => l.category === activeCategory);
  }, [locations, activeCategory]);

  const handleMarkerClick = (loc: CampusLocation) => {
    setSelectedLoc(loc);
    if (onSelectLocation) onSelectLocation(loc);
  };

  const handleComputeDirections = (fromId: string, toId: string) => {
    let fromObj: CampusLocation | undefined;
    if (fromId === 'user-live-gps' && userLocation) {
      fromObj = {
        id: 'user-live-gps',
        name: 'My Live GPS Location',
        category: 'Main Gate',
        building: 'Live Current Spot',
        floor: 'Ground Level',
        description: 'Real-time GPS coordinates of user device',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        coordinates: { x: 50, y: 92, lat: userLocation.lat, lng: userLocation.lng },
        coordinatesVerified: true
      };
    } else {
      fromObj = locations.find((l) => l.id === fromId);
    }

    const toObj = locations.find((l) => l.id === toId);
    if (!fromObj || !toObj) return;

    const route = campusNavService.generateDirections(fromObj, toObj);
    setActiveRoute(route);
    setIsNavigating(true);
    if (onRequestDirections) {
      onRequestDirections(fromId, toId);
    }
  };

  // HTML5 Live Geolocation handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Calculate distance to GNI campus center
        const R = 6371; // km
        const dLat = (GNI_CENTER.lat - latitude) * (Math.PI / 180);
        const dLon = (GNI_CENTER.lng - longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(latitude * (Math.PI / 180)) *
            Math.cos(GNI_CENTER.lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = Math.round(R * c * 10) / 10;
        setDistanceToCampusKm(distKm);

        setOriginLocationId('user-live-gps');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setLocationError(
          err.code === 1
            ? 'Location permission denied. You can select "Gate 1 (Main Entrance)" as your start point.'
            : 'Unable to retrieve location accurately.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const getCategoryIcon = (category: CampusLocationCategory) => {
    switch (category) {
      case 'Academic Block':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Laboratory':
        return <FlaskConical className="w-3.5 h-3.5" />;
      case 'Library':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Canteen':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Sports Ground':
        return <Trophy className="w-3.5 h-3.5" />;
      case 'Medical Room':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'Placement Cell':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Main Gate':
        return <DoorOpen className="w-3.5 h-3.5" />;
      default:
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  const getMarkerBadgeStyle = (category: CampusLocationCategory, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-indigo-600 text-white ring-4 ring-indigo-400/80 scale-125 z-40 shadow-xl shadow-indigo-500/50';
    }
    switch (category) {
      case 'Academic Block':
        return 'bg-blue-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Laboratory':
        return 'bg-cyan-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Library':
        return 'bg-emerald-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Examination Cell':
        return 'bg-purple-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Canteen':
        return 'bg-amber-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Hostel':
        return 'bg-orange-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Sports Ground':
        return 'bg-teal-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Medical Room':
        return 'bg-rose-600 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      case 'Main Gate':
        return 'bg-slate-800 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
      default:
        return 'bg-slate-700 text-white shadow-md ring-2 ring-white/80 hover:scale-110';
    }
  };

  const originLocation =
    originLocationId === 'user-live-gps' && userLocation
      ? ({
          id: 'user-live-gps',
          name: 'My Live GPS Location',
          building: 'Your Spot',
          floor: 'Ground Level',
          category: 'Main Gate',
          coordinates: { x: 50, y: 92, lat: userLocation.lat, lng: userLocation.lng },
          description: 'Live user GPS coordinates'
        } as CampusLocation)
      : locations.find((l) => l.id === originLocationId);

  const destLocation = locations.find((l) => l.id === destinationLocationId);

  // Pan and drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Route path calculation for SVG overlay
  const routeSvgPath = useMemo(() => {
    if (!isNavigating || !originLocation?.coordinates || !destLocation?.coordinates) return null;
    const startX = originLocation.coordinates.x;
    const startY = originLocation.coordinates.y;
    const endX = destLocation.coordinates.x;
    const endY = destLocation.coordinates.y;

    // Intermediate waypoint routing through central spine
    const midX = 50;
    const midY = (startY + endY) / 2;

    return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
  }, [isNavigating, originLocation, destLocation]);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-2xs">
            <Compass className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Guru Nanak Institutions — Interactive Campus Map
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Architectural Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ibrahimpatnam, Telangana • 65+ Verified Academic, Lab & Hostel Coordinates
            </p>
          </div>
        </div>

        {/* View Mode & Live GPS Trigger */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Blueprint style switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setThemeMode('blueprint-dark')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                themeMode === 'blueprint-dark'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dark CAD
            </button>
            <button
              onClick={() => setThemeMode('campus-light')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                themeMode === 'campus-light'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Light Plan
            </button>
          </div>

          {/* GPS My Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              userLocation
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Locate my position on campus"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : userLocation ? 'GPS Active' : 'My Location'}</span>
          </button>
        </div>
      </div>

      {/* Geolocation Notice (if user is far from campus or error occurred) */}
      {distanceToCampusKm !== null && distanceToCampusKm > 2.5 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice:</span> You are currently ~{distanceToCampusKm} km from Guru Nanak Institutions campus. You can simulate on-campus walking navigation by selecting{' '}
            <button
              onClick={() => {
                setOriginLocationId('gni-gate-1');
                handleComputeDirections('gni-gate-1', destinationLocationId);
              }}
              className="font-bold underline text-amber-900 hover:text-black cursor-pointer"
            >
              GNI Main Entrance (Gate 1)
            </button>{' '}
            as your starting spot.
          </div>
          <button onClick={() => setDistanceToCampusKm(null)} className="text-amber-500 hover:text-amber-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {locationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{locationError}</span>
          </div>
          <button onClick={() => setLocationError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Pills Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Filter:
        </span>
        {mapCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Map Stage & Details Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Architectural Blueprint Canvas (8 cols) */}
        <div
          className={`lg:col-span-8 rounded-3xl p-2 sm:p-3 border shadow-xl overflow-hidden relative select-none ${
            themeMode === 'blueprint-dark'
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-100 border-slate-300'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom & Reset Floating Controls */}
          <div className="absolute top-5 right-5 z-30 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="relative w-full h-[520px] sm:h-[600px] overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing">
            <div
              className="w-full h-full relative transition-transform duration-75"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              {/* SVG Blueprint Background Geometry */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern
                    id="cad-grid"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 4 0 L 0 0 0 4"
                      fill="none"
                      stroke={themeMode === 'blueprint-dark' ? '#1e293b' : '#e2e8f0'}
                      strokeWidth="0.25"
                    />
                  </pattern>

                  {/* Animated gradient for walking path */}
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Base Grid */}
                <rect width="100" height="100" fill="url(#cad-grid)" />

                {/* Campus Perimeter Boundary */}
                <rect
                  x="4"
                  y="6"
                  width="92"
                  height="88"
                  rx="6"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#334155' : '#cbd5e1'}
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                />

                {/* Outer Ring Road & Pedestrian Spine */}
                <ellipse
                  cx="50"
                  cy="50"
                  rx="42"
                  ry="36"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#1e293b' : '#cbd5e1'}
                  strokeWidth="3.5"
                />

                {/* Main Arterial Avenues */}
                <path
                  d="M 50,96 L 50,45 L 38,28"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#0f172a' : '#94a3b8'}
                  strokeWidth="4"
                />
                <path
                  d="M 50,55 L 75,55"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#0f172a' : '#94a3b8'}
                  strokeWidth="3"
                />
                <path
                  d="M 50,55 L 20,55"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#0f172a' : '#94a3b8'}
                  strokeWidth="3"
                />

                {/* Athletic Complex / Cricket Stadium Grounds */}
                <rect
                  x="8"
                  y="40"
                  width="22"
                  height="34"
                  rx="6"
                  fill={themeMode === 'blueprint-dark' ? '#064e3b' : '#dcfce7'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.35' : '0.8'}
                  stroke={themeMode === 'blueprint-dark' ? '#059669' : '#10b981'}
                  strokeWidth="0.6"
                />
                <ellipse
                  cx="19"
                  cy="57"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={themeMode === 'blueprint-dark' ? '#10b981' : '#059669'}
                  strokeWidth="0.4"
                  strokeDasharray="1,1"
                />
                <text
                  x="10"
                  y="44"
                  fill={themeMode === 'blueprint-dark' ? '#34d399' : '#047857'}
                  fontSize="2"
                  fontWeight="bold"
                >
                  CRICKET OVAL & STADIUM
                </text>

                {/* GNITC Block 1 & CSE Labs */}
                <rect
                  x="24"
                  y="16"
                  width="25"
                  height="22"
                  rx="3"
                  fill={themeMode === 'blueprint-dark' ? '#1e1b4b' : '#e0e7ff'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.5' : '0.9'}
                  stroke={themeMode === 'blueprint-dark' ? '#4f46e5' : '#4338ca'}
                  strokeWidth="0.8"
                />
                <text
                  x="26"
                  y="20"
                  fill={themeMode === 'blueprint-dark' ? '#818cf8' : '#3730a3'}
                  fontSize="2.2"
                  fontWeight="bold"
                >
                  GNITC (BLOCK 1 & CSE LABS)
                </text>

                {/* Central Library & Quadrangle */}
                <rect
                  x="41"
                  y="40"
                  width="18"
                  height="22"
                  rx="3"
                  fill={themeMode === 'blueprint-dark' ? '#042f2e' : '#ccfbf1'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.45' : '0.9'}
                  stroke={themeMode === 'blueprint-dark' ? '#14b8a6' : '#0f766e'}
                  strokeWidth="0.7"
                />
                <text
                  x="43"
                  y="43.5"
                  fill={themeMode === 'blueprint-dark' ? '#2dd4bf' : '#115e59'}
                  fontSize="2"
                  fontWeight="bold"
                >
                  CENTRAL LIBRARY & QUAD
                </text>

                {/* GNIT Main Block & Placements */}
                <rect
                  x="56"
                  y="22"
                  width="26"
                  height="24"
                  rx="3"
                  fill={themeMode === 'blueprint-dark' ? '#2e1065' : '#f3e8ff'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.45' : '0.9'}
                  stroke={themeMode === 'blueprint-dark' ? '#9333ea' : '#7e22ce'}
                  strokeWidth="0.8"
                />
                <text
                  x="58"
                  y="26"
                  fill={themeMode === 'blueprint-dark' ? '#c084fc' : '#6b21a8'}
                  fontSize="2.2"
                  fontWeight="bold"
                >
                  GNIT MAIN & AUDITORIUM
                </text>

                {/* Food Court & Canteen Hub */}
                <rect
                  x="64"
                  y="52"
                  width="22"
                  height="18"
                  rx="3"
                  fill={themeMode === 'blueprint-dark' ? '#451a03' : '#fef3c7'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.4' : '0.9'}
                  stroke={themeMode === 'blueprint-dark' ? '#f59e0b' : '#d97706'}
                  strokeWidth="0.7"
                />
                <text
                  x="66"
                  y="56"
                  fill={themeMode === 'blueprint-dark' ? '#fbbf24' : '#b45309'}
                  fontSize="2"
                  fontWeight="bold"
                >
                  FOOD COURT & CAFE
                </text>

                {/* Student Hostels Complex */}
                <rect
                  x="10"
                  y="12"
                  width="12"
                  height="22"
                  rx="2"
                  fill={themeMode === 'blueprint-dark' ? '#3b0764' : '#fae8ff'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.35' : '0.9'}
                  stroke={themeMode === 'blueprint-dark' ? '#a855f7' : '#9333ea'}
                  strokeWidth="0.6"
                />
                <text
                  x="11"
                  y="15.5"
                  fill={themeMode === 'blueprint-dark' ? '#d8b4fe' : '#7e22ce'}
                  fontSize="1.8"
                  fontWeight="bold"
                >
                  HOSTELS
                </text>

                {/* Gate 1 Reception & Security Plaza */}
                <rect
                  x="36"
                  y="84"
                  width="28"
                  height="11"
                  rx="2"
                  fill={themeMode === 'blueprint-dark' ? '#0f172a' : '#f1f5f9'}
                  fillOpacity={themeMode === 'blueprint-dark' ? '0.6' : '0.95'}
                  stroke={themeMode === 'blueprint-dark' ? '#64748b' : '#475569'}
                  strokeWidth="0.8"
                />
                <text
                  x="38"
                  y="89"
                  fill={themeMode === 'blueprint-dark' ? '#cbd5e1' : '#1e293b'}
                  fontSize="2.4"
                  fontWeight="bold"
                >
                  GATE 1 (MAIN HIGHWAY ENTRANCE)
                </text>

                {/* Animated Glowing Walking Route Polyline */}
                {routeSvgPath && (
                  <>
                    <path
                      d={routeSvgPath}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3.5"
                      strokeOpacity="0.4"
                    />
                    <path
                      d={routeSvgPath}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                      className="animate-pulse"
                    />
                  </>
                )}
              </svg>

              {/* Campus Location Marker Badges */}
              {filteredLocations.map((loc) => {
                const isSelected = selectedLoc?.id === loc.id;
                const pos = loc.coordinates || { x: 50, y: 50 };

                return (
                  <button
                    key={loc.id}
                    onClick={() => handleMarkerClick(loc)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 z-20 ${getMarkerBadgeStyle(
                      loc.category,
                      isSelected
                    )}`}
                    title={`${loc.name} (${loc.category})`}
                  >
                    {getCategoryIcon(loc.category)}
                    <span className="hidden sm:inline whitespace-nowrap text-[11px]">
                      {loc.name.split('(')[0]}
                    </span>
                  </button>
                );
              })}

              {/* User Live GPS Marker */}
              {userLocation && (
                <div
                  style={{ left: '50%', top: '92%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                >
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75 -translate-x-1/2 -translate-y-1/2" />
                  <div className="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white -translate-x-1/2 -translate-y-1/2">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Footer Overlay Indicator */}
          <div className="absolute bottom-5 left-5 right-5 pointer-events-none flex items-center justify-between">
            <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-[11px] text-slate-200 pointer-events-auto flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Guru Nanak Institutions Campus</span>
              <span className="text-slate-400">• Drag to pan, scroll to zoom</span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300 pointer-events-auto hidden sm:flex items-center gap-1.5 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>North-Facing Grid</span>
            </div>
          </div>
        </div>

        {/* Right Column: Directions & Destination Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Route Planner Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Walking Route Planner</h4>
              </div>
              <button
                onClick={() => {
                  const temp = originLocationId;
                  setOriginLocationId(destinationLocationId);
                  setDestinationLocationId(temp);
                  handleComputeDirections(destinationLocationId, temp);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Swap origin and destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Origin Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Starting Point (From)
              </label>
              <select
                value={originLocationId}
                onChange={(e) => setOriginLocationId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {userLocation && (
                  <option value="user-live-gps">📍 My Live GPS Location</option>
                )}
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.building})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Destination Point (To)
              </label>
              <select
                value={destinationLocationId}
                onChange={(e) => {
                  setDestinationLocationId(e.target.value);
                  const match = locations.find((l) => l.id === e.target.value);
                  if (match) setSelectedLoc(match);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.building})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => handleComputeDirections(originLocationId, destinationLocationId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                Find Walking Path
              </button>
              {isNavigating && (
                <button
                  onClick={() => {
                    setIsNavigating(false);
                    setActiveRoute(null);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer"
                  title="Clear Route"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active Navigation Route Guidance Card */}
          {activeRoute && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-indigo-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Navigation className="w-4 h-4" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Turn-by-Turn Guidance
                    </h5>
                    <p className="text-[11px] text-indigo-200">
                      To {activeRoute.toLocation.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">
                    {activeRoute.estimatedMinutes} min
                  </div>
                  <div className="text-[10px] text-indigo-300 font-semibold">
                    {activeRoute.distanceMeters > 1000
                      ? `${(activeRoute.distanceMeters / 1000).toFixed(2)} km`
                      : `${activeRoute.distanceMeters} m`}
                  </div>
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-slate-100 leading-snug">{step.instruction}</p>
                      {step.landmark && (
                        <p className="text-[10px] text-indigo-300">Landmark: {step.landmark}</p>
                      )}
                      {step.floorChange && (
                        <p className="text-[10px] text-emerald-400 font-bold">
                          Floor: {step.floorChange}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Location Full Spec Inspector */}
          {selectedLoc && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block mb-1">
                    {selectedLoc.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedLoc.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedLoc.institutionName || 'Guru Nanak Institutions'}
                  </p>
                </div>
                {selectedLoc.coordinatesVerified && (
                  <span
                    className="p-1 rounded-full bg-emerald-50 text-emerald-600 shrink-0"
                    title="Verified Campus Coordinates"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedLoc.description}
              </p>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong>Building:</strong> {selectedLoc.building}
                    {selectedLoc.floor && ` • ${selectedLoc.floor}`}
                    {selectedLoc.roomNumber && ` (Room ${selectedLoc.roomNumber})`}
                  </span>
                </div>

                {selectedLoc.landmarks && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Landmark:</strong> {selectedLoc.landmarks}
                    </span>
                  </div>
                )}

                {selectedLoc.timings && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong>Hours:</strong> {selectedLoc.timings}
                    </span>
                  </div>
                )}

                {selectedLoc.inCharge && (
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong>In-Charge:</strong> {selectedLoc.inCharge}
                    </span>
                  </div>
                )}

                {selectedLoc.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong>Contact:</strong> {selectedLoc.contactNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDestinationLocationId(selectedLoc.id);
                    handleComputeDirections(originLocationId, selectedLoc.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Navigate Here
                </button>
                <button
                  onClick={() => setOriginLocationId(selectedLoc.id)}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Set as Origin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
