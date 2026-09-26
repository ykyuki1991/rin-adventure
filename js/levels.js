// ステージデータ（神戸の10か所）
// 座標は「マス」単位。x = 左から何マス目、y = 上から何マス目（地面の表面はふつう y=13、画面は縦15マス）
// 使える命令は level.js の LevelBuilder を参照
import { LevelBuilder } from './level.js';
import { T, isSlope, isSemiTile } from './config.js';

// ステージ1：八雲通・春日野道（りんの家 → 商店街 → 電車 → 坂道）
function stage1() {
  const b = new LevelBuilder({ id: 1, name: '八雲通・春日野道', kana: 'やくもどおり・かすがのみち', theme: 'yakumo', bgm: 'field', w: 205, goalLabel: '王子動物園へ' });
  b.ground(0, 85);
  // 八雲通（りんの家・パン屋・カフェ・和菓子屋）
  b.deco('yhouse', 1, 13, { text: 'りんの家' });
  b.deco('bld', 8, 13, { shop: 'pan' });
  b.deco('bld', 13, 13, { shop: 'cafe' });
  b.deco('ytree', 18.5, 13);
  b.deco('bld', 21, 13, { shop: 'wagashi' });
  b.deco('pots', 27, 13).deco('ylamp', 29, 13);
  b.sign(7, '八雲通', 'やくもどおり', 13, 'street');
  b.start(9);
  b.row(13, 9, '?');
  b.row(15, 10, 'ooo');
  b.enemy('slime', 22);
  b.pipe(25, 2);
  // 春日野道商店街（アーケードの屋根にも乗れる）
  b.mat('wood', () => b.stairs(30, 3));
  b.deco('arcade', 33, 13, { w: 39, wpx: 640, shops: ['yaoya', 'omocha', 'sakana', 'honya', 'hanaya', 'wagashi', 'pan', 'ocha', 'korokke'] });
  b.deco('ygate', 33, 13, { wpx: 100 }).deco('ygate', 66.5, 13, { wpx: 100 });
  b.mat('arcade', () => b.row(33, 6, '======================================='));
  b.row(37, 9, '?');
  b.row(45, 9, 'B?B');
  b.row(51, 9, 'P');
  b.row(58, 9, 'BKB');
  b.row(64, 9, '?');
  b.row(40, 5, 'o.o.o.o.o.o.o.o.o.o.o');
  b.medal(70, 5, 'アーケードの屋根の上のはし');
  b.enemy('slime', 41).enemy('slime', 48).enemy('spiky', 55).enemy('slime', 61).enemy('slime', 67);
  b.enemy('bird', 60, 3);
  // 春日野道駅 → 電車に乗って王子公園駅へ
  b.stairs(74, 4);
  b.mat('rail', () => b.rect(78, 10, 85, 12, 'X'));
  b.mat('platform', () => b.row(78, 9, 'XXXXXXXX'));
  b.deco('ystation', 78, 9, { w: 8 });
  b.sign(80, '春日野道', 'かすがのみち', 9, 'station');
  b.deco('viaduct', 86, 9, { w: 31 });
  b.water(86, 116);
  b.train(86, 9, 26, { speed: 75, dwell: 1.8 });
  b.medal(101, 5, '電車の上でジャンプ');
  b.mat('rail', () => b.rect(117, 10, 125, 12, 'X'));
  b.mat('platform', () => b.row(117, 9, 'XXXXXXXXX'));
  b.deco('ystation', 117, 9, { w: 9 });
  b.sign(121, '王子公園', 'おうじこうえん', 9, 'station');
  b.ground(117, 125);
  b.stairs(126, 4, -1);
  b.ground(126, 204, 13);
  b.deco('house2', 126.5, 13).deco('ylamp', 135, 13);
  b.checkpoint(132);
  // 山側へ向かう坂道
  b.enemy('slime', 136);
  b.rampUp(138, 13, 3, true);
  b.ground(144, 158, 10);
  b.deco('ytree', 146, 10).deco('ytree', 156, 10, { flip: true }).deco('pots', 150, 10).deco('ylamp', 153, 10);
  b.deco('house2', 162.5, 8).deco('pots', 168.5, 8).deco('ylamp', 171, 8).deco('bld', 175.5, 8, { shop: 'cafe' });
  b.deco('ytree', 183, 8).deco('ylamp', 187, 8).deco('ytree', 199, 8, { flip: true }).deco('pots', 201.5, 8);
  for (const [x, y, v, k] of [[145, 10, 0, 0.8], [156.5, 10, 1, 0.7], [163, 8, 1, 1], [171.5, 8, 0, 0.6], [180, 8, 1, 0.85], [188.5, 8, 0, 0.55], [197, 8, 1, 1]]) b.deco('ivy', x, y, { v, s: k, layer: 'mid', flip: x % 2 === 0 });
  for (const [x, y] of [[165, 11], [178, 12], [191, 11], [148, 13], [203, 12]]) b.deco('drain', x, y, { layer: 'mid' });
  b.row(150, 7, 'h');
  b.medal(150, 3, '坂の上の 見えないブロックに乗る');
  b.enemy('slime', 147, 9).enemy('spiky', 154, 9);
  b.rampUp(159, 10, 2);
  b.ground(161, 204, 8);
  b.row(167, 4, 'B?B');
  b.row(172, 7, 'ooooo');
  b.enemy('slime', 170, 7).enemy('boar', 175, 7).enemy('bird', 178, 3).enemy('spiky', 182, 7);
  // はじめての人へのヒント
  b.hint(6, 7, '◀ ▶ で歩く\nジャンプボタンで とぶ');
  b.hint(14, 7, '？ブロックを 下からたたこう');
  b.hint(20, 8, '敵は 上から ふんで たおそう');
  b.hint(27, 8, 'ジャンプを長く押すと\n高くとべるよ');
  b.hint(82, 6, '電車に乗って\n川をわたろう');
  // コインの道しるべ
  b.coinArc(18, 24, 11, 2).coinArc(24, 29, 10, 2);
  b.coinArc(89, 96, 6, 1).coinArc(104, 111, 6, 1);
  b.coinArc(139, 146, 9, 2).coinsAbove(184, 188, 1, 5);
  b.goal(190, 8);
  return b.build();
}

