'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ChevronLeft, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="login-screen h-screen flex bg-gradient-to-br from-[#2BA0C5] via-[#3DAFAA] to-[#66D6B5] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-white/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-end pr-[8vw] text-white relative z-10">
        <h1 className="text-[76px] font-extrabold leading-[1.1] tracking-tight m-0 text-right">No te preocupes</h1>
        <p className="text-[34px] font-medium opacity-90 mt-0 text-right">Recupera tu contraseña</p>
      </div>

      <div className="w-1/2 flex items-center justify-center relative z-10">
        <form className="bg-white rounded-[24px] p-[56px] w-full max-w-[480px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.18)]" onSubmit={handleSubmit}>
          
          {success && (
            <div className="mb-6 flex items-start gap-3 bg-[#E6F5EC] border border-[#2C8B6E]/20 text-[#2C8B6E] p-4 rounded-xl relative">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p className="text-[13px] font-bold leading-snug">
                Te hemos enviado un enlace para que<br/>puedas restablecer tu contraseña.
              </p>
              <button type="button" onClick={() => setSuccess(false)} className="absolute top-4 right-4 text-[#2C8B6E]/60 hover:text-[#2C8B6E]">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A8FBF] to-[#2FA89D] flex items-center justify-center shadow-lg">
              <Car className="text-white w-8 h-8" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0E2A3A]">Cárgalo<sup className="text-xs opacity-50 ml-0.5">®</sup></span>
          </div>
          
          <h2 className="text-center text-[22px] font-bold text-[#0E2A3A] mb-4">Restablece tu contraseña</h2>
          <p className="text-[#5C7480] text-[13px] leading-relaxed mb-6">
            Enviaremos un enlace a tu correo electrónico para restablecer tu contraseña.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            <input
              type="email"
              placeholder="Correo electrónico*"
              className="w-full p-3.5 border border-[#D9E2E6] rounded-lg outline-none focus:border-[#1A8FBF] focus:ring-4 focus:ring-[#1A8FBF]/10 transition-all text-[13px] text-[#0E2A3A]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success}
            />
          </div>

          <button type="submit" className="w-full bg-[#0E6E97] hover:bg-[#1A8FBF] text-white font-bold py-3.5 px-6 rounded-lg transition-colors text-[13px]" disabled={loading || success}>
            {loading ? 'Enviando…' : 'Recuperar contraseña'}
          </button>

          <div className="text-center mt-10">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-[13px] text-[#1A8FBF] font-medium hover:underline transition-all">
              <ChevronLeft size={16} /> Regresar a inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
