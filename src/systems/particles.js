// Простая система частиц для вспышек/дыма/искр
import { rand } from '../utils.js';

export function spawnMuzzle(state, x, y, dir, color = '#ffd58a') {
    // короткая вспышка + пара искр вперед
    state.particles.push({
        type: 'flash', x, y, r: 7, life: 0, ttl: 0.06, color,
    });
    for (let i = 0; i < 3; i++) {
        const a = dir + rand(-0.2, 0.2);
        const s = rand(160, 260);
        state.particles.push({
            type: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            life: 0, ttl: 0.12, w: 6, color: '#ffe2a8'
        });
    }
}

export function spawnShell(state, x, y, dir) {
    // выброс гильзы вбок от линии ствола
    const a = dir + Math.PI/2 + rand(-0.4, 0.4);
    const s = rand(80, 140);
    state.particles.push({
        type: 'shell', x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
        life: 0, ttl: 0.6, rot: rand(0, Math.PI*2), vr: rand(-10, 10),
        g: 380, color: '#caa76b'
    });
}

export function spawnSmoke(state, x, y, count = 2, base = 'rgba(170,190,200,0.5)') {
    for (let i=0;i<count;i++) {
        state.particles.push({
            type:'smoke', x, y,
            vx: rand(-20,20), vy: rand(-10, -30),
            life:0, ttl: rand(0.5, 0.9), r: rand(4,8), grow: rand(14,24),
            color: base,
        });
    }
}

export function spawnHit(state, x, y, color = '#ffd58a') {
    // кольцо удара + несколько искр
    state.particles.push({ type:'ring', x, y, r: 2, grow: 120, life: 0, ttl: 0.18, color });
    for (let i=0;i<4;i++){
        const a = Math.random()*Math.PI*2;
        const s = rand(80,160);
        state.particles.push({ type:'spark', x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life:0, ttl:0.15, w:5, color });
    }
}

export function updateParticles(state, dt) {
    const gs = state.gameSpeed;
    for (let i = state.particles.length-1; i>=0; i--) {
        const p = state.particles[i];
        p.life += dt * gs;
        if (p.life >= p.ttl) { state.particles.splice(i,1); continue; }
        if (p.vx) p.x += p.vx * dt * gs;
        if (p.vy) p.y += p.vy * dt * gs;
        if (p.g)  p.vy += p.g * dt * gs;
        if (p.grow) p.r = (p.r || 0) + p.grow * dt * gs;
        if (p.vr) p.rot = (p.rot||0) + p.vr * dt * gs;
    }
}