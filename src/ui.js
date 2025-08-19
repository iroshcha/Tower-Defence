import { TOWERS } from './data/towers.js';
import { pointInNoBuild } from './map.js';
import { dist2, uid } from './utils.js';

export function initUI(state, profile) {
    const toolbar = document.getElementById('toolbar');
    const btns = Array.from(toolbar.querySelectorAll('button.btn'));

    // локальный шаблон башни для «призрака»
    state.towersTmp = {
        mg: {...TOWERS.mg},
        cannon: {...TOWERS.cannon},
        aa: {...TOWERS.aa},
    };

    btns.forEach(btn=>{
        btn.addEventListener('click', ()=>{
            btns.forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            state.ui.build = btn.dataset.tower;
            state.selection = null;
            updatePanel(null, state, profile);
        });
    });

    document.getElementById('speed').addEventListener('click', (e)=>{
        state.gameSpeed = state.gameSpeed===1 ? 2 : (state.gameSpeed===2 ? 3 : 1);
        e.target.textContent = 'x'+state.gameSpeed;
    });

    // панель
    ['upg_dmg','upg_rate','upg_rng'].forEach(id=>{
        document.getElementById(id).addEventListener('click', ()=>{
            const t = state.towers.find(x=>x.id===state.selection);
            if (!t) return;
            const baseCost = t.upgrades.cost;
            const inc = (t.upgCount||0);
            const cost = Math.round(baseCost * Math.pow(1.35, inc));
            if (state.money < cost) return;
            if (id==='upg_dmg') t.damage = Math.round(t.damage * t.upgrades.dmgMul);
            if (id==='upg_rate') t.fireDelay = Math.max(0.06, t.fireDelay * t.upgrades.rateMul);
            if (id==='upg_rng') t.range += t.upgrades.rangeAdd;
            t.level = (t.level||1)+1;
            t.upgCount = (t.upgCount||0)+1;
            state.money -= cost;
            updatePanel(t, state, profile);
        });
    });
}

export function bindCanvasInteractions(canvas, state, profile) {
    canvas.addEventListener('mousemove', (e)=>{
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        state.ui.mouse.x = x; state.ui.mouse.y = y;
        if (state.ui.build) {
            state.ui.canPlace = canPlace(state, x,y);
        }
    });

    canvas.addEventListener('contextmenu', e=>e.preventDefault());

    canvas.addEventListener('mousedown', (e)=>{
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;

        if (e.button === 2) {
            // продать выбранную
            if (state.selection) {
                const i = state.towers.findIndex(t=>t.id===state.selection);
                if (i>=0) {
                    const t = state.towers[i];
                    const sell = Math.round((t.buyCost || 0) * 0.75);
                    state.money += sell;
                    state.towers.splice(i,1);
                    state.selection=null;
                    updatePanel(null, state, profile);
                }
            }
            return;
        }

        if (state.ui.build) {
            if (state.ui.canPlace) {
                placeTower(state, x,y, state.ui.build);
            }
        } else {
            // выбор башни
            const t = pickTower(state, x, y);
            state.selection = t?.id || null;
            updatePanel(t, state, profile);
        }
    });
}

function pickTower(state, x,y) {
    let best=null, bestD2=1e9;
    for (const t of state.towers) {
        const d2 = dist2(x,y,t.x,t.y);
        if (d2 < 14*14 && d2<bestD2) { best=t; bestD2=d2; }
    }
    return best;
}

function canPlace(state, x,y) {
    if (pointInNoBuild(x,y)) return false;
    for (const t of state.towers) {
        if (dist2(x,y,t.x,t.y) < 26*26) return false;
    }
    return true;
}

function placeTower(state, x,y, key) {
    const T = TOWERS[key];
    if (!T) return;
    const cost = T.cost;
    if (state.money < cost) return;
    const id = uid();
    state.towers.push({
        id, key, name:T.name,
        x, y,
        range: T.range, fireDelay: T.fireDelay, bulletSpeed: T.bulletSpeed,
        damage: T.damage, splash: T.splash||0, homing: !!T.homing,
        canHitAir: !!T.canHitAir, onlyAir: !!T.onlyAir,
        color: T.color, projColor: T.projColor,
        cd: 0,
        targeting: 'closest',   // было 'first'
        lastDir: 0,             // новый: начальный угол ствола
        upgrades: T.upgrades,
        level: 1,
        buyCost: cost,
    });
    state.money -= cost;
}

export function updatePanel(t, state, profile) {
    const panel = document.getElementById('panel');
    if (!t) { panel.hidden = true; return; }
    panel.hidden=false;
    document.getElementById('p_title').textContent = t.name;
    document.getElementById('p_lvl').textContent = t.level||1;
    document.getElementById('p_dmg').textContent = t.damage.toString();
    document.getElementById('p_fir').textContent = (1/Math.max(0.0001,t.fireDelay)).toFixed(1)+'/с';
    document.getElementById('p_rng').textContent = Math.round(t.range).toString();
}