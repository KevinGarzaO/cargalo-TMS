'use client';

import React, { useState, useMemo } from 'react';
import { Download, Plus, Search, Filter, Eye, Edit, MoreHorizontal, AlertTriangle, User, Calendar, MapPin, CheckCircle2, Clock, MessageSquare, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const MOCK_INCIDENTES = [
  { id: 'INC-8801', viajeId: 'V-901', driver: 'Roberto Gómez', tipo: 'Cliente Ausente', fecha: '2025-04-22 10:30', estado: 'Pendiente', descripcion: 'El cliente no se encontraba en el domicilio al momento de la entrega.', evidencia: true },
  { id: 'INC-8802', viajeId: 'V-902', driver: 'Ana Martínez', tipo: 'Mercancía Dañada', fecha: '2025-04-22 11:15', estado: 'En Revisión', descripcion: 'Una caja de TecnoStock llegó con el empaque roto.', evidencia: true },
  { id: 'INC-8803', viajeId: 'V-899', driver: 'Juan Pérez', tipo: 'Retraso de Tráfico', fecha: '2025-04-21 16:00', estado: 'Resuelto', descripcion: 'Bloqueo en Av. Insurgentes, se reprogramó para mañana.', evidencia: false },
];

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { label: string, colorClass: string }> = { 
    'Pendiente': { label: "Pendiente", colorClass: "text-[#C23A22] bg-[#FDE2E1]" }, 
    'En Revisión': { label: "En Revisión", colorClass: "text-[#B07217] bg-[#FDF1DF]" }, 
    'Resuelto': { label: "Resuelto", colorClass: "text-[#2C8B6E] bg-[#E6F4EE]" } 
  };
  const status = map[s] || { label: s, colorClass: "text-ink-600 bg-ink-100" };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.colorClass}`}>{status.label}</span>;
}

function IncidenteDetail({ incidente, onClose, onResolve }: { incidente: any, onClose: () => void, onResolve: (r: string) => void }) {
  const [resolution, setResolution] = useState("");

  return (
    <div className="detail-shell">
      <div className="detail-map" style={{ background: '#FDE2E1', backgroundImage: 'url("/map-bg.png")', backgroundBlendMode: 'multiply', backgroundSize: 'cover' }}>
        <div className="detail-back" onClick={onClose} title="Volver">
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
        </div>
      </div>
      <div className="detail-header">
        <div className="detail-avatar">
          <div className="avatar-img flex items-center justify-center bg-gradient-to-tr from-[#E15B5B] to-[#F2A23C] text-white font-extrabold text-3xl">
            <AlertTriangle size={40} />
          </div>
        </div>
        <div className="detail-meta">
          <div className="detail-meta-top flex justify-between items-start w-full pr-4">
            <div>
              <h1>{incidente.id} · {incidente.tipo}</h1>
              <div className="detail-tags"><StatusPill s={incidente.estado} /><span className="gender">Viaje {incidente.viajeId}</span></div>
            </div>
          </div>
          <div className="detail-contact">
             <div className="item"><User size={15} className="ico" /><div className="label-stack">{incidente.driver}</div></div>
             <div className="item"><Clock size={15} className="ico" /><div className="label-stack">{incidente.fecha}</div></div>
          </div>
        </div>
      </div>

      <div className="detail-cards grid grid-cols-2 gap-5 mt-8">
        <div className="dcard h-fit">
          <div className="dcard-header" style={{ background: '#C23A22' }}>Descripción del Incidente</div>
          <div className="dcard-body">
            <p className="text-sm text-ink-900 leading-relaxed mb-4">{incidente.descripcion}</p>
            {incidente.evidencia && (
              <div className="p-4 bg-ink-50 rounded-xl border border-ink-200 flex items-center gap-3">
                <ImageIcon size={20} className="text-ink-400" />
                <span className="text-xs font-bold text-ink-600 cursor-pointer hover:text-primary">Ver evidencia fotográfica (1)</span>
              </div>
            )}
          </div>
        </div>

        <div className="dcard h-fit border-2 border-primary/20">
          <div className="dcard-header bg-primary">Resolución del Dispatcher</div>
          <div className="dcard-body">
            {incidente.estado === 'Resuelto' ? (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="text-xs font-bold text-primary mb-1">Resuelto por Administrador</div>
                <p className="text-sm text-ink-900 italic">"Se contactó al cliente y se acordó entrega en sucursal alterna."</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  className="val-select w-full min-h-[100px] text-sm" 
                  placeholder="Escribe la resolución o acciones tomadas..."
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="btn btn-ghost flex-1 text-xs" onClick={() => onResolve("En Revisión")}>Marcar en Revisión</button>
                  <button className="btn btn-solid flex-1 text-xs" onClick={() => onResolve("Resuelto")}>Resolver Incidente</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Incidentes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const [data, setData] = useState(MOCK_INCIDENTES);

  const selected = useMemo(() => data.find(i => i.id === idParam), [idParam, data]);

  const handleResolve = (newStatus: string) => {
    setData(prev => prev.map(i => i.id === idParam ? { ...i, estado: newStatus } : i));
  };

  if (selected) return <IncidenteDetail incidente={selected} onClose={() => router.push('/dashboard/incidentes')} onResolve={handleResolve} />;

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight">Incidentes en Ruta</h1><p className="text-sm text-[#5C7480] font-medium">Gestión de alertas y bloqueos reportados por conductores</p></div>
        <button className="btn btn-ghost"><Download size={14}/>Reporte Crítico</button>
      </div>

      <div className="card p-0 overflow-hidden border-red-100 shadow-sm shadow-red-50">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-red-50/30 border-b border-red-100 text-[11px] font-bold text-red-800/60 uppercase tracking-widest">
              <th className="px-4 py-3">Tipo / ID</th>
              <th className="px-4 py-3">Conductor</th>
              <th className="px-4 py-3">Viaje</th>
              <th className="px-4 py-3">Fecha Reporte</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-[11px] font-bold text-red-800/60 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-50">
            {data.map(i => (
              <tr key={i.id} className="hover:bg-red-50/20 cursor-pointer group" onClick={() => router.push(`?id=${i.id}`)}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i.estado === 'Pendiente' ? 'bg-red-100 text-red-600' : 'bg-ink-100 text-ink-400'}`}><AlertTriangle size={16} /></div>
                    <div><div className="font-bold text-[13px]">{i.tipo}</div><div className="text-[11px] text-ink-400">{i.id}</div></div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] font-semibold">{i.driver}</td>
                <td className="px-4 py-4 text-[13px] font-bold text-primary">{i.viajeId}</td>
                <td className="px-4 py-4 text-[13px] text-ink-500">{i.fecha}</td>
                <td className="px-4 py-4"><StatusPill s={i.estado}/></td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-red-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${i.id}`); }} title="Ver Detalle"><Eye size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
