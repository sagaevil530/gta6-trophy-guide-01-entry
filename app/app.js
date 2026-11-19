// Leonida Platinum — boot and wiring. Loads the trophy list, restores saved
// progress and settings, wires the toolbar, tabs and detail pane, and honours
// deep links (?view=, ?grade=, ?kind=, ?spoilers=off, ?demo=1, ?select=, ?scroll=).

import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgressFile, DEMO_EARNED } from './store.js';
import { applyFilters } from './filters.js';
import { renderProgress, renderList, renderDetail, renderRoadmap, renderMissables, renderAbout } from './views.js';

const params = new URLSearchParams(location.search);
const trophies = (await (await fetch('data/trophies.json')).json()).trophies;

const state = {
  all: trophies,
  earned: loadEarned(),
  revealed: new Set(),
  hideSpoilers: loadSettings().hideSpoilers,
  grade: 'all',
  kind: 'all',
  status: 'all',
  search: '',
  selected: null,
  view: 'tracker',
};

// Demo progress for screenshots: ?demo=1 seeds 13 earned trophies, but only
// when the reader has no saved progress of their own.
if (params.get('demo') === '1' && state.earned.size === 0) {
  state.earned = new Set(DEMO_EARNED.filter((name) => trophies.some((t) => t.name === name)));
  saveEarned(state.earned);
}
if (params.get('spoilers') === 'off') state.hideSpoilers = false;
if (params.get('grade')) state.grade = params.get('grade');
if (params.get('kind')) state.kind = params.get('kind');
if (params.get('status')) state.status = params.get('status');
if (params.get('view')) state.view = params.get('view');
if (params.get('select')) state.selected = params.get('select');

const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const kindSelect = document.getElementById('kind');
const statusSelect = document.getElementById('status');
const spoilersBox = document.getElementById('spoilers');

searchInput.value = state.search;
gradeSelect.value = state.grade;
kindSelect.value = state.kind;
statusSelect.value = state.status;
spoilersBox.checked = state.hideSpoilers;

function currentSelection() {
  return trophies.find((t) => t.name === state.selected) ?? null;
}

function render() {
  renderProgress(trophies, state.earned);
  const filtered = applyFilters(trophies, state);
  renderList(filtered, state, selectTrophy, toggleEarned);
  renderDetail(currentSelection(), state, revealTrophy);
}

function selectTrophy(name) {
  state.selected = name;
  render();
}

function revealTrophy(name) {
  state.revealed.add(name);
  render();
}

function toggleEarned(name, checked) {
  if (checked) state.earned.add(name);
  else state.earned.delete(name);
  saveEarned(state.earned);
  render();
}

function showView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.hidden = section.id !== `view-${view}`;
  }
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables(trophies);
  if (view === 'about') renderAbout();
}

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  render();
});
gradeSelect.addEventListener('change', () => {
  state.grade = gradeSelect.value;
  render();
});
kindSelect.addEventListener('change', () => {
  state.kind = kindSelect.value;
  render();
});
statusSelect.addEventListener('change', () => {
  state.status = statusSelect.value;
  render();
});
spoilersBox.addEventListener('change', () => {
  state.hideSpoilers = spoilersBox.checked;
  saveSettings({ hideSpoilers: state.hideSpoilers });
  render();
});
document.getElementById('export').addEventListener('click', () => exportProgress(state.earned));
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = await importProgressFile(file);
    saveEarned(state.earned);
    render();
  } catch (error) {
    alert(`Could not import that file: ${error.message}`);
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies and start over?')) return;
  state.earned = new Set();
  state.revealed = new Set();
  saveEarned(state.earned);
  render();
});
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

if (!state.selected) {
  // Open on a trophy with a rich guide so the detail pane is never empty.
  state.selected = 'A Long Road';
}
showView(state.view);
render();
if (params.get('scroll')) {
  window.scrollTo({ top: Number(params.get('scroll')) || 0, behavior: 'instant' });
}