// ステージ2：王子動物園（キリン・ゾウ・フラミンゴ・観覧車）
function stage2() {
  const b = new LevelBuilder({ id: 2, name: '王子動物園', kana: 'おうじどうぶつえん', theme: 'zoo', bgm: 'zoo', w: 210, goalLabel: '新神戸へ' });
  b.ground(0, 45);
  // 入り口の門・桜・売店
  b.deco('s2_gate', 1, 13, { wpx: 140 });
  b.deco('s2_lamp', 10, 13);
  b.deco('s2_sakura', 13.5, 13, { wpx: 70 }).deco('s2_signpost', 20, 13, { labels: ['キリン', 'もん', 'ゾウ'] });
  b.deco('s2_sakura', 22, 13, { flip: true, s: 0.9, wpx: 70 }).deco('s2_kiosk', 25, 13, { wpx: 70 }).deco('s2_sakura', 30.5, 13, { s: 0.95, wpx: 70 });
  b.start(11);
  b.row(16, 9, '?BJ');                  // ジャンプぐつ
  b.enemy('slime', 24).enemy('penguin', 28);
  // キリンの頭に乗って高いところへ
  b.deco('s2_giraffe', 34, 13, { wpx: 140 });
  b.sign(33, 'キリン', '', 13, 'board');
  b.platform(37, 11, { move: 'v', range: -5, speed: 0.4, width: 2, look: 'giraffe', base: 13, phase: 0.5 });
  b.platform(42, 11, { move: 'v', range: -5, speed: 0.4, width: 2, look: 'giraffe', base: 13 });
  b.medal(39, 2, 'キリンの頭からジャンプ');
  b.ground(46, 70, 7);
  // 丘の上：パンダの竹やぶ
  b.deco('s2_tree', 48, 7, { s: 0.9, wpx: 60 }).deco('s2_panda', 55, 7, { wpx: 130 }).deco('s2_sakura', 67, 7, { s: 0.85, wpx: 70 });
  for (const [x, v, k] of [[47, 0, 0.8], [53.5, 1, 0.9], [62, 0, 0.7], [68.5, 1, 1]]) b.deco('ivy', x, 7, { v, s: k, layer: 'mid', flip: x % 2 < 1 });
  b.row(55, 3, '?P?');
  b.enemy('penguin', 50, 6).enemy('slime', 60, 6).enemy('spiky', 66, 6);
  b.rampDown(71, 7, 6, true);
  b.deco('s2_sakura', 76, 9.6, { flip: true, s: 0.9, wpx: 70 });
  b.ground(83, 108);
  // ゾウのシャワーで生け垣をこえる
  b.deco('s2_elephantYard', 82, 13, { wpx: 150 });
  b.sign(84, 'ゾウ', '', 13, 'board');
  b.deco('s2_elephant', 86, 13, { wpx: 80 });
  b.zone('spray', 89, 1, 2, 12, { power: 2600, cap: 340 });
  b.mat('hedge', () => b.rect(92, 4, 93, 12, 'X'));
  b.medal(97, 3, '生け垣の上からジャンプ');
  // コアラ館
  b.deco('s2_signpost', 95, 13, { labels: ['コアラ', 'ゾウ', 'のりもの'] });
  b.deco('s2_koala', 99.5, 13, { wpx: 110 }).deco('s2_fence', 105.3, 13, { w: 2.5 });
  b.checkpoint(99);
  b.enemy('frog', 104);
  // フラミンゴの池（ハスの葉をわたる）
  b.deco('s2_pond', 108.5, 13, { wpx: 240 });
  b.water(109, 122);
  b.platform(111, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0 });
  b.platform(115, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0.3 });
  b.platform(119, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0.6 });
  b.deco('s2_flamingo', 110, 13, { v: 0 }).deco('s2_flamingo', 113, 13, { v: 1, flip: true }).deco('s2_flamingo', 118, 13, { v: 1 }).deco('s2_flamingo', 121, 13, { v: 0, flip: true });
  b.deco('s2_reeds', 108.2, 13).deco('s2_reeds', 122.6, 13, { flip: true });
  b.ground(123, 209);
  b.enemy('frog', 126);
  // のりもの広場：豆汽車・メリーゴーランド・観覧車
  b.deco('s2_train', 123.5, 13, { wpx: 80 });
  b.deco('s2_merry', 131, 13, { wpx: 100 });
  b.deco('s2_booth', 136.3, 13);
  b.wheel(142, 6, 4.5, 6, 0.35, { base: 13 });
  b.decos[b.decos.length - 1].type = 's2_wheel';
  b.decos[b.decos.length - 1].wpx = 200;
  b.medal(142, 6, '観覧車のまん中');
  b.mat('hedge', () => b.rect(148, 2, 149, 12, 'X'));
  b.sign(152, 'ペンギン', '', 13, 'board');
  b.deco('s2_fence', 150.5, 13, { w: 5 }).deco('s2_tree', 157, 13, { wpx: 60 }).deco('s2_lamp', 161, 13).deco('s2_kiosk', 163.5, 13, { text: 'ジュース', wpx: 70 });
  b.deco('s2_sakura', 170.5, 13, { s: 0.95, wpx: 70 });
  // 旧ハンター住宅
  b.deco('s2_hunter', 174, 13, { wpx: 160 });
  b.deco('s2_sakura', 185.5, 13, { wpx: 70 }).deco('s2_signpost', 190, 13, { labels: ['しんこうべ', 'もん', 'でぐち'] });
  b.enemy('penguin', 156).enemy('spiky', 162).enemy('penguin', 168).enemy('bird', 172, 7).enemy('slime', 178);
  b.row(165, 9, 'B?B?B');
  b.hint(32, 8, 'キリンの頭に乗ろう');
  b.hint(85, 4, 'ゾウのシャワーに乗ると\n上までとべるよ');
  // コインの道しるべ
  b.coinArc(18, 23, 11, 2).coinArc(35, 45, 5, 2);
  b.row(89, 4, 'oo').row(89, 7, 'oo').row(89, 10, 'oo');
  b.coinArc(112, 115, 11, 2).coinArc(116, 119, 11, 2).coinArc(120, 123, 11, 2);
  b.coinArc(151, 158, 11, 2).coinArc(185, 192, 12, 3);
  b.goal(195);
  return b.build();
}

