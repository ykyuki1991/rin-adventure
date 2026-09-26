// 絵記号（ピクトグラム）。看板・店の名前・ヒントの文字のかわりに描く
// picto(ctx, 名前, 中心x, 中心y, 大きさ, 線の色, 下地の色)
//   16×16 の箱の中に描く絵を、大きさ size に拡大して置く。ink（線・ぬり）と bg（くりぬき）の2色で統一
import { Art } from './art.js';

const TAU = Math.PI * 2;

// ---- 小さな道具（16×16 の箱の座標、まん中が 0,0）----
let C = null;
const begin = () => C.beginPath();
const circ = (x, y, r) => { C.moveTo(x + r, y); C.arc(x, y, r, 0, TAU); };
const ell = (x, y, rx, ry, rot = 0) => { C.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); C.ellipse(x, y, rx, ry, rot, 0, TAU); };
const poly = (...p) => { C.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) C.lineTo(p[i], p[i + 1]); C.closePath(); };
const rrect = (x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  C.moveTo(x + r, y); C.arcTo(x + w, y, x + w, y + h, r); C.arcTo(x + w, y + h, x, y + h, r);
  C.arcTo(x, y + h, x, y, r); C.arcTo(x, y, x + w, y, r); C.closePath();
};
// CUT：下地の色のかわりに、くりぬく（どんな色の看板にのせても下地がすけて見える）
export const CUT = '#cut';
const fill = c => {
  if (c === CUT) { C.globalCompositeOperation = 'destination-out'; C.fillStyle = '#000'; C.fill(); C.globalCompositeOperation = 'source-over'; return; }
  C.fillStyle = c; C.fill();
};
const stroke = (c, w) => {
  C.lineWidth = w; C.lineCap = 'round'; C.lineJoin = 'round';
  if (c === CUT) { C.globalCompositeOperation = 'destination-out'; C.strokeStyle = '#000'; C.stroke(); C.globalCompositeOperation = 'source-over'; return; }
  C.strokeStyle = c; C.stroke();
};
const line = (...p) => { C.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) C.lineTo(p[i], p[i + 1]); };
const star = (x, y, r1, r2) => {
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1;
    i ? C.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : C.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  C.closePath();
};
const arrowHead = (x, y, dx, dy, s, c) => { // (dx,dy) の向きの矢じり
  const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  begin(); poly(x + ux * s, y + uy * s, x - uy * s * 0.8, y + ux * s * 0.8, x + uy * s * 0.8, y - ux * s * 0.8); fill(c);
};

