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

    const colors = ['#ffffff', '#00E5FF', '#ffffff', '#70a1ff', '#ffffff'];
    const starCount = 350;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.1,
        speed: Math.random() * 0.05 + 0.01,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(star => {
        // Star movement
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Twinkle factor
        star.opacity += star.twinkle;
        if (star.opacity > 1 || star.opacity < 0.3) {
          star.twinkle = -star.twinkle;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle glow to larger stars
        if (star.size > 1.2) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      });

      ctx.globalAlpha = 1;
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
      {/* Distant cosmic clouds/nebula blobs */}
      <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ opacity: 0.8 }}
      />
    </div>
  );
}
