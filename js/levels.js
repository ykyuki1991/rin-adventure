// ステージデータ（神戸の10か所）
// 座標は「マス」単位。x = 左から何マス目、y = 上から何マス目（地面の表面はふつう y=13、画面は縦15マス）
// 使える命令は level.js の LevelBuilder を参照
import { LevelBuilder } from './level.js';
import { T, isSlope, isSemiTile } from './config.js';

// ステージ1：八雲通・春日野道（りんの家 → 商店街 → 電車 → 坂道）
function stage1() {
  const b = new LevelBuilder({ id: 1, name: '八雲通・春日野道', kana: 'やくもどおり・かすがのみち', theme: 'yakumo', bgm: 'field', w: 205, goalLabel: '王子動物園へ' });
  b.ground(0, 85);
  b.deco('house', 1, 13, { text: 'りんの家' });
  b.sign(7, '八雲通', 'やくもどおり', 13, 'street');
  b.start(9);
  b.row(13, 9, '?');
  b.row(15, 10, 'ooo');
  b.deco('tree', 19, 13);
  b.enemy('slime', 22);
  b.pipe(25, 2);
  b.deco('bench', 21, 13);
  // 春日野道商店街（アーケードの屋根にも乗れる）
  b.sign(36, '春日野道商店街', 'かすがのみちしょうてんがい', 6, 'board');
  b.mat('wood', () => b.stairs(30, 3));
  b.deco('shops', 33, 13, { w: 39 });
  b.mat('arcade', () => b.row(33, 6, '======================================='));
  b.row(38, 9, '?');
  b.row(44, 9, 'B?B');
  b.row(51, 9, 'P');
  b.row(57, 9, 'BKB');
  b.row(64, 9, '?');
  b.row(40, 5, 'o.o.o.o.o.o.o.o.o.o.o');
  b.medal(70, 5);                       // メダル1：アーケードの屋根の上のはし
  b.enemy('slime', 41).enemy('slime', 48).enemy('spiky', 55).enemy('slime', 61).enemy('slime', 67);
  b.enemy('bird', 60, 3);
  // 春日野道駅 → 電車に乗って王子公園駅へ
  b.stairs(74, 4);
  b.mat('rail', () => b.rect(78, 10, 85, 12, 'X'));
  b.mat('platform', () => b.row(78, 9, 'XXXXXXXX'));
  b.deco('station', 78, 9, { w: 8 });
  b.sign(80, '春日野道', 'かすがのみち', 9, 'station');
  b.deco('viaduct', 86, 9, { w: 31 });
  b.water(86, 116);
  b.train(86, 9, 26, { speed: 75, dwell: 1.8 });
  b.medal(101, 5);                      // メダル2：電車の上でジャンプ
  b.mat('rail', () => b.rect(117, 10, 125, 12, 'X'));
  b.mat('platform', () => b.row(117, 9, 'XXXXXXXXX'));
  b.deco('station', 117, 9, { w: 9 });
  b.sign(121, '王子公園', 'おうじこうえん', 9, 'station');
  b.ground(117, 125);
  b.stairs(126, 4, -1);
  b.ground(126, 204, 13);
  b.checkpoint(132);
  // 山側へ向かう坂道
  b.enemy('slime', 136);
  b.rampUp(138, 13, 3, true);
  b.ground(144, 158, 10);
  b.deco('tree', 146, 10).deco('tree', 156, 10);
  b.row(150, 7, 'h');
  b.medal(150, 3);                      // メダル3：かくしブロックに乗る
  b.enemy('slime', 147, 9).enemy('spiky', 154, 9);
  b.rampUp(159, 10, 2);
  b.ground(161, 204, 8);
  b.row(167, 4, 'B?B');
  b.row(172, 7, 'ooooo');
  b.enemy('slime', 170, 7).enemy('slime', 175, 7).enemy('bird', 178, 3).enemy('spiky', 182, 7);
  b.goal(190, 8);
  return b.build();
}

