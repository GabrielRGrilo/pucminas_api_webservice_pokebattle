import { useState, useEffect } from "react";
import { typeColor, TYPE_PT, STAT_LABELS, hpPercent, hpColor, capitalize } from "../engine/constants.js";

export default function FighterCard({ fighter, side, isWinner, isLoser, phase }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const pct = hpPercent(fighter.currentHp, fighter.maxHp);

  useEffect(() => { setImgLoaded(false); }, [fighter.id]);

  const shakeClass = phase === "battling" ? (side === "A" ? "shake-A" : "shake-B") : "";
  const winnerGlow = isWinner ? "fighter--winner" : "";
  const loserFade  = isLoser  ? "fighter--loser"  : "";

  return (
    <div className={`fighter-card ${winnerGlow} ${loserFade}`}>
      <div className="fighter-side-label">{side === "A" ? "Desafiante" : "Adversário"}</div>

      {/* Sprite */}
      <div className={`fighter-sprite-wrap ${shakeClass}`}>
        <img
          src={fighter.sprite}
          alt={fighter.name}
          className={`fighter-sprite ${imgLoaded ? "fighter-sprite--loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
        />
        {isWinner && <div className="winner-crown">👑</div>}
      </div>

      {/* Nome e tipos */}
      <div className="fighter-name">{capitalize(fighter.name)}</div>
      <div className="fighter-types">
        {fighter.types.map((t) => (
          <span key={t} className="type-badge" style={{ background: typeColor(t) }}>
            {TYPE_PT[t] || t}
          </span>
        ))}
      </div>

      {/* Barra de HP */}
      <div className="hp-wrap">
        <div className="hp-label-row">
          <span className="hp-label">HP</span>
          <span className="hp-values">
            <strong>{fighter.currentHp}</strong>
            <span className="hp-max"> / {fighter.maxHp}</span>
          </span>
        </div>
        <div className="hp-track">
          <div
            className="hp-fill"
            style={{
              width: `${pct}%`,
              background: hpColor(pct),
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="fighter-stats">
        {Object.entries(fighter.stats)
          .filter(([key]) => STAT_LABELS[key])
          .map(([key, val]) => (
            <div key={key} className="stat-chip">
              <span className="stat-chip-label">{STAT_LABELS[key]}</span>
              <span className="stat-chip-val">{val}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
