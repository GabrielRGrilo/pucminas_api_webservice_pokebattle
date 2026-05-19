import "./App.css";
import useBattle from "./hooks/useBattle.js";
import FighterCard from "./components/FighterCard.jsx";
import BattleLog from "./components/BattleLog.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import AutomationPanel from "./components/AutomationPanel.jsx";

function BattleArena({ battleState, phase }) {
  if (!battleState) return null;

  const { fighterA, fighterB, rounds, winner } = battleState;
  const winnerIs = winner;

  return (
    <div className="arena">
      <div className="fighters-row">
        <FighterCard
          fighter={fighterA}
          side="A"
          isWinner={winnerIs === fighterA.name}
          isLoser={winnerIs && winnerIs !== fighterA.name}
          phase={phase}
        />

        <div className="vs-divider">
          <span className="vs-text">VS</span>
          {phase === "battling" && (
            <div className="battle-fx">⚡</div>
          )}
          {winnerIs && (
            <div className="ko-badge">KO!</div>
          )}
        </div>

        <FighterCard
          fighter={fighterB}
          side="B"
          isWinner={winnerIs === fighterB.name}
          isLoser={winnerIs && winnerIs !== fighterB.name}
          phase={phase}
        />
      </div>

      <BattleLog rounds={rounds} winner={winner} />
    </div>
  );
}

function Controls({ phase, onFetch, onStart, onRun, autoEnabled }) {
  const fetching  = phase === "fetching";
  const battling  = phase === "battling";
  const busy      = fetching || battling;

  return (
    <div className="controls">
      <button
        className="ctrl-btn ctrl-btn--secondary"
        onClick={onFetch}
        disabled={busy || autoEnabled}
      >
        {fetching ? "Buscando..." : "🎲 Novos Pokémons"}
      </button>

      <button
        className="ctrl-btn ctrl-btn--primary"
        onClick={onStart}
        disabled={phase !== "ready" || autoEnabled}
      >
        ⚔️ Iniciar Batalha
      </button>
    </div>
  );
}

export default function App() {
  const battle = useBattle();

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">⚔️</div>
        <h1 className="app-title">PokéBattle</h1>
        <p className="app-subtitle">Sistema de Batalha com Automação · PokéAPI</p>
      </header>

      <main className="app-main">
        <div className="left-col">
          {/* Automação */}
          <AutomationPanel
            autoEnabled={battle.autoEnabled}
            setAutoEnabled={battle.setAutoEnabled}
            autoInterval={battle.autoInterval}
            setAutoInterval={battle.setAutoInterval}
            countdown={battle.countdown}
            intervals={battle.intervals}
            phase={battle.phase}
          />

          {/* Controles manuais */}
          <Controls
            phase={battle.phase}
            onFetch={battle.fetchCombatants}
            onStart={battle.startBattle}
            onRun={battle.runFullCycle}
            autoEnabled={battle.autoEnabled}
          />

          {/* Histórico */}
          <HistoryPanel
            history={battle.history}
            onExport={battle.exportHistory}
          />
        </div>

        <div className="right-col">
          {/* Erro */}
          {battle.error && (
            <div className="error-banner">{battle.error}</div>
          )}

          {/* Estado inicial */}
          {battle.phase === "idle" && !battle.battleState && (
            <div className="idle-state">
              <div className="idle-icon">🎮</div>
              <p className="idle-text">
                Clique em <strong>"Novos Pokémons"</strong> para sortear os combatentes,<br />
                ou ative a <strong>Automação</strong> para batalhas contínuas.
              </p>
            </div>
          )}

          {/* Carregando */}
          {battle.phase === "fetching" && (
            <div className="loading-state">
              <div className="pokeball-spin">
                <div className="pokeball">
                  <div className="pokeball-top" />
                  <div className="pokeball-mid" />
                  <div className="pokeball-bottom" />
                  <div className="pokeball-btn" />
                </div>
              </div>
              <p>Convocando combatentes…</p>
            </div>
          )}

          {/* Arena */}
          {battle.battleState && battle.phase !== "fetching" && (
            <BattleArena
              battleState={battle.battleState}
              phase={battle.phase}
            />
          )}
        </div>
      </main>
    </div>
  );
}
