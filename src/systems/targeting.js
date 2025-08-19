import { dist2 } from '../utils.js';

export function updateTargeting(state, dt, profile) {
    const gs = state.gameSpeed;

    for (const t of state.towers) {
        const r2 = t.range*t.range;
        const mode = t.targeting || 'closest';

        let target = null;
        let bestD2 = r2;
        let bestProgress = -Infinity;
        let bestHP = -Infinity;

        for (const e of state.enemies) {
            if (!e.alive) continue;
            if (!t.canHitAir && e.isAir) continue;
            if (t.onlyAir && !e.isAir) continue;

            const d2 = dist2(t.x,t.y,e.x,e.y);
            if (d2 > r2) continue;

            const progress = e.pathIdx + d2*1e-6;

            if (mode === 'closest') {
                if (d2 < bestD2) { target=e; bestD2=d2; bestProgress=progress; bestHP=e.hp; }
            } else if (mode === 'first') {
                if (progress > bestProgress) { target=e; bestProgress=progress; bestD2=d2; bestHP=e.hp; }
            } else if (mode === 'strongest') {
                if (e.hp > bestHP) { target=e; bestHP=e.hp; bestD2=d2; bestProgress=progress; }
            } else if (mode === 'weakest') {
                if (!target || e.hp < bestHP) { target=e; bestHP=e.hp; bestD2=d2; bestProgress=progress; }
            }
        }

        if (target) t.lastDir = Math.atan2(target.y - t.y, target.x - t.x);

        t.cd -= dt*gs;
        if (t.cd <= 0 && target) {
            fireAt(state, t, target, profile);
            t.cd = t.fireDelay;
        }
    }
}

function fireAt(state, t, e, profile) {
    const ang = Math.atan2(e.y - t.y, e.x - t.x);
    t.lastDir = ang;
    const vx = Math.cos(ang)*t.bulletSpeed;
    const vy = Math.sin(ang)*t.bulletSpeed;
    const dmg = Math.round(t.damage * profile.dmgBonus());
    state.bullets.push({
        x:t.x, y:t.y, vx, vy, speed:t.bulletSpeed, ttl:2.2,
        dmg, r:3, color:t.projColor||'#fff', splash:t.splash||0,
        homing:!!t.homing, targetId: t.homing? e.id : 0, owner:t.id,
        slow: t.slow || null,
    });
}