// ステージごとの飾りとテーマの上書きをまとめる
import * as s2 from './stage2.js';
import * as s3 from './stage3.js';
import * as s4 from './stage4.js';
import * as s5 from './stage5.js';
import * as s6 from './stage6.js';
import * as s7 from './stage7.js';
import * as s8 from './stage8.js';
import * as s9 from './stage9.js';
import * as s10 from './stage10.js';

const MODS = [s2, s3, s4, s5, s6, s7, s8, s9, s10];
export const SD = Object.assign({}, ...MODS.map(m => m.DECOS || {}));

export function applyStagePatches(THEMES, BG) {
  for (const m of MODS) {
    for (const [k, v] of Object.entries(m.THEMES || {})) Object.assign(THEMES[k] ||= {}, v);
    for (const [k, v] of Object.entries(m.BG || {})) Object.assign(BG[k] ||= {}, v);
  }
}
