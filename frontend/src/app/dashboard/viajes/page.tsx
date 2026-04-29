'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Plus, Search, Filter, MapPin, Truck, Box, Navigation, X, AlertTriangle, CheckCircle, Clock, Image as ImageIcon, FileCheck, Calendar, Copy, MoreHorizontal, Play } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { MOCK } from '@/utils/data';
import { RUTAS_MOCK } from '@/utils/rutas';
import DocumentModal from '@/components/DocumentModal';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';

// Dummy Trips Data
const VIAJES_MOCK = [
  { id: 'V-001', cliente: 'Mercado El Sol', driver: 'Esteban Carrillo', origen: 'Av. Insurgentes Sur 123, CDMX', destino: 'Calle Zaragoza 45, Monterrey', estado: 'En tránsito', fecha: '2024-05-20T10:00:00Z' },
  { id: 'V-002', cliente: 'Boutique Camelia', driver: 'María Olivares', origen: 'Parque Industrial 2, Guadalajara', destino: 'Av. Revolución 90, CDMX', estado: 'Programado', fecha: '2024-05-21T08:00:00Z' },
  { 
    id: 'V-003', 
    cliente: 'TecnoStock', 
    driver: 'Jorge Ibáñez', 
    origen: 'Cedis Tepotzotlán, Edomex', 
    destino: 'Plaza del Sol, Querétaro', 
    estado: 'Entregado', 
    fecha: '2024-05-18T14:30:00Z',
    evidencias: {
      foto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop',
      firma: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_of_John_Hancock.png',
      llegadaReal: '17:45 PM',
      estimada: '18:00 PM'
    }
  },
  { 
    id: 'V-004', 
    cliente: 'Florería Anaí', 
    driver: 'Laura Mendoza', 
    origen: 'Bodega Central, Puebla', 
    destino: 'Sucursal Sur, Veracruz', 
    estado: 'Incidente', 
    fecha: '2024-05-19T11:00:00Z',
    incidente: {
      tipo: 'Falla Mecánica',
      descripcion: 'La unidad presenta un sobrecalentamiento en el motor a la altura de la caseta de cobro. Se requiere apoyo de grúa y transbordo de mercancía.',
      foto: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop',
      hora: '12:45 PM',
      gravedad: 'Alta'
    }
  },
];

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function StatusBadge({ status }: { status: string }) {
  if (status === 'Programado') return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><Clock size={12}/> Programado</span>;
  if (status === 'En tránsito') return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><Navigation size={12}/> En tránsito</span>;
  if (status === 'Entregado') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Entregado</span>;
  return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><AlertTriangle size={12}/> Incidente</span>;
}

