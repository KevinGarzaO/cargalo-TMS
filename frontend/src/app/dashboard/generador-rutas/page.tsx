'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, Search, Filter, MapPin, Navigation, MoreHorizontal, 
  Copy, Trash2, Play, CheckCircle2, AlertCircle, GripVertical, 
  User, ChevronDown, ChevronUp, Map as MapIcon, X, Check, Save, Box, Sparkles, Loader2, Phone, ArrowLeft, CheckCircle, Clock
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { RUTAS_MOCK } from '@/utils/rutas';
import { MOCK } from '@/utils/data';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function SortableStop({ stop, index, removeStop }: { stop: any, index: number, removeStop: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as any,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white p-4 rounded-2xl border ${isDragging ? 'border-[#F97316] border-2 shadow-xl' : 'border-ink-100 shadow-sm'} flex items-center gap-4 transition-all`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-ink-50 rounded-lg text-ink-300 hover:text-ink-600 transition-all"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg">
        {String.fromCharCode(65 + index)}
      </div>

      <div className="flex-1 min-w-0">
         <div className="flex items-center gap-3 mb-1.5 flex-wrap">
           <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${stop.tipo === 'recoleccion' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
             {stop.tipo}
           </span>
           <span className="text-sm font-black text-ink-900 truncate">{stop.contacto || 'Sin contacto'}</span>
           {stop.cliente && (
             <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/5 px-2 py-0.5 rounded-md border border-[#F97316]/10">
               {stop.cliente}
             </span>
           )}
         </div>
         <div className="text-xs text-ink-500 font-medium truncate flex items-center gap-1.5">
           <MapPin size={12} className="text-ink-400" /> {stop.direccion}
         </div>
      </div>

      <button 
        onClick={() => removeStop(stop.id)}
        className="p-2 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function GeneradorRutas() {
  return (
    <Suspense fallback={<div>Cargando generador...</div>}>
      <GeneradorRutasContent />
    </Suspense>
  );
}

function GeneradorRutasContent() {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const searchParams = useSearchParams();
  const routeId = searchParams.get('id');

  const [form, setForm] = useState({
    nombre: 'Nueva Ruta Operativa',
    cliente: '',
    driver: '',
    paradas: [] as any[]
  });

  useEffect(() => {
    if (routeId) {
      const template = RUTAS_MOCK.find(r => r.id === routeId);
      if (template) {
        setForm({
          nombre: template.nombre,
          cliente: '',
          driver: '',
          paradas: template.paradas || []
        });
      }
    }
  }, [routeId]);

  const [newStop, setNewStop] = useState({ tipo: 'entrega', direccion: '', contacto: '', tel: '', cliente: '' });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.paradas.findIndex((p: any) => p.id === active.id);
      const newIndex = form.paradas.findIndex((p: any) => p.id === over.id);
      setForm({ ...form, paradas: arrayMove(form.paradas, oldIndex, newIndex) });
    }
  };

  const addStop = () => {
    if (!newStop.direccion) return;
    const updatedParadas = [...form.paradas, { ...newStop, id: `S-${Date.now()}` }];
    setForm({ ...form, paradas: updatedParadas });
    setNewStop({ tipo: 'entrega', direccion: '', contacto: '', tel: '', cliente: '' });
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

  useEffect(() => {
    if (isLoaded && form.paradas.length >= 2) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: form.paradas[0].direccion,
        destination: form.paradas[form.paradas.length - 1].direccion,
        waypoints: form.paradas.slice(1, -1).map(p => ({ location: p.direccion, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') setDirections(result);
      });
    } else {
      setDirections(null);
    }
  }, [isLoaded, form.paradas]);

  const optimizeRoute = () => {
    if (!window.google || form.paradas.length < 3) return;
    setOptimizing(true);
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin: form.paradas[0].direccion,
      destination: form.paradas[form.paradas.length - 1].direccion,
      waypoints: form.paradas.slice(1, -1).map(p => ({ location: p.direccion, stopover: true })),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      setOptimizing(false);
      if (status === 'OK' && result) {
        const order = result.routes[0].waypoint_order;
        const optimizedMiddle = order.map((idx: number) => form.paradas[idx + 1]);
        const newParadas = [form.paradas[0], ...optimizedMiddle, form.paradas[form.paradas.length - 1]];
        setForm({ ...form, paradas: newParadas });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-ink-50 rounded-xl transition-all"><ArrowLeft/></button>
          <div>
            <h1 className="text-2xl font-black text-ink-900 tracking-tight">{routeId ? `Editar Ruta ${routeId}` : 'Generador de Rutas'}</h1>
            <p className="text-sm text-ink-500 font-medium">{routeId ? 'Gestiona las paradas y el orden de esta ruta maestra' : 'Asigna paradas y visualiza el recorrido A, B, C en tiempo real'}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="text-red-500 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-red-50 transition-all flex items-center gap-2">
             <Trash2 size={16}/> Eliminar
           </button>
           <button onClick={() => router.back()} className="text-ink-400 px-4 py-2.5 rounded-2xl font-bold text-xs hover:text-ink-600 transition-all">Cancelar</button>
           
           <div className="flex gap-2 flex-wrap">
             {routeId && (
               <button 
                 onClick={() => router.push(`/dashboard/monitoreo?routeId=${routeId}`)}
                 className="bg-orange-50 text-orange-600 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-orange-100 transition-all flex items-center gap-2 border border-orange-100"
               >
                 <Navigation size={14} className="animate-pulse"/> Monitoreo en Vivo
               </button>
             )}
             <button className="bg-ink-100 text-ink-600 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-200 transition-all flex items-center gap-2">
               <Save size={14}/> Borrador
             </button>
             <button className="bg-ink-100 text-ink-600 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-200 transition-all flex items-center gap-2">
               <CheckCircle size={14}/> Guardar Cambios
             </button>
             <button className="bg-ink-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-800 transition-all flex items-center gap-2 shadow-lg">
               <Box size={14}/> Publicar Ruta
             </button>
             <button className="bg-[#F97316] text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-[#F97316]/20 hover:scale-[1.02] transition-all flex items-center gap-2">
               <Clock size={14}/> Programar
             </button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Columna 1: Configuración */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
          <div className="bg-white rounded-[32px] p-5 border border-ink-100 shadow-sm space-y-4">
             <h3 className="text-[10px] font-black text-ink-400 uppercase tracking-widest flex items-center gap-2">
               <User size={14}/> Datos Principales
             </h3>
             <div className="space-y-2">
                <select 
                  className="w-full bg-ink-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all appearance-none"
                  value={form.driver}
                  onChange={e => setForm({...form, driver: e.target.value})}
                >
                  <option value="">Seleccionar Driver para esta Ruta</option>
                  {MOCK.DRIVERS.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                </select>
             </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 border border-ink-100 shadow-sm space-y-4">
             <h3 className="text-[10px] font-black text-ink-400 uppercase tracking-widest flex items-center gap-2">
               <MapPin size={14}/> Agregar Parada
             </h3>
             <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setNewStop({...newStop, tipo: 'recoleccion'})} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider ${newStop.tipo === 'recoleccion' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-ink-50 text-ink-400'}`}>Recolección</button>
                  <button onClick={() => setNewStop({...newStop, tipo: 'entrega'})} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider ${newStop.tipo === 'entrega' ? 'bg-[#1A8FBF] text-white shadow-lg shadow-blue-500/20' : 'bg-ink-50 text-ink-400'}`}>Entrega</button>
                </div>
                
                <select 
                  className="w-full bg-ink-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all appearance-none"
                  value={newStop.cliente}
                  onChange={e => setNewStop({...newStop, cliente: e.target.value})}
                >
                  <option value="">Seleccionar Cliente para esta parada</option>
                  {MOCK.CLIENTES.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>

                {isLoaded && (
                  <Autocomplete 
                    onLoad={a => (window as any).genAuto = a}
                    onPlaceChanged={() => {
                      const p = (window as any).genAuto.getPlace();
                      if(p.formatted_address) setNewStop({...newStop, direccion: p.formatted_address});
                    }}
                    options={{ componentRestrictions: { country: 'mx' } }}
                  >
                    <input 
                      value={newStop.direccion}
                      onChange={e => setNewStop({...newStop, direccion: e.target.value})}
                      placeholder="Dirección de la parada..." 
                      className="w-full bg-ink-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20" 
                    />
                  </Autocomplete>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input value={newStop.contacto} onChange={e => setNewStop({...newStop, contacto: e.target.value})} placeholder="Contacto" className="bg-ink-50 border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20" />
                  <input value={newStop.tel} onChange={e => setNewStop({...newStop, tel: e.target.value})} placeholder="Tel" className="bg-ink-50 border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20" />
                </div>
                <button onClick={addStop} className="w-full bg-ink-900 text-white py-3 rounded-xl text-[10px] font-black hover:bg-ink-800 transition-all flex items-center justify-center gap-2">
                   <Plus size={14}/> Agregar a la Ruta
                </button>
             </div>
          </div>
        </div>

        {/* Columna 2: Secuencia (CENTRAL Y GRANDE) */}
        <div className="w-[450px] bg-white rounded-[40px] border border-ink-100 shadow-xl flex flex-col overflow-hidden">
           <div className="p-6 border-b border-ink-50 bg-ink-50/30 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-sm font-black text-ink-900 uppercase tracking-tight">Secuencia de Ruta</h3>
                <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest">{form.paradas.length} Paradas totales</p>
              </div>
              <button 
                onClick={optimizeRoute}
                disabled={form.paradas.length < 3 || optimizing}
                className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {optimizing ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} {optimizing ? 'Optimizando...' : 'Optimizar Ruta'}
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={form.paradas.map((p: any) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {form.paradas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-ink-300 gap-4 opacity-50">
                      <MapIcon size={64} />
                      <p className="text-xs font-black uppercase tracking-widest text-center">Agrega paradas para ver<br/>la secuencia A, B, C...</p>
                    </div>
                  ) : (
                    form.paradas.map((stop: any, idx: number) => (
                      <SortableStop 
                        key={stop.id} 
                        stop={stop} 
                        index={idx} 
                        removeStop={removeStop} 
                      />
                    ))
                  )}
                </SortableContext>
              </DndContext>
           </div>
        </div>

        {/* Columna 3: Mapa */}
        <div className="flex-1 bg-white rounded-[40px] border border-ink-100 shadow-2xl overflow-hidden relative">
           {isLoaded ? (
             <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 19.4326, lng: -99.1332 }}
                zoom={11}
                options={{ disableDefaultUI: true, zoomControl: true }}
             >
                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                {form.paradas.map((stop, idx) => {
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
           ) : <div className="w-full h-full bg-ink-50 animate-pulse flex items-center justify-center text-ink-400 font-black uppercase text-xs">Cargando Mapas...</div>}
        </div>
      </div>
    </div>
  );
}
