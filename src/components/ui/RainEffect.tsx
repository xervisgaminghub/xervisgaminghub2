import { useEffect, useRef } from 'react';

export default function RainEffect() {
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

    const drops: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];
    const dropCount = 150;

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 15 + 10,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    let lightningCounter = 0;
    let isLightning = false;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw lightning flash occasionally
      if (Math.random() > 0.995 && lightningCounter === 0) {
        isLightning = true;
        lightningCounter = 10;
      }

      if (isLightning) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        ctx.fillRect(0, 0, width, height);
        lightningCounter--;
        if (lightningCounter <= 0) isLightning = false;
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      drops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 2, drop.y + drop.length);
        ctx.stroke();
        ctx.globalAlpha = drop.opacity;

        drop.y += drop.speed;
        drop.x += 1; // Slanted rain

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
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
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[1]" 
      style={{ opacity: 0.6 }}
    />
  );
}
