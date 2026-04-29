'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Plus, Search, Filter, Edit, MoreHorizontal, User, Shield, LifeBuoy, X, Mail, Settings, Calendar, Key, Phone, Map, Eye } from 'lucide-react';

const ADMINS_MOCK = [
  { id: 'A001', nombre: 'Kevin Salazar', email: 'admin@cargalo.mx', tel: '81 1234 5678', rol: 'Admin', estado: 'active', fecha: '2023-11-15T10:00:00Z' },
  { id: 'A002', nombre: 'Misael Garza Rosas', email: 'misael@cargalo.mx', tel: '81 8765 4321', rol: 'Dispatcher', estado: 'active', fecha: '2024-01-10T09:30:00Z' },
  { id: 'A003', nombre: 'Andrea Lomas', email: 'andrea@cargalo.mx', tel: '81 1122 3344', rol: 'Manager', estado: 'active', fecha: '2024-02-05T14:20:00Z' },
  { id: 'A004', nombre: 'Juan Perez', email: 'juan@cargalo.mx', tel: '81 5566 7788', rol: 'Viewer', estado: 'suspended', fecha: '2023-12-01T11:15:00Z' },
];

const initials = (name: string) => (name || '').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase();
const fmtDate = (s: string) => new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = { active: "Activo", suspended: "Suspendido" };
  return <span className={"status " + s}>{map[s] || s}</span>;
}

function RolePill({ role }: { role: string }) {
  const map: Record<string, { label: string, color: string, icon: any }> = {
    'Admin': { label: 'Administrador', color: 'bg-purple-100 text-purple-700', icon: Shield },
    'Dispatcher': { label: 'Despachador', color: 'bg-blue-100 text-blue-700', icon: Map },
    'Manager': { label: 'Gerente', color: 'bg-amber-100 text-amber-700', icon: User },
    'Viewer': { label: 'Solo Lectura', color: 'bg-ink-100 text-ink-600', icon: Eye }
  };
  const cfg = map[role] || { label: role, color: 'bg-ink-100 text-ink-600', icon: User };
  const Icon = cfg.icon;
  return <span className={`${cfg.color} px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-max`}><Icon size={12}/> {cfg.label}</span>;
}

