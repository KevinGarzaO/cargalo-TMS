'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Building2, Truck, Coins, Calendar, Download, Plus, ArrowUp, Navigation, Gauge } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleMap, useJsApiLoader, OverlayView, Polyline } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';

const data = [
  { name: 'Ene', envios: 450, ingresos: 320 }, { name: 'Feb', envios: 650, ingresos: 450 }, { name: 'Mar', envios: 850, ingresos: 600 },
  { name: 'Abr', envios: 550, ingresos: 400 }, { name: 'May', envios: 750, ingresos: 550 }, { name: 'Jun', envios: 950, ingresos: 700 },
];
const feed = [
  { id: 1, kind: 'envio', text: 'Envío #ENV-9928 entregado...', time: 'hace 2 min' },
  { id: 2, kind: 'socio', text: 'Nuevo cliente Florería Anaís...', time: 'hace 14 min' },
  { id: 3, kind: 'driver', text: 'Tomás Bravo se desconectó...', time: 'hace 22 min' },
];
const topRutas = [
  { ruta: 'CDMX → Puebla', envios: 248, pct: 92 }, { ruta: 'Monterrey → Saltillo', envios: 182, pct: 75 },
  { ruta: 'Guadalajara → Tepic', envios: 141, pct: 58 }, { ruta: 'CDMX → Toluca', envios: 118, pct: 45 },
];

const INITIAL_DRIVERS = [
  {
    id: 'D1',
    nombre: 'Esteban',
    lat: 25.6689,
    lng: -100.3101,
    estado: 'active',
    origen: 'Macroplaza, Monterrey',
    destino: 'Arboleda, San Pedro Garza García',
  },
  {
    id: 'D2',
    nombre: 'María',
    lat: 25.6714,
    lng: -100.3090,
    estado: 'busy',
    origen: 'Pabellón M, Monterrey',
    destino: 'Parque Fundidora, Monterrey',
  },
];

