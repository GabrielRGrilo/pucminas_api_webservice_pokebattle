export const TYPE_COLORS = {
  fire:     "#D85A30",
  water:    "#378ADD",
  grass:    "#639922",
  electric: "#BA7517",
  psychic:  "#D4537E",
  ice:      "#85B7EB",
  dragon:   "#7F77DD",
  dark:     "#5F5E5A",
  fairy:    "#ED93B1",
  poison:   "#AFA9EC",
  fighting: "#C4553A",
  rock:     "#888780",
  ghost:    "#534AB7",
  bug:      "#97C459",
  steel:    "#9EA09E",
  ground:   "#EF9F27",
  flying:   "#94AADF",
  normal:   "#A8A878",
};

export const TYPE_PT = {
  fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico",
  psychic: "Psíquico", ice: "Gelo", dragon: "Dragão", dark: "Sombrio",
  fairy: "Fada", poison: "Veneno", fighting: "Lutador", rock: "Pedra",
  ghost: "Fantasma", bug: "Inseto", steel: "Aço", ground: "Terra",
  flying: "Voador", normal: "Normal",
};

export const STAT_LABELS = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SP.A", "special-defense": "SP.D", speed: "VEL",
};

export function typeColor(type) {
  return TYPE_COLORS[type] || "#A8A878";
}

export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

export function hpPercent(current, max) {
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export function hpColor(pct) {
  if (pct > 50) return "#4CAF50";
  if (pct > 20) return "#FFC107";
  return "#E63946";
}
