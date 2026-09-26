// 絵の登録簿。各ファイルで sprite() を呼ぶと、build.mjs がシートにまとめて書き出す
export const SPRITES = [];
export const BACKGROUNDS = {};
export const PICTURES = [];

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

// あるテーマの絵を作り直すとき、古い背景とタイル（t/<theme>/...）を消す
// tools/art/stages/*.mjs の先頭で resetTheme('zoo') のように呼ぶ
export function resetTheme(theme) {
  BACKGROUNDS[theme] = [];
  dropSprites(n => n.startsWith(`t/${theme}/`));
}
// 名前が条件に合う絵を登録簿から消す（同じ名前で描き直すとき用）
export function dropSprites(pred) {
  for (let i = SPRITES.length - 1; i >= 0; i--) if (pred(SPRITES[i].name)) SPRITES.splice(i, 1);
}

// 1枚絵（ステージ選択の地図など）。art/<name>.svg に書き出す。draw(defs) は viewBox 0 0 w h の中身
export function picture(name, w, h, draw) { PICTURES.push({ name, w, h, draw }); }