// ステージ3：新神戸・布引の滝（雌滝・鼓ヶ滝・夫婦滝・雄滝）
function stage3() {
  const b = new LevelBuilder({ id: 3, name: '新神戸・布引の滝', kana: 'しんこうべ・ぬのびきのたき', theme: 'shinkobe', bgm: 'cave', w: 215, goalLabel: 'ロープウェイ乗り場へ' });
  // 新神戸駅のホーム（駅の建物・止まっている新幹線・屋根）
  b.deco('s3_station', 12.2, 13, { wpx: 150 });
  b.deco('s3_shinkansen', 0, 9, { w: 12, wpx: 200 });
  b.mat('rail', () => b.rect(0, 10, 13, 12, 'X'));
  b.mat('platform', () => b.row(0, 9, 'XXXXXXXXXXXXXX'));
  b.deco('s3_roof', 0, 9, { w: 14, wpx: 230 });
  b.sign(11, '新神戸', 'しんこうべ', 9, 'station');
  b.ground(0, 13);
  b.start(9, 8);
  b.stairs(14, 4, -1);
  b.ground(14, 30);
  // 駅前の広場 → 山道の入り口
  b.deco('s3_clock', 18.3, 13).deco('s3_planter', 19.9, 13).deco('s3_ztree', 23, 13, { wpx: 60 });
  b.deco('s3_fern', 24.6, 13).deco('s3_maple', 27, 13, { v: 0, wpx: 70 }).deco('s3_lantern', 29.6, 13);
  b.sign(21, '布引の滝', 'ぬのびきのたき', 13, 'wood');
  b.theme(31, 'falls');
  b.enemy('slime', 27);
  b.mat('rock', () => b.stairs(31, 3));
  b.ground(34, 40, 10);
  // 雌滝
  b.deco('s3_cliff', 44, 12.5, { v: 1, wpx: 90 });
  b.deco('s3_cedar', 34.5, 10, { s: 0.9 }).deco('s3_kahi', 36, 10);
  b.sign(38, '雌滝', 'めんたき', 10, 'wood');
  b.water(41, 46, 12);
  b.mat('rock', () => b.row(43, 11, 'XX'));
  b.zone('fall', 43, 0, 2, 11, { power: 1000 });
  b.ground(47, 60, 10);
  b.deco('s3_boulder', 48.5, 10, { v: 0 }).deco('s3_maple', 51, 10, { v: 1, s: 0.9, wpx: 70 }).deco('s3_fern', 55, 10);
  b.mat('rock', () => b.rect(53, 0, 60, 2, 'X'));
  b.enemy('rock', 57, 3);
  b.row(48, 6, 'h');
  b.medal(48, 2, '雌滝のすぐ先、見えないブロックに乗る');
  b.enemy('frog', 51, 9);
  // 鼓ヶ滝（丸太に乗って）
  b.deco('s3_cliff', 68, 13.5, { v: 1, wpx: 90 });
  b.sign(58, '鼓ヶ滝', 'つづみがたき', 10, 'wood');
  b.rampDown(61, 10, 3);
  b.ground(64, 64);
  b.water(65, 70);
  b.zone('fall', 67, 0, 2, 12, { power: 1000 });
  b.platform(65, 12, { move: 'h', range: 4, speed: 0.4, width: 2, look: 'log' });
  b.ground(71, 89, 12);
  b.deco('s3_maple', 73.5, 12, { v: 0, wpx: 70 }).deco('s3_cedar', 77.5, 12).deco('s3_boulder', 81, 12, { v: 1 }).deco('s3_post', 84.5, 12, { text: '砂子橋' });
  b.checkpoint(74, 12);
  b.enemy('slime', 78, 11).enemy('spiky', 84, 11);
  b.mat('rock', () => b.rect(79, 0, 86, 2, 'X'));
  b.enemy('rock', 82, 3);
  // 砂子橋（石のアーチの橋）
  b.deco('s3_arch', 95.5, 11, { wpx: 200 });
  b.sign(87, '砂子橋', 'いさごばし', 12, 'wood');
  b.path(90, 12, [['up2', 1], ['flat', 7], ['down2', 1]], 'wood');
  b.row(92, 9, 'ooooooo');
  b.medal(95, 6, '橋の上でジャンプ');
  b.enemy('slime', 95, 10);
  b.ground(101, 106, 12);
  // 夫婦滝（2本ならんだ滝）
  b.deco('s3_cliff', 110, 12.5, { v: 2, wpx: 140 });
  b.deco('s3_fern', 101.4, 12);
  b.sign(103, '夫婦滝', 'めおとだき', 12, 'wood');
  b.water(107, 112, 12);
  b.mat('rock', () => b.row(109, 11, 'XX'));
  b.zone('fall', 107, 0, 1, 11, { power: 900 });
  b.zone('fall', 112, 0, 1, 11, { power: 900 });
  b.ground(113, 124, 12);
  b.deco('s3_maple', 116.5, 12, { v: 1, wpx: 70 }).deco('s3_kahi', 120.5, 12).deco('s3_boulder', 123, 12, { v: 0, flip: true });
  b.enemy('frog', 118, 11);
  b.rampUp(125, 12, 3);
  b.ground(128, 146, 9);
  b.deco('s3_cedar', 130.5, 9).deco('s3_maple', 135.5, 9, { v: 0, wpx: 70 }).deco('s3_lantern', 140.5, 9).deco('s3_fern', 142.5, 9, { flip: true });
  b.sign(129, 'イノシシ注意', 'いのししちゅうい', 9, 'wood');
  b.enemy('boar', 134, 8).enemy('bird', 138, 4);
  // 雄滝（いちばん大きな滝。丸太に乗って下をくぐる）
  b.deco('s3_cliff', 151.5, 11.5, { v: 3, wpx: 120 });
  b.sign(144, '雄滝', 'おんたき', 9, 'wood');
  b.water(147, 154, 11);
  b.zone('fall', 150, 0, 3, 11, { power: 1300 });
  b.platform(147, 10, { move: 'h', range: 6, speed: 0.3, width: 2, look: 'log' });
  b.medal(151, 7, '雄滝の中でジャンプ');
  b.ground(155, 164, 9);
  b.deco('s3_teahouse', 156.5, 9, { wpx: 100 });
  b.enemy('frog', 159, 8);
  b.rampUp(165, 9, 3);
  b.ground(168, 214, 6);
  b.row(176, 2, '?S?');
  b.enemy('slime', 174, 5).enemy('spiky', 181, 5).enemy('boar', 190, 5).enemy('bird', 192, 2);
  b.deco('s3_maple', 170, 6, { v: 1, wpx: 70 }).deco('s3_cedar', 174.5, 6).deco('s3_boulder', 179, 6, { v: 1 }).deco('s3_kahi', 184, 6);
  b.deco('s3_maple', 188.5, 6, { v: 0, wpx: 70 }).deco('s3_post', 193, 6, { text: 'ロープウェイ' }).deco('s3_lantern', 195.5, 6).deco('s3_maple', 198, 6, { v: 1, s: 0.85, wpx: 70 });
  for (const [x, y, v, k] of [[35.5, 10, 0, 0.6], [52, 10, 1, 0.7], [59, 10, 0, 0.6], [76, 12, 0, 0.5], [118, 12, 1, 0.5], [132, 9, 1, 0.8], [139.5, 9, 0, 0.7], [160, 9, 1, 0.8],
    [171, 6, 0, 0.9], [177.5, 6, 1, 1], [185, 6, 0, 0.8], [191.5, 6, 1, 1], [199, 6, 0, 0.9], [206, 6, 1, 1]]) b.deco('ivy', x, y, { v, s: k, layer: 'mid', flip: x % 2 < 1 });
  b.checkpoint(156, 9);                 // 雄滝をこえたところ
  b.hint(39, 6, '滝の中は\n下へおされるよ');
  // コインの道しるべ
  b.coinArc(40, 47, 9, 2).coinArc(64, 71, 10, 2).coinArc(106, 113, 10, 2);
  b.coinsAbove(129, 143, 3, 0).coinArc(183, 189, 5, 2);
  b.goal(200, 6);
  return b.build();
}

