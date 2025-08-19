// Генератор плана волны: микс типов + иногда воздух
export function makeWavePlan(wave) {
    const plan = [];
    const baseHPmul = 1 + wave*0.15;
    const packs = [];

    // Базовая пачка — grunt
    packs.push({ type:'grunt', count: 6 + Math.floor(wave*0.8), interval:0.8, path:'groundA', hpMul: baseHPmul });

    // Бегуны каждые 2 волны
    if (wave % 2 === 0) packs.push({ type:'runner', count: 4 + Math.floor(wave*0.6), interval:0.5, path:'groundB', hpMul: baseHPmul*0.9 });

    // Танки с 4-й волны
    if (wave >= 4) packs.push({ type:'tank', count: Math.max(2, Math.floor(wave/3)), interval:1.4, path: wave%2? 'groundA':'groundB', hpMul: baseHPmul*1.4 });

    // Воздушные с 3-й волны
    if (wave >= 3) packs.push({ type:'flyer', count: 3 + Math.floor(wave*0.5), interval:0.9, path:'airA', hpMul: baseHPmul });

    // Сборка в единый таймлайн
    let startAt = 1.0; // задержка перед началом волны
    for (const p of packs) {
        for (let i=0;i<p.count;i++) {
            plan.push({ t: startAt + i*p.interval, type: p.type, path: p.path, hpMul: p.hpMul });
        }
        startAt += 0.6; // сдвиг стартов пачек
    }

    const duration = Math.max(...plan.map(x=>x.t)) + 0.1;
    return { events: plan.sort((a,b)=>a.t-b.t), duration, rewardWave: 25 + wave*5 };
}