import { useEffect, useRef } from "react";
import { effectivenessLabel } from "../engine/battleEngine.js";
import { capitalize } from "../engine/constants.js";

function EventRow({ event }) {
  const eff = effectivenessLabel(event.effectiveness);
  return (
    <div className="log-event">
      <span className="log-attacker">{capitalize(event.attacker)}</span>
      <span className="log-arrow">→</span>
      <span className="log-defender">{capitalize(event.defender)}</span>
      <span className="log-damage">−{event.damage} HP</span>
      {event.isCrit && <span className="log-crit">CRÍTICO!</span>}
      {event.effectiveness !== 1 && (
        <span className="log-eff" style={{ color: eff.color }}>{eff.text}</span>
      )}
    </div>
  );
}

export default function BattleLog({ rounds, winner }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds.length]);

  if (rounds.length === 0) {
    return (
      <div className="battle-log battle-log--empty">
        <p>O log da batalha aparecerá aqui…</p>
      </div>
    );
  }

  return (
    <div className="battle-log">
      {rounds.map((round) => (
        <div key={round.roundNum} className="log-round">
          <div className="log-round-title">Round {round.roundNum}</div>
          {round.events.map((ev, i) => (
            <EventRow key={i} event={ev} />
          ))}
        </div>
      ))}
      {winner && (
        <div className="log-winner-msg">
          🏆 {capitalize(winner)} venceu a batalha!
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