// ステージ4：布引ロープウェイ（ゴンドラで山の上のハーブ園へ）
function stage4() {
  const b = new LevelBuilder({ id: 4, name: '布引ロープウェイ', kana: 'ぬのびきロープウェイ', theme: 'ropeway', bgm: 'sky', w: 220, goalLabel: '北野異人館へ' });
  b.ground(0, 14);
  // ふもとの駅（屋根の上にも乗れる）
  b.deco('s4_station', 1, 13, { v: 0, text: '山麓駅', wpx: 240 });
  b.row(1, 9, '--------------');
  b.medal(4, 4, '駅の屋根の上');
  b.start(9);
  // 1本目のロープウェイ
  b.ropeway(14, 12, 60, 9, 4, 42);
  b.deco('s4_pylon', 36, 12, { v: 'A' });
  b.mat('steel', () => b.rect(36, 12, 36, 14, 'X'));
  b.enemy('bird', 30, 7).enemy('bird', 48, 5);
  // 風の丘中間駅
  b.ground(59, 76, 9);
  b.deco('s4_station', 59, 9, { v: 1, text: '風の丘駅', wpx: 140 });
  b.row(59, 5, '--------');
  b.deco('s4_flowerbed', 67, 9).deco('s4_tree', 70.5, 9, { s: 0.8 }).deco('s4_gantry', 76, 9);
  b.sign(68, '風の丘', 'かぜのおか', 9, 'wood');
  b.checkpoint(72, 9);
  b.enemy('slime', 74, 8);
  // 2本目のロープウェイ（風がふく）
  b.ropeway(77, 9, 124, 7, 4, 42);
  b.deco('s4_pylon', 100, 10, { v: 'B' });
  b.mat('steel', () => b.rect(100, 10, 100, 14, 'X'));
  b.zone('wind', 86, 0, 30, 9, { period: 3.5, duty: 0.45, dir: 1, flip: true, power: 45 });
  b.medal(100, 3, '鉄塔の上でジャンプ');
  b.enemy('bird', 92, 3).enemy('bird', 112, 4);
  // ハーブ園（山頂駅・レストハウス・温室・ラベンダー畑）
  b.ground(122, 219, 7);
  b.deco('s4_station', 122, 7, { v: 1, text: '山頂駅', wpx: 140 });
  b.row(122, 3, '--------');
  b.sign(131, 'ハーブ園', 'はーぶえん', 7, 'board');
  b.deco('s4_lamp', 133, 7).deco('s4_planter', 134, 7);
  b.row(135, 3, '?P?');
  b.deco('s4_resthouse', 139, 7, { wpx: 150 });
  b.enemy('boar', 140, 6).enemy('bird', 144, 3);
  // 温室（左のかべはすり抜けられる）
  b.deco('s4_terrace', 146.3, 7);
  b.deco('s4_greenhouse', 150, 7);
  b.walls(150, 157, 3, 6, 'glass');
  b.rect(151, 4, 156, 6, '_');
  b.mat('glass', () => { b.put(150, 5, 'Z'); b.put(150, 6, 'Z'); });
  b.row(151, 6, 'ooo');
  b.medal(155, 6, '温室の中');
  b.deco('s4_cypress', 158, 7).deco('s4_lavender', 159, 7, { n: 2, wpx: 200 });
  b.enemy('spiky', 162, 6);
  b.rampUp(168, 7, 2, true);
  b.ground(172, 183, 5);
  b.deco('s4_lavender', 172, 5, { n: 2, wpx: 200 }).deco('s4_bench', 177, 5).deco('s4_lamp', 181, 5);
  b.enemy('slime', 176, 4).enemy('boar', 181, 4);
  b.rampDown(184, 5, 2, true);
  b.ground(188, 219, 7);
  b.deco('s4_scope', 189, 7).deco('s4_planter', 190.5, 7).deco('s4_tree', 197, 7).deco('s4_lamp', 201, 7).deco('s4_bench', 202, 7);
  b.deco('s4_cypress', 208, 7).deco('s4_terrace', 209, 7).deco('s4_lavender', 213, 7, { n: 1, wpx: 100 });
  b.enemy('spiky', 194, 6).enemy('bird', 198, 3);
  // 石がきのツタと花（タイルの前）
  for (const [x, y, v, k] of [[61, 9, 0, 0.7], [70, 9, 1, 0.6], [127, 7, 1, 0.9], [145, 7, 0, 1], [163, 7, 1, 0.8], [176, 5, 0, 1], [193, 7, 1, 0.9], [212, 7, 0, 0.8]]) b.deco('s4_ivy', x, y, { v, s: k, layer: 'mid', flip: x % 2 === 0 });
  b.checkpoint(126, 7);                 // 2本目のロープウェイをおりたところ
  b.hint(10, 8, 'ゴンドラに 乗ろう');
  b.hint(74, 5, '風がふくと\n横に流されるよ');
  // コインの道しるべ（ゴンドラの通り道の少し上）
  b.coinLine(20, 9, 56, 6, 4).coinLine(82, 6, 120, 4, 4);
  b.coinArc(128, 134, 6, 2).coinArc(185, 191, 6, 2).coinsAbove(200, 203, 1, 0);
  b.goal(205, 7);
  // ワイヤーはこのステージの絵で描く
  for (const d of b.decos) if (d.type === 'cable') d.type = 's4_cable';
  return b.build();
}

// ステージ5：北野・異人館（坂道・異人館の屋根・風見鶏の風）
function stage5() {
  const b = new LevelBuilder({ id: 5, name: '北野・異人館', kana: 'きたの・いじんかん', theme: 'kitano', bgm: 'kitano', w: 215, goalLabel: '三宮へ' });
  const WIND = { period: 3, duty: 0.55, dir: 1, flip: true };
  b.ground(0, 30);
  b.start(9);
  // 北野町（クリーム色の洋館・鉄のさく・街灯・花）
  b.deco('s5_rhine', 0.5, 13, { wpx: 130 });
  b.deco('s5_cypress', 15.5, 13).deco('s5_conifer', 22, 13).deco('s5_cypress', 27.5, 13, { s: 0.85 });
  b.deco('s5_fence', 8.5, 13, { w: 21, wpx: 340 });
  b.deco('s5_lamp', 10, 13).deco('s5_planter', 13.5, 13).deco('s5_pot', 19, 13).deco('s5_lamp', 25, 13);
  b.sign(12, '北野町', 'きたのちょう', 13, 'street');
  b.row(18, 9, '?J?');                  // ジャンプぐつ（屋根の上へ行きやすい）
  b.enemy('slime', 24).enemy('bird', 27, 8);
  // 北野坂をのぼる
  b.sign(29, '北野坂', 'きたのざか', 13, 'board');
  b.rampUp(31, 13, 4, true);
  b.ground(39, 100, 9);
  // うろこの家（屋根の上まで行ける）
  b.deco('s5_cypress', 38.5, 9, { s: 0.9 }).deco('s5_pot', 52.5, 9);
  b.sign(40, 'うろこの家', 'うろこのいえ', 9, 'board');
  b.walls(44, 50, 7, 8, 'uroko', 'urokowin', 3);
  b.gable(43, 51, 6, 'roofK');
  b.medal(47, 1, 'うろこの家の屋根のてっぺん');
  b.deco('s5_tree', 58, 9, { s: 0.9 }).deco('s5_fence', 53, 9, { w: 13, wpx: 220 });
  b.deco('s5_lamp', 54, 9).deco('s5_planter', 61.5, 9).deco('s5_cypress', 66.5, 9);
  b.enemy('slime', 54, 8);
  b.row(60, 5, '?P?');
  b.enemy('spiky', 63, 8);
  // 風見鶏の館（風が右へ左へふく。塔の上の風見鶏が風の向きを教えてくれる）
  b.deco('s5_tower', 69, 9, { wind: { x: 62 * 16, w: 30 * 16, ...WIND }, wpx: 60 });
  b.sign(64.5, '風見鶏の館', 'かざみどりのやかた', 9, 'board');
  b.mat('wood', () => b.row(69, 7, '=='));   // 屋根へ上がる白いベランダ
  b.walls(72, 78, 7, 8, 'brick', 'brickwin', 2);
  b.gable(71, 79, 6, 'roof');
  b.zone('wind', 62, 0, 30, 9, { ...WIND, power: 45 });
  b.medal(73, 1, '風見鶏の館の屋根の上でジャンプ');
  b.deco('s5_conifer', 83.5, 9).deco('s5_tree', 96, 9, { flip: true });
  b.deco('s5_fence', 80, 9, { w: 20, wpx: 330 });
  b.deco('s5_lamp', 81, 9).deco('s5_planter', 87.5, 9).deco('s5_pot', 92, 9).deco('s5_lamp', 99, 9);
  b.enemy('slime', 84, 8).enemy('bird', 88, 4);
  b.row(90, 5, 'BLB');                  // 神戸プリン（1UP）
  b.enemy('spiky', 95, 8);
  // 坂を下る
  b.rampDown(101, 9, 4, true);
  b.ground(109, 124);
  // 英国館ふうの白い洋館
  b.deco('s5_eikoku', 112.8, 13, { wpx: 110 });
  b.deco('s5_cypress', 110, 13).deco('s5_cypress', 121, 13, { s: 0.9 });
  b.deco('s5_fence', 108.5, 13, { w: 16, wpx: 260 });
  b.deco('s5_lamp', 109, 13).deco('s5_pot', 119.5, 13).deco('s5_lamp', 123, 13);
  b.checkpoint(112);
  b.enemy('slime', 118).enemy('slime', 121);
  // 急な坂の丘
  b.rampUp(125, 13, 5);
  b.ground(130, 140, 8);
  b.deco('s5_conifer', 131.5, 8, { s: 0.9 }).deco('s5_tree', 138, 8, { s: 0.85 });
  b.deco('s5_lamp', 130, 8).deco('s5_planter', 134, 8).deco('s5_lamp', 140, 8);
  b.row(135, 5, 'h');
  b.medal(136, 1, '急な坂の丘で 見えないブロックに乗る');
  b.enemy('spiky', 136, 7);
  b.rampDown(141, 8, 5);
  b.ground(146, 214);
  b.deco('s5_tree', 150, 13).deco('s5_cypress', 158, 13).deco('s5_conifer', 162, 13, { s: 0.9 });
  b.deco('s5_fence', 146, 13, { w: 21, wpx: 340 });
  b.deco('s5_lamp', 147, 13).deco('s5_planter', 154, 13).deco('s5_lamp', 160, 13);
  b.enemy('slime', 150).enemy('slime', 154).enemy('bird', 160, 7);
  // 萌黄の館
  b.sign(164, '萌黄の館', 'もえぎのやかた', 13, 'board');
  b.walls(168, 175, 10, 12, 'moegi', 'moegiwin', 2);
  b.gable(167, 176, 9, 'roofG');
  b.deco('s5_lamp', 177.5, 13).deco('s5_cypress', 181, 13).deco('s5_tree', 185, 13, { s: 0.8 });
  b.deco('s5_rhine', 188.5, 13, { flip: true, wpx: 130 });
  b.deco('s5_fence', 179, 13, { w: 28, wpx: 460 });
  b.deco('s5_pot', 180, 13).deco('s5_planter', 196.5, 13);
  b.deco('s5_conifer', 203, 13).deco('s5_lamp', 206, 13).deco('s5_tree', 210, 13, { flip: true });
  b.deco('s5_fence', 201, 13, { w: 13, wpx: 220 });
  b.enemy('slime', 180).enemy('spiky', 186).enemy('slime', 190);
  b.row(184, 9, '?B?');
  // れんがの壁のツタ（地面の前）
  for (const [x, y, v, k] of [[36, 12, 0, 0.7], [42, 9, 1, 0.9], [57, 9, 0, 0.8], [75, 9, 1, 1], [86, 9, 0, 0.8], [98, 9, 1, 0.9], [106, 12, 0, 0.6], [132, 8, 1, 0.85], [138, 8, 0, 0.7], [5, 13, 0, 0.45], [152, 13, 0, 0.45], [199, 13, 1, 0.4]]) b.deco('s5_ivy', x, y, { v, s: k, layer: 'mid', flip: x % 2 === 0 });
  // コインの道しるべ
  b.coinArc(21, 27, 11, 2).coinsAbove(40, 43, 1, 0).coinArc(52, 58, 7, 2);
  b.coinArc(80, 87, 7, 2).coinArc(114, 121, 11, 2).coinArc(147, 155, 11, 2).coinArc(178, 184, 11, 2);
  b.goal(200);
  return b.build();
}