// ステージ2：王子動物園（キリン・ゾウ・フラミンゴ・観覧車）
function stage2() {
  const b = new LevelBuilder({ id: 2, name: '王子動物園', kana: 'おうじどうぶつえん', theme: 'zoo', bgm: 'zoo', w: 210, goalLabel: '新神戸へ' });
  b.ground(0, 45);
  b.deco('zooGate', 2, 13);
  b.start(11);
  b.deco('sakura', 14, 13).deco('sakura', 22, 13).deco('sakura', 30, 13);
  b.row(16, 9, '?B?');
  b.enemy('slime', 24).enemy('slime', 28);
  // キリンの頭に乗って高いところへ
  b.sign(33, 'キリン', '', 13, 'board');
  b.platform(37, 11, { move: 'v', range: -5, speed: 0.4, width: 2, look: 'giraffe', base: 13, phase: 0.5 });
  b.platform(42, 11, { move: 'v', range: -5, speed: 0.4, width: 2, look: 'giraffe', base: 13 });
  b.medal(39, 2);                       // メダル1：キリンの頭からジャンプ
  b.ground(46, 70, 7);
  b.row(55, 3, '?P?');
  b.enemy('slime', 50, 6).enemy('slime', 60, 6).enemy('spiky', 66, 6);
  b.rampDown(71, 7, 6, true);
  b.ground(83, 108);
  // ゾウのシャワーで生け垣をこえる
  b.sign(84, 'ゾウ', '', 13, 'board');
  b.deco('elephant', 86, 13);
  b.zone('spray', 89, 1, 2, 12, { power: 2600, cap: 340 });
  b.mat('hedge', () => b.rect(92, 4, 93, 12, 'X'));
  b.medal(97, 3);                       // メダル2：生け垣の上からジャンプ
  b.checkpoint(99);
  b.enemy('frog', 104);
  // フラミンゴの池（ハスの葉をわたる）
  b.water(109, 122);
  b.platform(111, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0 });
  b.platform(115, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0.3 });
  b.platform(119, 12, { move: 'bob', width: 2, look: 'lotus', phase: 0.6 });
  b.deco('flamingo', 110, 13).deco('flamingo', 113, 13).deco('flamingo', 118, 13).deco('flamingo', 121, 13);
  b.ground(123, 209);
  b.enemy('frog', 126);
  // 観覧車に乗って高い生け垣をこえる
  b.wheel(142, 6, 4.5, 6, 0.35, { base: 13 });
  b.medal(142, 6);                      // メダル3：観覧車のまん中
  b.mat('hedge', () => b.rect(148, 2, 149, 12, 'X'));
  b.enemy('slime', 155).enemy('spiky', 162).enemy('slime', 168).enemy('bird', 172, 7).enemy('slime', 178);
  b.row(165, 9, 'B?B?B');
  b.deco('sakura', 184, 13);
  b.goal(195);
  return b.build();
}

