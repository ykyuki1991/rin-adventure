// 力がはたらくエリア（滝・風・ゾウのシャワー）
// kind: 'fall'  … 滝。下におし流される（ジャンプが低くなる）
//       'spray' … ゾウのシャワー。上にもち上げられる
//       'wind'  … 風。横に流される（period を入れると吹いたり止んだりする）

export function zoneActive(z, t) {
  if (!z.period) return true;
  const ph = (((t + (z.phase || 0)) % z.period) + z.period) % z.period / z.period;
  return ph < (z.duty ?? 0.6);
}

export function windDir(z, t) {
  if (!z.flip || !z.period) return z.dir || 1;
  const cyc = Math.floor((t + (z.phase || 0)) / z.period) % 2;
  return cyc ? -(z.dir || 1) : (z.dir || 1);
}

// box が受ける力。ay: 上下の加速度、ext: 横に流される速さ、capUp: 上向きの速さの上限
export function zoneForce(zones, box, t) {
  let ay = 0, ext = 0, capUp = null;
  for (const z of zones) {
    if (box.x + box.w <= z.x || box.x >= z.x + z.w || box.y + box.h <= z.y || box.y >= z.y + z.h) continue;
    if (!zoneActive(z, t)) continue;
    if (z.kind === 'fall') ay += z.power ?? 1100;
    else if (z.kind === 'spray') { ay -= z.power ?? 2600; capUp = -(z.cap ?? 340); }
    else if (z.kind === 'wind') ext += windDir(z, t) * (z.power ?? 50);
  }
  return { ay, ext, capUp };
}

// ステージデータ（マス単位）からピクセル単位のエリアを作る
export function buildZones(def, TILE) {
  return (def.zones || []).map(z => ({ ...z, x: z.x * TILE, y: z.y * TILE, w: z.w * TILE, h: z.h * TILE }));
}