// ステージ6：三宮・南京町（センター街・ビルの屋上・ポートライナー・長安門）
function stage6() {
  const b = new LevelBuilder({ id: 6, name: '三宮・南京町', kana: 'さんのみや・なんきんまち', theme: 'sannomiya', bgm: 'city', w: 225, goalLabel: 'メリケンパークへ' });
  b.ground(0, 112);
  b.start(9);
  // 三宮駅（駅ビル・横断歩道・信号・街路樹）
  b.deco('s6_station', 0, 13, { text: '神戸三宮駅', wpx: 160 });
  b.sign(10.5, '三宮', 'さんのみや', 13, 'station');
  b.deco('s6_tree', 16.5, 13).deco('s6_signal', 13.5, 13);
  b.deco('s6_zebra', 12, 13, { w: 3, layer: 'mid' });
  // センター街（アーケードの屋根にも乗れる）
  b.deco('s6_shops', 19, 13, { w: 27, wpx: 440, shops: ['fuku', 'kutsu', 'honya', 'cafe', 'pan', 'zakka'] });
  b.deco('s6_cgate', 18.6, 13, { wpx: 110 }).deco('s6_cgate', 39.4, 13, { wpx: 110, kana: '' });
  b.mat('arcade', () => b.row(19, 6, '==========================='));
  b.row(24, 9, '?B?');
  b.row(29, 9, 'P');
  b.row(34, 9, 'BKB');
  b.row(22, 5, 'o.o.o.o.o.o.o.o.o.o.o');
  b.enemy('slime', 26).enemy('slime', 38).enemy('spiky', 43).enemy('bird', 32, 3);
  // ビルの屋上をわたる（デパート・ガラスのビル・カフェのビル・ホテル）
  b.deco('s6_tree', 61.5, 13).deco('s6_signal', 68, 13).deco('s6_zebra', 53, 13, { w: 2, layer: 'mid' });
  b.walls(47, 52, 8, 12, 's6dept'); b.mat('s6dept', () => b.row(47, 8, 'XXXXXX')); b.mat('s6deptG', () => b.row(47, 12, 'XXXXXX'));
  b.walls(55, 60, 6, 12, 's6glass'); b.mat('s6glass', () => b.row(55, 6, 'XXXXXX')); b.mat('s6glassG', () => b.row(55, 12, 'XXXXXX'));
  b.walls(63, 67, 9, 12, 's6brick'); b.mat('s6brick', () => b.row(63, 9, 'XXXXX')); b.mat('s6brickG', () => b.row(63, 12, 'XXXXX'));
  b.walls(70, 80, 5, 12, 's6hotel'); b.mat('s6hotel', () => b.row(70, 5, 'XXXXXXXXXXX')); b.mat('s6hotelG', () => b.row(70, 12, 'XXXXXXXXXXX'));
  b.enemy('slime', 58, 5).enemy('bird', 62, 3).enemy('spiky', 75, 4);
  b.enemy('slime', 54).enemy('slime', 68);
  // ポートライナー（高架を走る）
  b.deco('s6_guideway', 81, 5, { w: 23, wpx: 380 });
  b.deco('s6_tree', 88.5, 13, { s: 0.9 }).deco('s6_tree', 99, 13, { flip: true });
  b.train(81, 5, 18, { look: 'portliner', speed: 80, dwell: 1.5 });
  b.medal(95, 2, 'ポートライナーからジャンプ');
  b.row(84, 11, 'oooooooooooooooooo');
  b.enemy('slime', 88).enemy('spiky', 96);
  b.row(92, 9, '?');
  b.mat('rail', () => b.rect(104, 6, 107, 12, 'X'));
  b.mat('platform', () => b.row(104, 5, 'XXXX'));
  // 下に落ちても もどれるように木箱の階段
  b.mat('wood', () => { b.row(100, 10, 'XX'); b.row(102, 8, 'XX'); b.row(53, 11, 'X'); });
  b.stairs(108, 7, -1);
  // 南京町
  b.theme(115, 'nankin');
  b.ground(113, 224);
  b.checkpoint(116);
  b.sign(117.3, '南京町', 'なんきんまち', 13, 'board');
  b.row(116, 10, '=');
  b.row(118, 8, '=');
  b.deco('s6_gate', 120, 7, { w: 8, text: '長安門', wpx: 180 });
  b.row(119, 7, '----------');
  b.medal(124, 6, '長安門の屋根の上');
  b.deco('s6_lanterns', 130, 3, { w: 12, wpx: 200 }).deco('s6_lanterns', 146, 3, { w: 14, wpx: 230 }).deco('s6_lanterns', 174, 3, { w: 15, wpx: 250 });
  b.deco('s6_stall', 129.6, 13, { v: 0, text: '豚まん', wpx: 90 });
  b.row(136, 9, 'L');
  b.enemy('slime', 140).enemy('lantern', 145, 9).enemy('spiky', 150);
  b.row(152, 10, '=.=.=');
  b.row(158, 7, '=');
  b.row(161, 5, '=');
  b.row(164, 3, '=');
  b.medal(167, 1, 'ちょうちんをのぼった先');
  b.deco('s6_stall', 165.2, 13, { v: 1, text: '餃子', wpx: 90 });
  b.deco('s6_stall', 170.4, 13, { v: 2, text: 'ごま団子', wpx: 90 });
  b.enemy('slime', 176).enemy('lantern', 181, 9).enemy('spiky', 186);
  b.row(182, 9, '?B?');
  b.deco('s6_gate', 192, 7, { w: 7, text: '西安門', wpx: 170 });
  b.row(191, 7, '---------');
  // 南京町広場のあずまや
  b.deco('s6_pavilion', 203.5, 13, { wpx: 110 });
  // コインの道しるべ（ビルの屋上のあいだ・南京町）
  b.coinArc(52, 55, 7, 2).coinArc(60, 63, 5, 2).coinArc(67, 70, 7, 2);
  b.coinArc(126, 131, 11, 2).coinArc(170, 176, 11, 2);
  b.goal(208);
  return b.build();
}