// ステージ3：新神戸・布引の滝（雌滝・鼓ヶ滝・夫婦滝・雄滝）
function stage3() {
  const b = new LevelBuilder({ id: 3, name: '新神戸・布引の滝', kana: 'しんこうべ・ぬのびきのたき', theme: 'shinkobe', bgm: 'cave', w: 215, goalLabel: 'ロープウェイ乗り場へ' });
  // 新神戸駅のホーム
  b.deco('shinkansen', 0, 9, { w: 12 });
  b.mat('rail', () => b.rect(0, 10, 13, 12, 'X'));
  b.mat('platform', () => b.row(0, 9, 'XXXXXXXXXXXXXX'));
  b.deco('station', 0, 9, { w: 14 });
  b.sign(11, '新神戸', 'しんこうべ', 9, 'station');
  b.ground(0, 13);
  b.start(9, 8);
  b.stairs(14, 4, -1);
  b.ground(14, 30);
  b.sign(21, '布引の滝', 'ぬのびきのたき', 13, 'wood');
  b.theme(24, 'falls');
  b.enemy('slime', 27);
  b.mat('rock', () => b.stairs(31, 3));
  b.ground(34, 40, 10);
  // 雌滝
  b.sign(38, '雌滝', 'めんたき', 10, 'wood');
  b.water(41, 46, 12);
  b.mat('rock', () => b.row(43, 11, 'XX'));
  b.zone('fall', 43, 0, 2, 11, { power: 1000 });
  b.ground(47, 60, 10);
  b.mat('rock', () => b.rect(53, 0, 60, 2, 'X'));
  b.enemy('rock', 57, 3);
  b.row(48, 6, 'h');
  b.medal(48, 2);                       // メダル1：かくしブロックに乗る
  b.enemy('frog', 51, 9);
  // 鼓ヶ滝（丸太に乗って）
  b.sign(58, '鼓ヶ滝', 'つづみがたき', 10, 'wood');
  b.rampDown(61, 10, 3);
  b.ground(64, 64);
  b.water(65, 70);
  b.zone('fall', 67, 0, 2, 12, { power: 1000 });
  b.platform(65, 12, { move: 'h', range: 4, speed: 0.4, width: 2, look: 'log' });
  b.ground(71, 89, 12);
  b.checkpoint(74, 12);
  b.enemy('slime', 78, 11).enemy('spiky', 84, 11);
  b.mat('rock', () => b.rect(79, 0, 86, 2, 'X'));
  b.enemy('rock', 82, 3);
  // 砂子橋（アーチの橋）
  b.sign(87, '砂子橋', 'いさごばし', 12, 'wood');
  b.path(90, 12, [['up2', 1], ['flat', 7], ['down2', 1]], 'wood');
  b.row(92, 9, 'ooooooo');
  b.medal(95, 6);                       // メダル2：橋の上でジャンプ
  b.enemy('slime', 95, 10);
  b.ground(101, 106, 12);
  // 夫婦滝（2本ならんだ滝）
  b.sign(103, '夫婦滝', 'めおとだき', 12, 'wood');
  b.water(107, 112, 12);
  b.mat('rock', () => b.row(109, 11, 'XX'));
  b.zone('fall', 107, 0, 1, 11, { power: 900 });
  b.zone('fall', 112, 0, 1, 11, { power: 900 });
  b.ground(113, 124, 12);
  b.enemy('frog', 118, 11);
  b.rampUp(125, 12, 3);
  b.ground(128, 146, 9);
  b.enemy('slime', 132, 8).enemy('bird', 138, 4);
  // 雄滝（いちばん大きな滝。丸太に乗って下をくぐる）
  b.sign(144, '雄滝', 'おんたき', 9, 'wood');
  b.water(147, 154, 11);
  b.zone('fall', 150, 0, 3, 11, { power: 1300 });
  b.platform(147, 10, { move: 'h', range: 6, speed: 0.3, width: 2, look: 'log' });
  b.medal(151, 7);                      // メダル3：雄滝の中でジャンプ
  b.ground(155, 164, 9);
  b.enemy('frog', 159, 8);
  b.rampUp(165, 9, 3);
  b.ground(168, 214, 6);
  b.row(176, 2, '?S?');
  b.enemy('slime', 174, 5).enemy('spiky', 181, 5).enemy('slime', 188, 5).enemy('bird', 192, 2);
  b.deco('tree', 170, 6).deco('tree', 196, 6);
  b.goal(200, 6);
  return b.build();
}

// ステージ4：布引ロープウェイ（ゴンドラで山の上のハーブ園へ）
function stage4() {
  const b = new LevelBuilder({ id: 4, name: '布引ロープウェイ', kana: 'ぬのびきロープウェイ', theme: 'ropeway', bgm: 'sky', w: 220, goalLabel: '北野異人館へ' });
  b.ground(0, 14);
  b.deco('ropewayStation', 1, 13, { text: '山麓駅' });
  b.row(2, 9, '------');
  b.medal(4, 4);                        // メダル1：駅の屋根の上
  b.start(9);
  // 1本目のロープウェイ
  b.ropeway(14, 12, 60, 9, 4, 42);
  b.mat('steel', () => b.rect(36, 12, 36, 14, 'X'));
  b.enemy('bird', 30, 7).enemy('bird', 48, 5);
  // 風の丘中間駅
  b.ground(59, 76, 9);
  b.deco('ropewayStation', 61, 9, { text: '風の丘' });
  b.sign(69, '風の丘', 'かぜのおか', 9, 'wood');
  b.checkpoint(72, 9);
  b.enemy('slime', 74, 8);
  // 2本目のロープウェイ（風がふく）
  b.ropeway(77, 9, 124, 7, 4, 42);
  b.mat('steel', () => b.rect(100, 10, 100, 14, 'X'));
  b.zone('wind', 86, 0, 30, 9, { period: 3.5, duty: 0.45, dir: 1, flip: true, power: 45 });
  b.medal(100, 3);                      // メダル2：鉄塔の上でジャンプ
  b.enemy('bird', 92, 3).enemy('bird', 112, 4);
  // ハーブ園
  b.ground(122, 219, 7);
  b.sign(128, 'ハーブ園', 'はーぶえん', 7, 'board');
  b.row(135, 3, '?P?');
  b.enemy('slime', 139, 6).enemy('bird', 144, 3);
  // 温室（左のかべはすり抜けられる）
  b.walls(150, 157, 3, 6, 'glass');
  b.rect(151, 4, 156, 6, '_');
  b.mat('glass', () => { b.put(150, 5, 'Z'); b.put(150, 6, 'Z'); });
  b.row(151, 6, 'ooo');
  b.medal(155, 6);                      // メダル3：温室の中
  b.enemy('spiky', 162, 6);
  b.rampUp(168, 7, 2, true);
  b.ground(172, 183, 5);
  b.enemy('slime', 176, 4).enemy('slime', 180, 4);
  b.rampDown(184, 5, 2, true);
  b.ground(188, 219, 7);
  b.enemy('spiky', 194, 6).enemy('bird', 198, 3);
  b.goal(205, 7);
  return b.build();
}

