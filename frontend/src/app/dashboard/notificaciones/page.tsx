'use client';

import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const NOTIF_MOCK = [
  { id: 1, type: 'incident', title: 'Nuevo incidente reportado', desc: 'Driver Roberto Gómez reportó "Cliente Ausente" en Viaje V-901.', time: 'Hace 5 min', icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  { id: 2, type: 'order', title: 'Nueva Orden de Servicio', desc: 'Mercado El Sol ha creado una nueva orden ORD-5504.', time: 'Hace 15 min', icon: Bell, color: 'text-blue-500 bg-blue-50' },
  { id: 3, type: 'trip', title: 'Viaje Completado', desc: 'El viaje V-899 ha sido finalizado con éxito.', time: 'Hace 1 hora', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
  { id: 4, type: 'system', title: 'Mantenimiento Programado', desc: 'El sistema entrará en mantenimiento el domingo a las 02:00 AM.', time: 'Hace 3 horas', icon: Info, color: 'text-ink-500 bg-ink-50' },
];

export default function Notificaciones() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0E2A3A] tracking-tight mb-2 flex items-center gap-3">
          Centro de Notificaciones <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">5</span>
        </h1>
        <p className="text-sm text-[#5C7480] font-medium">Alertas operativas y actualizaciones del sistema en tiempo real</p>
      </div>

      <div className="max-w-2xl space-y-3">
        {NOTIF_MOCK.map(n => (
          <div key={n.id} className="card hover:shadow-md transition-shadow cursor-pointer border-transparent hover:border-ink-100 group">
            <div className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-ink-900 group-hover:text-primary transition-colors">{n.title}</h3>
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">{n.time}</span>
                </div>
                <p className="text-sm text-ink-500 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          </div>
        ))}
        
        <button className="w-full py-4 text-xs font-bold text-ink-400 uppercase tracking-widest hover:text-ink-600 transition-colors">
          Cargar notificaciones anteriores
        </button>
      </div>
    </>
  );
}