const MAP_STYLES = [
  { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#121d2b" }] },
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#8497A0" }] },
  { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#121d2b" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121d2b" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#121d2b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1c2b3e" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1721" }] }
];

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export default function InicioPage() {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clippedPath, setClippedPath] = useState<google.maps.LatLngLiteral[]>([]);

  const pathsRef = useRef<Record<string, google.maps.LatLng[]>>({});
  const distRef = useRef<Record<string, number>>({});
  const totalDistRef = useRef<Record<string, number>>({});
  const selectedIdRef = useRef<string | null>(null);

  const speedMps = 8.3; // 30 km/h
  const intervalMs = 100;

  // Mantener ref sincronizado con estado
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) setClippedPath([]);
  }, [selectedId]);

  const getClippedRoute = useCallback((driverId: string, traveled: number) => {
    const path = pathsRef.current[driverId];
    if (!path || path.length < 2) return { pos: null, path: [] };

    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const d1 = path[i];
      const d2 = path[i + 1];
      const segmentDist = google.maps.geometry.spherical.computeDistanceBetween(d1, d2);

      if (acc + segmentDist > traveled) {
        const fraction = (traveled - acc) / segmentDist;
        const interpolated = google.maps.geometry.spherical.interpolate(d1, d2, fraction);
        const currentPos = { lat: interpolated.lat(), lng: interpolated.lng() };

        const sliced = [currentPos];
        for (let j = i + 1; j < path.length; j++) {
          sliced.push({ lat: path[j].lat(), lng: path[j].lng() });
        }
        return { pos: currentPos, path: sliced };
      }
      acc += segmentDist;
    }
    distRef.current[driverId] = 0;
    return { pos: { lat: path[0].lat(), lng: path[0].lng() }, path: [] };
  }, []);

  // Loop de simulación — usa selectedIdRef para evitar stale closure
  useEffect(() => {
    if (!isLoaded || !window.google) return;

    const interval = setInterval(() => {
      const currentSelected = selectedIdRef.current;

      setDrivers(prev => {
        let newSelectedPath: google.maps.LatLngLiteral[] = [];

        const next = prev.map(d => {
          const traveled = (distRef.current[d.id] || 0) + (speedMps * (intervalMs / 1000));
          distRef.current[d.id] = traveled;

          const result = getClippedRoute(d.id, traveled);

          if (currentSelected === d.id) {
            newSelectedPath = result.path;
          }

          if (result.pos) {
            return { ...d, lat: result.pos.lat, lng: result.pos.lng };
          }
          return d;
        });

        if (currentSelected) setClippedPath(newSelectedPath);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLoaded, getClippedRoute]); // sin selectedId — usamos la ref

  // Cargar rutas de Google Directions al inicio
  const loadRoute = useCallback((driver: typeof INITIAL_DRIVERS[0]) => {
    if (!window.google) return;
    new google.maps.DirectionsService().route({
      origin: driver.origen,
      destination: driver.destino,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result) {
        totalDistRef.current[driver.id] = result.routes[0].legs[0].distance?.value || 0;
        pathsRef.current[driver.id] = result.routes[0].overview_path;
        if (distRef.current[driver.id] === undefined) distRef.current[driver.id] = 0;
      }
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      INITIAL_DRIVERS.forEach(d => loadRoute(d));
    }
  }, [isLoaded, loadRoute]);

  const handleSelectDriver = (driverId: string) => {
    if (selectedId === driverId) {
      // Deseleccionar
      setSelectedId(null);
      setClippedPath([]);
    } else {
      setSelectedId(driverId);
    }
  };

  const selectedDriver = drivers.find(d => d.id === selectedId);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none">Dashboard</h1>
          <p className="text-sm text-[#5C7480] mt-2 font-medium">Resumen de la operación · Últimos 30 días</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-[#ECF1F3] px-4 py-2 rounded-xl text-xs font-bold text-[#5C7480] hover:bg-ink-50 transition-all shadow-sm"><Calendar size={14} />Sep 26 – Oct 25</button>
          <button className="flex items-center gap-2 bg-white border border-[#ECF1F3] px-4 py-2 rounded-xl text-xs font-bold text-[#5C7480] hover:bg-ink-50 transition-all shadow-sm"><Download size={14} />Exportar</button>
          <button
            onClick={() => router.push('/dashboard/generador-viajes')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Truck size={14} /> Nuevo Viaje
          </button>
          <button
            onClick={() => router.push('/dashboard/generador-rutas')}
            className="flex items-center gap-2 bg-[#F97316] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Navigation size={14} /> Nueva Ruta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Package, label: 'Envíos del mes', val: '2,481', d: '+12.4% vs mes anterior', up: true },
          { icon: Coins, label: 'Ingresos', val: '$ 1.84M', d: '+8.1%', up: true, teal: true },
          { icon: Building2, label: 'Socios activos', val: '128', d: '+4 nuevos', up: true, amber: true },
          { icon: Truck, label: 'Drivers en ruta', val: '42 / 76', d: '12 ocupados · 22 offline', up: null, rose: true }
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-[32px] p-6 border border-[#ECF1F3] shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-ink-900/5 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${k.teal ? 'bg-[#E6F5EC] text-[#4CB89C]' : k.amber ? 'bg-[#FFF9E6] text-[#FFB800]' : k.rose ? 'bg-[#FFF1F1] text-[#FF4D4D]' : 'bg-[#E6F2F7] text-[#1A8FBF]'}`}>
              <k.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-[#8497A0] mb-1.5 uppercase tracking-[0.15em]">{k.label}</p>
            <div className="text-[30px] font-black tracking-tight text-[#0E2A3A] leading-tight mb-4">{k.val}</div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full ${k.up ? 'bg-[#E6F5EC] text-[#2C8B6E]' : 'bg-[#F4F7F9] text-[#5C7480]'}`}>
              {k.up && <ArrowUp size={12} />} {k.d}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-[#ECF1F3] shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div><h3 className="text-xl font-black text-[#0E2A3A]">Envíos vs ingresos</h3><p className="text-xs text-[#5C7480] mt-1 font-bold">Comparativo mensual del año operativo</p></div>
            <div className="flex bg-[#F4F7F9] p-1.5 rounded-2xl">
              {['Semana', 'Mes', 'Año'].map(t => <button key={t} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${t === 'Mes' ? 'text-[#1A8FBF] bg-white shadow-sm' : 'text-[#8497A0]'}`}>{t}</button>)}
            </div>
          </div>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="cE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A8FBF" stopOpacity={0.2}/><stop offset="95%" stopColor="#1A8FBF" stopOpacity={0}/></linearGradient>
                  <linearGradient id="cI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CB89C" stopOpacity={0.2}/><stop offset="95%" stopColor="#4CB89C" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECF1F3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8497A0', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8497A0', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(14,42,58,0.15)', padding: '16px' }} />
                <Area type="monotone" dataKey="envios" stroke="#1A8FBF" strokeWidth={4} fill="url(#cE)" />
                <Area type="monotone" dataKey="ingresos" stroke="#4CB89C" strokeWidth={4} fill="url(#cI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-[#ECF1F3] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-black text-[#0E2A3A]">Actividad reciente</h3><span className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer">Ver todo</span></div>
          <div className="flex flex-col gap-2">
            {feed.map((f) => (
              <div key={f.id} className="flex items-center gap-4 py-4 border-b border-dashed border-[#ECF1F3] last:border-0 hover:bg-ink-50/30 transition-all rounded-2xl px-2">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F2F7] text-[#1A8FBF] flex items-center justify-center shrink-0 shadow-sm">
                  {f.kind === 'envio' && <Package size={18} />}{f.kind === 'socio' && <Building2 size={18} />}{f.kind === 'driver' && <Truck size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#0E2A3A] truncate mb-0.5">{f.text}</div>
                  <div className="text-[10px] text-[#5C7480] font-bold uppercase tracking-widest">Sistema Automático</div>
                </div>
                <div className="text-[9px] text-[#8497A0] font-black whitespace-nowrap uppercase">{f.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-[#ECF1F3] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-black text-[#0E2A3A]">Top rutas</h3><span className="text-[10px] text-[#8497A0] font-black uppercase tracking-[0.2em]">4 RUTAS</span></div>
          <div className="flex flex-col gap-6">
            {topRutas.map((r, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex justify-between mb-2.5 items-end">
                  <span className="text-xs font-black text-[#0E2A3A]">{r.ruta}</span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-wider">{r.envios} ENVÍOS</span>
                </div>
                <div className="w-full h-2 bg-[#F4F7F9] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all group-hover:scale-x-105 origin-left" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Map — full width */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-[#ECF1F3] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[#0E2A3A]">Estado de la flota</h3>
              <p className="text-xs text-[#5C7480] mt-1 font-medium">Monterrey · En movimiento a 30 km/h</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedId && (
                <button
                  onClick={() => router.push(`/dashboard/monitoreo?driverId=${selectedId}`)}
                  className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-3 py-1.5 rounded-lg shadow hover:scale-105 transition-all"
                >
                  Ver monitoreo →
                </button>
              )}
              <span className="text-[10px] text-[#8497A0] font-black uppercase tracking-[0.2em]">76 DRIVERS TOTAL</span>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] bg-[#F8FAFB] rounded-[32px] relative overflow-hidden border border-[#ECF1F3] shadow-inner">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedDriver ? { lat: selectedDriver.lat, lng: selectedDriver.lng } : { lat: 25.6689, lng: -100.3101 }}
                zoom={selectedId ? 16 : 14}
                options={{
                  disableDefaultUI: true,
                  gestureHandling: 'greedy',
                  styles: MAP_STYLES
                }}
                onClick={() => { setSelectedId(null); setClippedPath([]); }}
              >
                {/* Polyline recortada solo del driver seleccionado */}
                {selectedId && clippedPath.length > 0 && (
                  <Polyline
                    path={clippedPath}
                    options={{
                      strokeColor: '#00E5FF',
                      strokeWeight: 6,
                      strokeOpacity: 0.9,
                      geodesic: true,
                      zIndex: 999
                    }}
                  />
                )}

                {drivers.map(d => (
                  <OverlayView
                    key={d.id}
                    position={{ lat: d.lat, lng: d.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      className="flex flex-col items-center -translate-x-1/2 -translate-y-[100%] cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                      onClick={e => { e.stopPropagation(); router.push(`/dashboard/monitoreo?driverId=${d.id}`); }}
                    >
                      <div className={`text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-2 shadow-xl transition-all duration-300 whitespace-nowrap ${
                        selectedId === d.id
                          ? 'bg-[#F97316] scale-110 ring-4 ring-white'
                          : d.estado === 'active' ? 'bg-[#1A8FBF]' : 'bg-[#4CB89C]'
                      }`}>
                        {d.nombre}
                        <span className="ml-1.5 opacity-80">30 km/h</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-xl animate-pulse ${
                        selectedId === d.id ? 'bg-[#F97316]' : d.estado === 'active' ? 'bg-[#1A8FBF]' : 'bg-[#4CB89C]'
                      }`} />
                    </div>
                  </OverlayView>
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-ink-300 opacity-50">
                <Truck size={48} className="animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest text-center">Cargando flota en vivo...</span>
              </div>
            )}
          </div>

          {/* Legend + selected info */}
          <div className="flex items-center justify-between mt-6 px-4 flex-wrap gap-3">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/20"></div>
                <span className="text-[11px] font-black text-[#5C7480] uppercase tracking-widest leading-none">DISPONIBLE – 42</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4CB89C] shadow-lg shadow-[#4CB89C]/20"></div>
                <span className="text-[11px] font-black text-[#5C7480] uppercase tracking-widest leading-none">OCUPADO – 12</span>
              </div>
              {selectedId && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F97316] shadow-lg shadow-orange-200 animate-pulse"></div>
                  <span className="text-[11px] font-black text-[#F97316] uppercase tracking-widest leading-none">SELECCIONADO</span>
                </div>
              )}
            </div>
            {selectedDriver && (
              <span className="text-[10px] font-bold text-ink-500 italic">
                📍 {selectedDriver.nombre} en ruta → {selectedDriver.destino}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