// ---- 絵の一覧 ----（k = 線の色、b = 下地の色）
const ICONS = {
  // りんの家（ハートの窓）
  home(k, b) {
    begin(); poly(-8, -0.5, 0, -7.5, 8, -0.5); fill(k);
    begin(); rrect(-6, -1.5, 12, 8.5, 1); fill(k);
    begin(); rrect(-1.8, 2, 3.6, 5, 1); fill(b);
    begin(); C.moveTo(0, -1.2); C.bezierCurveTo(-3.2, -3.2, -1.8, -6, 0, -4.4); C.bezierCurveTo(1.8, -6, 3.2, -3.2, 0, -1.2); fill(b);
  },
  // 町なみ（家が3けん）
  town(k, b) {
    begin(); poly(-8, 7, -8, -1, -4.5, -4.5, -1, -1, -1, 7); fill(k);
    begin(); poly(-0.2, 7, -0.2, -3, 3.8, -7, 7.8, -3, 7.8, 7); fill(k);
    begin(); rrect(-5.8, 1, 2.6, 2.6, 0.4); rrect(2.3, -1.5, 3, 3, 0.4); rrect(2.4, 3.2, 2.8, 3.8, 0.4); fill(b);
  },
  bread(k, b) {
    begin(); C.moveTo(-8, 4); C.bezierCurveTo(-8, -6, 8, -6, 8, 4); C.quadraticCurveTo(0, 6.5, -8, 4); fill(k);
    begin(); line(-4.5, -0.5, -2.5, 3); line(-0.8, -2, 1.2, 2.6); line(3, -1, 4.6, 2.4); stroke(b, 1.2);
  },
  cup(k, b) {
    begin(); poly(-6.5, -2, 4.5, -2, 3.2, 6, -5.2, 6); fill(k);
    begin(); circ(5, 1.2, 2.6); stroke(k, 1.4);
    begin(); line(-7.5, 7, 6, 7); stroke(k, 1.2);
    begin(); C.moveTo(-3, -4); C.quadraticCurveTo(-4.5, -5.5, -3, -7.5); C.moveTo(0.5, -4); C.quadraticCurveTo(-1, -5.5, 0.5, -7.5); stroke(k, 1.1);
  },
  tea(k, b) {
    begin(); C.moveTo(-6, -2); C.lineTo(6, -2); C.quadraticCurveTo(6, 6.5, 0, 6.5); C.quadraticCurveTo(-6, 6.5, -6, -2); fill(k);
    begin(); line(-3.6, 1.2, 3.6, 1.2); stroke(b, 0.9);
    begin(); C.moveTo(-2, -3.5); C.quadraticCurveTo(-3.5, -5.5, -2, -7.5); C.moveTo(2, -3.5); C.quadraticCurveTo(0.5, -5.5, 2, -7.5); stroke(k, 1.1);
  },
  dango(k, b) {
    begin(); line(-7.5, 7.5, 7, -7); stroke(k, 1.2);
    begin(); circ(-3.6, 3.6, 3); circ(0, 0, 3); circ(3.6, -3.6, 3); fill(k);
    begin(); circ(-4.4, 2.8, 0.9); circ(-0.8, -0.8, 0.9); circ(2.8, -4.4, 0.9); fill(b);
  },
  sesame(k, b) {
    begin(); circ(-3.6, 2.5, 3.4); circ(3.6, 2.5, 3.4); circ(0, -3.2, 3.4); fill(k);
    begin();
    for (const [x, y] of [[-4.5, 1.5], [-2.5, 3.6], [2.8, 1.8], [4.6, 3.4], [-1, -4], [1.2, -2.6], [0.6, -4.8]]) ell(x, y, 0.55, 0.3, 0.6);
    fill(b);
  },
  veg(k, b) { // にんじん
    begin(); C.moveTo(-7, 7); C.quadraticCurveTo(-4, 0, 1.5, -3.5); C.lineTo(4, -1); C.quadraticCurveTo(0, 4.5, -7, 7); fill(k);
    begin(); ell(3.6, -5.8, 1.3, 2.8, 0.5); ell(5.6, -4, 1.3, 2.8, 1.2); ell(1.5, -6.8, 1.1, 2.4, -0.2); fill(k);
    begin(); line(-3.5, 2.5, -2, 3.5); line(-1, 0, 0.5, 1); stroke(b, 0.8);
  },
  fish(k, b) {
    begin(); ell(-1.5, 0, 6.2, 3.8); fill(k);
    begin(); poly(3.5, 0, 8, -4.2, 8, 4.2); fill(k);
    begin(); circ(-4.6, -0.8, 1); fill(b);
    begin(); C.arc(-2.2, 0, 2.4, -1.1, 1.1); stroke(b, 0.8);
  },
  toy(k, b) { // くまのぬいぐるみ
    begin(); circ(-4.6, -4.4, 2.4); circ(4.6, -4.4, 2.4); circ(0, 0.5, 6); fill(k);
    begin(); circ(-2.2, -0.6, 0.9); circ(2.2, -0.6, 0.9); ell(0, 2.8, 2.3, 1.7); fill(b);
    begin(); circ(0, 2.2, 0.8); fill(k);
  },
  book(k, b) {
    begin(); poly(-8, -5, -0.6, -3.5, -0.6, 6.5, -8, 5); poly(8, -5, 0.6, -3.5, 0.6, 6.5, 8, 5); fill(k);
    begin(); line(-6.2, -1.8, -2.4, -1); line(-6.2, 1, -2.4, 1.8); line(6.2, -1.8, 2.4, -1); line(6.2, 1, 2.4, 1.8); stroke(b, 0.7);
  },
  flower(k, b) {
    begin(); line(0, 1, 0, 8); stroke(k, 1.3);
    begin(); ell(3, 5, 2.6, 1.2, -0.5); fill(k);
    begin(); for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2; circ(Math.cos(a) * 3.4, -2.5 + Math.sin(a) * 3.4, 2.6); } fill(k);
    begin(); circ(0, -2.5, 1.7); fill(b);
  },
  croquette(k, b) {
    begin(); ell(0, 1, 7.5, 4.8, -0.15); fill(k);
    begin(); for (const [x, y] of [[-4, 0], [-1.5, -1.8], [1.5, 0.5], [4, -0.6], [-2.5, 2.8], [2, 3], [0, -0.2], [5, 2]]) circ(x, y, 0.55); fill(b);
  },
  shirt(k, b) {
    begin(); poly(-3, -6.5, -8, -3.5, -6, 0.5, -4.5, -0.5, -4.5, 7, 4.5, 7, 4.5, -0.5, 6, 0.5, 8, -3.5, 3, -6.5, 1.6, -4.8, -1.6, -4.8); fill(k);
  },
  shoe(k, b) {
    begin(); C.moveTo(-7.5, -4); C.lineTo(-2.5, -4); C.lineTo(-1, 0); C.quadraticCurveTo(7.5, 0.5, 7.5, 4); C.lineTo(7.5, 5.5); C.lineTo(-7.5, 5.5); C.closePath(); fill(k);
    begin(); line(-7.5, 3.6, 7.5, 3.6); stroke(b, 0.8);
  },
  gift(k, b) {
    begin(); rrect(-6.5, -2, 13, 9, 1); rrect(-7.5, -4.5, 15, 3.3, 0.8); fill(k);
    begin(); line(0, -4.5, 0, 7); stroke(b, 1.2);
    begin(); ell(-2.4, -6.2, 2.4, 1.3, 0.4); ell(2.4, -6.2, 2.4, 1.3, -0.4); stroke(k, 1.1);
  },
  fork(k, b) { // レストラン
    begin(); line(-3.5, -7, -3.5, 7); line(-5.5, -7, -5.5, -2.5); line(-1.5, -7, -1.5, -2.5); C.moveTo(-5.5, -2.5); C.quadraticCurveTo(-3.5, 0, -1.5, -2.5); stroke(k, 1.3);
    begin(); C.moveTo(4, 7); C.lineTo(4, -7); C.quadraticCurveTo(7, -3, 5.5, 1); C.lineTo(4, 1); stroke(k, 1.4); fill(k);
  },
  juice(k, b) {
    begin(); poly(-4.5, -3, 4.5, -3, 3.2, 7.5, -3.2, 7.5); fill(k);
    begin(); line(1, -2, 3.8, -8); stroke(k, 1.1);
    begin(); line(-3.4, 0.5, 3.4, 0.5); stroke(b, 0.8);
  },
  // 商店街のアーケード（丸い屋根の入り口）
  arcade(k, b) {
    begin(); C.moveTo(-8, 7); C.lineTo(-8, -1); C.bezierCurveTo(-8, -9.5, 8, -9.5, 8, -1); C.lineTo(8, 7); C.lineTo(5.4, 7); C.lineTo(5.4, -0.5);
    C.bezierCurveTo(5.4, -6.4, -5.4, -6.4, -5.4, -0.5); C.lineTo(-5.4, 7); C.closePath(); fill(k);
    begin(); rrect(-4, 1, 3.4, 6, 0.4); rrect(0.6, 1, 3.4, 6, 0.4); fill(k);
    begin(); line(-5.2, -2.2, 5.2, -2.2); stroke(k, 0.9);
  },
  train(k, b) {
    begin(); rrect(-7, -7, 14, 12, 3); fill(k);
    begin(); rrect(-5.2, -5, 4.4, 4, 0.8); rrect(0.8, -5, 4.4, 4, 0.8); fill(b);
    begin(); circ(-4.3, 2, 1); circ(4.3, 2, 1); fill(b);
    begin(); line(-4, 5, -6.5, 8); line(4, 5, 6.5, 8); stroke(k, 1.3);
  },
  shinkansen(k, b) {
    begin(); C.moveTo(-8, 4.5); C.lineTo(-8, -3); C.lineTo(-1, -3.5); C.bezierCurveTo(4, -3.5, 7.5, 1, 8, 4.5); C.closePath(); fill(k);
    begin(); C.moveTo(-6.5, -1.4); C.lineTo(0.4, -1.6); C.quadraticCurveTo(2.2, -1.4, 3.2, 0); C.lineTo(-6.5, 0); C.closePath(); fill(b);
    begin(); line(-8, 2.4, 6.8, 2.4); stroke(b, 0.7);
    begin(); line(-8, 6.5, 8, 6.5); stroke(k, 1.1);
  },
  gondola(k, b) {
    begin(); line(-8, -7, 8, -5); stroke(k, 0.9);
    begin(); line(0, -6, 0, -2); stroke(k, 1.2);
    begin(); rrect(-5.5, -2.2, 11, 9.5, 2.4); fill(k);
    begin(); rrect(-4, -0.6, 8, 3.6, 0.8); fill(b);
  },
  cablecar(k, b) {
    begin(); line(-8, 8, 8, 0); stroke(k, 1);
    C.save(); C.rotate(-0.46);
    begin(); rrect(-5.5, -4.5, 11, 8, 1.8); fill(k);
    begin(); rrect(-4.2, -3, 3.4, 3, 0.5); rrect(0.8, -3, 3.4, 3, 0.5); fill(b);
    C.restore();
  },
  wind(k, b) {
    begin();
    C.moveTo(-8, -3); C.lineTo(3, -3); C.arc(3, -5.3, 2.3, Math.PI / 2, -Math.PI * 0.9, true);
    C.moveTo(-8, 1); C.lineTo(5, 1); C.arc(5, 3.4, 2.4, -Math.PI / 2, Math.PI * 0.9);
    C.moveTo(-6, 5); C.lineTo(0, 5);
    stroke(k, 1.4);
  },
  herb(k, b) { // ラベンダー
    for (const [dx, h] of [[-3.5, 0.4], [0, -1], [3.5, 0.4]]) {
      begin(); line(dx, 7.5, dx * 0.6, h); stroke(k, 0.9);
      begin(); for (let i = 0; i < 4; i++) { ell(dx * 0.6 - 1, h - 1.6 - i * 1.7, 0.9, 0.7); ell(dx * 0.6 + 1, h - 1.6 - i * 1.7, 0.9, 0.7); } fill(k);
    }
    begin(); ell(-5, 6, 2.2, 0.9, -0.5); ell(5, 6, 2.2, 0.9, 0.5); fill(k);
  },
  giraffe(k, b) {
    begin(); ell(-2.5, 1.6, 4.8, 2.8); fill(k);
    begin(); line(-5.6, 3, -6, 8); line(-3.8, 3.5, -3.8, 8); line(0.2, 3.5, 0.4, 8); line(1.4, 3, 2, 8); stroke(k, 1.1);
    begin(); poly(0.2, -0.5, 3, -6.5, 5, -6, 2.8, 1.5); fill(k);
    begin(); ell(5.4, -6.8, 2.6, 1.4, 0.25); fill(k);
    begin(); line(3.8, -7.5, 3.6, -9.2); line(5, -7.9, 5, -9.4); stroke(k, 0.7);
    begin(); circ(-4.4, 0.8, 0.8); circ(-1.6, 2.2, 0.8); circ(-1.6, -0.2, 0.6); circ(2.4, -2.4, 0.6); fill(b);
  },
  elephant(k, b) {
    begin(); ell(1.5, 0.8, 6.2, 4.6); fill(k);
    begin(); circ(-4, -1.5, 3.8); fill(k);
    begin(); C.moveTo(-7.4, -0.6); C.quadraticCurveTo(-8.8, 4, -7, 7); stroke(k, 1.6);
    begin(); rrect(-1.6, 3, 2.6, 4.5, 0.6); rrect(3.6, 3, 2.6, 4.5, 0.6); fill(k);
    begin(); ell(-2.4, -1.4, 1.7, 2.6, 0.2); stroke(b, 0.6);
    begin(); circ(-5, -2.6, 0.6); fill(b);
  },
  panda(k, b) {
    begin(); circ(-4.8, -4.6, 2.4); circ(4.8, -4.6, 2.4); fill(k);
    begin(); circ(0, 0.8, 6.4); fill(b);
    begin(); circ(0, 0.8, 6.4); stroke(k, 1.2);
    begin(); ell(-2.6, 0.2, 1.4, 2, 0.6); ell(2.6, 0.2, 1.4, 2, -0.6); ell(0, 3, 1.3, 0.9); fill(k);
  },
  koala(k, b) {
    begin(); circ(-5.4, -2.8, 3.4); circ(5.4, -2.8, 3.4); circ(0, 1, 5.4); fill(k);
    begin(); circ(-5.4, -2.8, 1.6); circ(5.4, -2.8, 1.6); circ(-2.4, 0, 0.7); circ(2.4, 0, 0.7); fill(b);
    begin(); ell(0, 2.2, 1.6, 2.2); stroke(b, 0.7);
  },
  penguin(k, b) {
    begin(); ell(0, 0.8, 4.8, 6.8); fill(k);
    begin(); ell(0.6, 2.4, 3, 4.6); fill(b);
    begin(); circ(0.8, -3.6, 0.7); fill(b);
    begin(); poly(4, -3.4, 7, -2.4, 4, -1.6); ell(-2, 7.4, 2, 0.8); ell(2.4, 7.4, 2, 0.8); fill(k);
  },
  flamingo(k, b) {
    begin(); ell(-1.4, 0, 5, 2.8, -0.2); fill(k);
    begin(); C.moveTo(2.8, -1); C.bezierCurveTo(5.5, -3, 1, -5, 2.4, -7.4); stroke(k, 1.2);
    begin(); circ(3.4, -7.4, 1.4); fill(k);
    begin(); poly(4.4, -7.8, 6.4, -6.4, 4.8, -6.2); fill(k);
    begin(); line(-1, 2.5, -1, 8); line(-1, 5, 1.5, 3.8); stroke(k, 0.9);
  },
  ferris(k, b) {
    begin(); line(0, -1, -5, 8); line(0, -1, 5, 8); stroke(k, 1.2);
    begin(); circ(0, -1, 6.2); stroke(k, 1.2);
    begin(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; line(Math.cos(a) * 6, -1 + Math.sin(a) * 6, -Math.cos(a) * 6, -1 - Math.sin(a) * 6); } stroke(k, 0.6);
    begin(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; circ(Math.cos(a) * 6.2, -1 + Math.sin(a) * 6.2, 1.3); } fill(k);
  },
  exit(k, b) { // 門・出口（とびらと矢印）
    begin(); rrect(-7.5, -7, 9, 14, 1); stroke(k, 1.3);
    begin(); poly(-6.8, -6.2, -1.5, -4.5, -1.5, 7, -6.8, 6.2); fill(k);
    begin(); line(1, 0, 6, 0); stroke(k, 1.5);
    arrowHead(6.2, 0, 1, 0, 2.4, k);
  },
  // 異人館（とがった屋根の洋館）
  mansion(k, b) {
    begin(); poly(-8, -1, -4, -6, 0, -1); poly(0, -2, 4.2, -7.8, 8, -2); fill(k);
    begin(); rrect(-7.4, -1.5, 15, 9, 0.6); fill(k);
    begin(); rrect(5, -8.5, 1.2, 3, 0.3); fill(k);
    begin(); for (const x of [-5.8, -2.2, 1.6, 5]) { rrect(x - 1, 0.2, 2, 2.4, 0.9); rrect(x - 1, 4, 2, 2.6, 0.2); } fill(b);
  },
  // うろこの家（うろこ模様の塔）
  scales(k, b) {
    begin(); poly(-6.5, -2, 0, -8.5, 6.5, -2); fill(k);
    begin(); rrect(-6, -2.5, 12, 10, 0.5); fill(k);
    begin();
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -4.5 + i * 3 + (r % 2) * 1.5, y = -0.8 + r * 2.6; if (x < 5) { C.moveTo(x - 1.4, y); C.arc(x, y, 1.4, Math.PI, 0, true); } }
    stroke(b, 0.6);
  },
  // 風見鶏
  rooster(k, b) {
    begin(); line(0, 1, 0, 8); line(-6, 3, 6, 3); stroke(k, 1);
    arrowHead(6.5, 3, 1, 0, 1.8, k);
    begin(); poly(-6.6, 1.6, -5, 3, -6.6, 4.4); fill(k);
    begin(); ell(0.6, -2.4, 3.8, 2.8, -0.2); fill(k);
    begin(); C.moveTo(3.2, -3.4); C.quadraticCurveTo(7, -7, 5.2, -8.6); C.quadraticCurveTo(6.8, -3.8, 4, -0.8); C.closePath(); fill(k);
    begin(); circ(-3, -5.4, 1.9); fill(k);
    begin(); poly(-4.6, -6.6, -6.6, -5.2, -4.8, -4.6); ell(-2.6, -7.6, 1, 0.8); fill(k);
    begin(); circ(-3.4, -5.6, 0.45); fill(b);
  },
  slope(k, b) { // 坂道（上に洋館）
    begin(); poly(-8, 8, 8, 8, 8, -0.5); fill(k);
    begin(); poly(1.5, -1.5, 4.2, -5, 7, -1.5); rrect(2.2, -2, 4.2, 3.6, 0.3); fill(k);
    begin(); line(-4, 5.4, 2, 2.6); stroke(b, 1);
    arrowHead(3.2, 2, 2, -0.95, 1.8, b);
  },
  gate(k, b) { // 中華門
    begin(); poly(-8, -2.5, -6, -5, 6, -5, 8, -2.5, 5, -3.6, -5, -3.6); fill(k);
    begin(); poly(-6, -6.5, -4.2, -8.8, 4.2, -8.8, 6, -6.5, 4, -7.2, -4, -7.2); fill(k);
    begin(); rrect(-6, -3.8, 2.4, 11.5, 0.4); rrect(3.6, -3.8, 2.4, 11.5, 0.4); rrect(-3.6, -7.2, 7.2, 2.2, 0.3); rrect(-5, -0.8, 10, 1.5, 0.3); fill(k);
  },
  porkbun(k, b) {
    begin(); C.moveTo(-7.5, 5); C.bezierCurveTo(-8, -3, -2, -5.5, 0, -6); C.bezierCurveTo(2, -5.5, 8, -3, 7.5, 5); C.quadraticCurveTo(0, 7, -7.5, 5); fill(k);
    begin(); for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) { C.moveTo(Math.sin(a) * 1.2, -4.6); C.quadraticCurveTo(Math.sin(a) * 4, -1, Math.sin(a) * 6.5, 2.5); } stroke(b, 0.7);
  },
  gyoza(k, b) {
    begin(); C.moveTo(-8, 3); C.quadraticCurveTo(0, -9, 8, 3); C.quadraticCurveTo(0, 6, -8, 3); fill(k);
    begin(); for (let i = -2; i <= 2; i++) { C.moveTo(i * 2.6, -2.2 + Math.abs(i) * 0.7); C.lineTo(i * 2.9, 0.6 + Math.abs(i) * 0.4); } stroke(b, 0.7);
  },
  anchor(k, b) {
    begin(); circ(0, -6, 1.7); line(0, -4.3, 0, 6.5); line(-3.2, -2, 3.2, -2); C.moveTo(-6, 1.8); C.quadraticCurveTo(-5, 6.8, 0, 6.8); C.quadraticCurveTo(5, 6.8, 6, 1.8); stroke(k, 1.4);
    arrowHead(-6, 1.2, -0.3, -1, 1.8, k); arrowHead(6, 1.2, 0.3, -1, 1.8, k);
  },
  porttower(k, b) {
    begin(); poly(-4, -6.5, 4, -6.5, 1.3, 0, 4, 7.5, -4, 7.5, -1.3, 0); fill(k);
    begin(); rrect(-3, -8.5, 6, 2.4, 0.6); fill(k);
    begin(); line(-2.6, -4.5, 2.6, -4.5); line(-1.8, -2.4, 1.8, -2.4); line(-1.8, 2.4, 1.8, 2.4); line(-2.6, 4.8, 2.6, 4.8); stroke(b, 0.6);
  },
  warehouse(k, b) {
    begin(); poly(-8, -2.5, -4, -7, 4, -7, 8, -2.5, 8, 7, -8, 7); fill(k);
    begin(); for (const x of [-5, 0, 5]) { C.moveTo(x - 1.6, 7); C.lineTo(x - 1.6, 1.6); C.arc(x, 1.6, 1.6, Math.PI, 0); C.lineTo(x + 1.6, 7); C.closePath(); } fill(b);
    begin(); line(-8, -1.5, 8, -1.5); line(-6, -4.3, 6, -4.3); stroke(b, 0.55);
  },
  ship(k, b) {
    begin(); poly(-8, 1, 8, 1, 5.5, 5.5, -6, 5.5); fill(k);
    begin(); rrect(-4.5, -3.5, 8, 4, 0.6); rrect(0.5, -7, 2.6, 3.8, 0.4); fill(k);
    begin(); rrect(-3.3, -2.3, 1.6, 1.6, 0.3); rrect(-0.6, -2.3, 1.6, 1.6, 0.3); fill(b);
    begin(); C.moveTo(-8, 7.5); for (let x = -8; x < 8; x += 4) C.quadraticCurveTo(x + 1, 6.3, x + 2, 7.5), C.quadraticCurveTo(x + 3, 8.7, x + 4, 7.5); stroke(k, 0.8);
  },
  orca(k, b) {
    begin(); C.moveTo(-8, 1); C.bezierCurveTo(-6, -5, 4, -5, 6.5, 0); C.lineTo(8, -2.5); C.lineTo(8, 3.5); C.lineTo(6, 2.2); C.bezierCurveTo(2, 5.5, -6, 5, -8, 1); fill(k);
    begin(); poly(-1, -3.6, 0.8, -8, 2.2, -3.4); fill(k);
    begin(); ell(-4.2, -0.6, 1.4, 0.8, -0.2); fill(b);
    begin(); C.moveTo(-6.8, 2.4); C.quadraticCurveTo(-2, 4.6, 2, 2.4); C.quadraticCurveTo(-2, 3.2, -6.8, 2.4); fill(b);
  },
  aquarium(k, b) {
    begin(); ell(-1, 1.5, 5.4, 3.4); fill(k);
    begin(); poly(3.5, 1.5, 7.5, -2.2, 7.5, 5.2); fill(k);
    begin(); circ(-3.8, 0.8, 0.9); fill(b);
    begin(); circ(-4, -5.5, 1.4); circ(-1, -7, 0.9); circ(1.5, -4.8, 1.1); stroke(k, 0.8);
  },
  beach(k, b) { // 海水浴場（太陽と波）
    begin(); C.moveTo(-4, 0); C.arc(0, 0, 4, Math.PI, 0); C.closePath(); fill(k);
    begin(); for (let i = 0; i < 5; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 5; line(Math.cos(a) * 5.4, Math.sin(a) * 5.4, Math.cos(a) * 7.2, Math.sin(a) * 7.2); } stroke(k, 1);
    begin();
    for (const y of [3, 6.5]) { C.moveTo(-8, y); for (let x = -8; x < 8; x += 4) C.quadraticCurveTo(x + 1, y - 1.4, x + 2, y), C.quadraticCurveTo(x + 3, y + 1.4, x + 4, y); }
    stroke(k, 1.2);
  },
  parasol(k, b) {
    begin(); C.moveTo(-8, -1); C.quadraticCurveTo(0, -11, 8, -1); C.quadraticCurveTo(6, -2.4, 4, -1); C.quadraticCurveTo(2, -2.4, 0, -1); C.quadraticCurveTo(-2, -2.4, -4, -1); C.quadraticCurveTo(-6, -2.4, -8, -1); fill(k);
    begin(); line(0, -1.5, 1.5, 7); stroke(k, 1.1);
    begin(); C.moveTo(-8, 7.5); C.quadraticCurveTo(-4, 5.5, 0, 7.5); C.quadraticCurveTo(4, 9.5, 8, 7.5); stroke(k, 1);
  },
  shaveice(k, b) {
    begin(); poly(-6, 2.5, 6, 2.5, 3.5, 7, -3.5, 7); fill(k);
    begin(); C.moveTo(-6.5, 2.5); C.bezierCurveTo(-6.5, -8, 6.5, -8, 6.5, 2.5); C.closePath(); fill(k);
    begin(); C.moveTo(-5, -1); C.quadraticCurveTo(0, -4.5, 5, -1); C.lineTo(5, 0.5); C.quadraticCurveTo(3, 2, 2, 0.3); C.quadraticCurveTo(0, 2.4, -1.5, 0.3); C.quadraticCurveTo(-3.5, 2, -5, 0.3); C.closePath(); fill(b);
  },
  pine(k, b) { // 舞子の松
    begin(); C.moveTo(-1, 8); C.quadraticCurveTo(-2, 2, 2, -1); C.quadraticCurveTo(0, 3, 1.4, 8); fill(k);
    begin(); ell(-2.5, -1.6, 5.2, 1.8); ell(3, -4.8, 4.6, 1.7); ell(-1, -7.2, 3.6, 1.4); ell(5, 1, 2.8, 1.2); fill(k);
  },
  bridge(k, b) { // 明石海峡大橋
    begin(); rrect(-5.4, -7.5, 1.6, 13, 0.3); rrect(3.8, -7.5, 1.6, 13, 0.3); fill(k);
    begin(); line(-8, 2.5, 8, 2.5); stroke(k, 1.6);
    begin(); C.moveTo(-8, 0); C.quadraticCurveTo(-6, -4, -4.6, -7); C.quadraticCurveTo(0, 1.5, 4.6, -7); C.quadraticCurveTo(6, -4, 8, 0); stroke(k, 0.8);
    begin(); for (const x of [-2.8, -1, 1, 2.8]) { const y = -7 + (1 - Math.pow(x / 4.6, 2)) * 4.3; line(x, y, x, 2); } stroke(k, 0.45);
    begin(); C.moveTo(-8, 6.5); for (let x = -8; x < 8; x += 4) C.quadraticCurveTo(x + 1, 5.3, x + 2, 6.5), C.quadraticCurveTo(x + 3, 7.7, x + 4, 6.5); stroke(k, 0.8);
  },
  archbridge(k, b) { // 砂子橋（石のアーチ橋）
    begin(); C.moveTo(-8, -1); C.lineTo(8, -1); C.lineTo(8, 6); C.lineTo(5, 6); C.bezierCurveTo(4, 0.5, -4, 0.5, -5, 6); C.lineTo(-8, 6); C.closePath(); fill(k);
    begin(); line(-8, -4, 8, -4); for (const x of [-7, -3.5, 0, 3.5, 7]) line(x, -4, x, -1); stroke(k, 0.9);
    begin(); C.moveTo(-8, 7.6); C.quadraticCurveTo(-4, 6.6, 0, 7.6); C.quadraticCurveTo(4, 8.6, 8, 7.6); stroke(k, 0.8);
  },
  waterfall(k, b) {
    begin(); poly(-8, -7.5, -4.2, -8, -4, 3, -8, 3); poly(8, -7.5, 4.2, -8, 4, 3, 8, 3); fill(k);
    begin(); rrect(-4.2, -8, 8.4, 11.5, 0.6); fill(k);
    begin(); for (const x of [-2.2, 0, 2.2]) line(x, -6.8, x, 2.4); stroke(b, 0.75);
    begin(); C.moveTo(-8, 5.6); C.quadraticCurveTo(-6, 4.2, -4, 5.6); C.quadraticCurveTo(-2, 7, 0, 5.6); C.quadraticCurveTo(2, 4.2, 4, 5.6); C.quadraticCurveTo(6, 7, 8, 5.6);
    C.moveTo(-6, 8); C.quadraticCurveTo(-3, 6.8, 0, 8); C.quadraticCurveTo(3, 9.2, 6, 8); stroke(k, 1.1);
  },
  boar(k, b) { // イノシシ注意（三角のわく）
    begin(); poly(0, -8, 8, 7, -8, 7); stroke(k, 1.3);
    begin(); ell(0.4, 2.5, 3.6, 2.2); poly(-3.2, 1, -5.6, 2.2, -5.4, 3.5, -3, 3.6); fill(k);
    begin(); line(-2, 4, -2, 5.6); line(2.4, 4, 2.4, 5.6); stroke(k, 0.9);
    begin(); poly(-1.4, 0.5, -0.8, -1.2, 0.2, 0.4); fill(k);
  },
  cow(k, b) {
    begin(); rrect(-6.5, -2.5, 11, 6.5, 2.2); fill(k);
    begin(); rrect(3.4, -5.2, 4.6, 5, 1.6); fill(k);
    begin(); line(-5, 3, -5, 7.5); line(-2, 3, -2, 7.5); line(1, 3, 1, 7.5); line(3.6, 3, 3.6, 7.5); stroke(k, 1.2);
    begin(); line(4, -5, 3.2, -7); line(7.4, -5, 8.2, -7); line(-6.4, -1.5, -7.8, 2.5); stroke(k, 0.8);
    begin(); ell(-3.6, 0, 1.8, 1.3, 0.3); ell(0.6, 1.4, 1.4, 1, -0.3); circ(6.2, -3.6, 0.5); fill(b);
  },
  mountain(k, b) { // 山と星（六甲山・摩耶山）
    begin(); poly(-8, 7, -2.5, -2.5, 1, 2, 3.5, -1, 8, 7); fill(k);
    begin(); poly(-2.5, -2.5, -4, 0, -3, 0.8, -2, -0.4, -1, 0.6); fill(b);
    begin(); star(4.2, -6, 2.8, 1.2); fill(k);
  },
  rainbow(k, b) {
    const cols = ['#ef5b5b', '#ffb238', '#ffe066', '#57c67a', '#4fa3e0', '#8e6fd8'];
    cols.forEach((c, i) => { begin(); C.arc(0, 5, 8 - i * 1.1, Math.PI, 0); stroke(c, 1.15); });
    begin(); ell(-6, 5.4, 2.6, 1.4); ell(6, 5.4, 2.6, 1.4); fill(b === CUT ? '#ffffff' : b);
  },
  star(k, b) { begin(); star(0, 0.6, 8, 3.6); fill(k); begin(); star(0, 0.6, 3.2, 1.4); fill(b); },
  nightview(k, b) { // 掬星台（夜景と星）
    begin(); C.moveTo(-8, 8); C.lineTo(-8, 3); C.lineTo(-5, 3); C.lineTo(-5, 0); C.lineTo(-2, 0); C.lineTo(-2, 2); C.lineTo(1, 2); C.lineTo(1, -1); C.lineTo(4, -1); C.lineTo(4, 2.5); C.lineTo(8, 2.5); C.lineTo(8, 8); C.closePath(); fill(k);
    begin(); for (const [x, y] of [[-6.8, 4.5], [-3.6, 1.8], [-3.6, 4.5], [2.4, 0.6], [2.4, 3.4], [-0.4, 3.6], [5.6, 4.4]]) rrect(x, y, 1, 1, 0.2); fill(b);
    begin(); star(-4, -5.5, 2.4, 1); star(3.5, -6.2, 1.6, 0.7); star(6.4, -3, 1.1, 0.5); fill(k);
  },

  flag(k, b) { // 中間ポイントの旗
    begin(); line(-4, -7.5, -4, 8); stroke(k, 1.4);
    begin(); C.moveTo(-3.4, -7.5); C.quadraticCurveTo(1, -9, 7, -5.5); C.quadraticCurveTo(1, -3.5, -3.4, -2); C.closePath(); fill(k);
    begin(); star(0.8, -5.2, 1.7, 0.75); fill(b);
  },
  brick() { // われるレンガ
    begin(); rrect(-7.5, -6, 15, 12, 1); fill('#c8553d');
    begin(); line(-7.5, 0, 7.5, 0); line(-2, -6, -2, 0); line(3.5, 0, 3.5, 6); stroke('#f4c7a1', 1);
    begin(); line(1.5, -6.5, -0.5, -2, 2, 1, -1, 6.5); stroke('#2a1a14', 1.1);
  },
  // ---- ヒント用 ----
  arrowR(k) { begin(); line(-6, 0, 3, 0); stroke(k, 2); arrowHead(3, 0, 1, 0, 4, k); },
  arrowL(k) { begin(); line(6, 0, -3, 0); stroke(k, 2); arrowHead(-3, 0, -1, 0, 4, k); },
  arrowU(k) { begin(); line(0, 6, 0, -3); stroke(k, 2); arrowHead(0, -3, 0, -1, 4, k); },
  arrowD(k) { begin(); line(0, -6, 0, 3); stroke(k, 2); arrowHead(0, 3, 0, 1, 4, k); },
  plus(k) { begin(); line(-4, 0, 4, 0); line(0, -4, 0, 4); stroke(k, 1.8); },
  // 高いジャンプの山なり
  arc(k) {
    begin(); C.moveTo(-7, 7); C.quadraticCurveTo(0, -14, 6, 4); C.setLineDash([1.6, 1.8]); stroke(k, 1.3); C.setLineDash([]);
    arrowHead(6.4, 5, 0.4, 1, 2.6, k);
  },
  btnL() { btn(-1); },
  btnR() { btn(1); },
  btnJ() {
    begin(); circ(0, 0, 7.5); fill('#e0566f'); begin(); circ(0, 0, 7.5); stroke('#ffffff', 1.1);
    begin(); line(-3, 1.8, 0, -1.8, 3, 1.8); stroke('#ffffff', 1.8);
  },
  // ながおし（ボタンのまわりにわっか）
  btnHold() {
    ICONS.btnJ();
    begin(); C.arc(0, 0, 9.2, -Math.PI / 2, Math.PI * 1.1); stroke('#ffb703', 1.4);
    arrowHead(Math.cos(Math.PI * 1.1) * 9.2, Math.sin(Math.PI * 1.1) * 9.2, 0.6, -1, 2.2, '#ffb703');
  },
  qblock() {
    begin(); rrect(-7, -7, 14, 14, 2); fill('#f7b733');
    begin(); rrect(-7, -7, 14, 14, 2); stroke('#8a4b00', 1);
    begin(); C.moveTo(-3, -2.4); C.bezierCurveTo(-3, -6.4, 3.4, -6.4, 3, -2.4); C.bezierCurveTo(2.8, -0.6, 0, -0.4, 0, 1.8); stroke('#ffffff', 1.9);
    begin(); circ(0, 4.6, 1.2); fill('#ffffff');
  },
  slime() {
    begin(); C.moveTo(-7, 5.5); C.bezierCurveTo(-7.5, -5, 7.5, -5, 7, 5.5); C.closePath(); fill('#6cc46a');
    begin(); ell(-3, -1.5, 1.6, 0.9, -0.4); fill('rgba(255,255,255,0.7)');
    begin(); circ(-1.8, 1.2, 0.9); circ(2.2, 1.2, 0.9); fill('#2a3a2a');
  },
  rin() {
    if (Art.has('rin/icon')) { C.save(); C.scale(0.95, 0.95); Art.draw(C, 'rin/icon', 0, 0); C.restore(); return; }
    begin(); circ(0, 1, 6); fill('#ffd9b5');
    begin(); C.ellipse(0, -1, 6.5, 4.6, 0, Math.PI, TAU); fill('#4a2a14');
  },
  crown() {
    begin(); poly(-7, 5, -7, -4, -3.5, 0, 0, -6, 3.5, 0, 7, -4, 7, 5); fill('#ffc83d');
    begin(); poly(-7, 5, -7, -4, -3.5, 0, 0, -6, 3.5, 0, 7, -4, 7, 5); stroke('#b0701a', 0.9);
    begin(); circ(0, 1.8, 1.3); fill('#e0566f');
  }
};
// 左右ボタン（画面の◀▶と同じ見た目）
function btn(dir) {
  begin(); circ(0, 0, 7.5); fill('rgba(255,255,255,0.95)');
  begin(); circ(0, 0, 7.5); stroke('#7d8aa8', 1.1);
  begin(); poly(3 * dir, 0, -2 * dir, -3.6, -2 * dir, 3.6); fill('#4a5570');
}

