'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import { Download, Plus, Search, Filter, MapPin, Eye, Edit, MoreHorizontal, Mail, Phone, MessageSquare, UserMinus, UserPlus, FileText, Minus, User, Building, Clock, Map, Trash2, Maximize2 } from 'lucide-react';
import { MOCK } from '@/utils/data';
import { useSearchParams, useRouter } from 'next/navigation';
import DocumentModal from '@/components/DocumentModal';
import ZoomableImage from '@/components/ZoomableImage';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5aG1ur9_hOUAGmNwo9_TxUtpeFXMsiZM';
const placesLibrary: ('places' | 'geometry')[] = ['places', 'geometry'];

const initials = (name: string) => (name || '').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase();
const fmtDate = (s: string) => new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateLong = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { label: string, colorClass: string }> = { 
    active: { label: "Activo", colorClass: "text-[#2C8B6E] bg-[#E6F4EE]" }, 
    inactive: { label: "Inactivo", colorClass: "text-[#C23A22] bg-[#FDE2E1]" },
    pending: { label: "Pendiente", colorClass: "text-[#B07217] bg-[#FDF1DF]" } 
  };
  const status = map[s] || { label: s, colorClass: "text-ink-600 bg-ink-100" };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.colorClass}`}>
      {status.label}
    </span>
  );
}

interface ClientFormData {
  id?: string;
  tipo: string;
  name: string;
  rfc: string;
  repName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  zone: string;
  estado: string;
  fiscalStreet: string;
  fiscalColonia: string;
  fiscalCity: string;
  fiscalState: string;
  fiscalZip: string;
  fiscalRegime: string;
  cfdiUse: string;
  metodoPago: string;
  puntosEntrega: any[];
}

function ClientEditor({ initialData, defaultTipo, onClose, onSave }: { initialData?: any, defaultTipo?: string, onClose: () => void, onSave: (v:any)=>void }) {
  const isEdit = !!initialData?.id;
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState<ClientFormData>(initialData || {
    tipo: defaultTipo || 'B2B',
    name: '', rfc: '', 
    repName: '',
    contactName: '', contactPhone: '', contactEmail: '', 
    zone: 'Norte', estado: 'active',
    fiscalStreet: '', fiscalColonia: '', fiscalCity: '', fiscalState: '', fiscalZip: '',
    fiscalRegime: '601', cfdiUse: 'G03', metodoPago: 'PUE',
    puntosEntrega: []
  });
  const [activeDoc, setActiveDoc] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Record<string, { url: string, type: string } | undefined>>({});

  const docList = formData.tipo === 'B2B' 
    ? ['Foto Representante', 'INE Rep. Frontal', 'INE Rep. Trasera', 'Acta Constitutiva', 'Poder Notarial', 'Constancia SAT', 'Contrato']
    : ['INE Frontal', 'INE Trasera', 'Foto Cliente', 'Constancia SAT', 'Contrato'];
  const totalSteps = 4;
  const progress = ((activeSection + 1) / totalSteps) * 100;

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [docList[activeDoc]]: { url, type: file.type } }));
    }
  };

  const currentDoc = previews[docList[activeDoc]];

  React.useEffect(() => {
    if (formData.tipo === 'B2B') {
      setFormData(prev => ({ ...prev, fiscalRegime: '601', cfdiUse: 'G03' }));
    } else {
      setFormData(prev => ({ ...prev, fiscalRegime: '605', cfdiUse: 'S01' }));
    }
  }, [formData.tipo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goNext = () => setActiveSection(Math.min(totalSteps - 1, activeSection + 1));
  const goPrev = () => setActiveSection(Math.max(0, activeSection - 1));

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: placesLibrary });
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [addressSearch, setAddressSearch] = useState('');
  const [newPoint, setNewPoint] = useState({ name: '', address: '', lat: 0, lng: 0, contact_name: '', contact_phone: '', reception_from: '08:00', reception_to: '18:00', reception_days: [1,2,3,4,5], service_time_min: 30, special_instructions: '' });

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        setNewPoint(prev => ({...prev, address, lat, lng}));
        setAddressSearch(address);
      }
    }
  };
  
  const handleAddPoint = () => {
    if (newPoint.name && newPoint.address) {
      setFormData({ ...formData, puntosEntrega: [...formData.puntosEntrega, newPoint] });
      setNewPoint({ name: '', address: '', lat: 0, lng: 0, contact_name: '', contact_phone: '', reception_from: '08:00', reception_to: '18:00', reception_days: [1,2,3,4,5], service_time_min: 30, special_instructions: '' });
      setAddressSearch('');
    }
  };

  const removePoint = (idx: number) => {
    const updated = [...formData.puntosEntrega];
    updated.splice(idx, 1);
    setFormData({ ...formData, puntosEntrega: updated });
  };

  return (
    <div className="val-shell">
      <div className="val-progress-row">
        <div className="val-progress-title">{isEdit ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</div>
        <div className="val-progress-count">{activeSection + 1} de {totalSteps}</div>
      </div>
      <div className="val-progress-row-bar">
        <button className="val-arrow" onClick={goPrev} disabled={activeSection === 0} title="Anterior">‹</button>
        <div className="val-progress-bar" style={{ height: '4px' }}>
          <div className="val-progress-fill" style={{width: `${progress}%`, height: '4px'}}>
            <div className="val-progress-knob" style={{ width: '24px', height: '24px', top: '-10px' }}>
              {formData.tipo === 'B2B' ? <Building size={12}/> : <User size={12}/>}
            </div>
          </div>
        </div>
        <button className="val-arrow" onClick={goNext} disabled={activeSection === totalSteps - 1} title="Siguiente">›</button>
      </div>

      <div className="val-grid">
        <div className="val-form">
          {activeSection === 0 && (
            <div className="val-step-card">
              <div className="val-step-title">1. {formData.tipo === 'B2B' ? 'Datos de la Empresa' : 'Datos Personales'}</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">{formData.tipo === 'B2B' ? 'Nombre de la empresa' : 'Nombre completo'}*</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="val-select" placeholder={formData.tipo === 'B2B' ? "Ej. Logística Avanzada S.A. de C.V." : "Ej. Juan Pérez"} />
                </div>
              </div>
              <div className="val-q mt-6">
                <div className="val-field">
                  <label className="val-field-label">RFC (Registro Federal de Contribuyentes)*</label>
                  <input name="rfc" value={formData.rfc} onChange={handleChange} className="val-select font-mono uppercase" placeholder="ABC123456XYZ" maxLength={13} />
                </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="btn btn-solid" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="val-step-card">
              <div className="val-step-title">2. {formData.tipo === 'B2B' ? 'Representante Legal' : 'Datos de Contacto'}</div>
              
              {formData.tipo === 'B2B' && (
                <div className="val-q mb-6">
                  <div className="val-field">
                    <label className="val-field-label">Nombre completo del representante*</label>
                    <input name="repName" value={formData.repName} onChange={handleChange} className="val-select" placeholder="Ej. Roberto Gómez" />
                  </div>
                </div>
              )}

              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Nombre del contacto principal*</label>
                  <input name="contactName" value={formData.contactName} onChange={handleChange} className="val-select" placeholder="Ej. Ana Martínez" />
                </div>
              </div>

              <div className="val-q mt-6 flex gap-4">
                <div className="val-field flex-1">
                  <label className="val-field-label">Teléfono WhatsApp*</label>
                  <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="val-select font-bold" placeholder="55 1234 5678" />
                </div>
                <div className="val-field flex-1">
                  <label className="val-field-label">Correo electrónico*</label>
                  <input name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="val-select" placeholder="contacto@empresa.com" />
                </div>
              </div>

              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="val-step-card">
              <div className="val-step-title">3. Zona Geográfica</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Zona de Operación*</label>
                  <select name="zone" value={formData.zone} onChange={handleChange} className="val-select">
                    <option value="Norte">Zona Norte</option>
                    <option value="Sur">Zona Sur</option>
                    <option value="Bajío">Zona Bajío</option>
                    <option value="Metropolitana">Zona Metropolitana</option>
                  </select>
                </div>
              </div>
              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={goNext}>Continuar a Facturación</button>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="val-step-card">
              <div className="val-step-title">4. Domicilio Fiscal y Facturación</div>
              
              <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Ubicación Fiscal</div>
              <div className="val-q">
                <div className="val-field">
                  <label className="val-field-label">Calle y Número*</label>
                  <input name="fiscalStreet" value={formData.fiscalStreet} onChange={handleChange} className="val-select" placeholder="Ej. Av. Insurgentes Sur 123" />
                </div>
              </div>
              
              <div className="val-q mt-6 flex gap-4">
                <div className="val-field flex-1">
                  <label className="val-field-label">Colonia*</label>
                  <input name="fiscalColonia" value={formData.fiscalColonia} onChange={handleChange} className="val-select" placeholder="Ej. Juárez" />
                </div>
                <div className="val-field flex-1">
                  <label className="val-field-label">Ciudad*</label>
                  <input name="fiscalCity" value={formData.fiscalCity} onChange={handleChange} className="val-select" placeholder="Ej. CDMX" />
                </div>
              </div>

              <div className="val-q mt-6 flex gap-4">
                <div className="val-field flex-1">
                  <label className="val-field-label">Estado*</label>
                  <input name="fiscalState" value={formData.fiscalState} onChange={handleChange} className="val-select" placeholder="Ej. Ciudad de México" />
                </div>
                <div className="val-field w-32">
                  <label className="val-field-label">C.P.*</label>
                  <input name="fiscalZip" value={formData.fiscalZip} onChange={handleChange} className="val-select text-center font-bold" placeholder="00000" maxLength={5} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-ink-100">
                <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Datos de Facturación (SAT)</div>
                <div className="val-q">
                  <div className="val-field">
                    <label className="val-field-label">Régimen Fiscal (CFDI 4.0)*</label>
                    <select name="fiscalRegime" value={formData.fiscalRegime} onChange={handleChange} className="val-select">
                      {formData.tipo === 'B2B' ? (
                        <>
                          <option value="601">601 - General de Ley Personas Morales</option>
                          <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                          <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                        </>
                      ) : (
                        <>
                          <option value="605">605 - Sueldos y Salarios</option>
                          <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                          <option value="621">621 - Incorporación Fiscal</option>
                          <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="val-q mt-6 flex gap-4">
                  <div className="val-field flex-1">
                    <label className="val-field-label">Uso de CFDI*</label>
                    <select name="cfdiUse" value={formData.cfdiUse} onChange={handleChange} className="val-select">
                      {formData.tipo === 'B2B' ? (
                        <>
                          <option value="G03">G03 - Gastos en general</option>
                          <option value="I01">I01 - Construcciones</option>
                          <option value="CP01">CP01 - Pagos</option>
                          <option value="P01">P01 - Por definir</option>
                        </>
                      ) : (
                        <>
                          <option value="S01">S01 - Sin efectos fiscales</option>
                          <option value="G03">G03 - Gastos en general</option>
                          <option value="D01">D01 - Honorarios médicos</option>
                          <option value="D10">D10 - Pagos por servicios educativos</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="val-field flex-1">
                    <label className="val-field-label">Método de Pago*</label>
                    <select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="val-select">
                      <option value="PUE">PUE - Pago en una sola exhibición</option>
                      <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="val-actions mt-8">
                <button className="btn btn-ghost" onClick={goPrev}>Anterior</button>
                <button className="btn btn-solid" onClick={() => onSave(formData)}>Guardar Cliente</button>
              </div>
            </div>
          )}
        </div>

        <div className="val-doc val-doc-sticky h-full flex flex-col">
           <div className="val-doc-tabs">
             {formData.tipo === 'B2B' ? (
               ['Acta Const.', 'Constancia SAT', 'Poder Not.', 'INE Rep'].map((t, i) => (
                 <button key={t} className={`val-doc-tab ${activeDoc === i ? 'active' : ''}`} onClick={() => setActiveDoc(i)}>{t}</button>
               ))
             ) : (
               ['INE Frontal', 'INE Trasera', 'Foto Cliente', 'Constancia SAT', 'Contrato'].map((t, i) => (
                 <button key={t} className={`val-doc-tab ${activeDoc === i ? 'active' : ''}`} onClick={() => setActiveDoc(i)}>{t}</button>
               ))
             )}
           </div>
           <div className="val-doc-viewer flex-1 flex flex-col relative group" style={{ minHeight: '520px' }}>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
              
              {currentDoc ? (
                <div className="flex-1 w-full h-full flex flex-col relative bg-[#0E2A3A]/10">
                  <div className="flex-1 overflow-hidden relative">
                    {currentDoc.type === 'application/pdf' ? (
                       <iframe src={`${currentDoc.url}#toolbar=0&navpanes=0`} className="w-full h-full border-none bg-white" />
                    ) : (
                       <ZoomableImage src={currentDoc.url} alt={docList[activeDoc]} className="w-full h-full" />
                    )}

                    <div className="absolute top-4 right-4 flex gap-2 z-20 group-hover:opacity-100 transition-opacity opacity-100 lg:opacity-0">
                      <button className="w-10 h-10 rounded-xl bg-white shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform border border-ink-100" title="Ampliar" onClick={() => setShowModal(true)}>
                        <Maximize2 size={18} />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform border border-ink-100" title="Eliminar" onClick={() => setPreviews(prev => ({...prev, [docList[activeDoc]]: undefined}))}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white border-t border-ink-100 flex justify-between items-center text-ink-900">
                    <div>
                      <div className="text-xs font-bold">{docList[activeDoc]}</div>
                      <div className="text-[10px] text-ink-400">{currentDoc.type === 'application/pdf' ? 'Documento PDF' : 'Imagen Capturada'}</div>
                    </div>
                    <button className="btn btn-ghost text-[11px] h-8" onClick={handleFileClick}>Reemplazar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 w-full p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={handleFileClick}>
                     <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 border-2 border-dashed border-white/20">
                        <Plus size={32} className="text-white" />
                     </div>
                     <h3 className="text-white font-bold mb-2">Subir {docList[activeDoc]}</h3>
                     <p className="text-white/60 text-xs px-4">Arrastra aquí el archivo PDF o Imagen para validación oficial del cliente.</p>
                  </div>
                  <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Documento pendiente de carga</span>
                    <button className="text-[10px] bg-white text-ink-900 font-bold px-3 py-1 rounded hover:bg-primary hover:text-white transition-colors" onClick={handleFileClick}>SUBIR</button>
                  </div>
                </>
              )}
           </div>

           {showModal && currentDoc && (
             <DocumentModal 
               url={currentDoc.url} 
               type={currentDoc.type === 'application/pdf' ? 'pdf' : 'image'} 
               title={docList[activeDoc]} 
               onClose={() => setShowModal(false)} 
             />
           )}
        </div>
      </div>
    </div>
  );
}