function TripModal({ onClose, onSave, tripToEdit }: any) {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [form, setForm] = useState(tripToEdit || { cliente: '', driver: '', origen: '', destino: '' });
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const [origenAutocomplete, setOrigenAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinoAutocomplete, setDestinoAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

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
      if (status === google.maps.DirectionsStatus.OK && result) {
        setDirections(result);
        setDistance(result.routes[0].legs[0].distance?.text || '');
        setDuration(result.routes[0].legs[0].duration?.text || '');
      }
    });
  };

  // Only calculate on mount if editing
  useEffect(() => {
    if (isLoaded && tripToEdit) {
      calculateRoute();
    }
  }, [isLoaded]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        
        {/* Sidebar Form */}
        <div className="w-full md:w-[400px] flex flex-col border-r border-ink-100 bg-white z-10 h-full overflow-y-auto">
          <div className="bg-ink-50 px-6 py-4 border-b border-ink-100 flex items-center justify-between sticky top-0 z-20">
            <h2 className="text-lg font-bold text-ink-900">{tripToEdit ? 'Editar Viaje' : 'Nuevo Viaje'}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-900"><X size={20}/></button>
          </div>
          
          <div className="p-6 flex flex-col gap-5 flex-1">
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">1. Cliente</label>
              <select value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} className="w-full border border-ink-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary bg-white">
                <option value="">Selecciona cliente...</option>
                {MOCK.CLIENTES.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">2. Conductor y Vehículo (Opcional)</label>
              <select value={form.driver} onChange={e => setForm({...form, driver: e.target.value})} className="w-full border border-ink-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary bg-white">
                <option value="">Sin asignar</option>
                {MOCK.DRIVERS.filter(d => d.estado === 'active').map(d => <option key={d.id} value={d.nombre}>{d.nombre} ({d.vehiculo})</option>)}
              </select>
            </div>

            {isLoaded ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">3. Punto de Origen</label>
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
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                      <input 
                        value={form.origen} 
                        onChange={e => setForm({...form, origen: e.target.value})} 
                        onBlur={() => calculateRoute()}
                        placeholder="Buscar dirección de origen..."
                        className="w-full border border-ink-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary placeholder:text-ink-300"
                      />
                    </div>
                  </Autocomplete>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">4. Punto de Destino</label>
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
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                      <input 
                        value={form.destino} 
                        onChange={e => setForm({...form, destino: e.target.value})} 
                        onBlur={() => calculateRoute()}
                        placeholder="Buscar dirección de destino..."
                        className="w-full border border-ink-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary placeholder:text-ink-300"
                      />
                    </div>
                  </Autocomplete>
                </div>
              </>
            ) : <div className="text-sm text-ink-500 animate-pulse">Cargando mapas...</div>}

            <div className="bg-ink-50 p-4 rounded-xl border border-ink-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-1">Distancia estimada</div>
                <div className="font-bold text-ink-900">{distance || '--'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-1">Duración viaje</div>
                <div className="font-bold text-ink-900">{duration || '--'}</div>
              </div>
            </div>

            {tripToEdit?.estado === 'En tránsito' && (
              <button 
                onClick={() => {
                  const driver = MOCK.DRIVERS.find(d => d.nombre === tripToEdit.driver);
                  if (driver) {
                    // We map our D-204 style IDs to the D1, D2 style used in Monitoreo mock for now
                    const idMap: any = { 'Esteban Carrillo': 'D1', 'María Olivares': 'D2', 'Jorge Ibáñez': 'D3' };
                    const monitorId = idMap[driver.nombre] || 'D1';
                    router.push(`/dashboard/monitoreo?driverId=${monitorId}`);
                  }
                }}
                className="w-full bg-orange-50 border border-orange-200 text-orange-700 py-3 rounded-xl text-xs font-black hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
              >
                <Navigation size={14} className="animate-pulse"/> Ver en tiempo real (Mapa en vivo)
              </button>
            )}

            {tripToEdit?.estado === 'Entregado' && (
              <div className="mt-2 pt-5 border-t border-ink-100 animate-in fade-in duration-500">
                <h3 className="text-sm font-black text-ink-900 mb-4 flex items-center gap-2">
                  <FileCheck size={18} className="text-green-600"/> Evidencias de Entrega
                </h3>
                
                <div className="space-y-4">
                  {/* Foto de Entrega */}
                  <div>
                    <label className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 block">Foto del paquete en destino</label>
                    <div 
                      onClick={() => setExpandedImage(tripToEdit.evidencias?.foto)}
                      className="aspect-video w-full rounded-xl bg-ink-100 overflow-hidden border border-ink-200 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group relative"
                    >
                      <img src={tripToEdit.evidencias?.foto} className="w-full h-full object-cover" alt="Evidencia" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-primary text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">AMPLIAR EVIDENCIA</span>
                      </div>
                    </div>
                  </div>

                  {/* Firma y Tiempos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ink-50 p-3 rounded-xl border border-ink-100">
                      <label className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1 block">Firma Receptor</label>
                      <div className="bg-white h-16 rounded-lg flex items-center justify-center p-2 border border-ink-100">
                        <img src={tripToEdit.evidencias?.firma} className="h-full object-contain mix-blend-multiply opacity-80" alt="Firma" />
                      </div>
                    </div>
                    <div className="bg-ink-50 p-3 rounded-xl border border-ink-100 flex flex-col justify-center">
                      <label className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1 block">Hora de llegada</label>
                      <div className="text-sm font-black text-ink-900">{tripToEdit.evidencias?.llegadaReal}</div>
                      <div className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                        <CheckCircle size={10}/> A tiempo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tripToEdit?.estado === 'Incidente' && (
              <div className="mt-2 pt-5 border-t border-red-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-black text-red-700 mb-1 flex items-center gap-2">
                    <AlertTriangle size={18}/> Reporte de Incidente
                  </h3>
                  <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider">Gravedad: {tripToEdit.incidente?.gravedad}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ink-50 p-3 rounded-xl border border-ink-100">
                      <label className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1 block">Tipo</label>
                      <div className="text-sm font-black text-ink-900">{tripToEdit.incidente?.tipo}</div>
                    </div>
                    <div className="bg-ink-50 p-3 rounded-xl border border-ink-100">
                      <label className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1 block">Hora Reportada</label>
                      <div className="text-sm font-black text-ink-900">{tripToEdit.incidente?.hora}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1 block">Descripción del conductor</label>
                    <p className="text-[13px] text-ink-700 leading-relaxed bg-ink-50 p-3 rounded-xl border border-ink-100 italic">
                      "{tripToEdit.incidente?.descripcion}"
                    </p>
                  </div>

                  {tripToEdit.incidente?.foto && (
                    <div>
                      <label className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 block">Evidencia visual</label>
                      <div 
                        onClick={() => setExpandedImage(tripToEdit.incidente.foto)}
                        className="aspect-video w-full rounded-xl bg-ink-100 overflow-hidden border border-ink-200 group relative cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all"
                      >
                        <img src={tripToEdit.incidente.foto} className="w-full h-full object-cover" alt="Incidente" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-xs font-bold px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">Ampliar evidencia</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-black hover:bg-red-50 transition-all">Reportar al seguro</button>
                    <button className="flex-1 bg-ink-900 text-white py-2.5 rounded-xl text-xs font-black hover:bg-ink-800 transition-all">Resolver incidente</button>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-ink-100 flex justify-end gap-3 bg-white mt-auto sticky bottom-0 z-20">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-ink-600 hover:bg-ink-50 text-sm">Cancelar</button>
            <button onClick={() => onSave(form)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 text-sm shadow-md">{tripToEdit ? 'Guardar Cambios' : 'Crear Viaje'}</button>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 h-full bg-[#E8EAED] relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 19.4326, lng: -99.1332 }} // CDMX Default
              zoom={5}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#1A8FBF', strokeWeight: 5 } }}/>}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-ink-500 font-medium">Cargando Google Maps...</div>
          )}
        </div>

        {expandedImage && (
          <DocumentModal 
            url={expandedImage} 
            type="image" 
            title="Evidencia de Viaje" 
            onClose={() => setExpandedImage(null)} 
          />
        )}
      </div>
    </div>
  );
}

function ViajesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viajes, setViajes] = useState(VIAJES_MOCK);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    const fromRouteId = searchParams.get('fromRoute');
    
    if (id) {
      const trip = viajes.find(v => v.id === id);
      if (trip) {
        setSelectedTrip(trip);
        setShowModal(true);
      }
    } else if (fromRouteId) {
      const route = RUTAS_MOCK.find(r => r.id === fromRouteId);
      if (route && route.paradas.length >= 2) {
        setSelectedTrip({
          cliente: '',
          driver: '',
          origen: route.paradas[0].direccion,
          destino: route.paradas[route.paradas.length - 1].direccion,
          estado: 'Programado'
        });
        setShowModal(true);
      }
    }
  }, [searchParams, viajes]);

  const handleDuplicate = (e: React.MouseEvent, v: any) => {
    e.stopPropagation();
    const newTrip = { 
      ...v, 
      id: `V-00${viajes.length + 1}`, 
      fecha: new Date().toISOString(), 
      estado: 'Programado' 
    };
    setViajes([newTrip, ...viajes]);
  };

  const filtered = useMemo(() => {
    return viajes.filter(v => {
      if (filter !== "all" && v.estado !== filter) return false;
      if (q && !(v.id.toLowerCase().includes(q.toLowerCase()) ||
                 v.cliente.toLowerCase().includes(q.toLowerCase()) ||
                 v.driver.toLowerCase().includes(q.toLowerCase()) ||
                 v.origen.toLowerCase().includes(q.toLowerCase()) ||
                 v.destino.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [viajes, q, filter]);

  const handleSave = (form: any) => {
    if (selectedTrip) {
      setViajes(viajes.map(v => v.id === selectedTrip.id ? { ...form, id: v.id, fecha: v.fecha, estado: v.estado } : v));
    } else {
      setViajes([{ ...form, id: `V-00${viajes.length + 1}`, fecha: new Date().toISOString(), estado: 'Programado' }, ...viajes]);
    }
    setShowModal(false);
    setSelectedTrip(null);
  };

  const stats = useMemo(() => ({
    total: viajes.length,
    pendientes: viajes.filter(v => v.estado === 'Programado').length,
    enRuta: viajes.filter(v => v.estado === 'En tránsito').length,
    completados: viajes.filter(v => v.estado === 'Entregado').length,
  }), [viajes]);

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Viajes</h1>
          <p className="text-sm text-[#5C7480] font-medium">Gestión, creación y monitoreo de rutas en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost"><Download size={14}/>Reporte</button>
          <button className="btn btn-solid" onClick={() => router.push('/dashboard/generador-viajes')}><Plus size={14}/>Crear viaje</button>
        </div>
      </div>

      {/* Dashboard del día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center text-ink-600"><Box size={18}/></div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-widest">Total del día</div>
          </div>
          <div className="text-2xl font-black text-ink-900">{stats.total} <span className="text-sm font-bold text-ink-400 ml-1">viajes</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock size={18}/></div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-widest">Pendientes</div>
          </div>
          <div className="text-2xl font-black text-ink-900">{stats.pendientes} <span className="text-sm font-bold text-ink-400 ml-1">por iniciar</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><Navigation size={18}/></div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-widest">En ruta</div>
          </div>
          <div className="text-2xl font-black text-ink-900">{stats.enRuta} <span className="text-sm font-bold text-ink-400 ml-1">activos ahora</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><CheckCircle size={18}/></div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-widest">Completados</div>
          </div>
          <div className="text-2xl font-black text-ink-900">{stats.completados} <span className="text-sm font-bold text-ink-400 ml-1">entregados</span></div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-ink-50 flex items-center justify-between gap-4 flex-wrap bg-white">
          <div className="flex items-center gap-2 p-1 bg-ink-50 rounded-2xl">
            {[
              ['all', 'Todos'],
              ['Programado', 'Pendientes'],
              ['En tránsito', 'En Ruta'],
              ['Entregado', 'Entregados'],
              ['Incidente', 'Incidentes']
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${filter === k ? 'bg-white text-primary shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
              <input 
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por ID, cliente, conductor u origen..." 
                className="w-full bg-ink-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-ink-300 font-medium" 
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th className="px-5 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest w-[120px]">ID Viaje</th>
                <th className="px-5 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Ruta (Origen / Destino)</th>
                <th className="px-5 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Asignación</th>
                <th className="px-5 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-5 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-ink-50/50 cursor-pointer group transition-colors" onClick={() => router.push(`/dashboard/generador-viajes?id=${v.id}`)}>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-bold text-primary">{v.id}</div>
                    <div className="text-[11px] text-ink-400 font-medium">{new Date(v.fecha).toLocaleDateString('es-MX')}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1 w-3 shrink-0">
                        <div className="w-2 h-2 rounded-full border-2 border-ink-300 bg-white"></div>
                        <div className="w-0.5 h-5 bg-ink-200 my-0.5"></div>
                        <MapPin size={12} className="text-primary"/>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-ink-900 truncate mb-1">{v.origen}</div>
                        <div className="text-[13px] font-bold text-ink-900 truncate mt-1.5">{v.destino}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-bold text-ink-900 truncate">{v.cliente}</div>
                    <div className="text-[12px] text-ink-500 flex items-center gap-1.5 mt-1">
                      <Truck size={12}/> {v.driver || <span className="text-orange-500 font-bold italic">Sin asignar</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={v.estado} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => handleDuplicate(e, v)}
                        className="p-2 text-ink-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Copiar Viaje"
                      >
                        <Copy size={18}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/generador-viajes?id=${v.id}`); }}
                        className="bg-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        <Play size={14} fill="currentColor" /> Gestionar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-ink-500">No hay viajes que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <TripModal onClose={() => setShowModal(false)} onSave={handleSave} tripToEdit={selectedTrip} />}
    </>
  );
}

export default function Viajes() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Cargando gestión de viajes...</div>}>
      <ViajesContent />
    </Suspense>
  );
}
