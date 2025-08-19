import { dist2 } from '../utils.js';

export function updateTargeting(state, dt, profile) {
    const gs = state.gameSpeed;

    for (const t of state.towers) {
        t.cd -= dt * gs;
        if (t.cd > 0) continue;

        // поиск целей с учётом типа (воздух/земля)
        const r2 = t.range*t.range;
        let best = null;
        let bestProgress = -Infinity; // для 'first' нужно максимизировать, стартуем с -∞
        let bestD2 = r2;              // для 'closest' — минимизируем дистанцию


        for (const e of state.enemies) {
            if (!e.alive) continue;
            if (!t.canHitAir && e.isAir) continue;
            if (t.onlyAir && !e.isAir) continue;
            const d2 = dist2(t.x,t.y,e.x,e.y);
            if (d2 > r2) continue;

            // приоритет: «ближе к базе» => индекс пути

            const progress = e.pathIdx + d2*1e-6; // насколько далеко по пути

            if (t.targeting === 'first') {
                if (progress > bestProgress) {
                    best = e; bestProgress = progress;
                }
            } else { // 'closest'
                if (d2 < bestD2) {
                    best = e; bestD2 = d2;
                }
            }
        }

        if (best) {
            fireAt(state, t, best, profile);
            t.cd = t.fireDelay;
        }
    }
}

function fireAt(state, t, e, profile) {
    const ang = Math.atan2(e.y - t.y, e.x - t.x);
    const vx = Math.cos(ang)*t.bulletSpeed;
    const vy = Math.sin(ang)*t.bulletSpeed;
    const dmg = Math.round(t.damage * profile.dmgBonus());
    state.bullets.push({
        x: t.x, y: t.y,
        vx, vy,
        speed: t.bulletSpeed,
        ttl: 2.2,
        dmg,
        r: 3,
        color: t.projColor || '#ffffff',
        splash: t.splash || 0,
        homing: !!t.homing,
        targetId: t.homing ? e.id : 0,
        owner: t.id,
    });
    t.lastDir = Math.atan2(e.y - t.y, e.x - t.x);
}