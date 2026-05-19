import { useState, useEffect, useRef, useCallback } from "react";
import { fetchRandomPokemon } from "../api/pokeapi.js";
import {
  createBattleState,
  simulateRound,
  buildBattleSummary,
} from "../engine/battleEngine.js";

const AUTOMATION_INTERVALS = [
  { label: "5s",  value: 5 },
  { label: "10s", value: 10 },
  { label: "30s", value: 30 },
  { label: "1min", value: 60 },
  { label: "5min", value: 300 },
];

export function useAutomation() {
  return AUTOMATION_INTERVALS;
}

/**
 * useBattle
 * ---------
 * Hook central que gerencia todo o ciclo de vida de uma batalha:
 *
 *  1. fetchCombatants()  — busca 2 Pokémons aleatórios na API
 *  2. startBattle()      — inicia a simulação round a round com animação
 *  3. Automação          — repete o ciclo a cada N segundos
 *
 * Estados expostos:
 *  - phase: "idle" | "fetching" | "ready" | "battling" | "finished"
 *  - battleState: { fighterA, fighterB, rounds, winner, status }
 *  - history: lista de sumários das batalhas anteriores
 *  - countdown: segundos até próxima execução automática
 *  - error: mensagem de erro (se houver)
 */
export default function useBattle() {
  const [phase, setPhase] = useState("idle");
  const [battleState, setBattleState] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Automação
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoInterval, setAutoInterval] = useState(10);
  const [countdown, setCountdown] = useState(0);

  const intervalRef   = useRef(null);
  const countdownRef  = useRef(null);
  const animFrameRef  = useRef(null);
  const isBusyRef     = useRef(false);
  const pendingRounds = useRef([]);

  // ─── Buscar dois combatentes aleatórios ─────────────────────────────────────
  const fetchCombatants = useCallback(async () => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setPhase("fetching");
    setError(null);
    setBattleState(null);

    try {
      const [pA, pB] = await Promise.all([
        fetchRandomPokemon(),
        fetchRandomPokemon(),
      ]);
      const state = createBattleState(pA, pB);
      setBattleState(state);
      setPhase("ready");
    } catch (e) {
      setError("Falha ao buscar Pokémons. Verifique sua conexão.");
      setPhase("idle");
    } finally {
      isBusyRef.current = false;
    }
  }, []);

  // ─── Animar rounds um a um ──────────────────────────────────────────────────
  const animateNextRound = useCallback(() => {
    if (pendingRounds.current.length === 0) return;

    const nextState = pendingRounds.current.shift();
    setBattleState(nextState);

    if (nextState.status === "finished") {
      setPhase("finished");
      setHistory((prev) => [buildBattleSummary(nextState), ...prev].slice(0, 30));
      isBusyRef.current = false;
      return;
    }

    // Próximo round com delay para animação
    animFrameRef.current = setTimeout(animateNextRound, 900);
  }, []);

  // ─── Iniciar batalha (simula todos os rounds e anima) ───────────────────────
  const startBattle = useCallback(() => {
    if (!battleState || phase !== "ready") return;
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setPhase("battling");

    // Simular todos os rounds de uma vez para garantir consistência
    const states = [];
    let current = { ...battleState, status: "running" };
    let guard = 0;

    while (current.status !== "finished" && guard < 100) {
      current = simulateRound(current);
      states.push(current);
      guard++;
    }

    pendingRounds.current = states;
    animateNextRound();
  }, [battleState, phase, animateNextRound]);

  // ─── Ciclo completo: buscar + batalhar ──────────────────────────────────────
  const runFullCycle = useCallback(async () => {
    if (isBusyRef.current) return;
    await fetchCombatants();
    // startBattle será chamado automaticamente via useEffect quando phase === "ready" e auto está on
  }, [fetchCombatants]);

  // Auto-start da batalha quando em modo automático e Pokémons prontos
  useEffect(() => {
    if (autoEnabled && phase === "ready") {
      const t = setTimeout(startBattle, 600);
      return () => clearTimeout(t);
    }
  }, [autoEnabled, phase, startBattle]);

  // ─── Automação ──────────────────────────────────────────────────────────────
  const startCountdown = useCallback((secs) => {
    clearInterval(countdownRef.current);
    setCountdown(secs);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return secs;
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (autoEnabled) {
      runFullCycle();
      startCountdown(autoInterval);
      intervalRef.current = setInterval(() => {
        setCountdown(autoInterval);
        runFullCycle();
      }, autoInterval * 1000);
    } else {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
      clearTimeout(animFrameRef.current);
      setCountdown(0);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
      clearTimeout(animFrameRef.current);
    };
  }, [autoEnabled, autoInterval]);

  // ─── Exportar histórico como JSON ───────────────────────────────────────────
  const exportHistory = useCallback(() => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pokebattle_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return {
    phase,
    battleState,
    history,
    error,
    autoEnabled,
    setAutoEnabled,
    autoInterval,
    setAutoInterval,
    countdown,
    fetchCombatants,
    startBattle,
    runFullCycle,
    exportHistory,
    intervals: AUTOMATION_INTERVALS,
  };
}
