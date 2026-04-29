import React, { useState, useRef } from 'react';

export default function ZoomableImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPos({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center cursor-zoom-in ${className || ''}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Base Image */}
      <img 
        src={src} 
        alt={alt} 
        className={`max-w-full max-h-full object-contain transition-opacity duration-150 ${zoom ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {/* Zoomed Image Overlay */}
      {zoom && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundSize: '250%', // Adjust this for more/less zoom
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
    </div>
  );
}
