// タイルの「かぎ」から、重ねて描くSVGの絵の名前を決める
// かぎの形: "素材|種類:まわりの様子:ばらつき"  例 "|gT:lr:1"  "container2|hard:LT:0"
// 絵がないときは null を返し、これまでのプログラムの絵で描く
import { FRAMES } from './art-data.js';

const has = n => FRAMES[n] !== undefined;
const cnt = {};
function variants(prefix) {
  if (cnt[prefix] === undefined) { let n = 0; while (has(prefix + n)) n++; cnt[prefix] = n; }
  return cnt[prefix];
}
const pick = (prefix, v) => { const n = variants(prefix); return n ? prefix + (v % n) : null; };

export function tileArt(theme, key) {
  const [head, flags = '', vs = '0'] = key.split(':');
  const v = parseInt(vs, 10) || 0;
  const bar = head.indexOf('|');
  const matRaw = head.slice(0, bar), kindRaw = head.slice(bar + 1);
  const kind = kindRaw.replace(/\d+$/, '');
  const num = parseInt((kindRaw.match(/\d+$/) || ['0'])[0], 10);
  const mat = matRaw.replace(/\d+$/, '');
  const mv = parseInt((matRaw.match(/\d+$/) || ['0'])[0], 10);
  const T = `t/${theme}/`;

  // どこでも同じ絵
  if (kind === 'q' && has('q/0')) return ['q/' + Math.min(2, num)];
  if (kind === 'used' && has('used')) return ['used'];
  if (kind === 'coin' && has('coin/0')) return [['coin/' + (num % 6), 8, 8]];
  if (kind === 'brick' && !mat && has('brick')) return ['brick'];

  // 素材つきのタイル（家のかべ・屋根・コンテナなど）
  if (mat) {
    const base = [T + `m/${mat}/${kind}`, `m/${mat}/${kind}`].find(has);
    if (!base) return null;
    const out = [];
    if (mat === 'container') {
      out.push(pick(`m/container/c`, mv) || base);
      for (const e of 'LRTB') if (flags.includes(e) && has('m/container/' + e)) out.push('m/container/' + e);
      return out;
    }
    out.push(base);
    if (flags.includes('T')) { const t = [base + 'T', `m/${mat}/${kind}T`].find(has); if (t) out.push(t); }
    return out;
  }

  switch (kind) {
    case 'g': case 'gT': case 'fg': case 'fgT': {
      const body = pick(T + 'g/body', v);
      if (!body) return null;
      const out = [body];
      const top = kind.endsWith('T');
      if (flags.includes('l') && has(T + 'g/edgeL')) out.push(T + 'g/edgeL');
      if (flags.includes('r') && has(T + 'g/edgeR')) out.push(T + 'g/edgeR');
      const col = flags.includes('c') && has(T + 'g/col');
      if (col && !top) out.push(T + 'g/col');
      if (top) {
        out.push(pick(T + 'g/top', v) || T + 'g/top0');
        if (flags.includes('l') && has(T + 'g/topL')) out.push(T + 'g/topL');
        if (flags.includes('r') && has(T + 'g/topR')) out.push(T + 'g/topR');
        if (col && has(T + 'g/colTop')) out.push(T + 'g/colTop');
      }
      if (kind.startsWith('f') && has('crack')) out.push('crack');
      const depth = parseInt((flags.match(/\d/) || ['0'])[0], 10);
      if (depth >= 2 && has('deep' + Math.min(3, depth - 1))) out.push('deep' + Math.min(3, depth - 1));
      return out;
    }
    case 'sR': case 'sL': case 'sRa': case 'sRb': case 'sLa': case 'sLb':
      return has(T + 'g/' + kind) ? [T + 'g/' + kind] : null;
    case 'hard': {
      const b = has(T + 'hard') ? T + 'hard' : null;
      if (!b) return null;
      return flags.includes('T') && has(T + 'hardT') ? [b, T + 'hardT'] : [b];
    }
    case 'fake': return has(T + 'hard') ? [T + 'hard', 'crack'] : null;
    case 'semi': return has(T + 'semi') ? [T + 'semi'] : null;
    case 'water': case 'waterT': {
      const n = T + kind + (num % 4);
      return has(n) ? [n] : has('water/' + kind + (num % 4)) ? ['water/' + kind + (num % 4)] : null;
    }
    case 'pipeTL': case 'pipeTR': case 'pipeL': case 'pipeR':
      return has(T + 'pipe/' + kind) ? [T + 'pipe/' + kind] : has('pipe/' + kind) ? ['pipe/' + kind] : null;
    case 'spike': return has('spike') ? ['spike'] : null;
  }
  return null;
}
