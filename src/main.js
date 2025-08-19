import { state, profile, loadProfile, saveProfile } from './state.js';
import { render } from './render.js';
import { initUI, bindCanvasInteractions, updatePanel } from './ui.js';
import { updateMovement } from './systems/movement.js';
import { updateTargeting } from './systems/targeting.js';
import { updateBulletsAndHits } from './systems/collision.js';
import { makeWavePlan } from './data/waves.js';
import { startWave, updateSpawn } from './systems/spawn.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2);
canvas.width *= DPR; canvas.height *= DPR;
canvas.style.width = (canvas.width / DPR) + 'px';
canvas.style.height = (canvas.height / DPR) + 'px';
ctx.scale(DPR, DPR);

// загрузка профиля
loadProfile();
updateUIStats();

initUI(state, profile);
bindCanvasInteractions(canvas, state, profile);

let last = performance.now();
function loop(now) {
    const rawDt = (now-last)/1000; last = now;
    const dt = Math.min(rawDt, 0.033);

    tick(dt);
    render(ctx, state);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function tick(dt) {
    // старт волны если надо
    if (!state.spawn.ticking && !state.spawn.waveDone && state.enemies.length===0 && state.bullets.length===0) {
        const plan = makeWavePlan(state.wave);
        startWave(state, plan);
    }
    updateSpawn(state, dt);

    updateMovement(state, dt);
    updateTargeting(state, dt, profile);
    updateBulletsAndHits(state, dt);

    // окончание волны
    if (state.spawn.waveDone) {
        state.wave++;
        state.spawn.waveDone=false;
        state.money += 20 + state.wave*5;
    }

    // поражение
    if (state.lives<=0) {
        resetGame();
    }

    updateUIStats();
}

function resetGame() {
    state.lives = 20; state.money = 100; state.wave = 1;
    state.enemies.length=0; state.towers.length=0; state.bullets.length=0; state.particles.length=0;
    state.selection=null; state.ui.build=null; state.ui.canPlace=false;
    saveProfile();
    updatePanel(null, state, profile);
}

function updateUIStats() {
    document.getElementById('lives').textContent = state.lives;
    document.getElementById('money').textContent = state.money;
    document.getElementById('wave').textContent = state.wave;
    document.getElementById('plevel').textContent = profile.level;
    document.getElementById('pxp').textContent = profile.xp + '/' + profile.xpToNext();
}

// после initUI/bindCanvasInteractions
document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
        state.gameSpeed = state.gameSpeed === 0 ? 1 : 0;
        document.getElementById('speed').textContent = state.gameSpeed ? 'x'+state.gameSpeed : 'PAUSE';
        e.preventDefault();
    }
    if (e.key === '1') { state.ui.build = 'mg'; }
    if (e.key === '2') { state.ui.build = 'cannon'; }
    if (e.key === '3') { state.ui.build = 'aa'; }
    if (e.key.toLowerCase() === 't' && state.selection) {
        const t = state.towers.find(x=>x.id===state.selection);
        if (t) {
            const order = ['closest','first','strongest','weakest'];
            const i = order.indexOf(t.targeting||'closest');
            t.targeting = order[(i+1)%order.length];
        }
    }
});