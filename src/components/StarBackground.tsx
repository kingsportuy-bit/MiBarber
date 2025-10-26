"use client";

import { useEffect, useRef } from 'react';

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar el canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas con estilo Qoder
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      type: 'dot' | 'glow' | 'code';
    }> = [];

    // Crear puntos normales
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        color: '#ffffff',
        type: 'dot'
      });
    }

    // Crear puntos brillantes (estilo Qoder)
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.6 + 0.4,
        color: ['#6366f1', '#8b5cf6', '#0ea5e9'][Math.floor(Math.random() * 3)],
        type: 'glow'
      });
    }

    // Crear "partículas de código" (estilo Qoder)
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        color: ['#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 3)],
        type: 'code'
      });
    }

    // Animación
    let animationId: number;
    
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar gradient de fondo estilo Qoder
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f1720');
      gradient.addColorStop(0.5, '#1a2436');
      gradient.addColorStop(1, '#0f1720');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar líneas de grid sutiles
      ctx.strokeStyle = 'rgba(45, 61, 88, 0.1)';
      ctx.lineWidth = 1;
      
      // Líneas verticales
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Líneas horizontales
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Actualizar y dibujar partículas
      particles.forEach(particle => {
        // Mover partícula
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Efecto de parpadeo
        particle.alpha += (Math.random() - 0.5) * 0.02;
        particle.alpha = Math.max(0.1, Math.min(1, particle.alpha));
        
        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Mantener dentro del canvas
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Dibujar partícula según su tipo
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        
        switch (particle.type) {
          case 'dot':
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'glow':
            // Efecto de brillo
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = particle.radius * 3;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'code':
            // Efecto de partícula de código
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = particle.radius * 2;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            // Dibujar formas de caracteres de código
            if (Math.random() > 0.5) {
              // Círculo
              ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            } else {
              // Cuadrado
              ctx.fillRect(particle.x - particle.radius, particle.y - particle.radius, particle.radius * 2, particle.radius * 2);
            }
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}