'use client';

import React, { useState, useMemo } from 'react';
import { Download, Plus, Search, Filter, Eye, Edit, MoreHorizontal, MapPin, Phone, User, Clock, Info, ExternalLink } from 'lucide-react';
import { MOCK } from '@/utils/data';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function StatusPill({ s }: { s: string }) {
  const isInactive = s.toLowerCase() === 'inactivo';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${isInactive ? 'text-red-600 bg-red-50' : 'text-[#2C8B6E] bg-[#E6F4EE]'}`}>
      {s}
    </span>
  );
}

interface PointFormData {
  id?: string;
  nombre: string;
  direccion: string;
  gps: string;
  contacto: string;
  tel: string;
  client_id: string;
  reception_days: number[];
  reception_from: string;
  reception_to: string;
  service_time_min: number;
  acceso: string;
  status: string;
}

function PointEditor({ initialData, onClose, onSave }: { initialData?: any, onClose: () => void, onSave: (p: any) => void }) {
  const isEdit = !!initialData?.id;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [formData, setFormData] = useState<PointFormData>(initialData || {
    nombre: '', direccion: '', gps: '', contacto: '', tel: '', 
    client_id: '', reception_days: [1,2,3,4,5], reception_from: '08:00', reception_to: '18:00', 
    service_time_min: 30, acceso: '', status: 'active'
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [zoom, setZoom] = useState(15);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({ ...formData, [name]: type === 'number' ? parseInt(value) : value });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const addr = place.formatted_address || place.name || '';
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        setFormData(prev => ({
          ...prev,
          direccion: addr,
          gps: coords
        }));
        setZoom(18);
      }
    }
  };

  const toggleDay = (day: number) => {
    const days = formData.reception_days.includes(day)
      ? formData.reception_days.filter((d: number) => d !== day)
      : [...formData.reception_days, day].sort();
    setFormData({ ...formData, reception_days: days });
  };

  const daysLabels = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
  const [lat, lng] = formData.gps ? formData.gps.split(',').map((c:string) => parseFloat(c.trim())) : [19.4326, -99.1332];

  return (
    <div className="val-shell">
      <div className="val-progress-row">
        <div className="val-progress-title">{isEdit ? 'Editar Punto de Entrega' : 'Crear Nuevo Punto'}</div>
        <div className="val-progress-count">Paso 1 de 1</div>
      </div>
      <div className="val-progress-row-bar">
        <div className="val-progress-bar">
          <div className="val-progress-fill" style={{ width: '100%' }}>
            <div className="val-progress-knob"><MapPin size={11} /></div>
          </div>
        </div>
      </div>

      <div className="val-grid">
        <div className="val-form">
          <div className="val-step-card">
            <div className="val-step-title">1. Información del Punto de Entrega</div>
            
            <div className="val-q">
              <div className="val-field">
                <label className="val-field-label">Cliente Asociado*</label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} className="val-select">
                  <option value="">Seleccionar cliente...</option>
                  {MOCK.CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="val-q mt-6">
              <div className="val-field">
                <label className="val-field-label">Nombre del Punto*</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} className="val-select" placeholder="Ej. Centro de Distribución Norte" />
              </div>
            </div>

            <div className="val-q mt-6">
              <div className="val-field">
                <label className="val-field-label" style={{ zIndex: 10 }}>Dirección Completa (Google Maps)*</label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                    options={{ componentRestrictions: { country: 'mx' } }}
                  >
                    <div className="relative group">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10" />
                      <input 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleChange} 
                        className="val-select pl-10 focus:ring-2 focus:ring-primary/5" 
                        placeholder="Busca una ubicación en México..." 
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="relative">
                    <input className="val-select opacity-50" placeholder="Cargando buscador..." disabled />
                  </div>
                )}
              </div>
            </div>

            <div className="val-q mt-6 flex gap-4">
              <div className="val-field flex-1">
                <label className="val-field-label">Coordenadas GPS*</label>
                <input name="gps" value={formData.gps} onChange={handleChange} className="val-select font-mono text-[11px]" placeholder="Se llenará automáticamente..." />
              </div>
              <div className="val-field flex-1">
                <label className="val-field-label">Tiempo de Servicio (min)*</label>
                <input type="number" name="service_time_min" value={formData.service_time_min} onChange={handleChange} className="val-select" placeholder="30" />
              </div>
            </div>

            <div className="val-q mt-6">
              <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wide mb-3 block">Días de Recepción*</label>
              <div className="flex gap-2">
                {[1,2,3,4,5,6,7].map(d => (
                  <button 
                    key={d} 
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${formData.reception_days.includes(d) ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' : 'bg-white border-ink-200 text-ink-400 hover:border-primary/50'}`}
                  >
                    {daysLabels[d-1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="val-q mt-6 flex gap-4">
              <div className="val-field flex-1">
                <label className="val-field-label">Desde*</label>
                <input type="time" name="reception_from" value={formData.reception_from} onChange={handleChange} className="val-select" />
              </div>
              <div className="val-field flex-1">
                <label className="val-field-label">Hasta*</label>
                <input type="time" name="reception_to" value={formData.reception_to} onChange={handleChange} className="val-select" />
              </div>
            </div>

            <div className="val-q mt-6 flex gap-4">
              <div className="val-field flex-1">
                <label className="val-field-label">Contacto (Nombre)*</label>
                <input name="contacto" value={formData.contacto} onChange={handleChange} className="val-select" placeholder="Persona que recibe" />
              </div>
              <div className="val-field flex-1">
                <label className="val-field-label">Teléfono de Contacto*</label>
                <input name="tel" value={formData.tel} onChange={handleChange} className="val-select" placeholder="+52..." />
              </div>
            </div>

            <div className="val-q mt-6">
              <div className="val-field">
                <label className="val-field-label">Instrucciones de Acceso</label>
                <textarea name="acceso" value={formData.acceso} onChange={handleChange} className="val-select min-h-[80px] py-3" placeholder="Ej. Entrar por puerta 4, caseta de vigilancia..." />
              </div>
            </div>

            <div className="val-actions mt-8">
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-solid" onClick={() => onSave(formData)}>Guardar Punto de Entrega</button>
            </div>
          </div>
        </div>

        <div className="val-doc val-doc-sticky h-full flex flex-col">
           <div className="val-doc-tabs">
             <button className="val-doc-tab active">Ubicación en Tiempo Real</button>
           </div>
           <div className="val-doc-viewer flex-1" style={{ minHeight: '600px', background: '#f0f4f7', overflow: 'hidden' }}>
             {isLoaded ? (
               <GoogleMap
                 mapContainerStyle={{ width: '100%', height: '100%' }}
                 center={!isNaN(lat) && !isNaN(lng) ? { lat, lng } : { lat: 19.4326, lng: -99.1332 }}
                 zoom={zoom}
                 onZoomChanged={() => {}} // Placeholder to avoid uncontrolled behavior if needed
                 options={{ disableDefaultUI: true, zoomControl: true }}
               >
                 {!isNaN(lat) && !isNaN(lng) && <Marker position={{ lat, lng }} />}
               </GoogleMap>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-ink-100">
                  <MapPin className="text-ink-300 animate-bounce" size={32} />
                  <div className="text-[11px] text-ink-400 font-bold uppercase tracking-widest mt-4">Cargando Mapa...</div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

function PointDetail({ point, isCreate = false, onClose, onSave }: { point?: any, isCreate?: boolean, onClose: () => void, onSave?: (p: any) => void }) {
  const pData = point || { nombre: 'Nuevo Punto', direccion: 'Sin dirección', gps: '', contacto: '', reception_from: '08:00', reception_to: '18:00', reception_days: [1,2,3,4,5], service_time_min: 30 };
  const isEdit = isCreate || (point && onSave !== undefined);
  const client = MOCK.CLIENTES.find(c => c.id === pData.client_id);
  const daysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [lat, lng] = pData.gps ? pData.gps.split(',').map((c:string) => parseFloat(c.trim())) : [NaN, NaN];

  return (
    <div className="detail-shell">
      <div className="detail-map">
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-avatar">
          <div className="avatar-img flex items-center justify-center bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] text-white font-extrabold text-3xl">
            <MapPin size={40} />
          </div>
        </div>
        <div className="detail-meta flex justify-between items-start w-full pr-4">
          <div>
            <h1>{pData.nombre}</h1>
            <div className="detail-tags">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${pData.status === 'inactive' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                {pData.status === 'inactive' ? 'Inactivo' : 'Activo'}
              </span>
              <span className="gender">{client?.nombre || 'Sin cliente'}</span>
              <span className="gender">{pData.id || 'Nuevo'}</span>
            </div>
            <div className="detail-contact">
              <div className="item"><MapPin size={15} className="ico"/><div className="label-stack">{pData.direccion}</div></div>
              <div className="item"><User size={15} className="ico"/><div className="label-stack">{pData.contacto}</div></div>
            </div>
          </div>
        </div>
      </div>

      {isEdit ? (
        <PointEditor initialData={point} onClose={onClose} onSave={onSave!} />
      ) : (
        <div className="detail-cards">
          <div className="dcard h-full">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Información Operativa</div>
            <div className="dcard-body">
              <div className="kv-list">
                <div className="row"><span className="k">Cliente:</span><span className="v font-bold text-primary">{client?.nombre || 'N/A'}</span></div>
                <div className="row"><span className="k">Dirección:</span><span className="v">{pData.direccion}</span></div>
                <div className="row"><span className="k">Coordenadas GPS:</span><span className="v font-mono">{pData.gps}</span></div>
                <div className="row"><span className="k">Días de Recepción:</span><span className="v">{pData.reception_days?.map((d:number) => daysLabels[d-1]).join(', ')}</span></div>
                <div className="row"><span className="k">Ventana Horaria:</span><span className="v font-bold">{pData.reception_from} - {pData.reception_to}</span></div>
                <div className="row"><span className="k">Tiempo de Servicio:</span><span className="v font-bold">{pData.service_time_min} min</span></div>
                <div className="row"><span className="k">Contacto:</span><span className="v">{pData.contacto}</span></div>
                <div className="row"><span className="k">Teléfono:</span><span className="v">{pData.tel}</span></div>
              </div>

              {/* Notas para el Conductor Integradas */}
              <div className="mt-6 pt-6 border-t border-ink-100">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <Info size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Notas para el Conductor</div>
                    <div className="text-[13px] text-ink-700 leading-relaxed italic">"{pData.acceso || "Sin instrucciones especiales."}"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dcard h-full">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Ubicación en Tiempo Real</div>
            <div className="dcard-body p-0 h-[500px]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={!isNaN(lat) && !isNaN(lng) ? { lat, lng } : { lat: 19.4326, lng: -99.1332 }}
                  zoom={16}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  {!isNaN(lat) && !isNaN(lng) && <Marker position={{ lat, lng }} />}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-300">Cargando mapa...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PuntosEntrega() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get('id');
  const actionParam = searchParams.get('action');

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);

  React.useEffect(() => {
    setData([...MOCK.PUNTOS_ENTREGA]);
  }, []);

  const selected = useMemo(() => idParam ? data.find((p: any) => p.id === idParam) : null, [idParam, data]);

  const filtered = useMemo(() => {
    return data.filter((p: any) => 
      !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.direccion.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, data]);

  const perPage = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = (p: any) => {
    let newId = p.id;
    if (p.id) {
      setData(data.map(item => item.id === p.id ? p : item));
    } else {
      newId = `P-${Math.floor(100 + Math.random() * 900)}`;
      setData([...data, { ...p, id: newId }]);
    }
    router.push(`?id=${newId}&action=view`);
  };

  const handleClose = () => router.push('/dashboard/puntos-entrega');

  if (actionParam === 'create') return <PointDetail isCreate={true} onClose={handleClose} onSave={handleSave} />;
  if (selected) {
    if (actionParam === 'edit') return <PointDetail point={selected} onClose={handleClose} onSave={handleSave} />;
    return <PointDetail point={selected} onClose={handleClose} />;
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Puntos de Entrega</h1>
          <p className="text-sm text-[#5C7480] font-medium">{data.length} ubicaciones registradas para rutas</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost"><Download size={14}/>Exportar</button>
          <button className="btn btn-solid" onClick={() => router.push('?action=create')}>
            <Plus size={14}/>Nuevo punto
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-4 flex-wrap bg-white">
          <div className="flex-1 max-w-sm bg-ink-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-ink-200 focus-within:bg-white transition-all">
            <Search size={14} className="text-ink-400"/>
            <input 
              placeholder="Buscar por nombre o dirección…" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-ink-900"
              value={q} 
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex-1" />
          <button className="w-9 h-9 rounded-xl border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-ink-50 transition-all"><Filter size={14}/></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Punto de Entrega</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Ventana</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Días</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-center">Srv. Time</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {slice.map((p: any) => {
                const client = MOCK.CLIENTES.find(c => c.id === p.client_id);
                return (
                  <tr key={p.id} onClick={() => router.push(`?id=${p.id}&action=view`)} className="hover:bg-ink-50/50 cursor-pointer group transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] flex items-center justify-center shadow-sm shrink-0 text-white">
                          <MapPin size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-ink-900 group-hover:text-primary transition-colors truncate">{p.nombre}</div>
                          <div className="text-[11px] text-ink-400 font-medium truncate">{p.direccion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[13px] font-semibold text-ink-900">{client?.nombre || p.cliente || 'Consumidor Final'}</div>
                      <div className="text-[11px] text-ink-500 font-medium flex items-center gap-1.5">
                        {p.contacto} <span className="text-ink-300">•</span> <span className="text-primary font-bold">{p.tel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
                        <Clock size={13} className="text-primary" /> 
                        {p.reception_from ? `${p.reception_from} - ${p.reception_to}` : p.ventana || 'No definido'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5,6,7].map(d => {
                          const active = p.reception_days?.includes(d);
                          const labels = ['L','M','M','J','V','S','D'];
                          return (
                            <span key={d} className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-ink-50 text-ink-300 border border-transparent'}`}>
                              {labels[d-1]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[12px] font-bold text-ink-600 bg-ink-100 px-2 py-1 rounded-md">
                        {p.service_time_min !== undefined ? `${p.service_time_min}m` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-4"><StatusPill s={p.status === 'active' ? 'Activo' : 'Inactivo'}/></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${p.id}&action=view`); }} title="Ver Detalle"><Eye size={14}/></button>
                        <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${p.id}&action=edit`); }} title="Editar"><Edit size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-ink-100 flex items-center justify-between bg-ink-50/30">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-widest">Mostrando {slice.length} de {filtered.length} puntos</div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-white disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs shadow-md">1</button>
            <button className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-white disabled:opacity-30" disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button>
          </div>
        </div>
      </div>
    </>
  );
}
