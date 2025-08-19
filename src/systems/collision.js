import { dist2 } from '../utils.js';
import { applyArmor } from '../data/enemies.js';
import { addXP, profile } from '../state.js';

export function updateBulletsAndHits(state, dt) {
    const gs = state.gameSpeed;
    for (let i=state.bullets.length-1;i>=0;i--) {
        const b = state.bullets[i];
        b.x += b.vx * dt * gs; b.y += b.vy * dt * gs; b.ttl -= dt*gs;
        let hit = false;

        // столкновения
        for (let j=state.enemies.length-1;j>=0;j--) {
            const e = state.enemies[j];
            if (!e.alive) continue;
            const R = (e.radius || 10) + b.r;
            if (dist2(b.x,b.y, e.x,e.y) <= R*R) {
                applyHit(state, e, b);
                if (e.hp <= 0) {
                    killEnemy(state, j, e);
                }
                hit = true;
                if (b.splash > 0) {
                    // сплэш по близким
                    for (let k=state.enemies.length-1;k>=0;k--) {
                        if (k===j) continue;
                        const ee = state.enemies[k];
                        const rr = (b.splash);
                        if (dist2(b.x,b.y, ee.x,ee.y) <= rr*rr) {
                            applyHit(state, ee, { dmg: Math.floor(b.dmg*0.6), splash:0 });
                            if (ee.hp <= 0) killEnemy(state, k, ee);
                        }
                    }
                }
                break;
            }
        }
        if (hit || b.ttl<=0) state.bullets.splice(i,1);
    }
}

function applyHit(state, e, b) {
    const real = applyArmor(b.dmg, e.armor);
    e.hp -= real;
    if (b.slow) {
        e.slowT = Math.max(e.slowT || 0, b.slow.time);
        e.slowMul = Math.min(e.slowMul || 1, b.slow.factor);
    }
}

function killEnemy(state, idx, e) {
    e.alive = false;
    state.enemies.splice(idx,1);
    const money = Math.round(e.reward * profile.moneyBonus());
    state.money += money;
    addXP(3);
}