// 絵の登録簿。各ファイルで sprite() を呼ぶと、build.mjs がシートにまとめて書き出す
export const SPRITES = [];
export const BACKGROUNDS = {};

// sheet: 書き出すシート名 / name: 絵の名前 / w,h: 大きさ（ゲーム内の1ドット単位）
// ax,ay: 基準点（足元など）/ draw(defs): SVGの中身を返す関数（左上が 0,0）
export function sprite(sheet, name, w, h, ax, ay, draw) {
  if (SPRITES.some(s => s.name === name)) throw new Error('duplicate sprite ' + name);
  SPRITES.push({ sheet, name, w, h, ax, ay, draw });
}

// 背景の層。theme ごとに奥から順に登録する
// f: 動く速さ（0 = 動かない, 1 = 地面と同じ）/ w: 横にくり返す幅 / draw(defs, w): SVGの中身
export function bgLayer(theme, opts, draw) {
  (BACKGROUNDS[theme] ||= []).push({ ...opts, draw });
}
