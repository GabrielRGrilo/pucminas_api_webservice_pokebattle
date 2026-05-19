export default function AutomationPanel({
  autoEnabled,
  setAutoEnabled,
  autoInterval,
  setAutoInterval,
  countdown,
  intervals,
  phase,
}) {
  return (
    <div className="auto-panel">
      <div className="auto-header">
        <span className="auto-title">Automação</span>
        <button
          className={`auto-toggle ${autoEnabled ? "auto-toggle--on" : ""}`}
          onClick={() => setAutoEnabled((v) => !v)}
        >
          {autoEnabled ? "ON" : "OFF"}
        </button>
      </div>

      <div className="auto-row">
        <label className="auto-label">Intervalo</label>
        <div className="interval-pills">
          {intervals.map((iv) => (
            <button
              key={iv.value}
              className={`interval-pill ${autoInterval === iv.value ? "interval-pill--active" : ""}`}
              onClick={() => setAutoInterval(iv.value)}
              disabled={autoEnabled}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      <div className="auto-status">
        <span className={`auto-pulse ${autoEnabled ? "auto-pulse--on" : ""}`} />
        <span className="auto-status-txt">
          {autoEnabled
            ? phase === "fetching"
              ? "Buscando combatentes..."
              : phase === "battling"
              ? "Batalha em andamento..."
              : `Próximo ciclo em ${countdown}s`
            : "Agendador desativado"}
        </span>
      </div>
    </div>
  );
}