export function hasPicto(name) { return !!ICONS[name]; }

function run(ctx, f, x, y, size, ink, bg) {
  C = ctx;
  ctx.save();
  ctx.translate(x, y); ctx.scale(size / 16, size / 16);
  f(ink, bg);
  ctx.restore();
  C = null;
}
// くりぬきありの絵は、小さなキャンバスに描いてから置く（できた絵はとっておく）
const cache = new Map();
const M = 1.3; // 箱の外にはみ出すぶんのゆとり
export function picto(ctx, name, x, y, size, ink = '#3a2e2a', bg = CUT) {
  const f = ICONS[name];
  if (!f) return false;
  if (bg !== CUT || typeof document === 'undefined') { run(ctx, f, x, y, size, ink, bg); return true; }
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1;
  const px = Math.max(8, Math.min(512, Math.round(size * sc * M)));
  const key = name + '|' + ink + '|' + px;
  let cv = cache.get(key);
  if (!cv) {
    if (cache.size > 400) cache.clear();
    cv = document.createElement('canvas'); cv.width = cv.height = px;
    run(cv.getContext('2d'), f, px / 2, px / 2, px / M, ink, CUT);
    cache.set(key, cv);
  }
  const d = size * M;
  ctx.drawImage(cv, x - d / 2, y - d / 2, d, d);
  return true;
}