// ステージ5：北野・異人館（坂道・異人館の屋根・風見鶏の風）
function stage5() {
  const b = new LevelBuilder({ id: 5, name: '北野・異人館', kana: 'きたの・いじんかん', theme: 'kitano', bgm: 'kitano', w: 215, goalLabel: '三宮へ' });
  b.ground(0, 30);
  b.start(9);
  b.sign(12, '北野町', 'きたのちょう', 13, 'street');
  b.row(18, 9, '?B?');
  b.enemy('slime', 24).enemy('bird', 27, 8);
  // 北野坂をのぼる
  b.sign(29, '北野坂', 'きたのざか', 13, 'board');
  b.rampUp(31, 13, 4, true);
  b.ground(39, 100, 9);
  // うろこの家（屋根の上まで行ける）
  b.sign(40, 'うろこの家', 'うろこのいえ', 9, 'board');
  b.walls(44, 50, 7, 8, 'uroko', 'urokowin', 3);
  b.gable(43, 51, 6, 'roofK');
  b.medal(47, 1);                       // メダル1：うろこの家の屋根のてっぺん
  b.enemy('slime', 54, 8);
  b.row(60, 5, '?P?');
  b.enemy('spiky', 63, 8);
  // 風見鶏の館（風が右へ左へふく）
  b.sign(66, '風見鶏の館', 'かざみどりのやかた', 9, 'board');
  b.mat('wood', () => b.row(69, 7, '=='));   // 屋根へ上がる木の台
  b.walls(72, 78, 7, 8, 'brick', 'brickwin', 2);
  b.gable(71, 79, 6, 'roof');
  b.deco('weathercock', 75, 2, { layer: 'mid' });
  b.zone('wind', 62, 0, 30, 9, { period: 3, duty: 0.55, dir: 1, flip: true, power: 45 });
  b.medal(73, 1);                       // メダル2：風見鶏の館の屋根の上でジャンプ
  b.enemy('slime', 84, 8).enemy('bird', 88, 4);
  b.row(90, 5, 'B?B');
  b.enemy('spiky', 95, 8);
  // 坂を下る
  b.rampDown(101, 9, 4, true);
  b.ground(109, 124);
  b.checkpoint(112);
  b.enemy('slime', 118).enemy('slime', 121);
  // 急な坂の丘
  b.rampUp(125, 13, 5);
  b.ground(130, 140, 8);
  b.row(135, 5, 'h');
  b.medal(136, 1);                      // メダル3：かくしブロックに乗る
  b.enemy('spiky', 136, 7);
  b.rampDown(141, 8, 5);
  b.ground(146, 214);
  b.enemy('slime', 150).enemy('slime', 154).enemy('bird', 160, 7);
  // 萌黄の館
  b.sign(164, '萌黄の館', 'もえぎのやかた', 13, 'board');
  b.walls(168, 175, 10, 12, 'moegi', 'moegiwin', 2);
  b.gable(167, 176, 9, 'roofG');
  b.enemy('slime', 180).enemy('spiky', 186).enemy('slime', 190);
  b.row(184, 9, '?B?');
  b.goal(200);
  return b.build();
}

