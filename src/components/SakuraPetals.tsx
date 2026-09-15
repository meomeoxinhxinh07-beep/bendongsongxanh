import React, { useEffect, useRef } from 'react';

interface SakuraPetalsProps {
  enabled: boolean;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  swaySpeed: number;
  swayOffset: number;
  colorType: number;
}

export const SakuraPetals: React.FC<SakuraPetalsProps> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Track mouse for gentle interactive flutter breeze
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Petal color palettes: delicate translucent sakura pinks
    const petalColors = [
      { start: 'rgba(255, 192, 203, 0.85)', end: 'rgba(255, 228, 235, 0.65)' }, // Classic soft sakura pink
      { start: 'rgba(255, 182, 193, 0.9)', end: 'rgba(255, 240, 245, 0.7)' },  // Light pink
      { start: 'rgba(251, 113, 133, 0.75)', end: 'rgba(254, 205, 211, 0.6)' }, // Warm rosy blush
      { start: 'rgba(244, 114, 182, 0.8)', end: 'rgba(252, 231, 243, 0.65)' }, // Gentle pastel pink
      { start: 'rgba(255, 218, 224, 0.85)', end: 'rgba(255, 245, 247, 0.6)' }, // Very soft white-pink
    ];

    // Initialize dainty, small petals (petals are 7px - 13px in radius)
    // 28 petals on desktop, 16 on mobile to keep it serene and lightweight
    const petalCount = window.innerWidth < 768 ? 16 : 28;

    const createPetal = (initialY?: number): Petal => ({
      x: Math.random() * width,
      y: initialY !== undefined ? initialY : Math.random() * height - 20,
      size: 6.5 + Math.random() * 5.5, // Dainty, small sizes (around 6.5px - 12px)
      speedY: 0.65 + Math.random() * 0.95, // Gentle slow fall
      speedX: 0.2 + Math.random() * 0.5,   // Ambient slight rightward breeze
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.015 + Math.random() * 0.025, // 3D tumbling effect
      opacity: 0.55 + Math.random() * 0.35,
      swaySpeed: 0.012 + Math.random() * 0.016,
      swayOffset: Math.random() * Math.PI * 2,
      colorType: Math.floor(Math.random() * petalColors.length),
    });

    petalsRef.current = Array.from({ length: petalCount }, () => createPetal());

    /**
     * Draw an authentic sakura cherry blossom petal
     * Uses cubic Bezier curves with the iconic top notch cleft and soft curved base
     */
    const drawSakuraPetal = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      flip: number,
      opacity: number,
      colorIndex: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      // Simulate 3D flipping in wind by scaling the X axis
      const flipScale = Math.cos(flip);
      c.scale(flipScale, 1);

      c.globalAlpha = opacity;

      // Create subtle radial gradient across petal for realistic depth
      const color = petalColors[colorIndex % petalColors.length];
      const grad = c.createLinearGradient(0, size, 0, -size);
      grad.addColorStop(0, color.start);
      grad.addColorStop(1, color.end);
      c.fillStyle = grad;

      // Authentic sakura petal shape with top notch
      // Width is proportional to size * 0.7, height is size * 1.4
      const w = size * 0.72;
      const h = size * 1.35;

      c.beginPath();
      // Start at base point (bottom)
      c.moveTo(0, h * 0.45);
      // Left curve going up
      c.bezierCurveTo(-w * 0.85, h * 0.15, -w, -h * 0.4, -w * 0.35, -h * 0.5);
      // Sakura signature notch at the tip
      c.bezierCurveTo(-w * 0.15, -h * 0.42, 0, -h * 0.38, 0, -h * 0.4);
      c.bezierCurveTo(0, -h * 0.38, w * 0.15, -h * 0.42, w * 0.35, -h * 0.5);
      // Right curve going down back to base
      c.bezierCurveTo(w, -h * 0.4, w * 0.85, h * 0.15, 0, h * 0.45);
      c.closePath();
      c.fill();

      // Delicate faint center vein highlight
      c.beginPath();
      c.moveTo(0, h * 0.35);
      c.quadraticCurveTo(w * 0.05, -h * 0.1, 0, -h * 0.32);
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.lineWidth = 0.65;
      c.stroke();

      c.restore();
    };

    let tick = 0;

    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < petalsRef.current.length; i++) {
        const p = petalsRef.current[i];

        // 1. Natural floating physics: gentle sway + vertical fall
        const sway = Math.sin(tick * p.swaySpeed + p.swayOffset) * 0.75;
        p.x += p.speedX + sway;
        p.y += p.speedY;

        // 2. 3D Tumbling & Rotation
        p.angle += p.angularSpeed;
        p.flip += p.flipSpeed;

        // 3. Interactive breeze: if mouse cursor comes close, push petal gently
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 90;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force * 0.5;
            p.flip += force * 0.05;
          }
        }

        // 4. Wrap around screen smoothly
        if (p.y > height + 25) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 25) {
          p.x = -20;
        } else if (p.x < -25) {
          p.x = width + 20;
        }

        // 5. Render petal
        drawSakuraPetal(
          ctx,
          p.x,
          p.y,
          p.size,
          p.angle,
          p.flip,
          p.opacity,
          p.colorType
        );
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Pause animation when page tab is hidden to conserve GPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      } else if (enabled && !animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      id="sakura-petals-canvas"
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-20 transition-opacity duration-700 ${
        enabled ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ willChange: 'transform, opacity' }}
    />
  );
};
