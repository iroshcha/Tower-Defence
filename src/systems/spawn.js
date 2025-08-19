import { ENEMIES } from '../data/enemies.js';
import { paths } from '../map.js';
import { uid } from '../utils.js';
import { addXP } from '../state.js';

export function startWave(state, plan) {
    state.spawn.ticking = true;
    state.spawn.plan = plan.events.slice();
    state.spawn.timer = 0;
    state.spawn.waveDone = false;
}

export function updateSpawn(state, dt) {
    if (!state.spawn.ticking) return;
    state.spawn.timer += dt;
    const queue = state.spawn.plan;
    while (queue.length && queue[0].t <= state.spawn.timer) {
        const e = queue.shift();
        spawnEnemy(state, e.type, e.path, e.hpMul);
    }
    if (queue.length===0 && state.enemies.length===0) {
        state.spawn.ticking = false;
        state.spawn.waveDone = true;
    }
}

function spawnEnemy(state, type, pathKey, hpMul) {
    const T = ENEMIES[type];
    const p = paths[pathKey];
    const pos = p[0];
    const id = uid();
    state.enemies.push({
        id, type,
        x: pos.x, y: pos.y,
        path: p, pathIdx: 1,
        speed: T.speed,
        hp: Math.floor(T.hp*hpMul),
        maxHp: Math.floor(T.hp*hpMul),
        reward: T.reward,
        radius: T.radius || 10,
        armor: T.armor || 0,
        isAir: !!T.isAir,
        alive: true,
        bleed: 0,
    });
    addXP(1); // немного XP за спавн/активность
}