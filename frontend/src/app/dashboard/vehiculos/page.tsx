'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Download, Plus, Search, Filter, Eye, Edit, MoreHorizontal, Car, Truck, Bike, MapPin, Settings, ExternalLink } from 'lucide-react';
import { MOCK } from '@/utils/data';
import DocumentModal from '@/components/DocumentModal';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { label: string, colorClass: string }> = { 
    disponible: { label: "Disponible", colorClass: "text-[#2C8B6E] bg-[#E6F4EE]" }, 
    en_viaje: { label: "En viaje", colorClass: "text-[#0E6E97] bg-[#E6F2F7]" }, 
    mantenimiento: { label: "Mantenimiento", colorClass: "text-[#B07217] bg-[#FDF1DF]" },
    en_taller: { label: "En taller", colorClass: "text-[#C23A22] bg-[#FDE2E1]" } 
  };
  const status = map[s] || { label: s, colorClass: "text-ink-600 bg-ink-100" };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.colorClass}`}>
      {status.label}
    </span>
  );
}

function VehicleIcon({ type, size = 16 }: { type: string, size?: number }) {
  if (type === 'Moto') return <Bike size={size} className="text-white" />;
  if (type === 'Camión') return <Truck size={size} className="text-white" />;
  return <Car size={size} className="text-white" />;
}

function VehicleEditor({ initialData, onClose, onSave }: { initialData?: any, onClose: () => void, onSave: (v:any)=>void }) {
  const isEdit = !!initialData?.id;
  const [formData, setFormData] = useState(initialData || {
    tipo: 'Camioneta', placa: '', modelo: '', año: new Date().getFullYear(),
    peso: '', volumen: '', combustible: 'Gasolina', rendimiento: '',
    tanque: '', kilometraje: '', estado: 'disponible', driver: 'Sin asignar'
  });
  
  const [docTab, setDocTab] = useState(0);

  const [activeSection, setActiveSection] = useState(0);
  const totalSteps = 5;
  const progress = ((activeSection + 1) / totalSteps) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goNext = () => setActiveSection(Math.min(totalSteps - 1, activeSection + 1));
  const goPrev = () => setActiveSection(Math.max(0, activeSection - 1));

  const tabs = ['Foto Frontal', 'Foto Trasera', 'Foto Lateral Izq', 'Foto Lateral Der', 'Tarjeta de circulación', 'Póliza de seguro', 'Verificación'];

  return (
    <div className="val-shell">
      <div className="val-progress-row">
        <div className="val-progress-title">{isEdit ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'}</div>
        <div className="val-progress-count">{activeSection + 1} de {totalSteps}</div>
      </div>
      <div className="val-progress-row-bar">
        <button className="val-arrow" onClick={goPrev} disabled={activeSection === 0} title="Anterior">‹</button>
        <div className="val-progress-bar">
          <div className="val-progress-fill" style={{width: `${progress}%`}}>
            <div className="val-progress-knob"><Car size={11}/></div>
          </div>
        </div>
        <button className="val-arrow" onClick={goNext} disabled={activeSection === totalSteps - 1} title="Siguiente">›</button>
      </div>

      <div className="val-grid">
        <div className="val-form">
          <div className="val-form-hint">Completa los datos operativos y técnicos del vehículo:</div>
          
          {activeSection === 0 && (
            <div className="val-step-card">
              <div className="val-step-title">1. Identificación del vehículo</div>
              <div className="val-q">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Tipo de Vehículo*</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} className="val-select">
                      <option>Camioneta</option><option>Camión</option><option>Moto</option><option>Otro</option>
                    </select>
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Placas*</label>
                    <input name="placa" value={formData.placa} onChange={handleChange} className="val-select font-mono uppercase" placeholder="Ej. PJK-441-A" />
                  </div>
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Modelo*</label>
                    <input name="modelo" value={formData.modelo} onChange={handleChange} className="val-select" placeholder="Ej. Nissan NP300" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Año*</label>
                    <input type="number" name="año" value={formData.año} onChange={handleChange} className="val-select" />
                  </div>
                </div>
              </div>
              <div className="val-actions mt-6">
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="btn btn-solid" onClick={goNext}>Siguiente</button>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="val-step-card">
              <div className="val-step-title">2. Capacidades y dimensiones</div>
              <div className="val-q">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Capacidad de Carga*</label>
                    <input name="peso" value={formData.peso} onChange={handleChange} className="val-select" placeholder="Ej. 1.2 ton" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Volumen de Carga*</label>
                    <input name="volumen" value={formData.volumen} onChange={handleChange} className="val-select" placeholder="Ej. 4 m³" />
                  </div>
                </div>
              </div>
              <div className="val-actions mt-6">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Siguiente</button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="val-step-card">
              <div className="val-step-title">3. Rendimiento y Operación</div>
              <div className="val-q">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Combustible*</label>
                    <select name="combustible" value={formData.combustible} onChange={handleChange} className="val-select">
                      <option>Gasolina</option><option>Diésel</option><option>Eléctrico</option><option>Gas</option>
                    </select>
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Rendimiento*</label>
                    <input name="rendimiento" value={formData.rendimiento} onChange={handleChange} className="val-select" placeholder="Ej. 8 km/l" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Tanque*</label>
                    <input name="tanque" value={formData.tanque} onChange={handleChange} className="val-select" placeholder="Ej. 80 L" />
                  </div>
                </div>
              </div>
              <div className="val-actions mt-6">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Siguiente</button>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="val-step-card">
              <div className="val-step-title">4. Estado actual de la unidad</div>
              <div className="val-q">
                <div className="flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Kilometraje Actual*</label>
                    <input name="kilometraje" value={formData.kilometraje} onChange={handleChange} className="val-select" placeholder="Ej. 45,200 km" />
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Status*</label>
                    <select name="estado" value={formData.estado} onChange={handleChange} className="val-select">
                      <option value="disponible">Disponible</option><option value="en_viaje">En viaje</option><option value="mantenimiento">Mantenimiento</option><option value="en_taller">En taller</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="val-actions mt-6">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Siguiente</button>
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="val-step-card">
              <div className="val-step-title">5. Asignación operativa</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Conductor Asignado</label>
                  <select name="driver" value={formData.driver} onChange={handleChange} className="val-select">
                    <option value="Sin asignar">Sin asignar</option>
                    <option value="Roberto Saldívar">Roberto Saldívar</option>
                    <option value="Juan Pérez">Juan Pérez</option>
                    <option value="Carlos García">Carlos García</option>
                  </select>
                </div>
              </div>
              <div className="val-actions mt-6">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={() => onSave(formData)}>Guardar Vehículo</button>
              </div>
            </div>
          )}
        </div>

        <div className="val-doc val-doc-sticky">
          <div className="val-doc-tabs">
            {tabs.map((t, i) => (
              <button key={t}
                className={`val-doc-tab ${docTab === i ? 'active' : ''}`}
                onClick={() => setDocTab(i)}>{t}</button>
            ))}
          </div>
          <div className="val-doc-viewer" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
               <Plus size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink-900 mb-1">Subir {tabs[docTab]}</h3>
            <p className="text-xs text-ink-500 mb-6">Arrastra tu archivo aquí o haz clic para buscar</p>
            <button className="btn btn-solid border border-ink-200">Seleccionar archivo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleDetail({ vehicle, isCreate = false, onClose, onSave }: { vehicle?: any, isCreate?: boolean, onClose: () => void, onSave?: (v:any)=>void }) {

  const [vehImgIdx, setVehImgIdx] = useState(0);
  const [docIdx, setDocIdx] = useState(0);
  const [modalVehOpen, setModalVehOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [valTab, setValTab] = useState('tecnica');

  const vData = vehicle || {
    placa: 'Nuevo Vehículo', tipo: 'Sin especificar', año: new Date().getFullYear(),
    estado: 'disponible', modelo: 'Sin modelo', driver: 'Sin asignar'
  };

  const isEdit = isCreate || (vehicle && onSave !== undefined);

  const vehImgs = [
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&auto=format&fit=crop',
  ];

  const docs = [
    { label: 'Tarjeta de circulación', type: 'pdf' as const, url: '/sample.pdf' },
    { label: 'Póliza de Seguro', type: 'pdf' as const, url: '/sample.pdf' },
    { label: 'Factura', type: 'image' as const, url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&auto=format&fit=crop' },
  ];
  
  const currentDoc = docs[docIdx];

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
            <Car size={40}/>
          </div>
        </div>
        <div className="detail-meta flex justify-between items-start w-full pr-4">
          <div>
            <h1>{vData.placa}</h1>
            <div className="detail-tags">
              {!isCreate && (
                <span className={"detail-validated " + (vData.estado === 'disponible' ? '' : vData.estado === 'en_viaje' ? 'active' : 'suspended')}>
                  {vData.estado === 'disponible' ? 'Disponible' : vData.estado === 'en_viaje' ? 'En Viaje' : vData.estado === 'mantenimiento' ? 'En Mantenimiento' : 'En Taller'}
                </span>
              )}
              <span className="gender">{vData.tipo} · {vData.año}</span>
            </div>
            <div className="detail-contact">
              <div className="item"><Settings size={15} className="ico"/><div className="label-stack">{vData.modelo}</div></div>
              <div className="item"><MapPin size={15} className="ico"/><div className="label-stack">{vData.driver}</div></div>
            </div>
          </div>
        </div>
      </div>

      {isEdit ? (
        <>
          <div className="val-tabs">
            <div className={"val-tab " + (valTab === 'tecnica' ? 'active' : '')} onClick={() => setValTab('tecnica')}>Ficha técnica</div>
          </div>
          {onSave && <VehicleEditor initialData={vehicle} onClose={onClose} onSave={onSave} />}
        </>
      ) : (
        <div className="detail-cards">
          <div className="dcard h-full">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Detalles Técnicos y Operativos</div>
            <div className="dcard-body">
              <div className="ds-vehimg-wrap" style={{ position: 'relative', marginBottom: '20px' }}>
                <button className="ds-doc-expand" title="Ampliar foto" onClick={() => setModalVehOpen(true)} style={{ zIndex: 10 }}><Search size={14} /></button>
                <button className="ds-imgnav prev" onClick={() => setVehImgIdx((vehImgIdx - 1 + vehImgs.length) % vehImgs.length)}>‹</button>
                <div className="ds-vehimg cursor-pointer" onClick={() => setModalVehOpen(true)} style={{backgroundImage: `url(${vehImgs[vehImgIdx]})`}}/>
                <button className="ds-imgnav next" onClick={() => setVehImgIdx((vehImgIdx + 1) % vehImgs.length)}>›</button>
              </div>
              <div className="kv-list">
                <div className="row"><span className="k">Tipo de vehículo:</span><span className="v">{vData.tipo}</span></div>
                <div className="row"><span className="k">Modelo:</span><span className="v">{vData.modelo}</span></div>
                <div className="row"><span className="k">Año:</span><span className="v">{vData.año}</span></div>
                <div className="row"><span className="k">Capacidad de Carga:</span><span className="v">{vData.peso}</span></div>
                <div className="row"><span className="k">Volumen de Carga:</span><span className="v">{vData.volumen}</span></div>
                <div className="row"><span className="k">Combustible:</span><span className="v">{vData.combustible}</span></div>
                <div className="row"><span className="k">Rendimiento:</span><span className="v">{vData.rendimiento}</span></div>
                <div className="row"><span className="k">Capacidad de Tanque:</span><span className="v">{vData.tanque}</span></div>
                <div className="row"><span className="k">Kilometraje Actual:</span><span className="v">{vData.kilometraje}</span></div>
                <div className="row"><span className="k">Placas:</span><span className="v" style={{fontFamily:'var(--font-mono)'}}>{vData.placa}</span></div>
                <div className="row">
                  <span className="k">Estado:</span>
                  <span className="v">{vData.estado === 'disponible' ? 'Disponible' : vData.estado === 'en_viaje' ? 'En viaje' : vData.estado === 'mantenimiento' ? 'Mantenimiento' : 'En taller'}</span>
                </div>
                <div className="row">
                  <span className="k">Conductor Asignado:</span>
                  <span className="v">
                    {vData.driver !== "Sin asignar" ? (
                      <Link href={`/dashboard/drivers?driverName=${encodeURIComponent(vData.driver)}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                        {vData.driver} <ExternalLink size={12} />
                      </Link>
                    ) : (
                      <span className="text-ink-400 font-medium italic">{vData.driver}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dcard">
            <div className="dcard-header" style={{ background: '#4CB89C' }}>Documentos del vehículo</div>
            <div className="dcard-body">
              <div className="ds-doclabel">{currentDoc.label}</div>
              <div className="ds-doc-wrap">
                <button className="ds-imgnav prev" onClick={() => setDocIdx((docIdx - 1 + docs.length) % docs.length)}>‹</button>
                <div className="ds-doc">
                  <button className="ds-doc-expand" title="Ampliar" onClick={() => setModalOpen(true)}><Search size={14} /></button>
                  <div className="ds-doc-img flex items-center justify-center bg-[#ECF1F3]" style={currentDoc.type === 'image' ? {
                    backgroundImage: `url(${currentDoc.url})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  } : {}}>
                    {currentDoc.type === 'pdf' && (
                      <iframe 
                        src={`${currentDoc.url}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-none" 
                        title="PDF Preview"
                      />
                    )}
                  </div>
                  <div className="ds-doc-counter">{docIdx + 1} de {docs.length}</div>
                </div>
                <button className="ds-imgnav next" onClick={() => setDocIdx((docIdx + 1) % docs.length)}>›</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <DocumentModal 
          url={currentDoc.url}
          type={currentDoc.type}
          title={currentDoc.label}
          onClose={() => setModalOpen(false)}
          onNext={() => setDocIdx(i => (i + 1) % docs.length)}
          onPrev={() => setDocIdx(i => (i - 1 + docs.length) % docs.length)}
        />
      )}
      {modalVehOpen && (
        <DocumentModal 
          url={vehImgs[vehImgIdx]}
          type="image"
          title={`Fotografía ${vehImgIdx + 1} del Vehículo`}
          onClose={() => setModalVehOpen(false)}
          onNext={() => setVehImgIdx(i => (i + 1) % vehImgs.length)}
          onPrev={() => setVehImgIdx(i => (i - 1 + vehImgs.length) % vehImgs.length)}
        />
      )}
    </div>
  );
}


