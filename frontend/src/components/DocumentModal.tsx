import React, { useEffect } from 'react';
import { X, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import ZoomableImage from './ZoomableImage';

interface DocumentModalProps {
  url: string;
  type: 'image' | 'pdf';
  title: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function DocumentModal({ url, type, title, onClose, onNext, onPrev }: DocumentModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-white font-bold text-lg flex items-center gap-2 drop-shadow-md">
          {type === 'pdf' ? <FileText size={20} /> : null}
          {title}
        </div>
        <div className="flex gap-4">
          <a href={url} target="_blank" rel="noreferrer" download className="text-white/80 hover:text-white transition-colors" title="Descargar">
            <Download size={24} />
          </a>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" title="Cerrar">
            <X size={24} />
          </button>
        </div>
      </div>

      {onPrev && (
        <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10">
          <ChevronLeft size={40} />
        </button>
      )}

      <div className="w-full h-full max-w-5xl max-h-[85vh] mt-12 bg-[#0E2A3A]/20 rounded-xl overflow-hidden flex items-center justify-center relative shadow-2xl ring-1 ring-white/10">
        {type === 'image' ? (
          <ZoomableImage src={url} alt={title} className="w-full h-full" />
        ) : (
          <iframe 
            src={`${url}#toolbar=0`} 
            className="w-full h-full border-none bg-white"
            title={title}
          />
        )}
      </div>

      {onNext && (
        <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
          <ChevronRight size={40} />
        </button>
      )}
      
      <div className="absolute inset-0 z-[-1]" onClick={onClose}></div>
    </div>
  );
}
