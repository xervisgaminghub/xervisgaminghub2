import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { 
      x: number; 
      y: number; 
      size: number;
      speed: number;
      opacity: number;
      twinkle: number;
      color: string;
    }[] = [];

    const starCount = 150;
    const colors = ['#00E5FF', '#ffffff', '#ffffff', '#70a1ff', '#ffffff'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(star => {
        // Drift movement
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Twinkle factor
        star.opacity += star.twinkle;
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkle = -star.twinkle;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (star.size > 1.2) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Tactical Glow Elements */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-red/3 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />

      {/* Vertical Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/[0.02] to-transparent h-24 w-full animate-sweep opacity-30" style={{ animationDuration: '8s' }} />
    </div>
  );
}
