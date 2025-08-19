const PROFILE_KEY = 'hvA_profile_v1';

export const profile = {
    level: 1,
    xp: 0,
    xpToNext() { return 120 + (this.level-1)*80; },
    dmgBonus() { return 1 + (this.level-1)*0.02; }, // +2% к урону за уровень
    moneyBonus() { return 1 + (this.level-1)*0.02; },
};

export function loadProfile() {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    try {
        const p = JSON.parse(raw);
        Object.assign(profile, p);
    } catch {}
}
export function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ level: profile.level, xp: profile.xp }));
}
export function addXP(amount) {
    profile.xp += amount;
    let up = false;
    while (profile.xp >= profile.xpToNext()) {
        profile.xp -= profile.xpToNext();
        profile.level++; up = true;
    }
    if (up) saveProfile(); else saveProfile();
}

export const state = {
    lives: 20,
    money: 100,
    wave: 1,
    gameSpeed: 1,
    enemies: [],
    towers: [],
    bullets: [],
    particles: [],
    selection: null, // tower id
    ui: { build: null, mouse: {x:0,y:0}, canPlace: false },
    spawn: { ticking:false, plan:null, timer:0, waveDone:false },
};