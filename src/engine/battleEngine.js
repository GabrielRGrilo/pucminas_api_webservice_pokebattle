/**
 * BattleEngine
 * ============
 * Lógica de batalha baseada em stats reais da PokéAPI.
 * Simula rodadas de combate com:
 *   - Cálculo de dano baseado em ATK vs DEF (fórmula Gen I)
 *   - Vantagem/desvantagem de tipo (type effectiveness)
 *   - Ordem de ataque determinada pelo Speed
 *   - Chance crítica de 6.25% (igual ao jogo original)
 */

const TYPE_CHART = {
  fire:     { weakTo: ["water","rock","ground"],              resistantTo: ["fire","grass","ice","bug","steel","fairy"] },
  water:    { weakTo: ["electric","grass"],                   resistantTo: ["fire","water","ice","steel"] },
  grass:    { weakTo: ["fire","ice","poison","flying","bug"], resistantTo: ["water","electric","grass","ground"] },
  electric: { weakTo: ["ground"],                             resistantTo: ["electric","flying","steel"] },
  psychic:  { weakTo: ["bug","ghost","dark"],                 resistantTo: ["fighting","psychic"] },
  ice:      { weakTo: ["fire","fighting","rock","steel"],     resistantTo: ["ice"] },
  dragon:   { weakTo: ["ice","dragon","fairy"],               resistantTo: ["fire","water","electric","grass"] },
  dark:     { weakTo: ["fighting","bug","fairy"],             resistantTo: ["ghost","dark"] },
  fairy:    { weakTo: ["poison","steel"],                     resistantTo: ["fighting","bug","dark"] },
  fighting: { weakTo: ["flying","psychic","fairy"],           resistantTo: ["bug","rock","dark"] },
  poison:   { weakTo: ["ground","psychic"],                   resistantTo: ["grass","fighting","poison","bug","fairy"] },
  ground:   { weakTo: ["water","grass","ice"],                resistantTo: ["poison","rock"] },
  rock:     { weakTo: ["water","grass","fighting","ground","steel"], resistantTo: ["normal","fire","poison","flying"] },
  bug:      { weakTo: ["fire","flying","rock"],               resistantTo: ["grass","fighting","ground"] },
  ghost:    { weakTo: ["ghost","dark"],                       resistantTo: ["poison","bug"] },
  steel:    { weakTo: ["fire","fighting","ground"],           resistantTo: ["normal","grass","ice","flying","psychic","bug","rock","dragon","steel","fairy"] },
  flying:   { weakTo: ["electric","ice","rock"],              resistantTo: ["grass","fighting","bug"] },
  normal:   { weakTo: ["fighting"],                           resistantTo: [] },
};

/**
 * Calcula multiplicador de efetividade de tipo.
 */
export function typeEffectiveness(attackerTypes, defenderTypes) {
  let multiplier = 1;
  for (const atkType of attackerTypes) {
    for (const defType of defenderTypes) {
      const rel = TYPE_CHART[defType];
      if (!rel) continue;
      if (rel.weakTo.includes(atkType))      multiplier *= 2;
      if (rel.resistantTo.includes(atkType)) multiplier *= 0.5;
    }
  }
  return Math.max(0.25, Math.min(4, multiplier));
}

/**
 * Retorna label de efetividade para exibir na UI.
 */
export function effectivenessLabel(mult) {
  if (mult >= 2)   return { text: "Super efetivo!", color: "#E63946" };
  if (mult <= 0.5) return { text: "Não muito efetivo...", color: "#6B9DC8" };
  return { text: "Efetivo.", color: "#639922" };
}

/**
 * Calcula dano de um ataque.
 * Fórmula baseada na Gen I: ((2*level/5+2) * ATK/DEF * power/50 + 2) * mods
 */