// ステージ7：メリケンパーク・ハーバーランド（港・船・ポートタワー・観覧車・夜景）
function stage7() {
  const b = new LevelBuilder({ id: 7, name: 'メリケンパーク・ハーバーランド', kana: 'めりけんぱーく・はーばーらんど', theme: 'meriken', bgm: 'night', w: 230, goalLabel: '須磨海岸へ', night: true });
  b.ground(0, 30);
  b.start(9);
  // メリケンパークの岸壁（レンガ倉庫・街灯・ビット・はしご）
  b.deco('s7_soko', 0, 13, { wpx: 110 });
  b.sign(12, '神戸港', 'こうべこう', 13, 'board');
  b.deco('s7_bekobe', 16, 13, { wpx: 90 });
  for (const x of [7, 26, 47, 62, 105, 111, 120, 132, 162, 176, 190, 204]) b.deco('s7_lamp', x, 13).deco('s7_pool', x, 13, { layer: 'mid' });
  for (const x of [14, 21, 29, 45, 58, 74, 102, 118, 158, 183, 198]) b.deco('s7_bollard', x, 13);
  for (const x of [28, 46, 80]) b.deco('s7_ladder', x, 13, { layer: 'mid' });
  b.enemy('crab', 24);
  // 船にのって海をわたる
  b.water(31, 44);
  b.platform(31, 12, { move: 'bob', dx: 7, speed: 0.22, width: 6, look: 'ship' });
  b.medal(36, 8, '船の上でジャンプ');
  b.enemy('bird', 38, 5);
  b.ground(45, 81);
  // ポートタワー（中の足場をのぼる）
  b.deco('s7_tower', 54, 13, { wpx: 120 });
  b.row(49, 11, '-----');
  b.row(53, 8, '-----');
  b.row(50, 5, '-----');
  b.row(52, 2, '-----');
  // タワーの中の足場（見た目）：赤い鉄のはり・てっぺんは展望台のバルコニー
  b.deco('s7_beam', 49, 11, { w: 5, side: 'R', post: true, layer: 'mid' });
  b.deco('s7_beam', 53, 8, { w: 5, side: 'L', layer: 'mid' });
  b.deco('s7_beam', 50, 5, { w: 5, side: 'R', layer: 'mid' });
  b.deco('s7_deck', 52, 2, { layer: 'mid' });
  b.medal(54, 1, 'ポートタワーのてっぺん');
  b.enemy('crab', 60).enemy('spiky', 66);
  b.deco('s7_crane', 70, 13, { wpx: 120 });
  b.row(64, 9, '?P?');
  // コンテナの山（かべのタイルの上に、青・赤のコンテナと木箱の絵をかぶせる）
  b.walls(76, 81, 10, 12, 'container');
  b.water(82, 85);
  b.ground(86, 92);
  b.walls(86, 92, 9, 12, 'container');
  b.water(93, 95);
  b.ground(96, 230);
  b.walls(96, 101, 11, 12, 'container');
  b.deco('s7_stack', 76, 13, { v: 'A', layer: 'mid', wpx: 100 });
  b.deco('s7_stack', 86, 13, { v: 'B', layer: 'mid', wpx: 116 });
  b.deco('s7_stack', 96, 13, { v: 'C', layer: 'mid', wpx: 100 });
  b.enemy('crab', 90, 7).enemy('bird', 94, 4).enemy('spiky', 104);
  b.enemy('tako', 83, 13, { height: 4 });
  b.checkpoint(108);
  // ハーバーランド（夜）
  b.theme(114, 'harborland');
  b.sign(116, 'ハーバーランド', 'はーばーらんど', 13, 'board');
  b.enemy('slime', 122).enemy('crab', 128);
  // モザイクの観覧車（b.wheel と同じゴンドラ。輪の絵だけ s7_wheel で描く）
  b.deco('s7_wheel', 138, 6, { r: 4.5, speed: 0.35, wpx: 100 });
  for (let i = 0; i < 6; i++) b.platform(138, 6, { move: 'circle', cx: 138, cy: 6, r: 4.5, speed: 0.35, phase: i / 6, width: 2, look: 'wheel', color: i });
  // 煉瓦倉庫（観覧車からとび移る）
  b.walls(146, 156, 5, 12, 'brick', 'brickwin', 2);
  b.deco('s7_renga', 146, 13, { layer: 'mid', wpx: 180 });
  b.medal(160, 2, '倉庫の屋根からジャンプ');
  b.deco('bench', 168, 13);
  b.deco('s7_soko', 192, 13, { wpx: 110 });           // 広場のおくの小さいレンガ倉庫
  b.enemy('slime', 166).enemy('crab', 172).enemy('bird', 180, 6).enemy('spiky', 186).enemy('slime', 194);
  b.row(178, 9, 'B?BLB');
  b.checkpoint(170);                    // ハーバーランドの広場
  // コインの道しるべ
  b.coinArc(31, 44, 10, 2);
  b.coinArc(81, 86, 8, 2).coinArc(92, 96, 7, 2);
  b.coinArc(119, 126, 11, 2).coinsAbove(147, 155, 2, 0).coinArc(158, 165, 11, 3);
  b.goal(213);
  return b.build();
}

