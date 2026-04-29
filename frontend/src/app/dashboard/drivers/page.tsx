'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { Download, Plus, Search, Filter, MapPin, Eye, Edit, MoreHorizontal, Mail, Phone, User, Shield, Calendar, CreditCard, Truck, Star, Briefcase } from 'lucide-react';
import { MOCK } from '@/utils/data';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// --- HELPERS ---
const initials = (name: string) => (name || '').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase();
const fmtMXN = (n: number) => "$" + n.toLocaleString('es-MX');
const fmtDate = (s: string) => new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateLong = (s: string) => new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido", pending: "Pendiente" };
  return <span className={"status " + s}>{map[s] || s}</span>;
}

// --- COMPONENTS ---

function DriverEditor({ initialData, onClose, onSave }: { initialData?: any, onClose: () => void, onSave: (v:any)=>void }) {
  const isEdit = !!initialData?.id;
  const [formData, setFormData] = useState(initialData || {
    nombre: '', email: '', tel: '', ciudad: 'México', zona: '', 
    licencia_numero: '', licencia_vigencia: '', rfc: '', 
    estado: 'active', vehiculo_id: ''
  });

  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = 4;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goNext = () => setActiveStep(prev => Math.min(totalSteps - 1, prev + 1));
  const goPrev = () => setActiveStep(prev => Math.max(0, prev - 1));

  return (
    <div className="detail-shell animate-in fade-in slide-in-from-right-4">
      <div className="detail-map">
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-avatar flex items-center justify-center bg-gradient-to-tr from-primary to-[#4CB89C] text-white font-black text-3xl">
          {formData.nombre ? initials(formData.nombre) : <User size={32} />}
        </div>
        <div className="detail-meta">
          <h1>{isEdit ? 'Editar Conductor' : 'Nuevo Registro de Conductor'}</h1>
          <div className="detail-tags">
            <span className="gender">Configuración de Expediente</span>
          </div>
        </div>
      </div>

      <div className="val-tabs">
        <div className="val-tab active">Formulario de Alta Pro</div>
      </div>

      <div className="val-shell">
        <div className="val-progress-row">
          <div className="val-progress-title">Proceso de Registro Operativo</div>
          <div className="val-progress-count">Paso {activeStep + 1} de {totalSteps}</div>
        </div>
        <div className="val-progress-row-bar">
          <button className="val-arrow" onClick={goPrev} disabled={activeStep === 0}>‹</button>
          <div className="val-progress-bar">
            <div className="val-progress-fill" style={{ width: `${progress}%` }}>
              <div className="val-progress-knob">
                {activeStep === 0 && <User size={11} />}
                {activeStep === 1 && <CreditCard size={11} />}
                {activeStep === 2 && <Truck size={11} />}
                {activeStep === 3 && <Calendar size={11} />}
              </div>
            </div>
          </div>
          <button className="val-arrow" onClick={goNext} disabled={activeStep === totalSteps - 1}>›</button>
        </div>

        <div className="val-grid">
        <div className="val-form">
          <div className="val-form-hint">Completa la información oficial para el expediente del conductor:</div>
          
          {activeStep === 0 && (
            <div className="val-step-card">
              <div className="val-step-title">1. Datos Personales y de Contacto</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Nombre Completo*</label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} className="val-select" placeholder="Ej. Roberto Gómez" />
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Correo Electrónico*</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="val-select" placeholder="conductor@empresa.com" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Teléfono Móvil*</label>
                    <input name="tel" value={formData.tel} onChange={handleChange} className="val-select" placeholder="55 1234 5678" />
                  </div>
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Ciudad Base</label>
                    <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="val-select">
                      <option value="México">Ciudad de México</option>
                      <option value="Monterrey">Monterrey</option>
                      <option value="Guadalajara">Guadalajara</option>
                      <option value="Puebla">Puebla</option>
                    </select>
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Zona / Región</label>
                    <input name="zona" value={formData.zona} onChange={handleChange} className="val-select" placeholder="Ej. Norte / Iztapalapa" />
                  </div>
                </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="btn btn-solid" onClick={goNext}>Continuar a Documentación</button>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="val-step-card">
              <div className="val-step-title">2. Licencia y Documentación Fiscal</div>
              <div className="val-q">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">No. de Licencia de Conducir</label>
                    <input name="licencia_numero" value={formData.licencia_numero} onChange={handleChange} className="val-select" placeholder="AB-12345678" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Vigencia Licencia</label>
                    <input name="licencia_vigencia" type="date" value={formData.licencia_vigencia} onChange={handleChange} className="val-select" />
                  </div>
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="val-field">
                  <label className="val-field-label">RFC (Registro Federal de Contribuyentes)</label>
                  <input name="rfc" value={formData.rfc} onChange={handleChange} className="val-select font-mono uppercase" placeholder="GOMR850101XYZ" />
                </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Configuración de Estado</button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="val-step-card animate-in fade-in slide-in-from-bottom-2">
              <div className="val-step-title">3. Estado Operativo y Asignación</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Estado Inicial</label>
                  <select name="estado" value={formData.estado} onChange={handleChange} className="val-select">
                    <option value="active">Activo (Listo para viajar)</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="val-field">
                  <label className="val-field-label">Vehículo Asignado (Opcional)</label>
                  <select name="vehiculo_id" value={formData.vehiculo_id} onChange={handleChange} className="val-select">
                    <option value="">Sin vehículo asignado</option>
                    {MOCK.VEHICULOS.map(v => (
                      <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Configurar Horarios</button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="val-step-card animate-in fade-in slide-in-from-bottom-2">
              <div className="val-step-title">4. Horarios de Disponibilidad (driver_schedules)</div>
              <div className="val-q">
                 <div className="val-form-hint mb-4">Define los días y horas en los que el conductor estará disponible para recibir viajes:</div>
                 <div className="space-y-3">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                      <div key={day} className="flex items-center justify-between p-3 bg-white border border-ink-100 rounded-xl">
                        <div className="flex items-center gap-3">
                           <input type="checkbox" defaultChecked={!['Sábado', 'Domingo'].includes(day)} className="w-4 h-4 rounded border-ink-300 text-primary focus:ring-primary" />
                           <span className="text-sm font-bold text-ink-900">{day}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="time" defaultValue="08:00" className="text-xs bg-ink-50 border-none rounded px-2 py-1 outline-none font-bold text-primary" />
                           <span className="text-[10px] text-ink-400 font-bold uppercase">a</span>
                           <input type="time" defaultValue="18:00" className="text-xs bg-ink-50 border-none rounded px-2 py-1 outline-none font-bold text-primary" />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={() => onSave(formData)}>
                  {isEdit ? 'Guardar Cambios' : 'Registrar Conductor'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="val-doc hidden lg:block">
          <div className="val-doc-tabs">
            {['Licencia Frontal', 'Licencia Trasera', 'INE Frontal', 'INE Trasera', 'Contrato'].map((t, i) => (
              <button key={t} className={`val-doc-tab ${i === 0 ? 'active' : ''}`}>{t}</button>
            ))}
          </div>
          <div className="val-doc-viewer" style={{ minHeight: '340px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <Plus size={24} className="text-primary mb-4" />
             <h3 className="text-sm font-bold">Subir Documento</h3>
             <p className="text-xs text-ink-500 text-center px-8">Selecciona el archivo para el expediente oficial</p>
             <button className="btn btn-solid mt-4 border border-ink-200">Seleccionar archivo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

function DriverDetail({ driver, onClose }: { driver: any, onClose: () => void }) {
  const [tab, setTab] = useState('summary');
  const dData = driver;

  return (
    <div className="detail-shell animate-in fade-in slide-in-from-right-4">
      <div className="detail-map">
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-avatar">
          <div className="avatar-img flex items-center justify-center bg-gradient-to-tr from-primary to-[#4CB89C] text-white font-black text-3xl">
            {initials(dData.nombre)}
          </div>
        </div>
        <div className="detail-meta">
          <h1>{dData.nombre}</h1>
          <div className="detail-tags">
            <StatusPill s={dData.estado} />
            <span className="gender">Driver · {dData.id}</span>
          </div>
          <div className="detail-contact">
            <div className="item"><Mail size={15} className="ico" /><div className="label-stack">{dData.email}</div></div>
            <div className="item"><Phone size={15} className="ico" /><div className="label-stack">{dData.tel}</div></div>
            <div className="item"><MapPin size={15} className="ico" /><div className="label-stack">{dData.zona}, {dData.ciudad}</div></div>
          </div>
        </div>
      </div>

      <div className="val-tabs">
        <div className={`val-tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>Expediente General</div>
      </div>

      {tab === 'summary' && (
        <div className="detail-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="dcard h-fit">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Información Operativa</div>
            <div className="dcard-body">
              <div className="kv-list">
                <div className="row"><span className="k">Desde:</span><span className="v font-bold text-ink-900">{fmtDateLong(dData.desde)}</span></div>
                <div className="row"><span className="k">Ciudad Base:</span><span className="v text-ink-900">{dData.ciudad}</span></div>
                <div className="row"><span className="k">Zona asignada:</span><span className="v text-ink-900">{dData.zona}</span></div>
                <div className="row"><span className="k">Rating promedio:</span><span className="v text-amber-500 font-bold">★ {dData.rating || 5.0}</span></div>
              </div>
            </div>
          </div>

          <div className="dcard h-fit">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Licencia y Fiscal</div>
            <div className="dcard-body">
              <div className="kv-list">
                <div className="row"><span className="k">RFC:</span><span className="v font-mono text-ink-900 uppercase">{dData.rfc || 'MALM890424L98'}</span></div>
                <div className="row"><span className="k">No. Licencia:</span><span className="v font-mono text-ink-900 uppercase">{dData.licencia_numero || 'ABC-4412-MX'}</span></div>
                <div className="row"><span className="k">Vigencia:</span><span className="v text-ink-900">{dData.licencia_vigencia || 'Expirado 2026'}</span></div>
              </div>
            </div>
          </div>

          <div className="dcard h-fit">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Horarios de Disponibilidad (driver_schedules)</div>
            <div className="dcard-body">
              <div className="space-y-2">
                 {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => (
                   <div key={day} className="flex items-center justify-between p-2 bg-ink-50 rounded-lg">
                      <span className="text-xs font-black text-ink-900 uppercase tracking-tighter">{day}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[11px] font-bold text-primary">08:00 AM</span>
                         <span className="text-[10px] text-ink-400">a</span>
                         <span className="text-[11px] font-bold text-primary">06:00 PM</span>
                      </div>
                   </div>
                 ))}
                 {['Sáb', 'Dom'].map(day => (
                   <div key={day} className="flex items-center justify-between p-2 bg-ink-50/50 rounded-lg opacity-50">
                      <span className="text-xs font-black text-ink-400 uppercase tracking-tighter">{day}</span>
                      <span className="text-[10px] font-bold text-ink-400">No disponible</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="dcard h-fit">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Resumen de Actividad Histórica</div>
            <div className="dcard-body">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="text-[20px] font-black text-primary">{dData.envios?.toLocaleString() || '0'}</div>
                    <div className="text-[9px] font-black text-ink-400 uppercase tracking-widest">Envíos Totales</div>
                 </div>
                 <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-[20px] font-black text-green-600">{fmtMXN(dData.gasto || 0)}</div>
                    <div className="text-[9px] font-black text-ink-400 uppercase tracking-widest">Pagos Totales</div>
                 </div>
                 <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 col-span-2">
                    <div className="text-[20px] font-black text-amber-600">{dData.entregas_hoy || '0'}</div>
                    <div className="text-[9px] font-black text-ink-400 uppercase tracking-widest">Entregas de Hoy</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN PAGE ---


const DriversContent = dynamic(() => Promise.resolve(DriversContentInternal), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Cargando Conductores...</div>
});

export default function Drivers() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Iniciando...</div>}>
      <DriversContent />
    </Suspense>
  );
}

function DriversContentInternal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const actionParam = searchParams.get('action');

  const [drivers, setDrivers] = useState(MOCK.DRIVERS);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const selected = useMemo(() => drivers.find(d => d.id === idParam), [idParam, drivers]);

  const handleClose = () => router.push('/dashboard/drivers');

  const handleSaveForm = (data: any) => {
    if (data.id) {
      setDrivers(drivers.map(d => d.id === data.id ? data : d));
    } else {
      const newId = `D-${Math.floor(1000 + Math.random() * 9000)}`;
      setDrivers([...drivers, { ...data, id: newId, desde: new Date().toISOString(), rating: 5.0, envios: 0, gasto: 0, entregas_hoy: 0 }]);
    }
    handleClose();
  };

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      if (filter !== "all" && d.estado !== filter) return false;
      if (q && !(d.nombre.toLowerCase().includes(q.toLowerCase()) || d.id.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [drivers, q, filter]);

  const perPage = 10;
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  if (actionParam === 'create') {
    return <DriverEditor onClose={handleClose} onSave={handleSaveForm} />;
  }

  if (selected) {
    if (actionParam === 'edit') {
      return <DriverEditor initialData={selected} onClose={handleClose} onSave={handleSaveForm} />;
    }
    return <DriverDetail driver={selected} onClose={handleClose} />;
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Conductores (Drivers)</h1>
          <p className="text-sm text-[#5C7480] font-medium">Gestiona el personal de transporte y sus credenciales</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost"><Download size={14}/>Exportar CSV</button>
          <button className="btn btn-solid" onClick={() => router.push('?action=create')}><Plus size={14}/>Nuevo Conductor</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-4 flex-wrap bg-white">
          <div className="flex-1 max-w-sm bg-ink-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-ink-200 focus-within:bg-white transition-all">
            <Search size={14} className="text-ink-400"/>
            <input 
              placeholder="Buscar por nombre, ID o placa…" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-ink-900"
              value={q} 
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex bg-ink-50 p-1 rounded-xl gap-1">
            {[['all','Todos'],['active','Activos'],['inactive','Inactivos'],['suspended','Suspendidos']].map(([k,l]) => (
              <span key={k} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === k ? 'bg-white text-primary shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
                    onClick={() => { setFilter(k); setPage(1); }}>{l}</span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100 font-bold text-ink-500">
                <th className="px-4 py-3 text-[11px] uppercase tracking-widest">Conductor</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-widest">Ubicación</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-widest">Rating</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-widest text-right">Envíos</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {slice.map(d => (
                <tr key={d.id} onClick={() => router.push(`?id=${d.id}&action=view`)} className="hover:bg-ink-50/50 cursor-pointer group transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">{initials(d.nombre)}</div>
                      <div>
                        <div className="text-[13px] font-bold text-ink-900 group-hover:text-primary transition-colors">{d.nombre}</div>
                        <div className="text-[11px] text-ink-400 font-medium">{d.id} · {d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-bold text-ink-900">{d.ciudad}</div>
                    <div className="text-[11px] text-ink-500">{d.zona}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={12} fill="currentColor" /> {d.rating || 5.0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] font-bold text-ink-900">{d.envios?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3"><StatusPill s={d.estado}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${d.id}&action=view`); }} title="Ver Detalle"><Eye size={14}/></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${d.id}&action=edit`); }} title="Editar"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