const VehiculosContent = dynamic(() => Promise.resolve(VehiculosContentInternal), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Cargando Vehículos...</div>
});

export default function Vehiculos() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Iniciando...</div>}>
      <VehiculosContent />
    </Suspense>
  );
}

function VehiculosContentInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get('id');
  const actionParam = searchParams.get('action'); // 'view' | 'edit' | 'create'

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ key: "id", dir: "asc" });
  const [page, setPage] = useState(1);
  
  // States for Create/Edit Form
  const [vehiculosData, setVehiculosData] = useState([...MOCK.VEHICULOS]);

  const selected = useMemo(() => idParam ? vehiculosData.find((v:any) => v.id === idParam) : null, [idParam, vehiculosData]);

  const filtered = useMemo(() => {
    let r = vehiculosData.filter((v: any) => {
      if (filter !== "all" && v.estado !== filter) return false;
      if (q && !(v.placa.toLowerCase().includes(q.toLowerCase()) ||
                 v.modelo.toLowerCase().includes(q.toLowerCase()) ||
                 v.id.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    r = [...r].sort((a: any, b: any) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [q, filter, sort]);

  const perPage = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (k: string) => setSort(s => s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" });
  const sortIcon = (k: string) => sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : "↕";

  const handleSaveForm = (data: any) => {
    let newId = data.id;
    if (data.id) {
      setVehiculosData(vehiculosData.map(v => v.id === data.id ? data : v));
    } else {
      newId = `V-${Math.floor(100 + Math.random() * 900)}`;
      setVehiculosData([...vehiculosData, { ...data, id: newId }]);
    }
    router.push(`?id=${newId}&action=view`);
  };

  const handleClose = () => router.push('/dashboard/vehiculos');

  if (actionParam === 'create') {
    return <VehicleDetail 
      isCreate={true}
      onClose={handleClose} 
      onSave={handleSaveForm}
    />;
  }

  if (selected) {
    if (actionParam === 'edit') {
      return <VehicleDetail 
        vehicle={selected}
        onClose={handleClose} 
        onSave={handleSaveForm}
      />;
    }
    return <VehicleDetail 
      vehicle={selected} 
      onClose={handleClose} 
    />;
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight leading-none mb-2">Vehículos</h1>
          <p className="text-sm text-[#5C7480] font-medium">{vehiculosData.length} vehículos en flota · {vehiculosData.filter((v:any) => v.estado === 'disponible').length} disponibles</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost"><Download size={14}/>Exportar CSV</button>
          <button className="btn btn-solid" onClick={() => router.push('?action=create')}>
            <Plus size={14}/>Nuevo vehículo
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-4 flex-wrap bg-white">
          <div className="flex-1 max-w-sm bg-ink-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-ink-200 focus-within:bg-white transition-all">
            <Search size={14} className="text-ink-400"/>
            <input 
              placeholder="Buscar por placa, modelo o ID…" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-ink-900"
              value={q} 
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex bg-ink-50 p-1 rounded-xl gap-1">
            {[['all','Todos'],['disponible','Disponibles'],['en_viaje','En Viaje'],['mantenimiento','Mantenimiento'],['en_taller','En Taller']].map(([k,l]) => (
              <span key={k} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === k ? 'bg-white text-primary shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
                    onClick={() => { setFilter(k); setPage(1); }}>{l}</span>
            ))}
          </div>
          <div className="flex-1" />
          <button className="w-9 h-9 rounded-xl border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-ink-50 transition-all" title="Filtros"><Filter size={14}/></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th onClick={() => toggleSort("placa")} className={`px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest cursor-pointer hover:bg-ink-100/50 ${sort.key === "placa" ? "text-ink-700" : ""}`}>Vehículo <span className="opacity-50 ml-1">{sortIcon("placa")}</span></th>
                <th onClick={() => toggleSort("tipo")} className={`px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest cursor-pointer hover:bg-ink-100/50 ${sort.key === "tipo" ? "text-ink-700" : ""}`}>Tipo <span className="opacity-50 ml-1">{sortIcon("tipo")}</span></th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Capacidad</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Rendimiento</th>
                <th onClick={() => toggleSort("driver")} className={`px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest cursor-pointer hover:bg-ink-100/50 ${sort.key === "driver" ? "text-ink-700" : ""}`}>Conductor Asignado <span className="opacity-50 ml-1">{sortIcon("driver")}</span></th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {slice.map((v: any) => (
                <tr key={v.id} onClick={() => router.push(`?id=${v.id}&action=view`)} className="hover:bg-ink-50/50 cursor-pointer group transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] flex items-center justify-center shadow-sm shrink-0">
                        <VehicleIcon type={v.tipo} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-ink-900 group-hover:text-primary transition-colors truncate">{v.placa}</div>
                        <div className="text-[11px] text-ink-400 font-medium truncate">{v.modelo} · {v.año} · {v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{v.tipo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{v.peso}</div>
                    <div className="text-[11px] text-ink-500 font-medium">Vol: {v.volumen}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{v.rendimiento}</div>
                    <div className="text-[11px] text-ink-500 font-medium">{v.combustible} ({v.tanque})</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{v.driver}</div>
                  </td>
                  <td className="px-4 py-3"><StatusPill s={v.estado}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${v.id}&action=view`); }} title="Ver Detalle"><Eye size={14}/></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${v.id}&action=edit`); }} title="Editar"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-ink-500">No se encontraron vehículos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-ink-100 flex items-center justify-between bg-ink-50/30">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-widest">Mostrando {slice.length} de {filtered.length} vehículos</div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            {Array.from({length: pages}, (_, i) => i + 1).map(n => (
              <button key={n} className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${n === page ? 'bg-primary text-white shadow-md border-transparent' : 'text-ink-500 hover:bg-white border border-transparent hover:border-ink-200'}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent" disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button>
          </div>
        </div>
      </div>

    </>
  );
}