// 看板の文字 → 絵記号
export const LABEL_PICTO = {
  // ステージ1
  'りんの家': 'home', '八雲通': 'town', 'パン': 'bread', 'カフェ': 'cup', '和菓子': 'dango', 'やおや': 'veg', 'おもちゃ': 'toy',
  'さかな': 'fish', 'ほんや': 'book', 'はなや': 'flower', 'お茶': 'tea', 'コロッケ': 'croquette',
  '春日野道商店街': 'arcade', '春日野道': 'train', '王子公園': 'train', 'くすり': 'plus', 'おにく': 'fork',
  // ステージ2
  '王子動物園': 'panda', 'キリン': 'giraffe', 'もん': 'exit', 'でぐち': 'exit', 'ゾウ': 'elephant', 'おやつ': 'juice', 'ジュース': 'juice',
  'パンダ': 'panda', 'コアラ': 'koala', 'のりもの': 'ferris', 'フラミンゴ': 'flamingo', 'ペンギン': 'penguin',
  '旧ハンター住宅': 'mansion', 'しんこうべ': 'shinkansen',
  // ステージ3
  '新神戸駅': 'shinkansen', '新神戸': 'shinkansen', '布引の滝': 'waterfall', '雌滝': 'waterfall', '鼓ヶ滝': 'waterfall',
  '夫婦滝': 'waterfall', '雄滝': 'waterfall', '砂子橋': 'archbridge', 'イノシシ注意': 'boar', 'おんたき茶屋': 'tea',
  '滝見だんご': 'dango', 'ロープウェイ': 'gondola',
  // ステージ4
  '山麓駅': 'gondola', '風の丘駅': 'gondola', '山頂駅': 'gondola', '風の丘': 'wind', 'ハーブ園': 'herb', 'レストハウス': 'fork',
  // ステージ5
  '北野町': 'mansion', '北野坂': 'slope', 'うろこの家': 'scales', '風見鶏の館': 'rooster', '萌黄の館': 'mansion',
  // ステージ6
  '神戸三宮駅': 'train', '三宮駅': 'train', '三宮': 'train', 'ふく': 'shirt', 'くつ': 'shoe', 'ざっか': 'gift',
  '三宮センター街': 'arcade', '南京町': 'gate', '長安門': 'porkbun', '西安門': 'gyoza', '豚まん': 'porkbun', '餃子': 'gyoza', 'ごま団子': 'sesame',
  // ステージ7
  '神戸港': 'anchor', 'ハーバーランド': 'ferris', 'れんが倉庫': 'warehouse',
  // ステージ8
  '須磨海浜水族園': 'aquarium', '須磨海岸': 'beach', '海の家': 'parasol', 'シャチ': 'orca', 'かき氷': 'shaveice',
  // ステージ9
  '舞子公園': 'pine', '明石海峡大橋': 'bridge',
  // ステージ10
  '六甲山牧場': 'cow', 'ケーブル下': 'cablecar', '虹の駅': 'rainbow', '星の駅': 'star', '掬星台': 'nightview',
  // ゴールの「つぎの場所」
  '王子動物園へ': 'panda', '新神戸へ': 'shinkansen', 'ロープウェイ乗り場へ': 'gondola', '北野異人館へ': 'rooster',
  '三宮へ': 'gate', 'メリケンパークへ': 'porttower', '須磨海岸へ': 'parasol', '舞子へ': 'bridge', '六甲山へ': 'mountain'
};
// 本物の景色に書いてある文字（モニュメントなど）はそのまま残す
const KEEP = new Set(['BE KOBE', '氷', '?', '？']);

// 看板の文字を描くかわりに絵記号を描く。size は文字の大きさ（絵は少し大きめにする）
// 絵記号がない文字（ふりがな・英語など）は何も描かない
export function labelPicto(ctx, str, x, y, size, ink) {
  if (KEEP.has(str)) return 'text';
  const key = LABEL_PICTO[str];
  if (!key) return 'skip';
  picto(ctx, key, x, y, size * 1.45, ink);
  return 'drawn';
}
