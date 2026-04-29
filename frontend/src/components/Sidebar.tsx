'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Building2, Truck, Package, MapPin, Wallet, BarChart3, LogOut, Car, Users, Route, Play, Bell, AlertCircle, User, ChevronDown, ChevronRight, Menu } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  // Sync open section with current route
  React.useEffect(() => {
    const detectSection = () => {
      if (pathname.includes('/inicio') || pathname.includes('/notificaciones')) return 'Principal';
      if (pathname.includes('/clientes') || pathname.includes('/drivers') || pathname.includes('/vehiculos') || pathname.includes('/administradores') || pathname.includes('/puntos-entrega')) return 'Catálogo';
      if (pathname.includes('/viajes') || pathname.includes('/ordenes') || pathname.includes('/incidentes') || pathname.includes('/generador-viajes') || pathname.includes('/monitoreo')) return 'Operación Viajes';
      if (pathname.includes('/rutas') || pathname.includes('/generador-rutas')) return 'Logística Rutas';
      return 'Principal';
    };
    
    setOpenSections({ [detectSection()]: true });
  }, [pathname]);

  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;
    if (!query) return true;
    
    const params = new URLSearchParams(query);
    let match = true;
    params.forEach((val, key) => {
      if (searchParams.get(key) !== val) match = false;
    });
    return match;
  };

  interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
    iconColor?: string;
  }

  interface SidebarSection {
    title: string;
    items: SidebarItem[];
  }
  
  const sections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'inicio', label: 'Dashboard', icon: Home, href: '/dashboard/inicio' },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell, href: '/dashboard/notificaciones', badge: '5' },
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { id: 'clientes-b2b', label: 'Clientes (B2B)', icon: Building2, href: '/dashboard/clientes?tipo=B2B' },
        { id: 'clientes-b2c', label: 'Clientes (B2C)', icon: User, href: '/dashboard/clientes?tipo=B2C' },
        { id: 'drivers', label: 'Drivers', icon: Truck, href: '/dashboard/drivers' },
        { id: 'vehiculos', label: 'Vehículos', icon: Car, href: '/dashboard/vehiculos' },
        { id: 'administradores', label: 'Administradores', icon: Users, href: '/dashboard/administradores' },
        { id: 'puntos-entrega', label: 'Puntos de Entrega', icon: MapPin, href: '/dashboard/puntos-entrega' },
      ]
    },
    {
      title: 'Operación Viajes',
      items: [
        { id: 'viajes', label: 'Viajes', icon: Package, href: '/dashboard/viajes' },
        { id: 'ordenes', label: 'Órdenes de Servicio', icon: Package, href: '/dashboard/ordenes' },
        { id: 'incidentes', label: 'Incidentes', icon: AlertCircle, iconColor: '#C23A22', href: '/dashboard/incidentes', badge: '3' },
        { id: 'generador-viajes', label: 'Generador de Viajes', icon: Play, href: '/dashboard/generador-viajes' },
        { id: 'monitoreo', label: 'Monitoreo En Vivo', icon: MapPin, href: '/dashboard/monitoreo' },
      ]
    },
    {
      title: 'Logística Rutas',
      items: [
        { id: 'rutas', label: 'Rutas', icon: Route, href: '/dashboard/rutas' },
        { id: 'generador-rutas', label: 'Generador de Rutas', icon: Package, href: '/dashboard/generador-rutas' },
        { id: 'monitoreo-rutas', label: 'Monitoreo En Vivo', icon: MapPin, href: '/dashboard/monitoreo-rutas' },
      ]
    }
  ];

  const toggleSection = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSections({ [title]: true }); // Open only this one
      return;
    }
    setOpenSections(prev => ({ 
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), // Close others
      [title]: !prev[title] 
    }));
  };

  return (
    <aside className={`${isCollapsed ? 'w-[80px]' : 'w-[280px]'} bg-[#0E2A3A] flex flex-col p-4 gap-1 h-screen transition-all duration-300 ease-in-out overflow-hidden text-[#C9D6DC] border-r border-white/5`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pb-8 pt-2 px-2`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] flex items-center justify-center shadow-lg">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">Cárgalo<sup className="text-[10px] opacity-50 ml-0.5">®</sup></span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors ${isCollapsed ? 'bg-white/5' : ''}`}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sidebar-scroll space-y-1 mt-2">
        {sections.map((section, idx) => (
          <div key={idx} className="border-b border-white/5 last:border-0 pb-1 mb-1">
            <div 
              onClick={() => toggleSection(section.title)}
              className={`text-[10px] font-black tracking-[0.15em] uppercase text-[#5C7480] px-3 py-3 flex items-center justify-between cursor-pointer hover:text-white/60 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed ? (
                <>
                  <span>{section.title}</span>
                  {openSections[section.title] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </>
              ) : (
                <div className="h-px w-4 bg-white/10" />
              )}
            </div>
            
            {(openSections[section.title] || isCollapsed) && (
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    title={isCollapsed ? item.label : ''}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-[#2BA0C5] to-[#4CB89C] text-white shadow-lg shadow-primary/20' 
                        : 'hover:bg-white/10 text-[#C9D6DC]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon size={18} style={{ color: item.iconColor }} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`mt-auto bg-white/5 border border-white/5 ${isCollapsed ? 'p-2 items-center' : 'p-3.5'} rounded-2xl flex gap-3 transition-all`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white/10 shrink-0">KS</div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm truncate">Kevin Salazar</div>
            <div className="text-[#93A6AE] text-[11px] font-medium truncate">admin@cargalo.mx</div>
          </div>
        )}
        {!isCollapsed && (
          <Link href="/" className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors">
            <LogOut size={16} />
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
