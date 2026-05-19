const BASE = "https://pokeapi.co/api/v2";
const TOTAL = 1010;

// Cache simples em memória para não repetir chamadas
const cache = new Map();

async function get(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function fetchPokemon(idOrName) {
  return get(`${BASE}/pokemon/${idOrName}`);
}

export async function fetchSpecies(id) {
  return get(`${BASE}/pokemon-species/${id}`);
}

export async function fetchTypeRelations(typeName) {
  return get(`${BASE}/type/${typeName}`);
}

export async function fetchRandomPokemon() {
  const id = Math.floor(Math.random() * TOTAL) + 1;
  return fetchPokemon(id);
}

export function getSprite(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    null
  );
}

export function getFlavorText(speciesData) {
  return (
    speciesData?.flavor_text_entries
      ?.find((e) => e.language.name === "en")
      ?.flavor_text?.replace(/\f|\n/g, " ") || ""
  );
}

export function buildStatMap(pokemon) {
  return Object.fromEntries(
    pokemon.stats.map((s) => [s.stat.name, s.base_stat])
  );
}
