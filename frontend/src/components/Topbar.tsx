import React from 'react';
import { Search, Calendar, Bell } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="h-[68px] bg-white border-b border-[#ECF1F3] flex items-center px-7 gap-4 flex-shrink-0">
      <div className="flex-1 max-w-[480px] bg-[#F4F7F9] rounded-xl border border-transparent focus-within:border-[#D9E2E6] focus-within:bg-white flex items-center gap-3 px-4 py-2.5 transition-all">
        <Search size={16} className="text-[#5C7480]" />
        <input placeholder="Buscar dashboard, envíos, conductores…" className="flex-1 bg-transparent border-none outline-none text-sm text-[#0E2A3A] placeholder:text-[#8497A0] font-medium" />
        <kbd className="text-[10px] font-mono text-[#8497A0] bg-white border border-[#D9E2E6] px-1.5 py-0.5 rounded-md shadow-sm">⌘ K</kbd>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl hover:bg-[#F4F7F9] text-[#2C4654] transition-colors flex items-center justify-center relative"><Calendar size={18} /></button>
        <button className="w-10 h-10 rounded-xl hover:bg-[#F4F7F9] text-[#2C4654] transition-colors flex items-center justify-center relative">
          <Bell size={18} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E15B5B] border-2 border-white rounded-full"></span>
        </button>
      </div>
      <div className="w-px h-6 bg-[#D9E2E6] mx-2" />
      <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-[#F4F7F9] cursor-pointer transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A8FBF] to-[#4CB89C] text-white flex items-center justify-center font-bold text-[11px] shadow-lg border-2 border-white">KS</div>
        <div className="hidden sm:block leading-none">
          <div className="text-[13px] font-bold text-[#0E2A3A]">Kevin Salazar</div>
          <div className="text-[11px] font-medium text-[#5C7480] mt-0.5">Administrador</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
