'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, MapPin, Navigation, MoreHorizontal, 
  Copy, Trash2, Play, CheckCircle2, AlertCircle, GripVertical, 
  User, ChevronDown, ChevronUp, Map as MapIcon, X, Check, Save, Box, Sparkles, Loader2, Building2, CheckCircle, Clock, Route
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { RUTAS_MOCK } from '@/utils/rutas';
import { MOCK } from '@/utils/data';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export default function Rutas() {
  const router = useRouter();
  const [rutas, setRutas] = useState(RUTAS_MOCK);
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const stats = useMemo(() => {
    return {
      total: rutas.length,
      activas: rutas.filter(r => r.estado === 'Activa').length,
      inactivas: rutas.filter(r => r.estado === 'Inactiva').length,
      paradas: rutas.reduce((acc, r) => acc + (r.paradasCount || r.paradas?.length || 0), 0)
    };
  }, [rutas]);

  const filtered = useMemo(() => {
    return rutas.filter(r => {
      const matchesQuery = r.nombre.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = filterStatus === 'Todas' || r.estado === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [rutas, q, filterStatus]);

  const handleSave = (route: any) => {
    if (selectedRoute) {
      setRutas(rutas.map(r => r.id === selectedRoute.id ? { ...route, id: r.id } : r));
    } else {
      setRutas([...rutas, { ...route, id: `R-${Math.floor(Math.random() * 1000 + 200)}` }]);
    }
    setShowModal(false);
    setSelectedRoute(null);
  };

  const handleDuplicate = (route: any) => {
    const newRoute = { ...route, id: `R-${Math.floor(Math.random() * 1000 + 500)}`, nombre: `${route.nombre} (Copia)` };
    setRutas([newRoute, ...rutas]);
  };

  const toggleEstado = (id: string) => {
    setRutas(rutas.map(r => r.id === id ? { ...r, estado: r.estado === 'Activa' ? 'Inactiva' : 'Activa' } : r));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Gestión de Rutas</h1>
          <p className="text-sm text-[#5C7480] font-medium">Define plantillas de rutas recurrentes para generar viajes rápidos</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/generador-rutas')}
          className="bg-[#F97316] text-white px-5 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Crear Nueva Ruta
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Plantillas Totales', val: stats.total, icon: Route, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Rutas Activas', val: stats.activas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'En Pausa', val: stats.inactivas, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Paradas Registradas', val: stats.paradas, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-ink-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-ink-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ink-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 p-1 bg-ink-50 rounded-2xl">
            {['Todas', 'Activa', 'Inactiva'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${filterStatus === s ? 'bg-white text-primary shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}
              >
                {s === 'Activa' ? 'Activas' : s === 'Inactiva' ? 'Inactivas' : s}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
              <input 
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por nombre o ID de ruta..." 
                className="w-full bg-ink-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-ink-300 font-medium" 
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-ink-400 uppercase tracking-widest">ID / Ruta</th>
                <th className="px-6 py-4 text-[11px] font-black text-ink-400 uppercase tracking-widest">Asignación</th>
                <th className="px-6 py-4 text-[11px] font-black text-ink-400 uppercase tracking-widest text-center">Paradas / Dist.</th>
                <th className="px-6 py-4 text-[11px] font-black text-ink-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[11px] font-black text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(ruta => (
                <tr 
                  key={ruta.id} 
                  onClick={() => router.push(`/dashboard/generador-rutas?id=${ruta.id}`)}
                  className="hover:bg-ink-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-primary mb-0.5">{ruta.id}</span>
                      <span className="text-sm font-black text-ink-900 group-hover:text-primary transition-colors">{ruta.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-ink-400" />
                        <span className="text-xs font-bold text-ink-700">{ruta.cliente || 'Sin Cliente'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-ink-400" />
                        <span className="text-xs text-ink-500 font-medium">{ruta.driver || 'Sin Conductor'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-ink-900">{ruta.paradasCount || ruta.paradas?.length || 0} Paradas</span>
                      <span className="text-[10px] text-ink-500 font-medium">{ruta.distanciaEstimada || '-- km'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleEstado(ruta.id); }}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${ruta.estado === 'Activa' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-ink-100 text-ink-400 hover:bg-ink-200'}`}
                      >
                        {ruta.estado === 'Activa' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                        {ruta.estado}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {ruta.estado === 'Activa' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/monitoreo?routeId=${ruta.id}`); }}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" 
                          title="Monitoreo en Vivo"
                        >
                          <Navigation size={18} className="animate-pulse" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(ruta); }}
                        className="p-2 text-ink-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" 
                        title="Duplicar Plantilla"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/generador-rutas?id=${ruta.id}`); }}
                        className="bg-[#F97316] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-100"
                      >
                        <Play size={14} fill="currentColor" /> Generar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <RouteModal 
          onClose={() => { setShowModal(false); setSelectedRoute(null); }} 
          onSave={handleSave} 
          routeToEdit={selectedRoute} 
        />
      )}
    </div>
  );
}

function RouteModal({ onClose, onSave, routeToEdit }: any) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [form, setForm] = useState(routeToEdit || { nombre: '', cliente: '', driver: '', paradas: [] });
  const [newStop, setNewStop] = useState({ tipo: 'entrega', direccion: '', contacto: '', tel: '' });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (isLoaded && form.paradas.length >= 2) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: form.paradas[0].direccion,
        destination: form.paradas[form.paradas.length - 1].direccion,
        waypoints: form.paradas.slice(1, -1).map((p: any) => ({ location: p.direccion, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') setDirections(result);
      });
    } else {
      setDirections(null);
    }
  }, [isLoaded, form.paradas]);

  const addStop = () => {
    if (!newStop.direccion) return;
    setForm({ ...form, paradas: [...form.paradas, { ...newStop, id: `S-${Date.now()}` }] });
    setNewStop({ tipo: 'entrega', direccion: '', contacto: '', tel: '' });
  };

  const removeStop = (id: string) => {
    setForm({ ...form, paradas: form.paradas.filter((s: any) => s.id !== id) });
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newParadas = [...form.paradas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newParadas.length) return;
    [newParadas[index], newParadas[targetIndex]] = [newParadas[targetIndex], newParadas[index]];
    setForm({ ...form, paradas: newParadas });
  };

  const [optimizing, setOptimizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const optimizeRoute = () => {
    console.log('--- Iniciando Optimización ---');
    if (typeof window.google === 'undefined') {
      console.error('Google Maps API not loaded');
      alert('Cargando servicios de mapas... Intenta de nuevo en un momento.');
      return;
    }
    if (form.paradas.length < 3) {
      console.warn('Not enough stops to optimize');
      return;
    }
    
    setOptimizing(true);
    console.log('Origin:', form.paradas[0].direccion);
    console.log('Destination:', form.paradas[form.paradas.length - 1].direccion);
    console.log('Waypoints:', form.paradas.slice(1, -1).map((s: any) => s.direccion));
    
    const directionsService = new window.google.maps.DirectionsService();
    const origin = form.paradas[0].direccion;
    const destination = form.paradas[form.paradas.length - 1].direccion;
    const waypoints = form.paradas.slice(1, -1).map((s: any) => ({
      location: s.direccion,
      stopover: true
    }));

    try {
      directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        console.log('Google API Status:', status);
        setOptimizing(true); // Keep state for a moment for visual feedback
        
        setTimeout(() => setOptimizing(false), 500);

        if (status === 'OK' && result && result.routes[0]) {
          console.log('Waypoints Order:', result.routes[0].waypoint_order);
          const order = result.routes[0].waypoint_order;
          const optimizedMiddle = order.map((idx: number) => form.paradas[idx + 1]);
          const newParadas = [form.paradas[0], ...optimizedMiddle, form.paradas[form.paradas.length - 1]];
          
          const totalDist = result.routes[0].legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
          
          setForm({ 
            ...form, 
            paradas: newParadas, 
            distanciaEstimada: (totalDist / 1000).toFixed(1) + ' km'
          });

          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          console.error('Optimization failed:', status);
          alert('No se pudo optimizar la ruta. Asegúrate de que las direcciones existan en el mapa.');
        }
      });
    } catch (err) {
      console.error('Crash in directionsService.route:', err);
      setOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0E2A3A]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-ink-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-ink-900 tracking-tight">{routeToEdit ? 'Editar Ruta' : 'Crear Nueva Ruta'}</h2>
            <p className="text-sm text-ink-500 font-medium">Configura las paradas y el tipo de operación para esta ruta</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-ink-50 rounded-2xl transition-colors text-ink-400"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Formulario Izquierdo */}
          <div className="w-1/2 overflow-y-auto p-8 border-r border-ink-50 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-ink-400 uppercase tracking-[2px] mb-2 block">Nombre de la Ruta</label>
                <input 
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Ruta CDMX - Poniente Sabatina" 
                  className="w-full bg-ink-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-ink-400 uppercase tracking-[2px] mb-2 block">Cliente</label>
                <select 
                  className="w-full bg-ink-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  value={form.cliente}
                  onChange={e => setForm({...form, cliente: e.target.value})}
                >
                  <option value="">Seleccionar Cliente</option>
                  {MOCK.CLIENTES.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-ink-400 uppercase tracking-[2px] mb-2 block">Driver</label>
                <select 
                  className="w-full bg-ink-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  value={form.driver}
                  onChange={e => setForm({...form, driver: e.target.value})}
                >
                  <option value="">Seleccionar Driver</option>
                  {MOCK.DRIVERS.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-ink-50 rounded-[32px] p-6 border border-ink-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-black text-ink-400 uppercase tracking-[2px]">Agregar Parada</label>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setNewStop({ ...newStop, tipo: 'recoleccion' })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${newStop.tipo === 'recoleccion' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-ink-400 border border-ink-200'}`}
                    >
                      <Box size={14}/> Recolección
                    </button>
                    <button 
                      onClick={() => setNewStop({ ...newStop, tipo: 'entrega' })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${newStop.tipo === 'entrega' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-ink-400 border border-ink-200'}`}
                    >
                      <Navigation size={14}/> Entrega
                    </button>
                  </div>

                  <div className="relative">
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={auto => (window as any).stopAutocomplete = auto}
                        onPlaceChanged={() => {
                          const place = (window as any).stopAutocomplete.getPlace();
                          if (place.formatted_address) setNewStop({ ...newStop, direccion: place.formatted_address });
                        }}
                        options={{ componentRestrictions: { country: 'mx' } }}
                      >
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                          <input 
                            value={newStop.direccion}
                            onChange={e => setNewStop({ ...newStop, direccion: e.target.value })}
                            placeholder="Dirección de la parada..." 
                            className="w-full bg-white border border-ink-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </Autocomplete>
                    ) : <div className="h-11 bg-ink-100 rounded-xl animate-pulse"></div>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input 
                        value={newStop.contacto}
                        onChange={e => setNewStop({ ...newStop, contacto: e.target.value })}
                        placeholder="Contacto" 
                        className="w-full bg-white border border-ink-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <input 
                      value={newStop.tel}
                      onChange={e => setNewStop({ ...newStop, tel: e.target.value })}
                      placeholder="Teléfono" 
                      className="w-full bg-white border border-ink-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  <button 
                    onClick={addStop}
                    className="w-full bg-ink-900 text-white py-3 rounded-xl text-xs font-black hover:bg-ink-800 transition-all"
                  >
                    Agregar Parada a la Ruta
                  </button>
                </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-ink-400 uppercase tracking-[2px]">Secuencia A, B, C...</label>
                {form.paradas.length >= 3 && (
                  <button 
                    onClick={optimizeRoute}
                    disabled={optimizing || !isLoaded}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {optimizing ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                    {optimizing ? 'Optimizando...' : 'Optimizar Orden'}
                  </button>
                )}
              </div>
              
              <div className="space-y-3 relative">
                {optimizing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
                {form.paradas.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-ink-300 gap-4 border-2 border-dashed border-ink-100 rounded-[32px]">
                    <MapIcon size={48} className="opacity-20" />
                    <p className="text-xs font-bold">Aún no hay paradas</p>
                  </div>
                ) : (
                  form.paradas.map((stop: any, idx: number) => (
                    <div key={stop.id} className="bg-white border border-ink-100 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 hover:shadow-md transition-all">
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => moveStop(idx, 'up')} className="text-ink-300 hover:text-primary"><ChevronUp size={16}/></button>
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">{String.fromCharCode(65 + idx)}</div>
                        <button onClick={() => moveStop(idx, 'down')} className="text-ink-300 hover:text-primary"><ChevronDown size={16}/></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-ink-900 truncate">{stop.contacto}</div>
                        <div className="text-[9px] text-ink-500 truncate">{stop.direccion}</div>
                      </div>
                      <button onClick={() => removeStop(stop.id)} className="p-2 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mapa Derecho */}
          <div className="w-1/2 bg-ink-50 relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 19.4326, lng: -99.1332 }}
                zoom={11}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                {form.paradas.map((stop: any, idx: number) => {
                  const leg = directions?.routes[0].legs[idx];
                  const lastLeg = directions?.routes[0].legs[idx - 1];
                  const position = leg ? leg.start_location : (lastLeg ? lastLeg.end_location : null);
                  
                  return position ? (
                    <Marker 
                      key={stop.id} 
                      position={position} 
                      label={{ text: String.fromCharCode(65 + idx), color: 'white', fontWeight: 'bold' }}
                    />
                  ) : null;
                })}
              </GoogleMap>
            ) : <div className="w-full h-full flex items-center justify-center">Cargando Mapa...</div>}
            
            {showSuccess && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500">
                <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">¡Orden Optimizado!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-ink-50 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
          <button onClick={onClose} className="px-6 py-3 bg-ink-50 text-ink-600 rounded-2xl text-sm font-black hover:bg-ink-100 transition-all">Cancelar</button>
          <button 
            onClick={() => onSave(form)}
            className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Save size={18} /> Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  );
}