function ClienteDetail({ cliente, isCreate = false, defaultTipo, onClose, onSave }: { cliente?: any, isCreate?: boolean, defaultTipo?: string, onClose: () => void, onSave?: (v:any)=>void }) {
  const isEdit = isCreate || (cliente && onSave !== undefined);
  const cData = cliente || { name: 'Nuevo Cliente', estado: 'active', contactName: 'Sin contacto', contactEmail: '', contactPhone: '', zone: '', fiscalCity: '', puntosEntrega: [], tipo: defaultTipo || 'B2B' };

  // Document Viewer State for View Mode (Matching Vehicles logic)
  const [docIdx, setDocIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [previews, setPreviews] = useState<Record<string, { url: string, type: string }>>({
    'INE Frontal': { url: 'https://images.unsplash.com/photo-1633113087654-c49c686c2cdf?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'INE Trasera': { url: 'https://images.unsplash.com/photo-1633113087654-c49c686c2cdf?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'INE Rep. Frontal': { url: 'https://images.unsplash.com/photo-1633113087654-c49c686c2cdf?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'INE Rep. Trasera': { url: 'https://images.unsplash.com/photo-1633113087654-c49c686c2cdf?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Acta Constitutiva': { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Poder Notarial': { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Constancia SAT': { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Foto Representante': { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Foto Cliente': { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', type: 'image/jpeg' },
    'Contrato': { url: '/sample.pdf', type: 'application/pdf' }
  });

  const docList = cData.tipo === 'B2B' 
    ? ['Foto Representante', 'INE Rep. Frontal', 'INE Rep. Trasera', 'Acta Constitutiva', 'Poder Notarial', 'Constancia SAT', 'Contrato']
    : ['INE Frontal', 'INE Trasera', 'Foto Cliente', 'Constancia SAT', 'Contrato'];

  const currentDoc = previews[docList[docIdx]] || { url: '', type: 'image' };

  return (
    <div className="detail-shell">
      <div className="detail-map">
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
        </div>
      </div>
      
      {/* Header - Mirroring Vehicles style */}
      <div className="detail-header">
        <div className="detail-avatar">
          {cData.tipo === 'B2C' ? (
            <div className="avatar-img flex items-center justify-center text-white font-black text-5xl drop-shadow-md">
              {initials(cData.name || '')}
            </div>
          ) : (
            <div className="avatar-img flex items-center justify-center text-white drop-shadow-md">
              <Building size={60} />
            </div>
          )}
        </div>
        <div className="detail-meta">
          <h1>{cData.name || 'Sin nombre'}</h1>
          <div className="detail-tags">
            <span className={`detail-validated ${cData.estado !== 'active' ? 'suspended' : ''}`}>{cData.estado === 'active' ? 'Activo' : 'Inactivo'}</span>
            <span className={`detail-validated ${cData.tipo === 'B2C' ? 'bg-[#9C27B0]' : 'bg-[#1A8FBF]'}`}>
              {cData.tipo === 'B2C' ? 'Consumidor Final (B2C)' : 'Empresa / Negocio (B2B)'}
            </span>
            {cData.tipo === 'B2C' && <span className="gender font-bold ml-2">Persona Física</span>}
          </div>
          <div className="detail-contact">
             <div className="item">
               <Mail size={15} className="text-primary mr-2" />
               <div className="label-stack text-sm font-semibold">{cData.contactEmail || 'PENDIENTE'}</div>
             </div>
             <div className="item ml-4">
               <Phone size={15} className="text-primary mr-2" />
               <div className="label-stack text-sm font-semibold">{cData.contactPhone || 'PENDIENTE'}</div>
             </div>
          </div>
        </div>
      </div>

      {isEdit ? (
        <div className="p-8">
           <ClientEditor initialData={cliente} defaultTipo={defaultTipo} onClose={onClose} onSave={onSave!} />
        </div>
      ) : (
        <div className="flex gap-10 p-10">
          {/* Left Column: Information Stack - NO INTERNAL SCROLL */}
          <div className="w-[400px] flex flex-col gap-8 shrink-0">
            {/* Corporate / Contact Card */}
            <div className="dcard shadow-md">
              <div className="dcard-header !py-4" style={{ background: '#0E2A3A' }}>Datos de {cData.tipo === 'B2B' ? 'Representación' : 'Contacto'}</div>
              <div className="dcard-body !p-6">
                <div className="kv-list">
                    {cData.tipo === 'B2B' && <div className="row !py-3"><span className="k text-xs">Rep. Legal:</span><span className="v text-sm font-bold">{cData.repName || 'No registrado'}</span></div>}
                    <div className="row !py-3"><span className="k text-xs">Contacto:</span><span className="v text-sm">{cData.contactName || 'No registrado'}</span></div>
                    <div className="row !py-3"><span className="k text-xs">Zona Geográfica:</span><span className="v text-sm">{cData.zone || 'Nacional'}</span></div>
                    <div className="row !py-3"><span className="k text-xs">Rating Cliente:</span><span className="v text-sm text-primary font-bold">★ {cData.rating || '5.0'}</span></div>
                </div>
              </div>
            </div>

            {/* Fiscal Card */}
            <div className="dcard shadow-md">
              <div className="dcard-header !py-4" style={{ background: '#0E6E97' }}>Datos Fiscales y Facturación</div>
              <div className="dcard-body !p-6">
                <div className="kv-list">
                  <div className="row !py-3"><span className="k text-xs">RFC:</span><span className="v text-sm font-mono font-bold text-primary">{cData.rfc || 'N/A'}</span></div>
                  <div className="row !py-3"><span className="k text-xs">Régimen Fiscal:</span><span className="v text-sm">{cData.fiscalRegime || '601'}</span></div>
                  <div className="row !py-3"><span className="k text-xs">Uso del CFDI:</span><span className="v text-sm">{cData.cfdiUse || 'G03'}</span></div>
                  <div className="row !py-3"><span className="k text-xs">Método de Pago:</span><span className="v text-sm">{cData.metodoPago || 'PUE'}</span></div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="dcard shadow-md">
              <div className="dcard-header !py-4" style={{ background: '#7E8A91' }}>Domicilio Fiscal</div>
              <div className="dcard-body !p-6">
                <div className="kv-list">
                  <div className="row !py-3"><span className="k text-xs">Calle y Número:</span><span className="v text-sm font-semibold">{cData.fiscalStreet || 'No registrada'}</span></div>
                  <div className="row !py-3"><span className="k text-xs">Colonia:</span><span className="v text-sm">{cData.fiscalColonia || '-'}</span></div>
                  <div className="row !py-3"><span className="k text-xs">CP / Ciudad:</span><span className="v text-sm font-bold">{cData.fiscalZip || '-'} {cData.fiscalCity}</span></div>
                  <div className="row !py-3"><span className="k text-xs">Estado / Prov.:</span><span className="v text-sm">{cData.fiscalState || '-'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Expanded Expediente Digital */}
          <div className="flex-1 min-w-0">
            <div className="dcard shadow-xl flex flex-col border-2 border-primary/10 sticky top-8" style={{ minHeight: '800px' }}>
              <div className="dcard-header flex justify-between items-center py-5 px-6" style={{ background: '#4CB89C' }}>
                <div className="flex items-center gap-3">
                  <FileText size={22} />
                  <span className="font-bold tracking-tight">EXPEDIENTE DIGITAL DEL CLIENTE</span>
                </div>
                <div className="text-[11px] font-mono bg-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest font-bold">
                  DOC {docIdx + 1} / {docList.length}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col bg-white relative">
                {/* Internal Tabs for quick navigation */}
                <div className="flex gap-2 p-3 bg-ink-50/50 border-b border-ink-100 overflow-x-auto no-scrollbar">
                  {docList.map((t, i) => (
                    <button key={t} 
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${docIdx === i ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-ink-500 hover:bg-ink-100'}`}
                      onClick={() => setDocIdx(i)}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex-1 relative group bg-ink-900/5 overflow-hidden flex flex-col">
                  {/* Navigation Arrows */}
                  <button className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 shadow-2xl rounded-full flex items-center justify-center text-primary hover:scale-110 transition-all z-20 border border-ink-100" onClick={() => setDocIdx((docIdx - 1 + docList.length) % docList.length)}>‹</button>
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 shadow-2xl rounded-full flex items-center justify-center text-primary hover:scale-110 transition-all z-20 border border-ink-100" onClick={() => setDocIdx((docIdx + 1) % docList.length)}>›</button>

                  <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[600px]">
                    {currentDoc.url ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-ink-100 bg-white relative flex flex-col">
                        {currentDoc.type === 'application/pdf' ? (
                           <iframe 
                             src={`${currentDoc.url}#toolbar=0&navpanes=0`} 
                             className="flex-1 w-full border-none min-h-[600px]" 
                           />
                        ) : (
                           <ZoomableImage src={currentDoc.url} alt={docList[docIdx]} className="flex-1 w-full" />
                        )}
                        
                        <div className="absolute top-6 right-6 flex gap-3">
                           <button className="w-12 h-12 rounded-2xl bg-white/95 shadow-2xl flex items-center justify-center text-primary hover:scale-110 transition-transform border border-ink-100" onClick={() => setShowModal(true)}>
                             <Maximize2 size={20} />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-ink-300 py-20">
                        <div className="w-24 h-24 rounded-full bg-ink-100 flex items-center justify-center mb-6">
                          <FileText size={48} className="opacity-20" />
                        </div>
                        <span className="text-base font-bold uppercase tracking-widest italic">Documento no disponible</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-ink-50 border-t border-ink-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[13px] font-bold text-ink-700 uppercase tracking-tight">Archivo actual: <span className="text-primary italic">{docList[docIdx]}</span></span>
                  </div>
                  <button className="btn btn-solid !py-2.5 !px-6 !text-xs shadow-lg" onClick={() => setShowModal(true)}>
                    <Search size={16} className="mr-2" />
                    INSPECCIONAR DOCUMENTO COMPLETO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && currentDoc.url && (
        <DocumentModal 
          url={currentDoc.url} 
          type={currentDoc.type === 'application/pdf' ? 'pdf' : 'image'} 
          title={docList[docIdx]} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

export default function Clientes() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-ink-400 font-bold uppercase text-xs tracking-widest">Cargando...</div>}>
      <ClientesContent />
    </Suspense>
  );
}

function ClientesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get('id');
  const actionParam = searchParams.get('action');
  const tipoParam = (searchParams.get('tipo') || 'B2B') as 'B2B' | 'B2C';
 
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [clientesData, setClientesData] = useState([...MOCK.CLIENTES].map(c => ({...c, tipo: c.tipo || 'B2B', puntosEntrega: []})));
 
  const selected = useMemo(() => idParam ? clientesData.find(c => c.id === idParam) : null, [idParam, clientesData]);
  const filtered = useMemo(() => clientesData.filter(s => s.tipo === tipoParam && (filter === 'all' || s.estado === filter) && (!q || (s.name || s.nombre || '').toLowerCase().includes(q.toLowerCase()))), [q, filter, clientesData, tipoParam]);
 
  const handleSaveForm = (data: any) => {
    let newId = data.id || `C-${Math.floor(1000 + Math.random() * 9000)}`;
    setClientesData(prev => data.id ? prev.map(c => c.id === data.id ? data : c) : [...prev, { ...data, id: newId }]);
    router.push(`?id=${newId}&action=view&tipo=${tipoParam}`);
  };
 
  if (actionParam === 'create') return <ClienteDetail isCreate={true} defaultTipo={tipoParam} onClose={() => router.push(`/dashboard/clientes?tipo=${tipoParam}`)} onSave={handleSaveForm} />;
  if (selected) return <ClienteDetail cliente={selected} onClose={() => router.push(`/dashboard/clientes?tipo=${tipoParam}`)} onSave={actionParam === 'edit' ? handleSaveForm : undefined} />;
 
  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div><h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight">Clientes ({tipoParam})</h1><p className="text-sm text-[#5C7480]">{filtered.length} registros</p></div>
        <button className="btn btn-solid" onClick={() => router.push(`?tipo=${tipoParam}&action=create`)}><Plus size={14}/> Nuevo {tipoParam === 'B2B' ? 'cliente' : 'consumidor'}</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-4 bg-white">
          <div className="flex-1 max-w-sm bg-ink-50 rounded-xl px-4 py-2 flex items-center gap-3"><Search size={14} className="text-ink-400"/><input placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-full" value={q} onChange={e => setQ(e.target.value)}/></div>
          <div className="flex bg-ink-50 p-1 rounded-xl gap-1">
            {[['all','Todos'],['active','Activos'],['inactive','Inactivos']].map(([k,l]) => (
              <span key={k} className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filter === k ? 'bg-white text-primary shadow-sm' : 'text-ink-500'}`} onClick={() => setFilter(k)}>{l}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">{tipoParam === 'B2B' ? 'Empresa / Negocio' : 'Consumidor Final'}</th>
                {tipoParam === 'B2B' && <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Rep. Legal</th>}
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Contacto</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Ubicación</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(s => (
                <tr key={s.id} onClick={() => router.push(`?id=${s.id}&action=view&tipo=${tipoParam}`)} className="hover:bg-ink-50/50 cursor-pointer group transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] flex items-center justify-center text-white font-bold text-[12px] shadow-sm shrink-0">
                        {s.tipo === 'B2C' ? initials(s.name) : <Building size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[13px] group-hover:text-primary transition-colors truncate">{s.name}</div>
                        <div className="text-[10px] text-ink-400 font-mono tracking-tighter uppercase">{s.rfc || 'Sin RFC'}</div>
                      </div>
                    </div>
                  </td>
                  
                  {tipoParam === 'B2B' && (
                    <td className="px-4 py-3">
                       <div className="text-[13px] font-semibold text-ink-900">{s.repName || 'No registrado'}</div>
                       <div className="text-[10px] text-ink-400 font-bold uppercase tracking-tighter">Apoderado Legal</div>
                    </td>
                  )}

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                       <div className="text-[13px] font-semibold text-ink-900 flex items-center gap-1.5">
                         {s.contactName}
                       </div>
                       <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[11px] text-ink-500 flex items-center gap-1"><Mail size={10} /> {s.contactEmail}</span>
                         <span className="text-[11px] text-ink-500 flex items-center gap-1"><Phone size={10} /> {s.contactPhone}</span>
                       </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{s.fiscalCity || 'Nacional'}</div>
                    <div className="text-[10px] text-ink-400 font-bold uppercase tracking-tighter">{s.zone || 'Zona Centro'}</div>
                  </td>

                  <td className="px-4 py-3"><StatusPill s={s.estado}/></td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" 
                              onClick={(e) => { e.stopPropagation(); router.push(`?id=${s.id}&action=view&tipo=${tipoParam}`); }} title="Ver Detalle"><Eye size={14}/></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" 
                              onClick={(e) => { e.stopPropagation(); router.push(`?id=${s.id}&action=edit&tipo=${tipoParam}`); }} title="Editar"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={tipoParam === 'B2B' ? 6 : 5} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Search size={40} className="mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">No se encontraron clientes {tipoParam}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
