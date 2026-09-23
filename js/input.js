// 操作（キーボード・タッチボタン）と、ブラウザの拡大・縮小などの防止

const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW', 'KeyZ', 'KeyK'];
const LEFT_KEYS = ['ArrowLeft', 'KeyA'];
const RIGHT_KEYS = ['ArrowRight', 'KeyD'];

// ダブルタップでの拡大・ピンチでの拡大・長押しメニュー・文字選択をすべて止める
export function preventBrowserGestures() {
  const opts = { passive: false };
  const stop = e => { if (e.cancelable) e.preventDefault(); };
  document.addEventListener('touchstart', stop, opts);
  document.addEventListener('touchmove', stop, opts);
  document.addEventListener('touchend', stop, opts);
  // iOS Safari のピンチ操作
  document.addEventListener('gesturestart', stop, opts);
  document.addEventListener('gesturechange', stop, opts);
  document.addEventListener('gestureend', stop, opts);
  document.addEventListener('dblclick', stop, opts);
  document.addEventListener('contextmenu', stop);
  document.addEventListener('selectstart', stop);
  // パソコンのトラックパッドでのズーム
  window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, opts);
}

// タップ（押して離す）で反応するボタン。click はタッチで無効にしているので pointer イベントを使う
export function onTap(el, fn) {
  let downId = null;
  el.addEventListener('pointerdown', e => {
    downId = e.pointerId;
    el.classList.add('pressed');
  });
  el.addEventListener('pointerup', e => {
    el.classList.remove('pressed');
    if (downId !== e.pointerId) return;
    downId = null;
    const r = el.getBoundingClientRect();
    if (e.clientX >= r.left - 8 && e.clientX <= r.right + 8 && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8) fn(e);
  });
  el.addEventListener('pointercancel', () => { downId = null; el.classList.remove('pressed'); });
  el.addEventListener('pointerleave', () => { el.classList.remove('pressed'); });
}

export class Input {
  constructor() {
    this.keys = new Set();
    this.touchDir = new Map();     // 指ごとの向き（L / R）
    this.jumpPointers = new Set(); // ジャンプボタンを押している指
    this.left = false; this.right = false;
    this.jump = false; this.jumpPressed = false;
    this.onPause = null;
    this.onKeyAny = null;
    this.els = null;
    this.bindKeyboard();
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
  }

  bindKeyboard() {
    window.addEventListener('keydown', e => {
      const k = e.code;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(k)) e.preventDefault();
      if (this.onKeyAny) this.onKeyAny(e);
      if (e.repeat) return;
      this.keys.add(k);
      if (JUMP_KEYS.includes(k)) this.jumpPressed = true;
      if ((k === 'Escape' || k === 'KeyP') && this.onPause) this.onPause();
      this.refresh();
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); this.refresh(); });
  }

  // 画面のボタン
  bindTouch({ dpadZone, dpad, btnL, btnR, jumpZone, jumpBtn }) {
    this.els = { btnL, btnR, jumpBtn };
    // 左右ボタン：ボタンの中心より左なら左、右なら右。指をすべらせると切りかわる
    const dirFor = x => {
      const r = dpad.getBoundingClientRect();
      return x < r.left + r.width / 2 ? 'L' : 'R';
    };
    dpadZone.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { dpadZone.setPointerCapture(e.pointerId); } catch (_) {}
      this.touchDir.set(e.pointerId, dirFor(e.clientX));
      this.refresh();
    });
    dpadZone.addEventListener('pointermove', e => {
      if (!this.touchDir.has(e.pointerId)) return;
      const d = dirFor(e.clientX);
      if (d !== this.touchDir.get(e.pointerId)) { this.touchDir.set(e.pointerId, d); this.refresh(); }
    });
    const endDir = e => { if (this.touchDir.delete(e.pointerId)) this.refresh(); };
    dpadZone.addEventListener('pointerup', endDir);
    dpadZone.addEventListener('pointercancel', endDir);
    dpadZone.addEventListener('lostpointercapture', endDir);

    // ジャンプボタン：押している長さでジャンプの高さが変わる
    jumpZone.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { jumpZone.setPointerCapture(e.pointerId); } catch (_) {}
      this.jumpPointers.add(e.pointerId);
      this.jumpPressed = true;
      this.refresh();
    });
    const endJump = e => { if (this.jumpPointers.delete(e.pointerId)) this.refresh(); };
    jumpZone.addEventListener('pointerup', endJump);
    jumpZone.addEventListener('pointercancel', endJump);
    jumpZone.addEventListener('lostpointercapture', endJump);

    // 念のため：画面から指がすべて離れたら全部リセット
    document.addEventListener('touchend', e => {
      if (e.touches.length === 0 && (this.touchDir.size || this.jumpPointers.size)) {
        this.touchDir.clear(); this.jumpPointers.clear(); this.refresh();
      }
    });
  }

  refresh() {
    const k = this.keys;
    let tl = false, tr = false;
    for (const d of this.touchDir.values()) { if (d === 'L') tl = true; else tr = true; }
    this.left = LEFT_KEYS.some(c => k.has(c)) || tl;
    this.right = RIGHT_KEYS.some(c => k.has(c)) || tr;
    this.jump = JUMP_KEYS.some(c => k.has(c)) || this.jumpPointers.size > 0;
    if (this.els) {
      this.els.btnL.classList.toggle('pressed', tl);
      this.els.btnR.classList.toggle('pressed', tr);
      this.els.jumpBtn.classList.toggle('pressed', this.jumpPointers.size > 0);
    }
  }

  endStep() { this.jumpPressed = false; }

  clear() {
    this.keys.clear(); this.touchDir.clear(); this.jumpPointers.clear();
    this.jumpPressed = false;
    this.refresh();
  }
}
