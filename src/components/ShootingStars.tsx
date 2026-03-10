"use client";

import { useEffect, useRef } from "react";

export function ShootingStars() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let w = 0, h = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // ── Twinkling stars (Needle-like) ──
        interface Star {
            x: number; y: number; r: number;
            baseAlpha: number; alpha: number;
            speed: number; phase: number;
            spikes: boolean;
        }

        const stars: Star[] = [];
        const STAR_COUNT = 400;

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 0.5 + 0.1, // Small radius for needle effect
                baseAlpha: Math.random() * 0.5 + 0.5,
                alpha: 0,
                speed: Math.random() * 0.003 + 0.001, // Slightly faster for realistic twinkle
                phase: Math.random() * Math.PI * 2,
                spikes: Math.random() > 0.9, // Only some stars have diffraction spikes
            });
        }

        // ── Shooting stars (Restored) ──
        interface Meteor {
            x: number; y: number;
            vx: number; vy: number;
            len: number; life: number; maxLife: number;
            alpha: number;
        }

        const meteors: Meteor[] = [];
        let nextMeteor = 3000 + Math.random() * 5000;
        let meteorTimer = 0;

        const spawnMeteor = () => {
            const startX = Math.random() * w * 0.9;
            const startY = Math.random() * h * 0.4;
            const angle = Math.PI / 4 + Math.random() * 0.4 - 0.2;
            const speed = 7 + Math.random() * 5;
            meteors.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                len: 50 + Math.random() * 40,
                life: 0,
                maxLife: 40 + Math.random() * 25,
                alpha: 0.8 + Math.random() * 0.2,
            });
        };

        let lastTime = performance.now();
        let lastDrawTime = lastTime;
        const fpsInterval = 1000 / 30;

        const loop = (now: number) => {
            animId = requestAnimationFrame(loop);

            const dt = now - lastTime;
            lastTime = now;

            if (now - lastDrawTime < fpsInterval) return;
            lastDrawTime = now;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#ffffff";

            // Draw twinkling stars
            for (const s of stars) {
                s.phase += s.speed * dt;

                // Realistic Twinkle: Sharp intermittent bursts
                const twinkle = (Math.sin(s.phase) + 1) / 2;
                const burst = Math.pow((Math.sin(s.phase * 0.5) + 1) / 2, 12);

                s.alpha = s.baseAlpha * (0.1 + 0.8 * twinkle + 0.1 * burst);

                ctx.globalAlpha = s.alpha;

                // Needle Effect: Very small bright center
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();

                // Diffraction spikes for "needle" intensity
                if (s.spikes && s.alpha > 0.7) {
                    ctx.beginPath();
                    ctx.lineWidth = 0.3;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.5})`;
                    // Horizontal
                    ctx.moveTo(s.x - 2, s.y);
                    ctx.lineTo(s.x + 2, s.y);
                    // Vertical
                    ctx.moveTo(s.x, s.y - 2);
                    ctx.lineTo(s.x, s.y + 2);
                    ctx.stroke();
                }
            }

            // Spawn shooting stars
            meteorTimer += dt;
            if (meteorTimer >= nextMeteor) {
                spawnMeteor();
                meteorTimer = 0;
                nextMeteor = 3000 + Math.random() * 8000;
            }

            // Draw shooting stars
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.x += m.vx;
                m.y += m.vy;
                m.life += 2;

                const progress = m.life / m.maxLife;
                const fadeAlpha = m.alpha * (progress < 0.3 ? progress / 0.3 : 1 - ((progress - 0.3) / 0.7));

                const tailLen = m.len * Math.min(progress * 3, 1);
                const nx = m.vx / Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                const ny = m.vy / Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                const endX = m.x - nx * tailLen;
                const endY = m.y - ny * tailLen;

                const gradient = ctx.createLinearGradient(m.x, m.y, endX, endY);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${fadeAlpha})`);
                gradient.addColorStop(0.2, `rgba(255, 255, 255, ${fadeAlpha * 0.5})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 0.6;
                ctx.stroke();

                ctx.globalAlpha = fadeAlpha;
                ctx.fillRect(m.x - 0.5, m.y - 0.5, 1, 1);

                if (m.life >= m.maxLife) meteors.splice(i, 1);
            }

            ctx.globalAlpha = 1;
        };

        animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-15]"
            style={{ opacity: 1 }}
        />
    );
}
