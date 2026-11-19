// Filtering, searching and the spoiler rule for the trophy list.
// A trophy is hidden from a spoiler-shy reader when it is one of PlayStation's
// 28 hidden trophies and it has not been earned yet — unless the reader chose
// to reveal it, or turned the spoiler setting off.

export const KIND_LABELS = {
  'story': 'Story',
  'side-quest': 'Side quest',
  'collectible': 'Collectible',
  'activity': 'Activity',
  'robbery': 'Robbery',
  'exploration': 'Exploration',
  'combat': 'Combat',
  'partner': 'Partner',
  'money': 'Money',
  'secret': 'Secret',
  'completion': '100% completion',
  'platinum': 'Platinum',
  'misc': 'Misc',
};

export function isSpoilerHidden(trophy, earned, hideSpoilers, revealed) {
  if (!hideSpoilers) return false;
  if (earned.has(trophy.name)) return false;
  if (revealed.has(trophy.name)) return false;
  return trophy.hidden === true;
}

export function applyFilters(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.kind === 'missable') {
      if (!t.missable) return false;
    } else if (state.kind !== 'all' && t.kind !== state.kind) {
      return false;
    }
    if (state.status === 'earned' && !state.earned.has(t.name)) return false;
    if (state.status === 'unearned' && state.earned.has(t.name)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, earned) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (earned.has(t.name)) out[t.grade][0] += 1;
  }
  return out;
}

export function nextUnearned(trophies, earned, roadmapOrder) {
  const order = new Map(roadmapOrder.map((name, i) => [name, i]));
  const rest = trophies.filter((t) => !earned.has(t.name));
  rest.sort((a, b) => (order.get(a.name) ?? 999) - (order.get(b.name) ?? 999));
  return rest[0] ?? null;
}
