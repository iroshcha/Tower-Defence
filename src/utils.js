export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist2 = (ax, ay, bx, by) => { const dx = ax-bx, dy = ay-by; return dx*dx + dy*dy; };
export const len = (x, y) => Math.hypot(x, y);
export const lerp = (a,b,t) => a + (b-a)*t;
export const rand = (a,b) => a + Math.random()*(b-a);
export const pointSegDist2 = (px,py, ax,ay, bx,by) => {
    const abx = bx-ax, aby = by-ay;
    const t = clamp(((px-ax)*abx + (py-ay)*aby)/(abx*abx+aby*aby), 0, 1);
    const x = ax + abx*t, y = ay + aby*t;
    return dist2(px,py,x,y);
};
let _id=1; export const uid = () => _id++;