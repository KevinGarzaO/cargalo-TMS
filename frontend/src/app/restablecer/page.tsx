'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Eye, EyeOff } from 'lucide-react';

export default function RestablecerPage() {
  const router = useRouter();
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd1 || !pwd2) return;
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="login-screen h-screen flex bg-gradient-to-br from-[#2BA0C5] via-[#3DAFAA] to-[#66D6B5] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-white/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-end pr-[8vw] text-white relative z-10">
        <h1 className="text-[76px] font-extrabold leading-[1.1] tracking-tight m-0 text-right">¡Listo!</h1>
        <p className="text-[34px] font-medium opacity-90 mt-0 text-right">Crea tu nueva contraseña</p>
      </div>

      <div className="w-1/2 flex items-center justify-center relative z-10">
        <form className="bg-white rounded-[24px] p-[56px] w-full max-w-[480px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.18)]" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A8FBF] to-[#2FA89D] flex items-center justify-center shadow-lg">
              <Car className="text-white w-8 h-8" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0E2A3A]">Cárgalo<sup className="text-xs opacity-50 ml-0.5">®</sup></span>
          </div>
          
          <h2 className="text-center text-[22px] font-bold text-[#0E2A3A] mb-4">Crea nueva contraseña</h2>
          <p className="text-[#5C7480] text-[13px] leading-relaxed mb-6">
            Ingresa una nueva contraseña a 10 dígitos
          </p>

          <div className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <input
                type={show1 ? "text" : "password"}
                placeholder="Nueva contraseña*"
                className="w-full p-3.5 pr-12 border border-[#D9E2E6] rounded-lg outline-none focus:border-[#1A8FBF] focus:ring-4 focus:ring-[#1A8FBF]/10 transition-all text-[13px] text-[#0E2A3A]"
                value={pwd1}
                onChange={(e) => setPwd1(e.target.value)}
              />
              <button type="button" onClick={() => setShow1(!show1)} className="absolute right-4 top-[14px] text-[#0E2A3A] hover:text-[#1A8FBF] transition-colors">
                {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={show2 ? "text" : "password"}
                placeholder="Confirmar contraseña*"
                className="w-full p-3.5 pr-12 border border-[#D9E2E6] rounded-lg outline-none focus:border-[#1A8FBF] focus:ring-4 focus:ring-[#1A8FBF]/10 transition-all text-[13px] text-[#0E2A3A]"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
              />
              <button type="button" onClick={() => setShow2(!show2)} className="absolute right-4 top-[14px] text-[#0E2A3A] hover:text-[#1A8FBF] transition-colors">
                {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0E6E97] hover:bg-[#1A8FBF] text-white font-bold py-3.5 px-6 rounded-lg transition-colors text-[13px]" disabled={loading}>
            {loading ? 'Guardando…' : 'Crear nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