// ステージ6：三宮・南京町（センター街・ビルの屋上・ポートライナー・長安門）
function stage6() {
  const b = new LevelBuilder({ id: 6, name: '三宮・南京町', kana: 'さんのみや・なんきんまち', theme: 'sannomiya', bgm: 'city', w: 225, goalLabel: 'メリケンパークへ' });
  b.ground(0, 112);
  b.start(9);
  b.sign(10, '三宮', 'さんのみや', 13, 'station');
  // センター街
  b.sign(15, '三宮センター街', 'さんのみやせんたーがい', 13, 'board');
  b.deco('shops', 19, 13, { w: 27, names: ['ふく', 'くつ', 'ほんや', 'カフェ', 'パン', 'ざっか'] });
  b.mat('arcade', () => b.row(19, 6, '==========================='));
  b.row(24, 9, '?B?');
  b.row(29, 9, 'P');
  b.row(34, 9, 'BKB');
  b.row(22, 5, 'o.o.o.o.o.o.o.o.o.o.o');
  b.enemy('slime', 26).enemy('slime', 38).enemy('spiky', 43).enemy('bird', 32, 3);
  // ビルの屋上をわたる
  b.walls(47, 52, 8, 12, 'bldg'); b.mat('roofTop', () => b.row(47, 8, 'XXXXXX'));
  b.walls(55, 60, 6, 12, 'bldg'); b.mat('roofTop', () => b.row(55, 6, 'XXXXXX'));
  b.walls(63, 67, 9, 12, 'bldg'); b.mat('roofTop', () => b.row(63, 9, 'XXXXX'));
  b.walls(70, 80, 5, 12, 'bldg'); b.mat('roofTop', () => b.row(70, 5, 'XXXXXXXXXXX'));
  b.enemy('slime', 58, 5).enemy('bird', 62, 3).enemy('spiky', 75, 4);
  b.enemy('slime', 54).enemy('slime', 68);
  // ポートライナー（高架を走る）
  b.deco('viaduct', 81, 5, { w: 23 });
  b.train(81, 5, 18, { look: 'portliner', speed: 80, dwell: 1.5 });
  b.medal(95, 2);                       // メダル1：ポートライナーからジャンプ
  b.row(84, 11, 'oooooooooooooooooo');
  b.enemy('slime', 88).enemy('spiky', 96);
  b.row(92, 9, '?');
  b.mat('rail', () => b.rect(104, 6, 107, 12, 'X'));
  b.mat('platform', () => b.row(104, 5, 'XXXX'));
  b.stairs(108, 7, -1);
  // 南京町
  b.theme(115, 'nankin');
  b.ground(113, 224);
  b.checkpoint(116);
  b.sign(131, '南京町', 'なんきんまち', 13, 'board');
  b.row(116, 10, '=');
  b.row(118, 8, '=');
  b.deco('gate', 120, 7, { w: 8, text: '長安門' });
  b.row(119, 7, '----------');
  b.medal(124, 6);                      // メダル2：長安門の屋根の上
  b.deco('lanterns', 130, 3, { w: 12 }).deco('lanterns', 146, 3, { w: 14 });
  b.deco('stall', 134, 13, { text: '豚まん' });
  b.row(136, 9, 'L');
  b.enemy('slime', 140).enemy('bird', 144, 7).enemy('spiky', 150);
  b.row(152, 10, '=.=.=');
  b.row(158, 7, '=');
  b.row(161, 5, '=');
  b.row(164, 3, '=');
  b.medal(167, 1);                      // メダル3：ちょうちんをのぼった先
  b.deco('stall', 170, 13, { text: 'ごま団子' });
  b.enemy('slime', 176).enemy('slime', 180).enemy('spiky', 186);
  b.row(182, 9, '?B?');
  b.deco('gate', 192, 7, { w: 7, text: '西安門' });
  b.row(191, 7, '---------');
  b.goal(208);
  return b.build();
}