function calcDamage(attacker, defender, effectiveness) {
  const LEVEL = 50;
  const POWER = 40;

  const atkStat  = attacker.stats["attack"];
  const defStat  = defender.stats["defense"];
  const isCrit   = Math.random() < 0.0625;
  const critMult = isCrit ? 1.5 : 1;
  const random   = 0.85 + Math.random() * 0.15;

  const base = ((2 * LEVEL / 5 + 2) * atkStat / defStat * POWER / 50 + 2);
  const dmg  = Math.max(1, Math.round(base * effectiveness * critMult * random));

  return { damage: dmg, isCrit };
}

/**
 * Cria um fighter a partir de um Pokémon da API.
 */
function makeFighter(p) {
  return {
    id:        p.id,
    name:      p.name,
    types:     p.types.map((t) => t.type.name),
    stats:     Object.fromEntries(p.stats.map((s) => [s.stat.name, s.base_stat])),
    maxHp:     p.stats.find((s) => s.stat.name === "hp").base_stat,
    currentHp: p.stats.find((s) => s.stat.name === "hp").base_stat,
    sprite:    p.sprites?.other?.["official-artwork"]?.front_default || p.sprites?.front_default,
  };
}

/**
 * Cria o estado inicial de batalha a partir de dois Pokémons da API.
 */
export function createBattleState(pokemonA, pokemonB) {
  return {
    fighterA: makeFighter(pokemonA),
    fighterB: makeFighter(pokemonB),
    rounds:   [],
    winner:   null,
    status:   "ready",
  };
}

/**
 * Simula UMA rodada de batalha. Retorna novo estado (imutável).
 * Quem tem mais Speed ataca primeiro.
 */
export function simulateRound(state) {
  if (state.status === "finished") return state;

  const A = { ...state.fighterA };
  const B = { ...state.fighterB };
  const roundEvents = [];
  const roundNum = state.rounds.length + 1;

  const aFirst = A.stats["speed"] >= B.stats["speed"];
  const first  = aFirst ? A : B;
  const second = aFirst ? B : A;

  // Primeiro ataque
  const eff1 = typeEffectiveness(first.types, second.types);
  const { damage: dmg1, isCrit: crit1 } = calcDamage(first, second, eff1);
  second.currentHp = Math.max(0, second.currentHp - dmg1);

  roundEvents.push({
    attacker:      first.name,
    defender:      second.name,
    damage:        dmg1,
    isCrit:        crit1,
    effectiveness: eff1,
    defenderHp:    second.currentHp,
    defenderMaxHp: second.maxHp,
  });

  let winner = null;

  if (second.currentHp <= 0) {
    winner = first.name;
  } else {
    // Segundo ataque
    const eff2 = typeEffectiveness(second.types, first.types);
    const { damage: dmg2, isCrit: crit2 } = calcDamage(second, first, eff2);
    first.currentHp = Math.max(0, first.currentHp - dmg2);

    roundEvents.push({
      attacker:      second.name,
      defender:      first.name,
      damage:        dmg2,
      isCrit:        crit2,
      effectiveness: eff2,
      defenderHp:    first.currentHp,
      defenderMaxHp: first.maxHp,
    });

    if (first.currentHp <= 0) winner = second.name;
  }

  const newA = aFirst ? first : second;
  const newB = aFirst ? second : first;

  return {
    fighterA: newA,
    fighterB: newB,
    rounds:   [...state.rounds, { roundNum, events: roundEvents }],
    winner,
    status:   winner ? "finished" : "running",
  };
}

/**
 * Gera sumário da batalha para exportação em JSON.
 */
export function buildBattleSummary(state) {
  return {
    timestamp:   new Date().toISOString(),
    fighters: {
      A: { name: state.fighterA.name, types: state.fighterA.types, finalHp: state.fighterA.currentHp, maxHp: state.fighterA.maxHp },
      B: { name: state.fighterB.name, types: state.fighterB.types, finalHp: state.fighterB.currentHp, maxHp: state.fighterB.maxHp },
    },
    totalRounds: state.rounds.length,
    winner:      state.winner,
    rounds:      state.rounds,
  };
}