// ステージ8：須磨海岸（浮き輪・パラソル・シャチ）
function stage8() {
  const b = new LevelBuilder({ id: 8, name: '須磨海岸', kana: 'すまかいがん', theme: 'suma', bgm: 'beach', w: 220, goalLabel: '舞子へ' });
  // ビーチパラソル（上に乗れる。見えないすり抜け足場＋絵）
  const para = (x, y, c) => { b.row(x, y, '--'); return b.deco('s8_para', x, y, { base: 13, color: c }); };
  b.ground(0, 40);
  b.start(9);
  b.deco('s8_aqua', 0, 13, { wpx: 220 });
  b.sign(12, '須磨海岸', 'すまかいがん', 13, 'board');
  b.deco('s8_umi', 15, 13, { v: 0, text: '海の家', wpx: 160 });   // 屋根の上（15〜22の10行め）に乗れる
  b.row(15, 10, '--------');
  b.deco('s8_toys', 23.5, 13).deco('s8_life', 34, 13).deco('s8_pine', 38, 13, { v: 1 });
  para(26, 10, 0); para(31, 8, 1);
  b.row(31, 6, 'oo');
  b.enemy('crab', 28).enemy('crab', 36);
  // 浮き輪をわたる
  b.water(41, 60);
  for (const [x, i] of [[43, 0], [47, 1], [51, 2], [55, 3], [59, 0]]) b.platform(x, 12, { move: 'bob', width: 2, look: 'ring', color: i, phase: i * 0.25 });
  b.medal(52, 6, '浮き輪の上で大ジャンプ');
  b.enemy('bird', 49, 7).enemy('jelly', 45, 13, { range: 2 }).enemy('jelly', 53, 13, { range: 2 });
  b.ground(61, 95);
  b.deco('s8_castle', 63.5, 13).deco('s8_chair', 67, 13).deco('s8_pine', 77.5, 13).deco('s8_toys', 85, 13, { flip: true }).deco('s8_life', 89, 13);
  b.checkpoint(70);
  b.row(74, 9, '?P?');
  b.enemy('spiky', 78).enemy('crab', 84).enemy('crab', 88);
  para(81, 10, 2);
  // シャチのジャンプに乗って海をわたる
  b.sign(92, 'シャチ', '', 13, 'board');
  b.water(96, 125);
  b.platform(97, 12, { move: 'arc', dx: 9, width: 3, look: 'orca', height: 5, dur: 2.2, wait: 0.9 });
  b.mat('rock', () => b.rect(108, 12, 109, 14, 'X'));
  b.platform(111, 12, { move: 'arc', dx: 10, width: 3, look: 'orca', height: 5, dur: 2.2, wait: 0.9, phase: 0.5 });
  b.medal(116, 4, 'シャチの上から大ジャンプ');
  b.enemy('bird', 104, 5).enemy('bird', 118, 6);
  b.ground(126, 219);
  b.deco('s8_pine', 130, 13).deco('s8_chair', 133.5, 13).deco('s8_toys', 155.5, 13).deco('s8_life', 161, 13);
  b.deco('s8_pine', 170, 13, { v: 1, flip: true }).deco('s8_chair', 193, 13, { flip: true }).deco('s8_pine', 200, 13).deco('s8_castle', 210, 13);
  b.enemy('crab', 133).enemy('spiky', 137);
  // パラソルの階段
  [[140, 10], [143, 8], [146, 6], [149, 4]].forEach(([x, y], i) => para(x, y, i));
  b.medal(152, 1, 'いちばん上のパラソルからジャンプ');
  b.enemy('crab', 156).enemy('crab', 162).enemy('bird', 166, 6).enemy('spiky', 175);
  b.deco('s8_umi', 178, 13, { v: 1, text: 'かき氷', wpx: 140 });
  b.row(186, 9, 'BLB');                 // 明石焼き（1UP）
  b.enemy('crab', 190);
  b.checkpoint(170);                    // パラソルの階段のあと
  b.hint(93, 8, 'シャチの背中に 乗ろう');
  // コインの道しるべ（浮き輪のあいだ・シャチのジャンプ・パラソル）
  b.coinArc(44, 48, 10, 2).coinArc(48, 52, 10, 2).coinArc(52, 56, 10, 2).coinArc(56, 60, 10, 2);
  b.coinArc(99, 106, 8, 3).coinArc(112, 121, 8, 3);
  for (const [x, y] of [[141, 9], [144, 7], [147, 5], [150, 3]]) b.put(x, y, 'o');
  b.coinArc(18, 24, 11, 2).coinArc(128, 136, 11, 2);
  b.goal(205);
  return b.build();
}

// ステージ9：舞子・明石海峡大橋（ケーブルをのぼって主塔のてっぺんへ）
function stage9() {
  const b = new LevelBuilder({ id: 9, name: '舞子・明石海峡大橋', kana: 'まいこ・あかしかいきょうおおはし', theme: 'maiko', bgm: 'bridge', w: 235, goalLabel: '六甲山へ' });
  b.ground(0, 33);
  // 舞子公園（松林・旧武藤山治邸・移情閣・遊歩道の街灯）
  b.deco('s9_pine', 0.5, 13, { v: 1 }).deco('s9_muto', 2, 13, { wpx: 140 }).deco('s9_lamp', 10.5, 13);
  b.deco('s9_ijo', 14.5, 13, { wpx: 100 }).deco('s9_pine', 21, 13).deco('s9_lamp', 26, 13).deco('s9_pine', 29, 13, { v: 1, s: 0.8, flip: true });
  b.start(9);
  b.sign(24, '舞子公園', 'まいここうえん', 13, 'board');
  b.enemy('slime', 27);
  b.stairs(30, 3);
  // 橋の上（下は海）
  b.theme(33, 'bridge');
  b.water(33, 234, 13);
  b.mat('s9anc', () => b.rect(33, 10, 40, 14, 'X'));         // アンカレイジ
  b.deco('s9_side', 40.5, 10, { x2: 80, y2: 2, wpx: 700 });   // 側径間のケーブル（奥・飾り）
  b.sign(38, '明石海峡大橋', 'あかしかいきょうおおはし', 10, 'board');
  b.rect(41, 10, 99, 11, 'G');
  b.rect(103, 10, 177, 11, 'G');
  b.rect(181, 10, 234, 11, 'G');
  // 主塔（道路の高さはくぐれる）
  b.mat('bridgeTower', () => { b.rect(80, 2, 81, 7, 'X'); b.rect(80, 12, 81, 14, 'X'); });
  b.mat('bridgeTower', () => { b.rect(160, 2, 161, 7, 'X'); b.rect(160, 12, 161, 14, 'X'); });
  for (const tx of [80, 160]) b.deco('s9_twgap', tx, 8).deco('s9_tower', tx, 2, { layer: 'mid', low: 12, wpx: 60 });
  // 主塔の点検用の足場（のぼれる）
  b.mat('grating', () => { b.row(77, 7, '==='); b.row(77, 4, '==='); });
  // メインケーブル（坂になっていて歩ける。主塔のてっぺんから次の主塔へ）
  b.path(82, 2, [['down', 1], ['down2', 1], ['flat', 71], ['up2', 1], ['up', 1], ['flat', 1]], 'cable');
  b.path(162, 2, [['down', 3], ['down2', 4], ['flat', 12]], 'cable');
  b.medal(80, 1, '1本目の主塔のてっぺん');
  b.medal(160, 1, '2本目の主塔のてっぺん');
  // ハンガーロープの飾り（ケーブルから道路へ）
  const lines = [];
  for (let x = 82; x < 186; x += 3) {
    for (let y = 0; y < 10; y++) {
      const t = b.tiles[y * b.w + x];
      if (isSlope(t) || isSemiTile(t)) { lines.push([x * 16 + 8, y * 16 + (isSlope(t) ? 13 : 8), 160]); break; }
      if (t === T.HARD) break;
    }
  }
  b.deco('s9_hangers', 0, 0, { lines, wpx: 99999 });
  // 橋の上のしかけ
  b.row(56, 6, '?J?');                  // ジャンプぐつ（ケーブルにとび乗れる）
  b.enemy('slime', 60, 9).enemy('spiky', 70, 9).enemy('bird', 76, 6);
  b.enemy('tako', 101, 13, { height: 7 }).enemy('tako', 179, 13, { height: 7 });
  b.zone('wind', 84, 0, 16, 10, { period: 3.2, duty: 0.5, dir: -1, power: 55 });
  b.enemy('slime', 90, 9).enemy('bird', 110, 5);
  b.checkpoint(116, 10);
  // 点検用の通路（落ちても大丈夫な穴）
  b.rect(125, 10, 127, 11, '_');
  b.mat('grating', () => b.row(119, 13, '================================'));
  b.deco('s9_rods', 119, 13, { x2: 150, wpx: 520 });
  b.mat('grating', () => { b.rect(148, 10, 149, 10, '='); b.rect(148, 11, 149, 11, '_'); });
  b.row(130, 12, 'ooooooooo');
  b.medal(140, 12, '橋の下の点検通路');
  b.enemy('spiky', 135, 9).enemy('slime', 142, 9).enemy('bird', 155, 6);
  b.zone('wind', 164, 0, 16, 10, { period: 2.8, duty: 0.5, dir: -1, power: 60 });
  b.row(190, 6, 'BLB');                 // 明石焼き（1UP）
  b.enemy('slime', 172, 9).enemy('spiky', 186, 9).enemy('slime', 194, 9).enemy('bird', 200, 5);
  b.checkpoint(168, 10);                // 2本目の主塔をこえたところ
  // コインの道しるべ（ケーブルの上・道路のすきま）
  b.coinsAbove(88, 152, 5, 0);
  b.coinArc(98, 104, 8, 2).coinArc(176, 182, 8, 2);
  b.coinArc(44, 52, 9, 2).coinArc(62, 70, 9, 2);
  b.goal(214, 10);
  return b.build();
}