// ステージ7：メリケンパーク・ハーバーランド（港・船・ポートタワー・観覧車・夜景）
function stage7() {
  const b = new LevelBuilder({ id: 7, name: 'メリケンパーク・ハーバーランド', kana: 'めりけんぱーく・はーばーらんど', theme: 'meriken', bgm: 'night', w: 230, goalLabel: '須磨海岸へ', night: true });
  b.ground(0, 30);
  b.start(9);
  b.sign(12, '神戸港', 'こうべこう', 13, 'board');
  b.deco('bekobe', 16, 13);
  b.enemy('crab', 24);
  // 船にのって海をわたる
  b.water(31, 44);
  b.platform(31, 12, { move: 'bob', dx: 7, speed: 0.22, width: 6, look: 'ship' });
  b.medal(36, 8);                       // メダル1：船の上でジャンプ
  b.enemy('bird', 38, 5);
  b.ground(45, 81);
  // ポートタワー（中の足場をのぼる）
  b.deco('portTower', 54, 13, { s: 1.75 });
  b.row(49, 11, '-----');
  b.row(53, 8, '-----');
  b.row(50, 5, '-----');
  b.row(52, 2, '-----');
  // タワーの中の足場（見た目）
  for (const [bx, by] of [[49, 11], [53, 8], [50, 5], [52, 2]]) b.deco('beam', bx, by, { w: 5, layer: 'mid' });
  b.medal(54, 1);                       // メダル2：ポートタワーのてっぺん
  b.enemy('crab', 60).enemy('spiky', 66);
  b.deco('crane', 70, 13);
  b.row(64, 9, '?P?');
  // コンテナの山
  b.walls(76, 81, 10, 12, 'container');
  b.water(82, 85);
  b.ground(86, 92);
  b.walls(86, 92, 9, 12, 'container');
  b.water(93, 95);
  b.ground(96, 230);
  b.walls(96, 101, 11, 12, 'container');
  b.enemy('crab', 90, 7).enemy('bird', 94, 4).enemy('spiky', 104);
  b.checkpoint(108);
  // ハーバーランド（夜）
  b.theme(114, 'harborland');
  b.sign(116, 'ハーバーランド', 'はーばーらんど', 13, 'board');
  b.enemy('slime', 122).enemy('crab', 128);
  b.wheel(138, 6, 4.5, 6, 0.35, { base: 13, lit: true });
  // 煉瓦倉庫（観覧車からとび移る）
  b.walls(146, 156, 5, 12, 'brick', 'brickwin', 2);
  b.medal(160, 2);                      // メダル3：倉庫の屋根からジャンプ
  b.deco('lamp', 162, 13).deco('lamp', 176, 13).deco('lamp', 190, 13);
  b.deco('bench', 168, 13);
  b.enemy('slime', 166).enemy('crab', 172).enemy('bird', 180, 6).enemy('spiky', 186).enemy('slime', 194);
  b.row(178, 9, 'B?B?B');
  b.goal(213);
  return b.build();
}

// ステージ8：須磨海岸（浮き輪・パラソル・シャチ）
function stage8() {
  const b = new LevelBuilder({ id: 8, name: '須磨海岸', kana: 'すまかいがん', theme: 'suma', bgm: 'beach', w: 220, goalLabel: '舞子へ' });
  b.ground(0, 40);
  b.start(9);
  b.sign(12, '須磨海岸', 'すまかいがん', 13, 'board');
  b.deco('hut', 16, 13, { text: '海の家' });
  b.row(15, 10, '--------');
  b.parasol(26, 10, 0).parasol(31, 8, 1);
  b.row(31, 6, 'oo');
  b.enemy('crab', 28).enemy('crab', 36);
  // 浮き輪をわたる
  b.water(41, 60);
  for (const [x, i] of [[43, 0], [47, 1], [51, 2], [55, 3], [59, 0]]) b.platform(x, 12, { move: 'bob', width: 2, look: 'ring', color: i, phase: i * 0.25 });
  b.medal(52, 6);                       // メダル1：浮き輪の上で大ジャンプ
  b.enemy('bird', 49, 7).enemy('bird', 57, 5);
  b.ground(61, 95);
  b.deco('sandcastle', 64, 13);
  b.checkpoint(70);
  b.row(74, 9, '?P?');
  b.enemy('spiky', 78).enemy('crab', 84).enemy('crab', 88);
  b.parasol(81, 10, 2);
  // シャチのジャンプに乗って海をわたる
  b.sign(92, 'シャチ', '', 13, 'board');
  b.water(96, 125);
  b.platform(97, 12, { move: 'arc', dx: 9, width: 3, look: 'orca', height: 5, dur: 2.2, wait: 0.9 });
  b.mat('rock', () => b.rect(108, 12, 109, 14, 'X'));
  b.platform(111, 12, { move: 'arc', dx: 10, width: 3, look: 'orca', height: 5, dur: 2.2, wait: 0.9, phase: 0.5 });
  b.medal(116, 4);                      // メダル2：シャチの上から大ジャンプ
  b.enemy('bird', 104, 5).enemy('bird', 118, 6);
  b.ground(126, 219);
  b.deco('pine', 130, 13).deco('pine', 170, 13).deco('pine', 200, 13);
  b.enemy('crab', 133).enemy('spiky', 137);
  // パラソルの階段
  [[140, 10], [143, 8], [146, 6], [149, 4]].forEach(([x, y], i) => b.parasol(x, y, i));
  b.medal(152, 1);                      // メダル3：いちばん上のパラソルからジャンプ
  b.enemy('crab', 156).enemy('crab', 162).enemy('bird', 166, 6).enemy('spiky', 175);
  b.deco('hut', 178, 13, { text: 'かき氷' });
  b.row(186, 9, 'B?B');
  b.enemy('crab', 190);
  b.goal(205);
  return b.build();
}

