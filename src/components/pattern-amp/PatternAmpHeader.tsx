import React from "react";
import { ShieldCheck, Layers, Activity, AlertTriangle, Play, RotateCcw } from "lucide-react";
import { PatternAmpViewState } from "../../lib/pattern-amp/state-machine.ts";

interface PatternAmpHeaderProps {
  viewState: PatternAmpViewState;
  selectedMode: "observe" | "dialogue" | "amplify";
  onSelectMode: (mode: "observe" | "dialogue" | "amplify") => void;
  onTriggerSimulation: (scenario: "completed" | "partial_usable" | "failed") => void;
  onReset: () => void;
}

const PatternAmpHeader: React.FC<PatternAmpHeaderProps> = ({
  viewState,
  selectedMode,
  onSelectMode,
  onTriggerSimulation,
  onReset
}) => {
  // Determine text based on state
  let statusBadgeColor = "bg-slate-800 text-slate-400";
  let statusText = "Bereit";

  if (viewState.phase === "running") {
    statusBadgeColor = "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse";
    statusText = `Simuliert Runde ${viewState.roundsCompleted}/${viewState.roundsTotal}`;
  } else if (viewState.phase === "completed") {
    statusBadgeColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    statusText = "Lauf Abgeschlossen";
  } else if (viewState.phase === "partial_usable") {
    statusBadgeColor = "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    statusText = "Teilweise Verwendbar";
  } else if (viewState.phase === "failed") {
    statusBadgeColor = "bg-rose-500/20 text-rose-300 border border-rose-500/30";
    statusText = "Abgebrochen";
  } else if (viewState.phase === "missing_source") {
    statusBadgeColor = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
    statusText = "Quellenspiegelung Ausstehend";
  }

  return (
    <header className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Decorative Grid Line Accents - Elegant emerald/cyan/sky gradient */}
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600" />
      
      {/* Brand Metadata */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <div className="relative w-9 h-9 bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.15)] mr-1">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)] border border-[#0a0a0b]" />
            </div>
            Pattern AMP <span className="font-light text-slate-400">Cockpit</span>
          </h1>
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${statusBadgeColor}`}>
            {statusText}
          </span>
        </div>
        <p className="text-slate-400 text-xs mt-1 max-w-xl font-sans">
          Eingebettetes BaZodiac Reflexionsmodul zur spiegelnden Beobachtung Ihrer psychologischen Schatten- und Autopilotanteile.
        </p>

        {/* Safety Warning Panel */}
        <div className="mt-3 flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg max-w-xl">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200/90 leading-normal">
            <strong>Reflexionshinweis:</strong> Dieses Cockpit dient ausschliesslich der Spiegelung simulierter Antriebe. Es stellt unter keinen Umstaenden eine psychologische Diagnose, klinische Beratung, Therapie oder Zukunftsgarantie dar.
          </p>
        </div>
      </div>

      {/* Control Actions & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        {/* Play Simulated Actions selectors */}
        {viewState.phase === "missing_source" || viewState.phase === "ready_no_run" || viewState.phase === "completed" || viewState.phase === "partial_usable" || viewState.phase === "failed" ? (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button 
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all outline-none"
              >
                <Play className="w-3.5 h-3.5" />
                Simulation starten
              </button>
              {/* Dropdown overlay with detailed design options */}
              <div className="absolute right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xl z-50 w-52 opacity-0 scale-95 pointer-events-none group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto transition-all">
                <button
                  onClick={() => onTriggerSimulation("completed")}
                  className="w-full text-left font-sans text-xs hover:bg-slate-850 p-2 rounded-lg text-emerald-400 font-medium flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Szenario A (Vollstaendig)
                </button>
                <button
                  onClick={() => onTriggerSimulation("partial_usable")}
                  className="w-full text-left font-sans text-xs hover:bg-slate-850 p-2 rounded-lg text-blue-400 font-medium flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Szenario B (Teilweise)
                </button>
                <button
                  onClick={() => onTriggerSimulation("failed")}
                  className="w-full text-left font-sans text-xs hover:bg-slate-850 p-2 rounded-lg text-rose-400 font-medium flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Szenario C (Abgebrochen)
                </button>
              </div>
            </div>

            {/* Reset buttons to clear simulation states */}
            {onReset && (
              <button
                onClick={onReset}
                title="Cockpit zuruecksetzen"
                className="bg-slate-850 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white p-2 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}

        {/* Observe Mode Switching Toggles */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-0.5">
          <button
            onClick={() => onSelectMode("observe")}
            className={`font-semibold text-xs py-1.5 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMode === "observe"
                ? "bg-slate-850 text-sky-400 shadow cursor-default"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Observe
          </button>
          <button
            onClick={() => onSelectMode("dialogue")}
            className={`font-semibold text-xs py-1.5 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMode === "dialogue"
                ? "bg-slate-850 text-violet-400 shadow cursor-default"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dialogue
          </button>
          <button
            onClick={() => onSelectMode("amplify")}
            className={`font-semibold text-xs py-1.5 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMode === "amplify"
                ? "bg-slate-850 text-orange-400 shadow cursor-default"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Amplify
          </button>
        </div>
      </div>
    </header>
  );
};

export default PatternAmpHeader;
