import { pointSegDist2 } from './utils.js';

// Фиксированные пути на холсте 960x600: два наземных и один воздушный
const groundA = [
    {x: 40, y: 520}, {x: 220, y: 520}, {x: 220, y: 360},
    {x: 340, y: 360}, {x: 340, y: 220}, {x: 520, y: 220},
    {x: 520, y: 320}, {x: 760, y: 320}, {x: 900, y: 320},
];
const groundB = [
    {x: 900, y: 80}, {x: 720, y: 80}, {x: 720, y: 220},
    {x: 600, y: 220}, {x: 520, y: 220}, {x: 520, y: 320},
    {x: 760, y: 320}, {x: 900, y: 320},
];
// Воздушный: диагональ сверху-слева к базе
const airA = [
    {x: 20, y: 40}, {x: 200, y: 140}, {x: 420, y: 260}, {x: 900, y: 320}
];

const ROAD_W = 28; // половина ширины дороги (толщина 56)
const NOBUILD_PAD = 16;
const bunkers = [
    {x: 160, y: 140, r: 28},
    {x: 820, y: 460, r: 26},
];
const props = [
    {type:'radar', x: 110, y: 90},
    {type:'ufo', x: 680, y: 420},
    {type:'crates', x: 300, y: 520},
    {type:'antenna', x: 820, y: 140},
];

export const paths = { groundA, groundB, airA };
export const roadWidth = ROAD_W*2;

export function pointInNoBuild(x,y) {
    // запрет близко к дороге
    const checkPath = (p) => {
        for (let i=0;i<p.length-1;i++) {
            const a=p[i], b=p[i+1];
            const d2 = pointSegDist2(x,y,a.x,a.y,b.x,b.y);
            if (d2 <= (ROAD_W + NOBUILD_PAD) * (ROAD_W + NOBUILD_PAD)) return true;
        }
        return false;
    };
    if (checkPath(groundA) || checkPath(groundB)) return true;
    for (const b of bunkers) {
        const dx = x-b.x, dy = y-b.y;
        if (dx*dx+dy*dy < (b.r+18)*(b.r+18)) return true;
    }
    return false;
}

export function drawMap(ctx) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    // фон: «база» + пустошь
    ctx.save();
    // пустошь
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#0b1420'); g.addColorStop(1,'#0a1b2a');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    // декоративная сетка/панели
    ctx.strokeStyle = '#0f273a'; ctx.lineWidth = 1;
    for (let x=0; x<w; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=0; y<h; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // Дороги (толстые полосы)
    const drawRoad = (p, color='#354a5f') => {
        ctx.strokeStyle = color; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.lineWidth = ROAD_W*2;
        ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y);
        for (let i=1;i<p.length;i++) ctx.lineTo(p[i].x,p[i].y);
        ctx.stroke();
        // борта
        ctx.strokeStyle = '#203243'; ctx.lineWidth = 6;
        ctx.stroke();
        // разметка
        ctx.setLineDash([14,10]); ctx.strokeStyle = '#7da2c7aa'; ctx.lineWidth = 4;
        ctx.stroke(); ctx.setLineDash([]);
    };
    drawRoad(groundA, '#3a4d5f');
    drawRoad(groundB, '#3a4d5f');

    // ВПП/обозначения базы (финиш)
    ctx.fillStyle = '#1f2f42'; ctx.fillRect(w-90, 290, 80, 60);
    ctx.fillStyle = '#315577'; ctx.fillRect(w-86, 294, 72, 52);
    ctx.fillStyle = '#a3d3ff22'; ctx.fillRect(w-86, 294, 72, 8);

    // Декор: бункеры
    for (const b of bunkers) {
        ctx.beginPath(); ctx.fillStyle = '#28384a'; ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = '#1a2633'; ctx.arc(b.x,b.y,b.r*0.6,0,Math.PI*2); ctx.fill();
    }

    // РЛС, уфо, ящики, антенна
    for (const p of props) {
        if (p.type==='radar') {
            ctx.save(); ctx.translate(p.x,p.y);
            ctx.fillStyle = '#2a3e55'; ctx.fillRect(-10,8,20,10);
            ctx.strokeStyle='#6bbcff'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.arc(0,0,14,Math.PI*0.1,Math.PI*0.9); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,0,10,Math.PI*0.1,Math.PI*0.9); ctx.stroke();
            ctx.restore();
        } else if (p.type==='ufo') {
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(-0.2);
            ctx.fillStyle='#546e7a'; ctx.beginPath(); ctx.ellipse(0,0,38,16,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#a5f3fc66'; ctx.beginPath(); ctx.ellipse(0,-8,16,8,0,0,Math.PI*2); ctx.fill();
            ctx.restore();
        } else if (p.type==='crates') {
            ctx.fillStyle='#3b2f22'; ctx.fillRect(p.x-14,p.y-14,28,28);
            ctx.strokeStyle='#6b5844'; ctx.strokeRect(p.x-14,p.y-14,28,28);
        } else if (p.type==='antenna') {
            ctx.save(); ctx.translate(p.x,p.y);
            ctx.strokeStyle='#64748b'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(0,16); ctx.stroke();
            ctx.fillStyle='#60a5faaa'; ctx.beginPath(); ctx.arc(0,-16,6,0,Math.PI*2); ctx.fill();
            ctx.restore();
        }
    }

    // воздушный путь (пунктиром)
    ctx.setLineDash([8,8]); ctx.strokeStyle='#67e8f966'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(airA[0].x, airA[0].y);
    for (let i=1;i<airA.length;i++) ctx.lineTo(airA[i].x, airA[i].y);
    ctx.stroke(); ctx.setLineDash([]);

    ctx.restore();
}