function AdminDetail({ admin, isCreate = false, onClose, onSave }: { admin?: any, isCreate?: boolean, onClose: () => void, onSave?: (v:any)=>void }) {
  const isEdit = isCreate || (admin && onSave !== undefined);
  const aData = admin || {
    nombre: '', email: '', tel: '', rol: 'Dispatcher', estado: 'active', password: ''
  };

  const [formData, setFormData] = useState(aData);
  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = 2;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="detail-shell">
      <div className="detail-map">
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{fontSize:18,lineHeight:1}}>‹</span>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-avatar">
          <div className="avatar-img flex items-center justify-center bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] text-white font-extrabold text-3xl">
            {isCreate ? <User size={40}/> : initials(aData.nombre)}
          </div>
        </div>
        <div className="detail-meta flex justify-between items-start w-full pr-4">
          <div>
            <h1>{isCreate ? 'Nuevo Administrador' : aData.nombre}</h1>
            <div className="detail-tags">
              {!isCreate && (
                <span className={"detail-validated " + (aData.estado === 'active' ? '' : 'suspended')}>
                  {aData.estado === 'active' ? 'Activo' : 'Suspendido'}
                </span>
              )}
              <span className="gender"><RolePill role={aData.rol} /></span>
            </div>
            {!isCreate && (
              <div className="detail-contact">
                <div className="item"><Mail size={15} className="ico"/><div className="label-stack">{aData.email}</div></div>
                <div className="item"><Phone size={15} className="ico"/><div className="label-stack">{aData.tel || 'Sin teléfono'}</div></div>
                <div className="item"><Calendar size={15} className="ico"/><div className="label-stack">Registro: {fmtDate(aData.fecha)}</div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEdit ? (
        <>
          <div className="val-tabs">
            <div className="val-tab active">Configuración de Acceso</div>
          </div>
          <div className="val-shell">
            <div className="val-progress-row">
              <div className="val-progress-title">{isCreate ? 'Crear Nuevo Administrador' : 'Editar Administrador'}</div>
              <div className="val-progress-count">Paso {activeStep + 1} de {totalSteps}</div>
            </div>
            <div className="val-progress-row-bar">
              <button className="val-arrow" onClick={() => setActiveStep(0)} disabled={activeStep === 0} title="Anterior">‹</button>
              <div className="val-progress-bar">
                <div className="val-progress-fill" style={{width: `${progress}%`}}>
                  <div className="val-progress-knob">{activeStep === 0 ? <User size={11}/> : <Key size={11}/>}</div>
                </div>
              </div>
              <button className="val-arrow" onClick={() => setActiveStep(1)} disabled={activeStep === 1} title="Siguiente">›</button>
            </div>

            <div className="val-grid">
              <div className="val-form">
                {activeStep === 0 && (
                  <div className="val-step-card animate-in fade-in slide-in-from-bottom-2">
                    <div className="val-step-title">1. Información del Perfil</div>
                    <div className="val-q">
                      <div className="val-field">
                        <label className="val-field-label">Nombre completo*</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} className="val-select" placeholder="Ej. Carlos Mendoza" required/>
                      </div>
                    </div>
                    <div className="val-q mt-6">
                      <div className="flex gap-4">
                        <div className="val-field flex-1">
                          <label className="val-field-label">Correo Electrónico*</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} className="val-select" placeholder="admin@cargalo.mx" required/>
                        </div>
                        <div className="val-field flex-1">
                          <label className="val-field-label">Teléfono / WhatsApp*</label>
                          <input name="tel" value={formData.tel} onChange={handleChange} className="val-select" placeholder="81 1234 5678" />
                        </div>
                      </div>
                    </div>
                    <div className="val-actions mt-8">
                      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                      <button className="btn btn-solid" onClick={() => setActiveStep(1)}>Continuar a Seguridad</button>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="val-step-card animate-in fade-in slide-in-from-bottom-2">
                    <div className="val-step-title">2. Seguridad y Permisos</div>
                    <div className="val-q">
                      <div className="flex gap-4">
                        <div className="val-field flex-1">
                          <label className="val-field-label">Perfil de acceso (Rol)*</label>
                          <select name="rol" value={formData.rol} onChange={handleChange} className="val-select">
                            <option value="Admin">Administrador (Acceso total)</option>
                            <option value="Dispatcher">Despachador (Gestión de viajes)</option>
                            <option value="Manager">Gerente (Reportes y Supervisión)</option>
                            <option value="Viewer">Solo Lectura (Visualización)</option>
                          </select>
                        </div>
                        <div className="val-field flex-1">
                          <label className="val-field-label">Estado de la cuenta*</label>
                          <select name="estado" value={formData.estado} onChange={handleChange} className="val-select">
                            <option value="active">Activo</option>
                            <option value="suspended">Suspendido</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {isCreate && (
                      <div className="val-q mt-6">
                        <div className="val-field">
                          <label className="val-field-label">Contraseña Temporal*</label>
                          <input type="password" name="password" value={formData.password} onChange={handleChange} className="val-select" placeholder="••••••••" required/>
                        </div>
                      </div>
                    )}
                    <div className="val-actions mt-8">
                      <button className="btn btn-ghost" onClick={() => setActiveStep(0)}>Volver</button>
                      <button className="btn btn-solid" onClick={() => onSave?.(formData)}>{isCreate ? 'Crear Administrador' : 'Guardar Cambios'}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="val-doc hidden lg:block">
                <div className="val-doc-tabs">
                  <button className="val-doc-tab active">Previsualización</button>
                </div>
                <div className="val-doc-viewer" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '0 0 12px 12px' }}>
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary mb-4 shadow-md border border-ink-100">
                    {formData.nombre ? <span className="text-2xl font-black">{initials(formData.nombre)}</span> : <User size={40} />}
                  </div>
                  <h3 className="text-[15px] font-black text-ink-900 mb-1">{formData.nombre || 'Nombre del Admin'}</h3>
                  <p className="text-xs text-ink-500 mb-4">{formData.email || 'correo@ejemplo.com'}</p>
                  <RolePill role={formData.rol} />
                  <div className="mt-6 pt-6 border-t border-ink-100 w-full px-8 text-center text-[10px] text-ink-400 uppercase font-black tracking-widest">
                    Avatar generado automáticamente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="val-tabs">
            <div className="val-tab active">Información del Perfil</div>
          </div>

          <div className="detail-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="dcard h-full">
              <div className="dcard-header">Información Personal</div>
              <div className="dcard-body">
                <div className="kv-list">
                  <div className="row"><span className="k">Nombre Completo:</span><span className="v font-bold text-ink-900">{aData.nombre || 'No disponible'}</span></div>
                  <div className="row"><span className="k">Teléfono:</span><span className="v text-ink-900">{aData.tel || 'No registrado'}</span></div>
                  <div className="row"><span className="k">Correo Electrónico:</span><span className="v text-ink-900">{aData.email || 'No disponible'}</span></div>
                </div>
              </div>
            </div>
            <div className="dcard h-full">
              <div className="dcard-header" style={{ background: '#4CB89C' }}>Acceso y Sistema</div>
              <div className="dcard-body">
                <div className="kv-list">
                  <div className="row"><span className="k">Rol en Sistema:</span><span className="v"><RolePill role={aData.rol} /></span></div>
                  <div className="row">
                    <span className="k">Estado de Cuenta:</span>
                    <span className="v"><StatusPill s={aData.estado}/></span>
                  </div>
                  <div className="row"><span className="k">Fecha de Registro:</span><span className="v text-ink-900">{aData.fecha ? fmtDate(aData.fecha) : '--'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Administradores() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Cargando...</div>}>
      <AdministradoresContent />
    </Suspense>
  );
}

function AdministradoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const idParam = searchParams.get('id');

  const [admins, setAdmins] = useState(ADMINS_MOCK);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const selected = useMemo(() => admins.find(a => a.id === idParam), [idParam, admins]);

  const handleClose = () => router.push('/dashboard/administradores');

  const handleSaveForm = (formData: any) => {
    if (actionParam === 'create') {
      const n = {
        id: `A00${Math.floor(Math.random() * 1000)}`,
        nombre: formData.nombre,
        email: formData.email,
        tel: formData.tel,
        rol: formData.rol,
        estado: formData.estado,
        fecha: new Date().toISOString()
      };
      setAdmins([n, ...admins]);
    } else if (actionParam === 'edit' && selected) {
      setAdmins(admins.map(a => a.id === selected.id ? { ...a, ...formData } : a));
    }
    handleClose();
  };

  const filtered = useMemo(() => {
    return admins.filter(a => {
      if (filter !== "all" && a.estado !== filter) return false;
      if (q && !(a.nombre.toLowerCase().includes(q.toLowerCase()) ||
                 a.email.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [admins, q, filter]);

  const perPage = 10;
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  if (actionParam === 'create') {
    return <AdminDetail isCreate={true} onClose={handleClose} onSave={handleSaveForm} />;
  }

  if (selected) {
    if (actionParam === 'edit') {
      return <AdminDetail admin={selected} onClose={handleClose} onSave={handleSaveForm} />;
    }
    return <AdminDetail admin={selected} onClose={handleClose} />;
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Administradores</h1>
          <p className="text-sm text-[#5C7480] font-medium">Gestiona los accesos y perfiles del panel administrativo</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost"><Download size={14}/>Exportar CSV</button>
          <button className="btn btn-solid" onClick={() => router.push('?action=create')}><Plus size={14}/>Nuevo administrador</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-4 flex-wrap bg-white">
          <div className="flex-1 max-w-sm bg-ink-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-ink-200 focus-within:bg-white transition-all">
            <Search size={14} className="text-ink-400"/>
            <input 
              placeholder="Buscar por nombre o email…" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-ink-900"
              value={q} 
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex bg-ink-50 p-1 rounded-xl gap-1">
            {[['all','Todos'],['active','Activos'],['suspended','Suspendidos']].map(([k,l]) => (
              <span key={k} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === k ? 'bg-white text-primary shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
                    onClick={() => { setFilter(k); setPage(1); }}>{l}</span>
            ))}
          </div>
          <div className="flex-1" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Administrador</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Perfil / Rol</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {slice.map(a => (
                <tr key={a.id} onClick={() => router.push(`?id=${a.id}&action=view`)} className="hover:bg-ink-50/50 cursor-pointer group transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#4CB89C] text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">{initials(a.nombre)}</div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-ink-900 group-hover:text-primary transition-colors truncate">{a.nombre}</div>
                        <div className="text-[11px] text-ink-400 font-medium truncate">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RolePill role={a.rol}/></td>
                  <td className="px-4 py-3"><StatusPill s={a.estado}/></td>
                  <td className="px-4 py-3 text-[13px] text-ink-500 font-medium">{fmtDate(a.fecha)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${a.id}&action=view`); }} title="Ver Detalle"><Eye size={14}/></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${a.id}&action=edit`); }} title="Editar"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-ink-500">Sin administradores encontrados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-ink-100 flex items-center justify-between bg-ink-50/30">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-widest">Mostrando {slice.length} de {filtered.length} admins</div>
        </div>
      </div>
    </>
  );
}