// ステージ10：六甲山・摩耶山（夜。ケーブルカー・ロープウェー・掬星台でボス）
function stage10() {
  const b = new LevelBuilder({ id: 10, name: '六甲山・摩耶山', kana: 'ろっこうさん・まやさん', theme: 'rokko', bgm: 'castle', w: 232, night: true });
  b.ground(0, 45);
  // 六甲山牧場（月あかりの牧草地・ひつじ・牛舎・ちょうちん）
  b.deco('s10_tree', -1, 13, { s: 0.9 }).deco('s10_barn', 1, 13, { wpx: 110 });
  b.deco('s10_lantern', 8, 13).deco('s10_fence', 14, 13, { n: 4, wpx: 140 });
  b.start(9);
  b.sign(12, '六甲山牧場', 'ろっこうさんぼくじょう', 13, 'board');
  b.deco('s10_sheep', 16, 13).deco('s10_sheep', 21, 13, { flip: true }).deco('s10_sheep', 26, 13);
  b.deco('s10_lantern', 23.5, 13).deco('s10_tree', 29, 13, { s: 0.8, flip: true }).deco('s10_lantern', 33, 13);
  b.row(18, 9, '?P?');
  b.row(23, 6, 'h');
  b.medal(23, 2, '牧場のかくしブロック');
  b.enemy('boar', 31).enemy('bird', 34, 8);
  b.rampUp(36, 13, 3);
  b.ground(39, 45, 10);
  b.deco('s10_fence', 39.5, 10, { n: 1 }).deco('s10_lantern', 43, 10);
  b.enemy('spiky', 42, 9);
  b.rampDown(46, 10, 3);
  // 摩耶ケーブル（ななめに上るケーブルカー）
  b.ground(49, 76, 13);
  b.sign(49.5, 'ケーブル下', 'けーぶるした', 13, 'wood');
  b.deco('s10_track', 52, 12, { x2: 77, y2: 6, w: 3, ground: 13, wpx: 420 });
  b.platform(52, 12, { move: 'line', dx: 22, dy: -6, speed: 0.22, width: 3, look: 'cablecar' });
  b.deco('s10_lantern', 58, 13).deco('s10_tree', 63, 13, { s: 0.85 }).deco('s10_lantern', 70, 13);
  b.enemy('bird', 64, 5).enemy('boar', 68);
  // 虹の駅
  b.ground(77, 99, 6);
  b.deco('s10_station', 79, 6, { text: '虹の駅', wpx: 120 });
  b.sign(87.5, '虹の駅', 'にじのえき', 6, 'station');
  b.deco('s10_lantern', 92, 6).deco('s10_gantry', 99, 6);
  b.medal(90, 1, '虹の駅の上でジャンプ');
  b.enemy('slime', 85, 5).enemy('spiky', 92, 5);
  b.checkpoint(96, 6);
  // 摩耶ロープウェー
  b.ropeway(100, 6, 148, 8, 3, 40);
  b.deco('s10_pylon', 124, 10);
  b.mat('steel', () => b.rect(124, 10, 124, 14, 'X'));
  b.enemy('bird', 110, 3).enemy('bird', 120, 5).enemy('bird', 136, 4);
  b.zone('wind', 106, 0, 36, 8, { period: 3.4, duty: 0.4, dir: -1, flip: true, power: 45 });
  // 星の駅 → 掬星台
  b.ground(146, 231, 8);
  b.deco('s10_station', 147, 8, { v: 'hoshi', text: '星の駅', wpx: 150 });
  b.sign(157, '星の駅', 'ほしのえき', 8, 'station');
  b.deco('s10_lamp', 160.5, 8);
  b.enemy('boar', 156, 7).enemy('spiky', 160, 7);
  b.theme(163, 'kikusei');
  b.sign(165, '掬星台', 'きくせいだい', 8, 'board');
  b.deco('s10_monument', 170, 8).deco('s10_monument', 200, 8).deco('s10_lamp', 176, 8).deco('s10_lamp', 206, 8);
  b.deco('s10_lamp', 188, 8).deco('s10_lamp', 218, 8).deco('s10_bench', 181, 8).deco('s10_scope', 212, 8).deco('s10_bench', 214, 8, { flip: true });
  b.row(178, 4, '===');
  b.row(194, 4, '===');
  b.medal(183, 1, 'ボスの広場の上');
  b.enemy('boss', 196, 7);
  b.rect(224, 0, 231, 7, 'X');
  b.checkpoint(166, 8);                 // ボスの前（負けてもここから）
  // コインの道しるべ
  b.coinArc(26, 33, 11, 2).coinArc(39, 45, 8, 2);
  b.coinLine(55, 8, 73, 4, 3);
  b.coinLine(104, 3, 144, 5, 4);
  b.coinArc(150, 158, 6, 2);
  // ワイヤーはこのステージの絵で描く
  for (const d of b.decos) if (d.type === 'cable') d.type = 's10_cable';
  return b.build();
}

export const LEVELS = [stage1(), stage2(), stage3(), stage4(), stage5(), stage6(), stage7(), stage8(), stage9(), stage10()];
