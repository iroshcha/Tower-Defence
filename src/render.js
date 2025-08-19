import { drawMap } from './map.js';

export function render(ctx, state) {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

    drawMap(ctx);
    drawEnemies(ctx, state);
    drawTowers(ctx, state);
    drawBullets(ctx, state);
    drawGhost(ctx, state);
    drawHUD(ctx, state);
}

function drawEnemies(ctx, state) {
    for (const e of state.enemies) {
        // тень
        ctx.fillStyle = '#00000055';
        ctx.beginPath(); ctx.ellipse(e.x+2, e.y+6, e.radius*1.1, e.radius*0.6, 0, 0, Math.PI*2); ctx.fill();

        // тело
        ctx.beginPath(); ctx.fillStyle = typeColor(e.type);
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();

        // hp
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
        // радиус (для выбранной)
        if (state.selection === t.id) {
            ctx.beginPath(); ctx.arc(t.x,t.y,t.range,0,Math.PI*2);
            ctx.strokeStyle='rgba(120,180,255,0.16)'; ctx.lineWidth=2; ctx.stroke();
        }
        // основание
        ctx.fillStyle='#1f2f3a'; ctx.beginPath(); ctx.arc(t.x,t.y,12,0,Math.PI*2); ctx.fill();
        // башня
        ctx.fillStyle=t.color; ctx.beginPath(); ctx.arc(t.x,t.y,9,0,Math.PI*2); ctx.fill();
        // ствол
        ctx.strokeStyle=t.color; ctx.lineWidth=4;
        ctx.beginPath(); ctx.moveTo(t.x,t.y);
        const dir = t.lastDir || 0;
        ctx.lineTo(t.x + Math.cos(dir)*16, t.y + Math.sin(dir)*16);
        ctx.stroke();
    }
}

function drawBullets(ctx, state) {
    ctx.fillStyle='#ffffff';
    for (const b of state.bullets) {
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
        if (b.splash>0) {
            // чуть подсветим артиллерию
            ctx.strokeStyle='rgba(255,200,80,0.08)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.arc(b.x,b.y,b.splash,0,Math.PI*2); ctx.stroke();
        }
    }
}

function drawGhost(ctx, state) {
    const g = state.ui;
    if (!g.build) return;
    const x=g.mouse.x, y=g.mouse.y;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = g.canPlace ? '#4ade80' : '#ef4444';
    ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,180,255,0.16)'; ctx.lineWidth=2;
    const t = state.towersTmp?.[g.build];
    const range = t?.range || 140;
    ctx.beginPath(); ctx.arc(x,y,range,0,Math.PI*2); ctx.stroke();
    ctx.restore();
}

function drawHUD(ctx, state) {
    // можно добавлять всплывающие тексты/частицы и т.п.
}