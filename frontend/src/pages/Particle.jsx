import { useEffect, useRef } from "react";

export default function ParticleBackground({
  color = "99, 102, 241",
  count = 180,
  maxDistance = 120,
  speed = 0.4,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = 0;
    let height = 0;
    let particles = [];
    let pointer = { x: 0, y: 0, active: false };

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        r: Math.random() * 1.8 + 1.2,
      }));
    };

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.06;
        p.vy += (Math.random() - 0.5) * 0.06;

        const drift = Math.hypot(p.vx, p.vy) || 1;
        if (drift > speed * 1.8) {
          p.vx = (p.vx / drift) * speed * 1.8;
          p.vy = (p.vy / drift) * speed * 1.8;
        }

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;

          if (dist < 160) {
            const push = (160 - dist) / 160;
            p.vx += (dx / dist) * push * 1.6;
            p.vy += (dy / dist) * push * 1.6;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) {
          p.vx *= -1;
          p.x = Math.min(Math.max(p.x, 0), width);
        }

        if (p.y <= 0 || p.y >= height) {
          p.vy *= -1;
          p.y = Math.min(Math.max(p.y, 0), height);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.8)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color}, ${opacity * 0.42})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    const handleResize = () => {
      resize();
      createParticles();
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", () => {
        pointer.active = false;
      });
    };
  }, [color, count, maxDistance, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}