'use client';

import React, { useState, useMemo } from 'react';
import { Download, Plus, Search, Filter, Eye, Edit, MoreHorizontal, Package, User, Calendar, MapPin, CheckCircle2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const MOCK_ORDENES = [
  { id: 'ORD-5501', cliente: 'Mercado El Sol', fecha: '2025-04-22', items: 12, estado: 'Nueva', total: 4500, contacto: 'Lorena Pérez', direccion: 'Av. Reforma 222, CDMX' },
  { id: 'ORD-5502', cliente: 'TecnoStock', fecha: '2025-04-22', items: 3, estado: 'Asignada', total: 12800, contacto: 'Mariana López', direccion: 'Industrial Vallejo, CDMX' },
  { id: 'ORD-5503', cliente: 'Boutique Camelia', fecha: '2025-04-21', items: 25, estado: 'Completada', total: 8900, contacto: 'Andrés Ruiz', direccion: 'Providencia, GDL' },
];

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { label: string, colorClass: string }> = { 
    'Nueva': { label: "Nueva", colorClass: "text-[#0E6E97] bg-[#E6F2F7]" }, 
    'Asignada': { label: "Asignada", colorClass: "text-[#B07217] bg-[#FDF1DF]" }, 
    'Completada': { label: "Completada", colorClass: "text-[#2C8B6E] bg-[#E6F4EE]" },
    'Cancelada': { label: "Cancelada", colorClass: "text-[#C23A22] bg-[#FDE2E1]" } 
  };
  const status = map[s] || { label: s, colorClass: "text-ink-600 bg-ink-100" };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.colorClass}`}>{status.label}</span>;
}

function OrderEditor({ onClose, onSave }: { onClose: () => void, onSave: (o: any) => void }) {
  const [formData, setFormData] = useState({ cliente: '', contacto: '', direccion: '', items: [] as any[] });

  return (
    <div className="val-shell">
      <div className="val-progress-row">
        <div className="val-progress-title">Crear Nueva Orden de Servicio</div>
        <div className="val-progress-count">Paso 1 de 1</div>
      </div>
      <div className="val-grid">
        <div className="val-form">
          <div className="val-step-card">
            <div className="val-step-title">1. Datos del Cliente y Pedido</div>
            <div className="val-q"><div className="val-field"><label className="val-field-label">Cliente*</label><input className="val-select" placeholder="Buscar cliente..." /></div></div>
            <div className="val-q mt-6"><div className="val-field"><label className="val-field-label">Dirección de Recolección/Entrega*</label><input className="val-select" placeholder="Dirección completa..." /></div></div>
            <div className="val-q mt-6"><div className="val-field"><label className="val-field-label">Artículos / Items</label><div className="p-4 border border-dashed border-ink-200 rounded-xl text-center text-xs text-ink-400">No hay artículos agregados. <span className="text-primary font-bold cursor-pointer">+ Agregar Item</span></div></div></div>
            <div className="val-actions mt-8"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-solid" onClick={() => onSave(formData)}>Crear Orden</button></div>
          </div>
        </div>
        <div className="val-doc val-doc-sticky">
           <div className="val-doc-tabs"><button className="val-doc-tab active">Evidencias / Fotos</button></div>
           <div className="val-doc-viewer" style={{ minHeight: '400px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <ImageIcon size={32} className="text-ink-200 mb-2" />
             <p className="text-xs text-ink-400">Las fotos subidas por el cliente vía WhatsApp aparecerán aquí.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: any, onClose: () => void }) {
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
            <Package size={40} />
          </div>
        </div>
        <div className="detail-meta">
          <div className="detail-meta-top flex justify-between items-start w-full pr-4">
            <div>
              <h1>{order.id}</h1>
              <div className="detail-tags"><StatusPill s={order.estado} /><span className="gender">{order.cliente}</span></div>
            </div>
          </div>
          <div className="detail-contact">
             <div className="item"><Calendar size={15} className="ico" /><div className="label-stack">{order.fecha}</div></div>
             <div className="item"><MapPin size={15} className="ico" /><div className="label-stack">{order.direccion}</div></div>
          </div>
        </div>
      </div>
      <div className="detail-cards grid grid-cols-2 gap-5 mt-8">
        <div className="dcard h-fit">
          <div className="dcard-header">Detalle del Pedido</div>
          <div className="dcard-body">
            <div className="kv-list">
              <div className="row"><span className="k">Items:</span><span className="v font-bold">{order.items} unidades</span></div>
              <div className="row"><span className="k">Total Est.:</span><span className="v text-primary font-bold">${order.total.toLocaleString()} MXN</span></div>
              <div className="row"><span className="k">Contacto:</span><span className="v">{order.contacto}</span></div>
            </div>
          </div>
        </div>
        <div className="dcard h-fit">
          <div className="dcard-header">Trazabilidad</div>
          <div className="dcard-body">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]"><CheckCircle2 size={12}/></div>
                <div><div className="text-xs font-bold">Orden Recibida</div><div className="text-[10px] text-ink-400">22 Abr, 10:00 AM · Vía WhatsApp Bot</div></div>
              </div>
              {order.estado === 'Asignada' && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]"><Clock size={12}/></div>
                  <div><div className="text-xs font-bold">Asignada a Viaje V-901</div><div className="text-[10px] text-ink-400">22 Abr, 11:30 AM · Por Admin</div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Ordenes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const actionParam = searchParams.get('action');
  const [data, setData] = useState(MOCK_ORDENES);

  const selected = useMemo(() => data.find(o => o.id === idParam), [idParam, data]);

  if (actionParam === 'create') return <OrderEditor onClose={() => router.push('/dashboard/ordenes')} onSave={(o) => router.push('/dashboard/ordenes')} />;
  if (selected) return <OrderDetail order={selected} onClose={() => router.push('/dashboard/ordenes')} />;

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight">Órdenes de Servicio</h1><p className="text-sm text-[#5C7480] font-medium">Pedidos pendientes de asignación y despacho</p></div>
        <button className="btn btn-solid" onClick={() => router.push('?action=create')}><Plus size={14}/>Nueva Orden</button>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-ink-50/50 border-b border-ink-100 text-[11px] font-bold text-ink-400 uppercase tracking-widest">
              <th className="px-4 py-3">ID / Cliente</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-[11px] font-bold text-ink-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {data.map(o => (
              <tr key={o.id} className="hover:bg-ink-50/50 cursor-pointer group" onClick={() => router.push(`?id=${o.id}&action=view`)}>
                <td className="px-4 py-4"><div className="font-bold text-[13px]">{o.id}</div><div className="text-[11px] text-ink-400 font-medium">{o.cliente}</div></td>
                <td className="px-4 py-4 text-[13px] font-semibold">{o.items}</td>
                <td className="px-4 py-4 text-[13px] text-ink-500">{o.fecha}</td>
                <td className="px-4 py-4"><StatusPill s={o.estado}/></td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); router.push(`?id=${o.id}&action=view`); }} title="Ver Detalle"><Eye size={14}/></button>
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-500 shadow-sm border border-transparent hover:border-ink-100" onClick={(e) => { e.stopPropagation(); }} title="Editar"><Edit size={14}/></button>
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
