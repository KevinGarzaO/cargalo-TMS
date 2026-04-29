'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline, OverlayView } from '@react-google-maps/api';
import { ArrowLeft, Search, Timer, Gauge, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';
const SPEED_MPS = 8.3;
const INTERVAL_MS = 100;

const DRIVERS_CONFIG = [
  { id: 'D1', nombre: 'Esteban Carrillo', vehiculo: 'Hilux - ABC-123', origen: 'Macroplaza, Monterrey', destino: 'Arboleda, San Pedro Garza García', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop', initLat: 25.6689, initLng: -100.3101 },
  { id: 'D2', nombre: 'María Olivares', vehiculo: 'NP300 - XYZ-789', origen: 'Pabellón M, Monterrey', destino: 'Parque Fundidora, Monterrey', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop', initLat: 25.6714, initLng: -100.3090 },
];

const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

const MAP_OPTIONS = {
  disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
  styles: [
    { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#121d2b' }] },
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#8497A0' }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#121d2b' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c2b3e' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1721' }] },
  ],
};

function MonitoreoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries });

  const [drivers, setDrivers] = useState(DRIVERS_CONFIG.map(d => ({ ...d, lat: d.initLat, lng: d.initLng })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clippedPath, setClippedPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [eta, setEta] = useState('');

  // Refs — nunca quedan stale
  const pathsRef = useRef<Record<string, google.maps.LatLng[]>>({});
  const distRef = useRef<Record<string, number>>({});
  const totalDistRef = useRef<Record<string, number>>({});
  const selectedIdRef = useRef<string | null>(null);

  // Mantener ref sincronizado
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) { setClippedPath([]); setEta(''); }
  }, [selectedId]);

  // Función pura de recorte usando refs
  const getClippedRoute = useCallback((driverId: string, traveled: number) => {
    const path = pathsRef.current[driverId];
    if (!path || path.length < 2) return { pos: null, sliced: [] as google.maps.LatLngLiteral[] };
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i], p2 = path[i + 1];
      const segLen = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      if (acc + segLen > traveled) {
        const interp = google.maps.geometry.spherical.interpolate(p1, p2, (traveled - acc) / segLen);
        const pos = { lat: interp.lat(), lng: interp.lng() };
        const sliced: google.maps.LatLngLiteral[] = [pos];
        for (let j = i + 1; j < path.length; j++) sliced.push({ lat: path[j].lat(), lng: path[j].lng() });
        return { pos, sliced };
      }
      acc += segLen;
    }
    distRef.current[driverId] = 0;
    return { pos: { lat: path[0].lat(), lng: path[0].lng() }, sliced: [] as google.maps.LatLngLiteral[] };
  }, []);

  // Loop — cálculo FUERA del updater, setClippedPath independiente
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    const interval = setInterval(() => {
      const sel = selectedIdRef.current;
      const posUpdates: Record<string, { lat: number; lng: number }> = {};
      let newSliced: google.maps.LatLngLiteral[] = [];
      let newEta = '';

      for (const d of DRIVERS_CONFIG) {
        const traveled = (distRef.current[d.id] || 0) + SPEED_MPS * (INTERVAL_MS / 1000);
        distRef.current[d.id] = traveled;
        const { pos, sliced } = getClippedRoute(d.id, traveled);
        if (pos) posUpdates[d.id] = pos;
        if (d.id === sel) {
          newSliced = sliced;
          const rem = (totalDistRef.current[d.id] || 0) - traveled;
          newEta = rem > 0 ? `${Math.ceil(rem / SPEED_MPS / 60)} mins` : 'Llegando...';
        }
      }

      setDrivers(prev => prev.map(d => posUpdates[d.id] ? { ...d, ...posUpdates[d.id] } : d));
      if (sel) { setClippedPath(newSliced); setEta(newEta); }
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoaded, getClippedRoute]);

  const loadRoute = useCallback((d: typeof DRIVERS_CONFIG[0]) => {
    if (!window.google) return;
    new google.maps.DirectionsService().route({ origin: d.origen, destination: d.destino, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
      if (status === 'OK' && res) {
        totalDistRef.current[d.id] = res.routes[0].legs[0].distance?.value || 0;
        pathsRef.current[d.id] = res.routes[0].overview_path;
        if (distRef.current[d.id] === undefined) distRef.current[d.id] = 0;
      }
    });
  }, []);

  useEffect(() => { if (isLoaded) DRIVERS_CONFIG.forEach(d => loadRoute(d)); }, [isLoaded, loadRoute]);

  // Auto-seleccionar desde URL
  useEffect(() => {
    if (!isLoaded) return;
    const id = searchParams.get('driverId');
    if (id) setSelectedId(id);
  }, [isLoaded, searchParams]);

  const selectedDriver = drivers.find(d => d.id === selectedId) ?? null;
  const clearSelection = () => setSelectedId(null);

  const destPos = selectedId && pathsRef.current[selectedId]
    ? (() => { const p = pathsRef.current[selectedId]; return { lat: p[p.length - 1].lat(), lng: p[p.length - 1].lng() }; })()
    : null;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-ink-50 rounded-xl transition-all text-ink-600"><ArrowLeft /></button>
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Monitoreo Monterrey</h1>
            <p className="text-sm text-[#5C7480] font-medium">Ruta recortada en tiempo real · 30 km/h</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-ink-100 shadow-sm">
          <div className="px-4 py-1.5 flex items-center gap-2 border-r border-ink-100"><Gauge size={14} className="text-primary" /><span className="text-xs font-bold text-ink-900">30 km/h</span></div>
          <div className="px-4 py-1.5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs font-bold text-ink-500">Flota Activa</span></div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-ink-100 flex flex-col bg-white z-10">
          <div className="p-4 border-b border-ink-100 bg-ink-50/30">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input placeholder="Buscar conductor..." className="w-full bg-white border border-ink-200 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-ink-50 panel-scroll">
            {drivers.map(d => (
              <div key={d.id} className={`p-4 hover:bg-ink-50 cursor-pointer transition-all ${selectedId === d.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`} onClick={() => setSelectedId(d.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-2 overflow-hidden shrink-0 ${selectedId === d.id ? 'border-[#F97316]' : 'border-primary'}`}>
                    <img src={d.img} alt={d.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-ink-900 truncate">{d.nombre}</div>
                    <div className="flex items-center gap-1.5 mt-0.5"><Gauge size={11} className="text-primary" /><span className="text-[10px] font-black text-primary">30 km/h</span></div>
                  </div>
                  {selectedId === d.id && <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shrink-0" />}
                </div>
                <div className="text-[11px] text-ink-400 truncate pl-1 mt-2 italic">→ {d.destino}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={selectedDriver ? { lat: selectedDriver.lat, lng: selectedDriver.lng } : { lat: 25.6689, lng: -100.3101 }}
              zoom={selectedId ? 17 : 15}
              options={MAP_OPTIONS}
              onClick={clearSelection}
            >
              {/* Ruta recortada SOLO si hay selección */}
              {selectedId && clippedPath.length > 0 && (
                <Polyline path={clippedPath} options={{ strokeColor: '#00E5FF', strokeWeight: 7, strokeOpacity: 0.95, geodesic: true, zIndex: 1000 }} />
              )}

              {destPos && (
                <Marker position={destPos} icon={{ path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#1A8FBF', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff', scale: 1.5, anchor: new google.maps.Point(12, 22) }} />
              )}

              {drivers.map(d => (
                <OverlayView key={d.id} position={{ lat: d.lat, lng: d.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                  <div className="flex flex-col items-center -translate-x-1/2 -translate-y-[100%] cursor-pointer" style={{ pointerEvents: 'auto' }} onClick={e => { e.stopPropagation(); setSelectedId(d.id); }}>
                    <div className={`text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-2 shadow-2xl transition-all duration-300 whitespace-nowrap ${selectedId === d.id ? 'bg-[#F97316] scale-110 ring-4 ring-white' : 'bg-[#1A8FBF]'}`}>
                      {d.nombre.split(' ')[0]}<span className="ml-2 opacity-70">30 km/h</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-[3.5px] border-white shadow-2xl animate-pulse ${selectedId === d.id ? 'bg-[#F97316]' : 'bg-[#1A8FBF]'}`} />
                  </div>
                </OverlayView>
              ))}

              {selectedDriver && (
                <InfoWindow position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }} onCloseClick={clearSelection}>
                  <div className="min-w-[260px] p-0">
                    <div className="flex items-center gap-3 p-3 pb-2.5 border-b border-ink-100">
                      <div className="w-12 h-12 rounded-full border-[3px] border-[#F97316] overflow-hidden shadow-md shrink-0">
                        <img src={selectedDriver.img} alt={selectedDriver.nombre} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-black text-ink-900 leading-tight truncate">{selectedDriver.nombre}</div>
                        <div className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mt-0.5">{selectedDriver.vehiculo}</div>
                        <div className="flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-black text-green-600">En tránsito</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 pb-2">
                      <div className="bg-primary/5 rounded-xl p-2.5"><div className="text-[8px] font-black text-primary uppercase tracking-wider">Velocidad</div><div className="text-[13px] font-black text-primary">30 km/h</div></div>
                      <div className="bg-amber-50 rounded-xl p-2.5"><div className="text-[8px] font-black text-amber-600 uppercase tracking-wider">Llega en</div><div className="text-[13px] font-black text-amber-700">{eta || '...'}</div></div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="flex items-start gap-2 bg-ink-50 rounded-xl p-2.5">
                        <Navigation size={13} className="text-primary mt-0.5 shrink-0" />
                        <div><div className="text-[8px] font-black text-ink-400 uppercase tracking-wider mb-0.5">Destino final</div><div className="text-[11px] font-bold text-ink-800">{selectedDriver.destino}</div></div>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-ink-50 flex items-center justify-center text-ink-500 font-black uppercase text-xs animate-pulse">Cargando Monterrey...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Monitoreo() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500 font-black uppercase text-xs">Cargando...</div>}>
      <MonitoreoContent />
    </Suspense>
  );
}
