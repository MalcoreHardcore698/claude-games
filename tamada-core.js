(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OrionTamadaCore = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const MODES = ['wheel', 'tiles', 'prize'];
  const PHASES = ['vote', 'spin', 'done'];
  const ROUNDS = ['rarity', 'tag', 'game'];
  const budget = 10;
  const sum = allocation => Object.values(allocation || {}).reduce((n, x) => n + x, 0);
  function create(games, { id, host, mode }) {
    if (!MODES.includes(mode)) throw new Error('Unknown Tamada mode');
    return { id, host, mode, phase: 'vote', round: 'rarity', revision: 0, seq: 0,
      enabled: games.map(g => g.id), rarity: null, tag: null, ballots: {}, ready: {},
      result: null, tied: [], spinAt: 0, spinDuration: 0, seed: 0 };
  }
  function candidates(state, games) {
    return games.filter(g => state.enabled.includes(g.id) &&
      (!state.rarity || state.rarity === g.r) && (!state.tag || g.tags.includes(state.tag)));
  }
  function options(state, games) {
    const list = candidates(state, games);
    if (state.round === 'rarity') return [...new Set(list.map(g => g.r))];
    if (state.round === 'tag') return [...new Set(list.flatMap(g => g.genres || g.tags))];
    return list.map(g => g.id);
  }
  function allocation(value, enabled, exact = false) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const out = {};
    for (const [id, n] of Object.entries(value)) {
      if (!enabled.includes(id) || !Number.isInteger(n) || n < 0 || n > budget) return null;
      out[id] = n;
    }
    const total = sum(out);
    return total <= budget && (!exact || total === budget) ? out : null;
  }
  function vote(state, player, payload, players, games) {
    if (state.phase !== 'vote' || payload.revision !== state.revision || !players.includes(player)) return null;
    const next = copy(state);
    if (state.mode === 'wheel') {
      const votes = allocation(payload.allocation, state.enabled);
      if (!votes) return null;
      next.ballots[player] = votes;
      next.ready[player] = payload.ready === true && sum(votes) === budget;
    } else if (state.mode === 'tiles') {
      if (payload.round !== state.round || !options(state, games).includes(payload.choice)) return null;
      next.ballots[player] = payload.choice;
      next.ready[player] = true;
    } else return null;
    return next;
  }
  function include(state, id, games) {
    if (state.phase !== 'vote' || !games.some(g => g.id === id)) return null;
    const next = copy(state);
    next.enabled = state.enabled.includes(id) ? state.enabled.filter(x => x !== id) : [...state.enabled, id];
    if (!next.enabled.length) return null;
    next.ballots = {}; next.ready = {}; next.round = 'rarity'; next.rarity = null; next.tag = null;
    next.revision++;
    return next;
  }
  function step(state,player,payload,players,games){
    if(state.mode!=='wheel'||state.phase!=='vote'||state.ready[player]||payload.revision!==state.revision||!players.includes(player)||!state.enabled.includes(payload.game)||![1,-1].includes(payload.delta))return null;
    const votes={...(state.ballots[player]||{})};
    votes[payload.game]=(votes[payload.game]||0)+payload.delta;
    return vote(state,player,{revision:state.revision,allocation:votes,ready:false},players,games);
  }
  function canAdvance(state, players) {
    if (state.phase !== 'vote' || !state.enabled.length) return false;
    if (state.mode === 'prize') return true;
    return players.length > 0 && players.every(p => state.ready[p] &&
      (state.mode !== 'wheel' || !!allocation(state.ballots[p], state.enabled, true)));
  }
  function totals(state, players) {
    const result = Object.fromEntries(state.enabled.map(id => [id, 0]));
    for (const player of players) for (const [id, n] of Object.entries(state.ballots[player] || {})) {
      if (Object.hasOwn(result, id) && Number.isInteger(n) && n >= 0) result[id] += n;
    }
    return result;
  }
  function weightedPick(weights, random = Math.random) {
    const entries = Object.entries(weights).filter(([, n]) => Number.isFinite(n) && n > 0);
    if (!entries.length) return null;
    let n = random() * entries.reduce((total, [, weight]) => total + weight, 0);
    for (const [id, weight] of entries) { n -= weight; if (n < 0) return id; }
    return entries.at(-1)[0];
  }
  function wheelWeights(state, players) {
    const counts = totals(state, players);
    return Object.fromEntries(state.enabled.map(id => [id, 1 + counts[id]]));
  }
  function sectors(weights) {
    const total = Object.values(weights).reduce((n, x) => n + x, 0);
    let start = 0;
    const entries = Object.entries(weights);
    return entries.map(([id, weight], index) => {
      const end = index === entries.length - 1 ? 360 : start + weight / total * 360;
      const sector = { id, weight, start, end, mid: (start + end) / 2 };
      start = end; return sector;
    });
  }
  function advance(state, players, games, random = Math.random, now = Date.now()) {
    if (!canAdvance(state, players)) return null;
    const next = copy(state);
    let selected;
    if (state.mode === 'wheel') selected = weightedPick(wheelWeights(state, players), random);
    else if (state.mode === 'prize') selected = weightedPick(Object.fromEntries(state.enabled.map(id => [id, 1])), random);
    else {
      const tally = Object.fromEntries(options(state, games).map(id => [id, 0]));
      for (const player of players) if (Object.hasOwn(tally, state.ballots[player])) tally[state.ballots[player]]++;
      const best = Math.max(...Object.values(tally));
      next.tied = Object.keys(tally).filter(id => tally[id] === best);
      selected = next.tied[Math.min(next.tied.length - 1, Math.floor(random() * next.tied.length))];
      if (state.round !== 'game') {
        if (state.round === 'rarity') { next.rarity = selected; next.round = 'tag'; }
        else { next.tag = selected; next.round = 'game'; }
        next.ballots = {}; next.ready = {}; next.revision++;
        return next;
      }
    }
    next.phase = 'spin'; next.result = selected;
    next.spinAt = now + 300; next.spinDuration = state.mode === 'prize' ? 7000 : state.mode === 'wheel' ? 6500 : 1400;
    next.seed = Math.floor(random() * 0x100000000) >>> 0;
    // Freeze the weights used to select the winner for every client's animation.
    next.spinWeights = state.mode === 'wheel' ? wheelWeights(state, players) : null;
    return next;
  }
  function seeded(seed) {
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function prizeStrip(state) {
    const random = seeded(state.seed), winnerIndex = 44;
    const items = Array.from({ length: 52 }, () => state.enabled[Math.floor(random() * state.enabled.length)]);
    items[winnerIndex] = state.result;
    return { items, winnerIndex, offset: -winnerIndex * 190 };
  }
  function normalise(raw, games) {
    if (!raw || typeof raw !== 'object' || !MODES.includes(raw.mode) || !PHASES.includes(raw.phase) ||
      !ROUNDS.includes(raw.round) || typeof raw.id !== 'string' || !raw.id || raw.id.length > 80 ||
      typeof raw.host !== 'string' || !raw.host || raw.host.length > 40 ||
      !Number.isInteger(raw.seq) || !Number.isInteger(raw.revision)) return null;
    const enabled = Array.isArray(raw.enabled) ? [...new Set(raw.enabled)].filter(id => games.some(g => g.id === id)) : [];
    if (!enabled.length || ((raw.phase === 'spin' || raw.phase === 'done') && !enabled.includes(raw.result))) return null;
    const state = copy(raw); state.enabled = enabled;
    state.ballots = state.ballots && typeof state.ballots === 'object' ? state.ballots : {};
    state.ready = state.ready && typeof state.ready === 'object' ? state.ready : {};
    return state;
  }
  return { create, candidates, options, allocation, vote, step, include, canAdvance, totals,
    weightedPick, wheelWeights, sectors, advance, prizeStrip, normalise, sum, budget };
});