// ステージ9：舞子・明石海峡大橋（ケーブルをのぼって主塔のてっぺんへ）
function stage9() {
  const b = new LevelBuilder({ id: 9, name: '舞子・明石海峡大橋', kana: 'まいこ・あかしかいきょうおおはし', theme: 'maiko', bgm: 'bridge', w: 235, goalLabel: '六甲山へ' });
  b.ground(0, 33);
  b.deco('pine', 2, 13).deco('ijokaku', 13, 13).deco('pine', 22, 13);
  b.start(9);
  b.sign(24, '舞子公園', 'まいここうえん', 13, 'board');
  b.enemy('slime', 27);
  b.stairs(30, 3);
  // 橋の上（下は海）
  b.theme(33, 'bridge');
  b.water(33, 234, 13);
  b.mat('bridgeTower', () => b.rect(33, 10, 40, 14, 'X'));   // アンカレイジ
  b.sign(38, '明石海峡大橋', 'あかしかいきょうおおはし', 10, 'board');
  b.rect(41, 10, 99, 11, 'G');
  b.rect(103, 10, 177, 11, 'G');
  b.rect(181, 10, 234, 11, 'G');
  // 主塔（道路の高さはくぐれる）
  b.mat('bridgeTower', () => { b.rect(80, 2, 81, 7, 'X'); b.rect(80, 12, 81, 14, 'X'); });
  b.mat('bridgeTower', () => { b.rect(160, 2, 161, 7, 'X'); b.rect(160, 12, 161, 14, 'X'); });
  b.deco('towerTop', 80, 2, { layer: 'mid' }).deco('towerTop', 160, 2, { layer: 'mid' });
  // 主塔の点検用の足場（のぼれる）
  b.mat('grating', () => { b.row(77, 7, '==='); b.row(77, 4, '==='); });
  // メインケーブル（坂になっていて歩ける。主塔のてっぺんから次の主塔へ）
  b.path(82, 2, [['down', 1], ['down2', 1], ['flat', 71], ['up2', 1], ['up', 1], ['flat', 1]], 'cable');
  b.path(162, 2, [['down', 3], ['down2', 4], ['flat', 12]], 'cable');
  b.medal(80, 1);                       // メダル1：1本目の主塔のてっぺん
  b.medal(160, 1);                      // メダル2：2本目の主塔のてっぺん
  // ハンガーロープの飾り（ケーブルから道路へ）
  const lines = [];
  for (let x = 82; x < 186; x += 3) {
    for (let y = 0; y < 10; y++) {
      const t = b.tiles[y * b.w + x];
      if (isSlope(t) || isSemiTile(t)) { lines.push([x * 16 + 8, y * 16 + (isSlope(t) ? 10 : 4), 160]); break; }
      if (t === T.HARD) break;
    }
  }
  b.deco('hangers', 0, 0, { lines, wpx: 99999 });
  // 橋の上のしかけ
  b.row(56, 6, '?B?');
  b.enemy('slime', 60, 9).enemy('spiky', 70, 9).enemy('bird', 76, 6);
  b.zone('wind', 84, 0, 16, 10, { period: 3.2, duty: 0.5, dir: -1, power: 55 });
  b.enemy('slime', 90, 9).enemy('bird', 110, 5);
  b.checkpoint(116, 10);
  // 点検用の通路（落ちても大丈夫な穴）
  b.rect(125, 10, 127, 11, '_');
  b.mat('grating', () => b.row(119, 13, '================================'));
  b.mat('grating', () => { b.rect(148, 10, 149, 10, '='); b.rect(148, 11, 149, 11, '_'); });
  b.row(130, 12, 'ooooooooo');
  b.medal(140, 12);                     // メダル3：橋の下の点検通路
  b.enemy('spiky', 135, 9).enemy('slime', 142, 9).enemy('bird', 155, 6);
  b.zone('wind', 164, 0, 16, 10, { period: 2.8, duty: 0.5, dir: -1, power: 60 });
  b.row(190, 6, 'B?B');
  b.enemy('slime', 172, 9).enemy('spiky', 186, 9).enemy('slime', 194, 9).enemy('bird', 200, 5);
  b.goal(214, 10);
  return b.build();
}

