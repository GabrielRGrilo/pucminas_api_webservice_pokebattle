import { capitalize } from "../engine/constants.js";

function Scoreboard({ history }) {
  const tally = {};
  history.forEach(({ winner }) => {
    if (!winner) return;
    tally[winner] = (tally[winner] || 0) + 1;
  });
  const ranked = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="scoreboard">
      <div className="scoreboard-title">🏅 Placar geral</div>
      {ranked.map(([name, wins], i) => (
        <div key={name} className="score-row">
          <span className="score-rank">#{i + 1}</span>
          <span className="score-name">{capitalize(name)}</span>
          <span className="score-wins">{wins} {wins === 1 ? "vitória" : "vitórias"}</span>
        </div>
      ))}
    </div>
  );
}

function HistoryItem({ battle, index }) {
  const timeStr = new Date(battle.timestamp).toLocaleTimeString("pt-BR");
  const hpA = Math.round((battle.fighters.A.finalHp / battle.fighters.A.maxHp) * 100);
  const hpB = Math.round((battle.fighters.B.finalHp / battle.fighters.B.maxHp) * 100);

  return (
    <div className="history-item">
      <div className="history-meta">
        <span className="history-index">#{index + 1}</span>
        <span className="history-time">{timeStr}</span>
        <span className="history-rounds">{battle.totalRounds} rounds</span>
      </div>
      <div className="history-matchup">
        <span className={`history-fighter ${battle.winner === battle.fighters.A.name ? "history-fighter--win" : "history-fighter--loss"}`}>
          {capitalize(battle.fighters.A.name)}
          <span className="history-hp"> ({hpA}% HP)</span>
        </span>
        <span className="history-vs">vs</span>
        <span className={`history-fighter ${battle.winner === battle.fighters.B.name ? "history-fighter--win" : "history-fighter--loss"}`}>
          {capitalize(battle.fighters.B.name)}
          <span className="history-hp"> ({hpB}% HP)</span>
        </span>
      </div>
      <div className="history-winner">
        🏆 {capitalize(battle.winner)}
      </div>
    </div>
  );
}

export default function HistoryPanel({ history, onExport }) {
  return (
    <div className="history-panel">
      <div className="history-header">
        <span className="history-title">Histórico de batalhas</span>
        {history.length > 0 && (
          <button className="export-btn" onClick={onExport}>
            ↓ Exportar JSON
          </button>
        )}
      </div>

      <Scoreboard history={history} />

      {history.length === 0 ? (
        <p className="history-empty">Nenhuma batalha registrada ainda.</p>
      ) : (
        <div className="history-list">
          {history.map((b, i) => (
            <HistoryItem key={b.timestamp} battle={b} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
