// Progress storage for Leonida Platinum: earned trophies and settings live in
// localStorage, and can be exported to a file and imported back. Nothing is
// sent anywhere — the file the browser downloads is the only copy that leaves.

export const PROGRESS_KEY = 'leonida-platinum-progress-v1';
export const SETTINGS_KEY = 'leonida-platinum-settings-v1';

// A fixed sample of 13 earned trophies, used only when the page is opened
// with ?demo=1 (for screenshots). Real progress always wins over the demo.
export const DEMO_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'Baited My Tackle', 'Stick Fiddler',
  'Whip It Good', 'Catch Me If You Can', 'In The Beginning…', 'Let’s Go Bowling',
  'Personal Best', 'The Truth Is Out There', 'Ten Pin', 'Treat Yo Self',
  'On the Spot',
];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Private mode or a full store: the checklist still works for the session.
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { hideSpoilers: true };
    const parsed = JSON.parse(raw);
    return { hideSpoilers: parsed.hideSpoilers !== false };
  } catch {
    return { hideSpoilers: true };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Same as above: settings just do not persist.
  }
}

export function exportProgress(earned) {
  const payload = {
    app: 'leonida-platinum',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned-trophy list in it.');
  return new Set(names.filter((n) => typeof n === 'string'));
}
