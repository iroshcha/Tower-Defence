import { drawMap } from './map.js';
import { TOWERS } from './data/towers.js';

let mapCanvas, mapCtx;
function ensureMap(ctx) {
    if (mapCanvas) return;
    mapCanvas = document.createElement('canvas');
    mapCanvas.width = ctx.canvas.width;
    mapCanvas.height = ctx.canvas.height;
    mapCtx = mapCanvas.getContext('2d');
    // важно: map.js рисует в размер CSS-пикселей; если у вас scale(DPR,DPR) применяется к главному ctx,
    // просто рисуем карту тем же способом: scale не нужен — используем реальные размеры канвы, а потом drawImage 1:1
    drawMap(mapCtx);
}

export function render(ctx, state) {
    const c = ctx.canvas;

    // Полная очистка кадра
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // сброс трансформаций, если scale/translate были
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();

    drawMap(ctx, state);
    drawEnemies(ctx, state);
    drawTowers(ctx, state);
    drawBullets(ctx, state);
    drawParticles(ctx, state);  // не забудьте вызывать
    drawGhost(ctx, state);
    drawHUD(ctx, state);
}
function drawEnemies(ctx, state) {
    for (const e of state.enemies) {
        // тень
        ctx.fillStyle = '#00000055';
        ctx.beginPath(); ctx.ellipse(e.x+2, e.y+6, e.radius*1.2, e.radius*0.7, 0, 0, Math.PI*2); ctx.fill();

        if (e.type === 'flyer') {
            ctx.save(); ctx.translate(e.x, e.y);
            ctx.fillStyle = '#556b77';
            ctx.beginPath(); ctx.ellipse(0,0, e.radius+8, e.radius-2, 0, 0, Math.PI*2); ctx.fill();
            const g = ctx.createRadialGradient(-6,-6,2, 0,0, e.radius+8);
            g.addColorStop(0,'#8fdcffcc'); g.addColorStop(1,'#8fdcff22');
            ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0,-5, e.radius-1, e.radius-8, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#9be8ffaa';
            for (let a=0;a<Math.PI*2;a+=Math.PI/3){
                ctx.beginPath(); ctx.arc(Math.cos(a)*(e.radius+2), Math.sin(a)*(e.radius-4), 2.2, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        } else if (e.type === 'tank') {
            ctx.save(); ctx.translate(e.x, e.y);
            ctx.fillStyle='#702a37'; ctx.beginPath(); ctx.arc(0,0,e.radius,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#b85d69'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.arc(0,0,e.radius-3,0,Math.PI*2); ctx.stroke();
            ctx.strokeStyle='#8e3a47'; ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(-e.radius+4,0); ctx.lineTo(e.radius-4,0);
            ctx.moveTo(0,-e.radius+4); ctx.lineTo(0,e.radius-4);
            ctx.stroke();
            ctx.restore();
        } else if (e.type === 'runner') {
            ctx.save(); ctx.translate(e.x,e.y);
            ctx.fillStyle='#72e34a';
            ctx.beginPath(); ctx.ellipse(0,0, e.radius+2, e.radius-3, 0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#2a3a2a'; ctx.beginPath(); ctx.arc(6,-2,2.2,0,Math.PI*2); ctx.fill();
            ctx.restore();
        } else {
            // «серый» гуманоид
            ctx.save(); ctx.translate(e.x,e.y);
            ctx.fillStyle='#9aa6ad'; ctx.beginPath(); ctx.ellipse(0,2, e.radius-2, e.radius, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#b3c0c8'; ctx.beginPath(); ctx.ellipse(0,-6, e.radius-4, e.radius-6, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#0f172a';
            ctx.beginPath(); ctx.ellipse(-3,-7, 3.2,1.8, -0.3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(3,-7, 3.2,1.8, 0.3, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }

        // HP-полоска
        const hpR = Math.max(0, Math.min(1, e.hp / e.maxHp));
        ctx.fillStyle='#ff4757'; ctx.fillRect(e.x-12, e.y-18, 24, 4);
        ctx.fillStyle='#2ed573'; ctx.fillRect(e.x-12, e.y-18, 24*hpR, 4);
    }
}

function typeColor(type) {
    switch(type) {
        case 'runner': return '#a3e635';
        case 'tank': return '#fb7185';
        case 'flyer': return '#7dd3fc';
        default: return '#f0c419';
    }
}

function drawTowers(ctx, state) {
    for (const t of state.towers) {
        const dir = t.lastDir || 0;
        const rec = t.recoil || 0;
        const selected = state.selection === t.id;

        if (selected) {
            ctx.beginPath(); ctx.arc(t.x,t.y,t.range,0,Math.PI*2);
            ctx.strokeStyle='rgba(120,180,255,0.16)'; ctx.lineWidth=2; ctx.stroke();
        }

        ctx.save();
        ctx.translate(t.x, t.y);

        // тень
        ctx.fillStyle='#00000055';
        ctx.beginPath(); ctx.ellipse(2,6,13,7,0,0,Math.PI*2); ctx.fill();

        // основание
        const base = ctx.createRadialGradient(-4,-4,2, 0,0,14);
        base.addColorStop(0,'#243341'); base.addColorStop(1,'#17232f');
        ctx.fillStyle = base;
        ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#2d3e50'; ctx.lineWidth=2; ctx.stroke();

        // поворотный узел
        ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2);
        ctx.fillStyle='#233446'; ctx.fill();
        ctx.strokeStyle='#3b5369'; ctx.lineWidth=2; ctx.stroke();

        // ствол
        ctx.rotate(dir);
        let len=18, w=4, tip=18;
        if (t.key==='cannon') { len=26; w=6; tip=24; }
        if (t.key==='aa')     { len=18; w=3; tip=16; }
        if (t.key==='cryo')   { len=18; w=5; tip=16; }

        const back = rec * (t.key==='cannon' ? 6 : 3);
        ctx.translate(-back, 0);

        // корпус башни
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-6, -8, 12, 16);
        ctx.strokeStyle = '#445a70'; ctx.lineWidth=2; ctx.strokeRect(-6,-8,12,16);

        // ствол(а)
        ctx.fillStyle = t.color;
        if (t.key==='aa') {
            ctx.save(); ctx.translate(0,-3); ctx.fillRect(0,-w/2, len, w); ctx.restore();
            ctx.save(); ctx.translate(0, 3); ctx.fillRect(0,-w/2, len, w); ctx.restore();
        } else {
            ctx.fillRect(0, -w/2, len, w);
        }

        // крио-конус
        if (t.key==='cryo') {
            const g = ctx.createRadialGradient(tip,0,0, tip+24,0,28);
            g.addColorStop(0,'rgba(150,210,255,0.35)');
            g.addColorStop(1,'rgba(150,210,255,0.0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(tip, -10); ctx.quadraticCurveTo(tip+26, 0, tip, 10); ctx.closePath(); ctx.fill();
        }

        // вспышка выстрела
        if (t.muzzle && t.key!=='cryo') {
            const a = Math.min(1, t.muzzle/0.06);
            ctx.fillStyle = 'rgba(255,220,140,'+a.toFixed(3)+')';
            ctx.beginPath(); ctx.ellipse(tip+3,0,6,3,0,0,Math.PI*2); ctx.fill();
        }

        ctx.restore();
    }
}

function drawParticles(ctx, state) {
    for (const p of state.particles) {
        const t = p.life / p.ttl;            // 0..1
        const a = Math.max(0, 1 - t);        // альфа от 1 к 0

        if (p.type === 'flash') {
            ctx.save();
            ctx.globalAlpha = 0.9 * a;
            ctx.fillStyle = p.color || '#ffd58a';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, (p.r || 6) * (1 + t), (p.r || 6) * 0.6 * (1 + t), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.type === 'spark') {
            ctx.save();
            ctx.globalAlpha = 0.9 * a;
            ctx.strokeStyle = p.color || '#ffe2a8';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            // короткий «трейл» назад по вектору скорости
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - (p.vx || 0) * 0.02, p.y - (p.vy || 0) * 0.02);
            ctx.stroke();
            ctx.restore();
        } else if (p.type === 'ring') {
            ctx.save();
            ctx.globalAlpha = 0.9 * a;
            ctx.strokeStyle = p.color || '#ffd58a';
            ctx.lineWidth = 2 * a;
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.r || 2) + (p.grow || 100) * t, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (p.type === 'smoke') {
            ctx.save();
            ctx.globalAlpha = 0.5 * a;
            ctx.fillStyle = (p.color || 'rgba(170,190,200,1)'); // альфа задаем через globalAlpha
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.r || 6) + (p.grow || 16) * t, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.type === 'shell') {
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot || 0);
            ctx.fillStyle = '#caa76b';
            ctx.fillRect(-2, -1, 4, 2);
            ctx.restore();
        }
    }
}

function drawBullets(ctx, state) {
    for (const b of state.bullets) {
        if (b.kind === 'mg') {
            const ang = Math.atan2(b.vy, b.vx);
            ctx.save();
            ctx.strokeStyle = 'rgba(255,245,200,0.9)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(b.x - Math.cos(ang)*6, b.y - Math.sin(ang)*6);
            ctx.lineTo(b.x + Math.cos(ang)*2,  b.y + Math.sin(ang)*2);
            ctx.stroke();
            ctx.restore();
        } else if (b.kind === 'cannon') {
            ctx.save();
            ctx.fillStyle = '#ffcd7a';
            ctx.beginPath(); ctx.arc(b.x,b.y,2.8,0,Math.PI*2); ctx.fill();
            ctx.restore();
        } else if (b.kind === 'aa') {
            const ang = Math.atan2(b.vy, b.vx);
            ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ang);
            ctx.fillStyle = '#d7f4ff'; ctx.fillRect(-4,-1.6, 8, 3.2);
            ctx.fillStyle = '#7cc7ff';  ctx.fillRect(1,-2.8, 3, 5.6);
            ctx.fillStyle = '#8bb3c7';
            ctx.fillRect(-3.8,-3.6, 2, 1.2); ctx.fillRect(-3.8,2.4,2,1.2);
            ctx.restore();
        } else if (b.kind === 'cryo') {
            ctx.save();
            ctx.fillStyle = '#9bd1ff';
            ctx.beginPath(); ctx.ellipse(b.x,b.y,3.2,2.2, Math.atan2(b.vy,b.vx), 0, Math.PI*2); ctx.fill();
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = b.color || '#ffffff';
            ctx.beginPath(); ctx.arc(b.x,b.y, b.r || 3, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
    }
}

function drawGhost(ctx, state) {
    const ui = state.ui;
    if (!ui.build) return;

    const x = ui.mouse.x;
    const y = ui.mouse.y;

    // Берём описание башни по ключу, заданному в UI
    const def = TOWERS[ui.build];
    // Если не нашли — подстраховка, чтобы не упасть
    const range = def ? def.range : 140;

    ctx.save();
    ctx.globalAlpha = 0.85;

    // Точка установки: зелёная — можно, красная — нельзя
    ctx.fillStyle = ui.canPlace ? '#4ade80' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Круг радиуса действия будущей башни
    ctx.strokeStyle = 'rgba(120,180,255,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawHUD(ctx, state) {
    // можно добавлять всплывающие тексты/частицы и т.п.
}