// 進みぐあいの保存（この端末のブラウザの中に保存されます）
const KEY = 'rin-adventure-save-v2';

export function defaultSave() {
  return { unlocked: 1, medals: {}, best: {}, times: {}, cleared: {}, muted: false, seenHints: {} };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch (_) {
    return defaultSave();
  }
}

export function writeSave(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) { /* 保存できなくても続ける */ }
}