// ステージ10：六甲山・摩耶山（夜。ケーブルカー・ロープウェー・掬星台でボス）
function stage10() {
  const b = new LevelBuilder({ id: 10, name: '六甲山・摩耶山', kana: 'ろっこうさん・まやさん', theme: 'rokko', bgm: 'castle', w: 232, night: true });
  b.ground(0, 45);
  b.start(9);
  b.sign(12, '六甲山牧場', 'ろっこうさんぼくじょう', 13, 'board');
  b.deco('sheep', 16, 13).deco('sheep', 21, 13).deco('sheep', 26, 13);
  b.row(18, 9, '?P?');
  b.row(23, 6, 'h');
  b.medal(23, 2);                       // メダル1：牧場のかくしブロック
  b.enemy('slime', 30).enemy('bird', 34, 8);
  b.rampUp(36, 13, 3);
  b.ground(39, 45, 10);
  b.enemy('spiky', 42, 9);
  b.rampDown(46, 10, 3);
  // 摩耶ケーブル（ななめに上るケーブルカー）
  b.ground(49, 76, 13);
  b.sign(50, 'ケーブル下', 'けーぶるした', 13, 'wood');
  b.deco('track', 52, 12, { x2: 77, y2: 6 });
  b.platform(52, 12, { move: 'line', dx: 22, dy: -6, speed: 0.22, width: 3, look: 'cablecar' });
  b.enemy('bird', 64, 5).enemy('slime', 66);
  b.ground(77, 99, 6);
  b.sign(79, '虹の駅', 'にじのえき', 6, 'station');
  b.medal(90, 1);                       // メダル2：虹の駅の上でジャンプ
  b.enemy('slime', 85, 5).enemy('spiky', 92, 5);
  b.checkpoint(96, 6);
  // 摩耶ロープウェー
  b.ropeway(100, 6, 148, 8, 3, 40);
  b.mat('steel', () => b.rect(124, 10, 124, 14, 'X'));
  b.enemy('bird', 110, 3).enemy('bird', 120, 5).enemy('bird', 136, 4);
  b.zone('wind', 106, 0, 36, 8, { period: 3.4, duty: 0.4, dir: -1, flip: true, power: 45 });
  // 星の駅 → 掬星台
  b.ground(146, 231, 8);
  b.sign(151, '星の駅', 'ほしのえき', 8, 'station');
  b.enemy('slime', 156, 7).enemy('spiky', 160, 7);
  b.theme(163, 'kikusei');
  b.sign(165, '掬星台', 'きくせいだい', 8, 'board');
  b.deco('monument', 170, 8).deco('monument', 200, 8).deco('lamp', 176, 8).deco('lamp', 206, 8);
  b.row(178, 4, '===');
  b.row(194, 4, '===');
  b.medal(183, 1);                      // メダル3：ボスの広場の上
  b.enemy('boss', 196, 7);
  b.rect(224, 0, 231, 7, 'X');
  return b.build();
}

export const LEVELS = [stage1(), stage2(), stage3(), stage4(), stage5(), stage6(), stage7(), stage8(), stage9(), stage10()];
