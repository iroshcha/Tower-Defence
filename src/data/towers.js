export const TOWERS = {
    mg: {
        key:'mg', name:'MG Турель', cost:35, range:130, fireDelay:0.18, bulletSpeed:520, damage:6,
        canHitAir:true, onlyAir:false, splash:0, color:'#4fb4ff',
        upgrades: { dmgMul:1.2, rateMul:0.85, rangeAdd:18, cost:30 }, // кнопки апгрейда
    },
    cannon: {
        key:'cannon', name:'Пушка', cost:60, range:180, fireDelay:0.9, bulletSpeed:320, damage:26,
        canHitAir:false, onlyAir:false, splash:42, color:'#f59e0b',
        upgrades: { dmgMul:1.25, rateMul:0.9, rangeAdd:20, cost:45 },
    },
    aa: {
        key:'aa', name:'ПВО', cost:50, range:220, fireDelay:0.6, bulletSpeed:420, damage:14,
        canHitAir:true, onlyAir:true, splash:0, homing:true, color:'#22d3ee',
        upgrades: { dmgMul:1.22, rateMul:0.9, rangeAdd:24, cost:40 },
    }
};