export const ENEMIES = {
    grunt:   { key:'grunt',   hp: 40,  speed: 60,  reward:6,  color:'#f0c419', radius:11 },
    runner:  { key:'runner',  hp: 24,  speed: 110, reward:5,  color:'#a3e635', radius:9 },
    tank:    { key:'tank',    hp: 180, speed: 38,  reward:14, color:'#fb7185', radius:13, armor:6 },
    flyer:   { key:'flyer',   hp: 55,  speed: 95,  reward:10, color:'#7dd3fc', radius:10, isAir:true },
};

export function applyArmor(dmg, armor=0) {
    return Math.max(1, dmg - (armor||0));
}