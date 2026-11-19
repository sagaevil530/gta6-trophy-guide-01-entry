// Rendering for Leonida Platinum: the checklist rows, the guide detail pane,
// the roadmap, the missables page and the about page. Every source a guide
// cites is named here with its link, so the detail pane can show it.

import { KIND_LABELS, isSpoilerHidden, countByGrade } from './filters.js';

export const SOURCE_MAP = {
  powerpyx: {
    name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  exophase: {
    name: 'Exophase — GTA VI trophies (official list: name, description, grade)',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  },
  psnprofiles: {
    name: 'PSNProfiles — GTA VI trophies (PSN progress targets)',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
  },
};

export const ROADMAP = [
  {
    title: 'Stage 1 — Play the story',
    time: '60–80 hours',
    intro: 'Finish the 5 chapters and enjoy the game. The 100% checklist is not viewable until after the story, but progress made during it already counts. There are no mission gold medals and no mission replay, so keep manual saves at the start and end of each chapter (15 slots).',
    items: [
      ['Do the one missable meditation', 'In Chapter 1, after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and choose Accept. It is the only trophy that can be locked out — see the Missables tab.'],
      ['Finish Chapters 1–5', 'All 13 story trophies pop automatically: the 4 chapter trophies, the final mission gold, and the 7 named-mission trophies.'],
      ['Scan and study as you go', 'Scan every new vehicle with WAiNK (200 of 277 needed for 100%) and study animals with binoculars (100 of 255). Both count from Chapter 1.'],
      ['Do optional missions as they appear', 'You need any 100 for the 100% checklist and there are 200–300+. Questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret all open during the story and stay available after it.'],
      ['Start the stranger strands', 'Kirk, Kyle, Yago and Pilot Pete count toward Strangers & Freaks — 8 strands in total.'],
    ],
  },
  {
    title: 'Stage 2 — 100% checklist & challenges',
    time: 'about 100 hours',
    intro: 'After the story, the checklist unlocks under Progress, Stats, 100% Completion. PowerPyx reports it is closer to 60% true completion: most side quests are not required, and you only need 70 of the 80 challenges.',
    items: [
      ['Complete the checklist categories', '300 stunts, 200 vehicles scanned, 100 animals studied, 70 of 80 challenges, all robberies, all 8 bank vaults, all 15 Target Decks, 15 of 18 meditations.'],
      ['Gold the shooting ranges', '42 gold medals across 12 ranges for The Shootist — also required in full for the checklist.'],
      ['Win the drone races', 'One win at each of the 14 Top Fun locations; all 42 races are needed for the checklist.'],
      ['Clear the robberies', '5 bank vaults for Maximum Withdrawal (8 for the checklist), one illegal operation per gang for Pest Control (all 39 for the checklist), and the armored truck for A Classic Blitz Play.'],
      ['Launder and spend', '$250,000 in marked bills to a fence (Dime on the Dollar) and $100,000 spent in shops (Treat Yo Self) — the vault payouts fund both.'],
    ],
  },
  {
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    time: 'about 10 hours',
    intro: 'By now most trophies should have popped on their own. This stage is the leftovers: the stranger strands, the partner and combat trophies, and the last collectibles.',
    items: [
      ['Finish the 8 stranger strands', 'The Strangers & Freaks are not needed for 100%, so they are the most likely thing left.'],
      ['Partner trophies', 'Hot Together (escape a 4-star wanted level with your partner) and Retail Therapy (rob 3 shops back-to-back while wanted).'],
      ['Combat and secret trophies', 'Gunslinger (5 takedowns in one Combat Focus), Catch Me If You Can (steal the docked plane at VCIA), Challenging Tank (steal a tank at Mile Zero), and the unconfirmed ones if their methods are known by then.'],
      ['Buy the garages, register the cars', 'Little Boxes (8 garages, $160,000) then On the Spot (register 10 vehicles with Moses).'],
      ['Platinum', 'Vice Got a Price! pops when the other 54 are earned.'],
    ],
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeChip(trophy) {
  return el('span', `chip grade-${trophy.grade}`, trophy.grade);
}

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('earned-count').textContent = String(done);
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  const byGrade = countByGrade(trophies, earned);
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map(
    (g) => `<b>${byGrade[g][0]}/${byGrade[g][1]}</b> ${g}`,
  );
  document.getElementById('progress-grades').innerHTML =
    `${parts.join(' &middot; ')} &middot; <b>${done} of ${total}</b> total`;
}

export function renderList(trophies, state, onSelect, onToggle) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  for (const t of trophies) {
    const hidden = isSpoilerHidden(t, state.earned, state.hideSpoilers, state.revealed);
    const li = document.createElement('li');
    const row = el('button', 'trophy-row', undefined);
    row.type = 'button';
    if (state.selected === t.name) row.classList.add('selected');
    if (state.earned.has(t.name)) row.classList.add('earned');
    row.addEventListener('click', (event) => {
      if (event.target.type === 'checkbox') return;
      onSelect(t.name);
    });

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : t.name} as earned`);
    box.addEventListener('change', () => onToggle(t.name, box.checked));
    box.addEventListener('click', (event) => event.stopPropagation());
    row.append(box);

    const main = el('div', 'row-main');
    const name = el('div', 'row-name');
    if (hidden) {
      name.append(el('span', 'hidden-tag', 'Hidden trophy — earn it (or reveal it) to see its name'));
    } else {
      name.textContent = t.name;
    }
    main.append(name);
    if (!hidden) main.append(el('div', 'row-desc', t.description));
    const meta = el('div', 'row-meta');
    meta.append(gradeChip(t));
    // The kind chip would only repeat what the grade or the target already says.
    if (!hidden && t.kind !== 'platinum' && t.kind !== 'completion') meta.append(el('span', 'chip', KIND_LABELS[t.kind] ?? t.kind));
    if (t.missable) meta.append(el('span', 'chip missable', '⚠ Missable'));
    if (t.target) meta.append(el('span', 'chip target', `Target: ${formatTarget(t.target)}`));
    if (state.earned.has(t.name)) meta.append(el('span', 'chip earned-chip', '✓ Earned'));
    main.append(meta);
    row.append(main);
    li.append(row);
    list.append(li);
  }
  document.getElementById('empty').hidden = trophies.length !== 0;
  const shown = trophies.length;
  const earnedShown = trophies.filter((t) => state.earned.has(t.name)).length;
  document.getElementById('count-line').innerHTML =
    `Showing <b>${shown}</b> of <b>${state.all.length}</b> trophies` +
    (shown ? ` — <b>${earnedShown}</b> earned in this view` : '');
}

export function formatTarget(target) {
  if (target.label.startsWith('%')) return `${target.count}${target.label}`;
  if (target.label.startsWith('$')) return `${target.label} ${target.count.toLocaleString('en-US')}`;
  return `${target.count} ${target.label}`;
}

export function renderDetail(trophy, state, onReveal) {
  const pane = document.getElementById('detail');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('h2', undefined, 'Pick a trophy'));
    pane.append(el('p', undefined, 'Select any trophy in the list to see its full guide: how to unlock it, step by step, with its sources.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, state.earned, state.hideSpoilers, state.revealed);
  if (hidden) {
    pane.append(el('h2', undefined, 'Hidden trophy'));
    pane.append(el('p', 'official', 'This is one of PlayStation’s 28 hidden trophies. Its name and description stay hidden until you earn it — or until you choose to reveal it.'));
    const btn = el('button', 'btn reveal-btn', 'Reveal this trophy (spoiler)');
    btn.type = 'button';
    btn.addEventListener('click', () => onReveal(trophy.name));
    pane.append(btn);
    return;
  }
  pane.append(el('h2', undefined, trophy.name));
  pane.append(el('p', 'official', `“${trophy.description}” — official PlayStation description`));
  const meta = el('div', 'row-meta');
  meta.append(gradeChip(trophy));
  if (trophy.kind !== 'platinum' && trophy.kind !== 'completion') meta.append(el('span', 'chip', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.hidden) meta.append(el('span', 'chip', 'Hidden on PSN'));
  if (trophy.missable) meta.append(el('span', 'chip missable', '⚠ Missable'));
  if (trophy.target) meta.append(el('span', 'chip target', `PSN target: ${formatTarget(trophy.target)}`));
  pane.append(meta);
  if (state.earned.has(trophy.name)) {
    pane.append(el('p', 'earned-line', '✓ You have earned this trophy.'));
  }
  pane.append(el('h3', undefined, 'How to unlock it'));
  for (const para of trophy.guide.split('\n')) {
    if (para.trim()) pane.append(el('p', undefined, para.trim()));
  }
  if (trophy.steps && trophy.steps.length) {
    pane.append(el('h3', undefined, 'Steps'));
    const ol = document.createElement('ol');
    for (const step of trophy.steps) ol.append(el('li', undefined, step));
    pane.append(ol);
  }
  if (trophy.tip) {
    const tip = el('p', 'tip');
    tip.append(el('strong', undefined, 'Tip: '));
    tip.append(document.createTextNode(trophy.tip));
    pane.append(tip);
  }
  if (trophy.missable) {
    const warn = el('p', 'warn');
    warn.append(el('strong', undefined, 'Missable warning: '));
    warn.append(document.createTextNode(
      'This is the one trophy PowerPyx flags as potentially missable. Do the Chapter 1 meditation before Chapter 1 ends, and keep a manual save from early in Chapter 1 as a safety net.',
    ));
    pane.append(warn);
  }
  pane.append(el('h3', undefined, 'Sources'));
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const key of trophy.sources) {
    const src = SOURCE_MAP[key];
    if (!src) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = src.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = src.name;
    li.append(a);
    sources.append(li);
  }
  pane.append(sources);
  pane.append(el('p', 'unverified',
    'Guide written in our own words from the official description and the sources above. ' +
    'The game released 19 November 2026; where a method is not yet confirmed, the guide says so instead of inventing one.'));
}

export function renderRoadmap() {
  const facts = document.getElementById('roadmap-facts');
  facts.replaceChildren();
  const data = [
    ['4/10', 'Estimated difficulty (PowerPyx)'],
    ['~200 hours', 'Time to platinum (PowerPyx)'],
    ['1 playthrough', 'Minimum, no mission replay'],
    ['0 online', 'All 55 trophies are offline'],
    ['1 missable', 'Positive Mental Attitude, maybe'],
    ['5 chapters', 'Story, about 60–80 hours'],
  ];
  for (const [value, label] of data) {
    const fact = el('div', 'fact');
    fact.append(el('b', undefined, value));
    fact.append(el('span', undefined, label));
    facts.append(fact);
  }
  const stages = document.getElementById('roadmap-stages');
  stages.replaceChildren();
  for (const stage of ROADMAP) {
    const card = el('section', 'stage');
    const h = el('h2', undefined, stage.title);
    h.append(el('span', 'stage-time', stage.time));
    card.append(h);
    card.append(el('p', undefined, stage.intro));
    const ul = document.createElement('ul');
    for (const [bold, rest] of stage.items) {
      const li = document.createElement('li');
      li.append(el('b', undefined, `${bold} — `));
      li.append(document.createTextNode(rest));
      ul.append(li);
    }
    card.append(ul);
    stages.append(card);
  }
}

export function renderMissables(trophies) {
  const body = document.getElementById('missables-body');
  body.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = el('section', 'miss-card danger');
    card.append(el('h2', undefined, `⚠ ${t.name} — the one potentially missable trophy`));
    card.append(el('p', undefined, t.guide));
    const steps = document.createElement('ol');
    for (const step of t.steps) steps.append(el('li', undefined, step));
    card.append(steps);
    card.append(el('p', 'note', 'Source: PowerPyx — GTA 6 Trophy Guide & Roadmap (the only trophy it flags, and only as a maybe).'));
    body.append(card);
  }
  const safe = el('section', 'miss-card');
  safe.append(el('h2', undefined, 'Everything else is safe'));
  safe.append(el('p', undefined,
    'PowerPyx reports there is no mission replay, but also that every other trophy can be earned after the story in free-roam: all story trophies pop automatically, every trophy-related quest giver comes back later in the game, optional missions that disappear do not matter for trophies, and the 100% checklist is fully doable after the story. Keep manual saves at the start and end of each chapter anyway — with 15 slots, it costs nothing.'));
  body.append(safe);
  const unknown = trophies.filter((t) => t.guide.includes('No confirmed method yet'));
  if (unknown.length) {
    const card = el('section', 'miss-card');
    card.append(el('h2', undefined, 'Not yet confirmed — not the same as missable'));
    const ul = document.createElement('ul');
    for (const t of unknown) {
      const li = document.createElement('li');
      li.append(el('b', undefined, `${t.name} — `));
      li.append(document.createTextNode(t.description));
      ul.append(li);
    }
    card.append(ul);
    card.append(el('p', 'note',
      'PowerPyx lists these as currently unknown. They are not flagged as missable anywhere — their methods simply have not been confirmed yet. This guide will be updated when they are.'));
    body.append(card);
  }
}

export function renderAbout() {
  const body = document.getElementById('about-body');
  body.replaceChildren();
  const sections = [
    ['What this is', [
      'A free, open-source, offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation).',
      'Open index.html in a desktop browser and it works with the network off. Your progress is saved in your browser (localStorage) and can be exported to a file and imported back.',
      'No Rockstar logo or official artwork is used anywhere; the look is our own.',
    ]],
    ['Where the facts come from', [
      'Trophy names, descriptions and grades: the official list as published by Exophase and PSNProfiles on 18 November 2026, the two agreeing on every name, description and grade.',
      'PSN progress targets (such as 250 stunts or 42 shooting range golds): PSNProfiles.',
      'Which trophies are hidden on PlayStation (28) and which are visible (27): PSNProfiles and the cross-checked lists.',
      'Roadmap, missable warning and per-trophy methods: PowerPyx — GTA 6 Trophy Guide & Roadmap, in our own words, never copied.',
      'Where PowerPyx lists a trophy as currently unknown, this guide says so and does not invent a method.',
    ]],
    ['How to use it', [
      'Tick a trophy off when you earn it — it stays ticked in your browser.',
      'Filter by grade, kind or earned status, or search by name. The kind filter includes a Missable view with the one trophy that may be missable.',
      'Turn on “Hide story spoilers” to keep the 28 hidden trophies masked until you earn them or reveal one.',
      'Export your progress before clearing browser data, and import it back afterwards.',
      'Deep links: ?grade=silver, ?kind=collectible, ?view=roadmap, ?demo=1 loads sample progress for screenshots.',
    ]],
    ['Sources', [
      'PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
      'Exophase — GTA VI trophies: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
      'PSNProfiles — GTA VI trophies: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
    ]],
  ];
  for (const [title, lines] of sections) {
    body.append(el('h2', undefined, title));
    const ul = document.createElement('ul');
    for (const line of lines) ul.append(el('li', undefined, line));
    body.append(ul);
  }
}
