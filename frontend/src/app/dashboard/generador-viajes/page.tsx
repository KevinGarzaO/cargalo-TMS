'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { 
  MapPin, Navigation, ArrowLeft, User, Truck, 
  Save, Clock, CheckCircle, AlertTriangle, Search, Info, Play, Trash2, Box
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { MOCK, VIAJES_MOCK } from '@/utils/data';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function GeneradorViajesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('id');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [form, setForm] = useState({ cliente: '', driver: '', origen: '', destino: '' });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const [origenAutocomplete, setOrigenAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinoAutocomplete, setDestinoAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (tripId) {
      const trip = VIAJES_MOCK.find(v => v.id === tripId);
      if (trip) {
        setForm({
          cliente: trip.cliente,
          driver: trip.driver || '',
          origen: trip.origen,
          destino: trip.destino
        });
      }
    }
  }, [tripId]);

  useEffect(() => {
    if (isLoaded && form.origen && form.destino) {
      calculateRoute(form.origen, form.destino);
    }
  }, [isLoaded, form.origen, form.destino]);

  const calculateRoute = (originAddr?: string, destAddr?: string) => {
    const o = originAddr || form.origen;
    const d = destAddr || form.destino;
    if (!o || !d || !window.google) return;
    
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin: o,
      destination: d,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result) {
        setDirections(result);
        setDistance(result.routes[0].legs[0].distance?.text || '');
        setDuration(result.routes[0].legs[0].duration?.text || '');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-ink-50 rounded-xl transition-all"><ArrowLeft/></button>
          <div>
            <h1 className="text-2xl font-black text-ink-900 tracking-tight">{tripId ? `Editar Viaje ${tripId}` : 'Generador de Viajes (1 a 1)'}</h1>
            <p className="text-sm text-ink-500 font-medium">{tripId ? 'Modifica los detalles del envío seleccionado' : 'Configura un envío punto a punto de forma rápida'}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="text-red-500 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-red-50 transition-all flex items-center gap-2">
             <Trash2 size={16}/> Eliminar
           </button>
           <button onClick={() => router.back()} className="text-ink-400 px-4 py-2.5 rounded-2xl font-bold text-xs hover:text-ink-600 transition-all">Cancelar</button>
           
           <div className="flex gap-2 flex-wrap">
             <button className="bg-ink-100 text-ink-600 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-200 transition-all flex items-center gap-2">
               <Save size={14}/> Borrador
             </button>
             <button className="bg-ink-100 text-ink-600 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-200 transition-all flex items-center gap-2">
               <CheckCircle size={14}/> Guardar Cambios
             </button>
             <button className="bg-ink-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase hover:bg-ink-800 transition-all flex items-center gap-2 shadow-lg">
               <Box size={14}/> Publicar
             </button>
             <button className="bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
               <Clock size={14}/> Programar Viaje
             </button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Panel Izquierdo */}
        <div className="w-[400px] space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="bg-white rounded-[32px] p-6 border border-ink-100 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14}/> Detalles del Viaje
            </h3>
            
            <div>
              <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wide mb-2">Cliente</label>
              <select value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} className="w-full bg-ink-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Selecciona cliente...</option>
                {MOCK.CLIENTES.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wide mb-2">Conductor</label>
              <select value={form.driver} onChange={e => setForm({...form, driver: e.target.value})} className="w-full bg-ink-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Sin asignar</option>
                {MOCK.DRIVERS.filter(d => d.estado === 'active').map(d => <option key={d.id} value={d.nombre}>{d.nombre} ({d.vehiculo})</option>)}
              </select>
            </div>

            {isLoaded ? (
              <>
                <div>
                  <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wide mb-2">Origen</label>
                  <Autocomplete 
                    onLoad={setOrigenAutocomplete}
                    onPlaceChanged={() => {
                      if (origenAutocomplete) {
                        const place = origenAutocomplete.getPlace();
                        const addr = place.formatted_address || place.name || '';
                        setForm(f => ({...f, origen: addr}));
                        calculateRoute(addr, form.destino);
                      }
                    }}
                    options={{ componentRestrictions: { country: 'mx' } }}
                  >
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"/>
                      <input 
                        value={form.origen} 
                        onChange={e => setForm({...form, origen: e.target.value})} 
                        onBlur={() => calculateRoute()}
                        placeholder="Dirección de origen..."
                        className="w-full bg-ink-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </Autocomplete>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wide mb-2">Destino</label>
                  <Autocomplete 
                    onLoad={setDestinoAutocomplete}
                    onPlaceChanged={() => {
                      if (destinoAutocomplete) {
                        const place = destinoAutocomplete.getPlace();
                        const addr = place.formatted_address || place.name || '';
                        setForm(f => ({...f, destino: addr}));
                        calculateRoute(form.origen, addr);
                      }
                    }}
                    options={{ componentRestrictions: { country: 'mx' } }}
                  >
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"/>
                      <input 
                        value={form.destino} 
                        onChange={e => setForm({...form, destino: e.target.value})} 
                        onBlur={() => calculateRoute()}
                        placeholder="Dirección de destino..."
                        className="w-full bg-ink-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </Autocomplete>
                </div>
              </>
            ) : <div className="animate-pulse h-12 bg-ink-50 rounded-xl"></div>}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink-50">
               <div>
                  <p className="text-[9px] font-black text-ink-400 uppercase tracking-widest mb-1">Distancia</p>
                  <p className="text-sm font-black text-ink-900">{distance || '-- km'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-ink-400 uppercase tracking-widest mb-1">Tiempo</p>
                  <p className="text-sm font-black text-ink-900">{duration || '-- min'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Mapa */}
        <div className="flex-1 bg-white rounded-[40px] border border-ink-100 shadow-xl overflow-hidden">
           {isLoaded ? (
             <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 19.4326, lng: -99.1332 }}
                zoom={11}
                options={{ disableDefaultUI: true, zoomControl: true }}
             >
                {directions && <DirectionsRenderer directions={directions} />}
             </GoogleMap>
           ) : <div className="w-full h-full bg-ink-50 animate-pulse flex items-center justify-center text-ink-400 font-black uppercase text-xs tracking-widest">Cargando Mapa...</div>}
        </div>
      </div>
    </div>
  );
}

export default function GeneradorViajes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <GeneradorViajesContent />
    </Suspense>
  );
}
