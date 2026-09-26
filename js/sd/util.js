// ステージごとの飾り（js/sd/stageN.js）から使う小さな道具
export { Art } from '../art.js';
export { TILE } from '../config.js';
export const TAU = Math.PI * 2;
export const FONT = '"Hiragino Maru Gothic ProN", "Hiragino Sans", "Arial Rounded MT Bold", sans-serif';

// 文字（看板の名前など）。size はゲームの1ドット単位
export function text(ctx, str, x, y, size, color, stroke, weight = 'bold') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = size * 0.28; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
}
// 光のにじみ（夜の街灯・ちょうちんなど）
export function glow(ctx, x, y, r, rgb, a = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
