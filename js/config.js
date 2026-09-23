// ゲーム全体の設定値
// 数値をいじると操作感が変わります（単位: ピクセル / 秒）

export const TILE = 16;          // 1マスの大きさ（ゲーム内ピクセル）
export const ROWS = 15;          // 画面の縦マス数
export const VIEW_H = TILE * ROWS; // 画面の高さ = 240
export const MIN_VIEW_W = 320;   // 画面の横幅（最小）
export const MAX_VIEW_W = 568;   // 画面の横幅（最大）
export const STEP = 1 / 60;      // 1回の更新の時間

export const START_LIVES = 5;    // 残り人数の初期値
export const STAR_TIME = 10;     // スター（無敵）の時間
export const HURT_INVINCIBLE = 1.8; // ダメージ後の無敵時間

export const PHYS = {
  gravityUpHold: 1000, // ジャンプボタンを押している間の上昇中の重力（小さいほど高く飛ぶ）
  gravityUp: 2400,     // ジャンプボタンを離した後の上昇中の重力
  gravityDown: 1800,   // 落下中の重力
  maxFall: 480,        // 落下の最高速度
  walkSpeed: 100,      // 歩く速さ
  runSpeed: 150,       // 押しっぱなしで加速したときの最高速度
  runDelay: 0.3,       // 加速が始まるまでの時間
  accelGround: 700,    // 地上での加速
  accelRun: 150,       // 歩き→走りの加速
  accelAir: 450,       // 空中での加速
  turnBoost: 2.2,      // 切り返し時の加速倍率
  friction: 900,       // 地上で手を離したときの減速
  airDrag: 150,        // 空中で手を離したときの減速
  jumpVel: 380,        // ジャンプの初速
  jumpVelRun: 410,     // 走りジャンプの初速
  coyote: 0.1,         // 足場から落ちた直後でもジャンプできる猶予
  jumpBuffer: 0.12,    // 着地直前のジャンプ入力を受け付ける猶予
  stompBounce: 280,    // 敵をふんだときのはね返り
  stompBounceHold: 400 // 敵をふんだときにジャンプを押していた場合
};

// タイルの種類
export const T = {
  EMPTY: 0,
  GROUND: 1,   // 地面
  BRICK: 2,    // レンガ
  QBLOCK: 3,   // ？ブロック
  USED: 4,     // 使用済みブロック
  HARD: 5,     // かたいブロック（建物のかべなどにも使う）
  PIPE: 6,     // 土管
  SEMI: 7,     // 下からすり抜けられる足場（屋根・橋・ちょうちんなど）
  SPIKE: 8,    // トゲ
  LAVA: 9,     // マグマ
  HIDDEN: 10,  // かくしブロック
  FAKE: 11,    // すり抜けられるニセのブロック
  FAKEG: 12,   // すり抜けられるニセの地面
  COIN: 13,    // コイン
  SLOPE_R: 14, // 右上がりの坂（急）
  SLOPE_L: 15, // 左上がりの坂（急）
  SLOPE_R1: 16, // 右上がりのゆるい坂（下半分）
  SLOPE_R2: 17, // 右上がりのゆるい坂（上半分）
  SLOPE_L2: 18, // 左上がりのゆるい坂（上半分）
  SLOPE_L1: 19, // 左上がりのゆるい坂（下半分）
  WATER: 20,   // 水（海・川・池）
  ISEMI: 21,   // 見えないすり抜け足場（飾りの絵の上に乗るとき用）
  ISOLID: 22   // 見えないかべ
};

export function isSolidTile(t) {
  return t === T.GROUND || t === T.BRICK || t === T.QBLOCK || t === T.USED ||
         t === T.HARD || t === T.PIPE || t === T.ISOLID;
}
export function isSemiTile(t) { return t === T.SEMI || t === T.ISEMI; }
export function isSlope(t) { return t >= T.SLOPE_R && t <= T.SLOPE_L1; }

// 坂のタイルの、横位置 px における地面の高さ（y座標）
export function slopeSurface(t, tx, ty, px) {
  const lx = Math.max(0, Math.min(TILE, px - tx * TILE));
  const top = ty * TILE;
  switch (t) {
    case T.SLOPE_R: return top + TILE - lx;
    case T.SLOPE_L: return top + lx;
    case T.SLOPE_R1: return top + TILE - lx / 2;
    case T.SLOPE_R2: return top + TILE / 2 - lx / 2;
    case T.SLOPE_L2: return top + lx / 2;
    case T.SLOPE_L1: return top + TILE / 2 + lx / 2;
  }
  return top + TILE;
}
