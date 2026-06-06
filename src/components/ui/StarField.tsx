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
    const colors = ['#00FF66', '#FFD700', '#ffffff', '#a855f7', '#ffffff'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(star => {
        // Drift movement (celebratory falling confetti style)
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
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
        
        // Render a bit more festive circles (confetti style)
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (star.size > 1.5) {
            ctx.shadowBlur = 10;
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
      {/* Tactical Glow Elements - Stadium lighting effects */}
      <div className="absolute top-[5%] left-[20%] w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[160px] animate-pulse-glow" />
      <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-red/3 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      
      {/* Grid Overlay - Stylized lawn/pitch grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00FF66 1px, transparent 1px), linear-gradient(90deg, #00FF66 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />

      {/* Vertical Scanline Effect - Stadium broadcast effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/[0.03] to-transparent h-24 w-full animate-sweep opacity-40" style={{ animationDuration: '6s' }} />
    </div>
  );
}
