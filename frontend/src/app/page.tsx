'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cargalo.mx');
  const [pwd, setPwd] = useState('cargalo2026');
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !pwd) { setErr('Completa todos los campos.'); return; }
    setLoading(true);
    setTimeout(() => {
      if (pwd.length < 4) { setErr('Credenciales incorrectas.'); setLoading(false); return; }
      router.push('/dashboard/inicio');
    }, 700);
  };

  return (
    <div className="login-screen h-screen flex bg-gradient-to-br from-[#2BA0C5] via-[#3DAFAA] to-[#66D6B5] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-white/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-end pr-[8vw] text-white relative z-10">
        <h1 className="text-[120px] font-extrabold leading-[0.85] tracking-tighter m-0">¡Hola!</h1>
        <p className="text-[26px] font-normal opacity-90 mt-4">Bienvenido a Cárgalo</p>
      </div>

      <div className="w-1/2 flex items-center justify-center relative z-10">
        <form className="bg-white rounded-[32px] p-[56px] w-full max-w-[520px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.18)]" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A8FBF] to-[#2FA89D] flex items-center justify-center shadow-lg">
              <Car className="text-white w-8 h-8" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0E2A3A]">Cárgalo<sup className="text-xs opacity-50 ml-0.5">®</sup></span>
          </div>
          
          <h2 className="text-center text-[20px] font-bold text-[#0E2A3A] mb-8">Iniciar sesión</h2>

          {err && <div className="text-center p-3 mb-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-semibold">{err}</div>}

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Correo electrónico*"
              className="w-full p-4 border border-[#D9E2E6] rounded-xl outline-none focus:border-[#1A8FBF] focus:ring-4 focus:ring-[#1A8FBF]/10 transition-all text-sm text-[#0E2A3A]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña*"
              className="w-full p-4 border border-[#D9E2E6] rounded-xl outline-none focus:border-[#1A8FBF] focus:ring-4 focus:ring-[#1A8FBF]/10 transition-all text-sm text-[#0E2A3A]"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-[13px] my-8 px-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#2C4654] font-medium select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#B6C4CB] text-[#1A8FBF] focus:ring-[#1A8FBF]"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordar mi contraseña
            </label>
            <Link href="/recuperar" className="text-[#1A8FBF] font-bold hover:underline cursor-pointer">Olvidé mi contraseña</Link>
          </div>

          <button type="submit" className="btn-primary">
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <div className="text-center mt-8 text-[12px] text-[#8497A0] font-medium">
            ¿No tienes acceso? Contacta a <code className="bg-[#F4F7F9] px-1.5 py-0.5 rounded text-[#2C4654] font-mono">soporte@cargalo.mx</code>
          </div>
        </form>
      </div>
    </div>
  );
}
