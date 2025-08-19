export function updateMovement(state, dt) {
    // Враги по путям
    for (let i=state.enemies.length-1;i>=0;i--) {
        const e = state.enemies[i];
        const target = e.path[e.pathIdx];
        if (!target) {
            // дошли до базы
            state.lives--;
            state.enemies.splice(i,1);
            continue;
        }
        const dx = target.x - e.x, dy = target.y - e.y;
        const len = Math.hypot(dx,dy) || 1;
        const step = e.speed * dt * state.gameSpeed;
        if (len <= step) { e.x = target.x; e.y = target.y; e.pathIdx++; }
        else { e.x += dx/len*step; e.y += dy/len*step; }
    }

    // Самонаводящиеся пули (простое наведение)
    for (const b of state.bullets) {
        if (!b.homing || !b.targetId) continue;
        const tgt = state.enemies.find(e=>e.id===b.targetId);
        if (!tgt) continue;
        const dx = tgt.x - b.x, dy = tgt.y - b.y;
        const l = Math.hypot(dx,dy) || 1;
        const desiredVx = dx/l * b.speed, desiredVy = dy/l * b.speed;
        const turn = 6.0; // рад/сек эфф. скорость поворота
        b.vx = b.vx + (desiredVx - b.vx) * Math.min(1, turn*dt);
        b.vy = b.vy + (desiredVy - b.vy) * Math.min(1, turn*dt);
    }
}