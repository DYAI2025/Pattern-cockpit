import React, { useState } from "react";
import {
  Activity,
  User,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Database,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
  FileCode,
  CheckCircle,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  PatternAmpRunV1,
  PatternActorV1,
  AgentDialogueEventV1,
  PatternConflictV1,
  ScenarioBranchV1,
  GrowthCurvePointV1,
  NarrativeStreamV1,
  PatternProvenanceV1,
  PatternRunErrorV1,
  DataQualityV1
} from "../../lib/pattern-amp/contracts.ts";

const COLOR_MAP: Record<string, string> = {
  cyan: "#06b6d4",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  blue: "#3b82f6",
  red: "#ef4444",
  yellow: "#eab308",
  rose: "#f43f5e",
  white: "#f8fafc"
};


/* -------------------------------------------------------------------------- */
/* STATE BANNER COMPONENT                                                     */
/* -------------------------------------------------------------------------- */
interface PatternAmpStateBannerProps {
  status: string;
  dataQuality: DataQualityV1;
  activeRun?: {
    roundsCompleted?: number;
    roundsTotal?: number;
    scenarioType?: string;
  } | null;
  onTriggerSimulation: (scenario: "completed" | "partial_usable" | "failed") => void;
  errors?: PatternRunErrorV1[];
}

export const PatternAmpStateBanner: React.FC<PatternAmpStateBannerProps> = ({
  status,
  dataQuality,
  activeRun,
  onTriggerSimulation,
  errors
}) => {
  if (status === "running" && activeRun) {
    const percent = Math.round((activeRun.roundsCompleted / activeRun.roundsTotal) * 100);
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-300" style={{ width: `${percent}%` }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg animate-pulse border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                MiroSharkService Simulation aktiv...
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Runde {activeRun.roundsCompleted} von {activeRun.roundsTotal} wird im Hintergrund synthetisiert.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-300 font-semibold">{percent}% abgeschlossen</span>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "missing_source") {
    return (
      <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-600 to-violet-600" />
        <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Keine historische Simulationsbasis vorhanden</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xl">
                Für Ihr Profil wurden noch keine Simulationsdaten des MiroSharkService normalisiert. Um das 3D-Musterbeobachtungs-Cockpit zu aktivieren, starten Sie bitte eine automatisierte agentische Simulation einer Ihrer Bazi-Dayun Musterverbindungen.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(dataQuality.sourceCompleteness).map(([key, val]) => (
                  <span
                    key={key}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      val === "present"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {key.replace("_", " ")}: {val === "present" ? "VORHANDEN" : "AUSSTEHEND"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => onTriggerSimulation("completed")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow"
            >
              Leistungs-Autopilot simulieren (Scenario A)
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Dauer: ca. 15 Sekunden
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "partial_usable") {
    return (
      <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-amber-500/40" />
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-amber-300">Teilweise verwendbarer Daten-Lauf (partial_usable)</h4>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-200 px-2 py-0.5 rounded-md border border-amber-500/20">
                Datenvollstaendigkeit: {Math.round((dataQuality.overall || 0) * 100)}%
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1">
              Es wurden unvollständigkeiten in den Quellberechnungen festgestellt.
              <strong> Grund:</strong> {dataQuality.partialUsableReason}
            </p>
            {dataQuality.warnings.length > 0 && (
              <ul className="mt-2 text-[10px] text-amber-200/80 space-y-0.5 list-disc pl-4 font-sans">
                {dataQuality.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-5 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-rose-600" />
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-100">Simulations-Lauf fehlgeschlagen</h3>
            <p className="text-slate-400 text-xs mt-1">
              Der MiroSharkService konnte die agentischen Zyklen nicht erfolgreich mappen. Es existieren keine verarbeitbaren Datenpfade.
            </p>

            {errors && errors.length > 0 && (
              <div className="mt-3 bg-slate-950/60 border border-rose-500/20 rounded-lg p-3">
                <p className="text-[11px] font-mono text-rose-400 font-bold">Fehlerdetails:</p>
                {errors.map((err, i) => (
                  <div key={i} className="mt-1">
                    <p className="text-[10px] font-mono text-rose-300">
                      [{err.code}] {err.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => onTriggerSimulation("completed")}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-700 transition-all shadow"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* TIMELINE SCRUBBER COMPONENT                                                */
/* -------------------------------------------------------------------------- */
interface PatternAmpTimelineScrubberProps {
  selectedRound: number;
  onSelectRound: (round: number) => void;
  maxRound: number;
  run: PatternAmpRunV1;
}

export const PatternAmpTimelineScrubber: React.FC<PatternAmpTimelineScrubberProps> = ({
  selectedRound,
  onSelectRound,
  maxRound,
  run
}) => {
  // Map standard labels to rounds to display markers
  const roundLabels: Record<number, string> = {
    0: "Baseline",
    1: "Sharpening",
    2: "Trigger",
    3: "Shift",
    4: "Conflict",
    5: "Tension",
    6: "Synthesis",
    7: "Integration"
  };

  const currentRoundLabel = roundLabels[selectedRound] || `Runde ${selectedRound}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-sans font-bold text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          Simulierte Verlaufslinien-Timeline
        </span>
        <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-bold">
          Runde {selectedRound}: <span className="text-violet-400">{currentRoundLabel}</span>
        </span>
      </div>

      {/* Grid Track */}
      <div className="relative pt-4 pb-2">
        <input
          type="range"
          min={0}
          max={maxRound}
          value={selectedRound}
          onChange={(e) => onSelectRound(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500 outline-none"
        />

        {/* Indicators on track */}
        <div className="flex justify-between mt-2.5">
          {Array.from({ length: maxRound + 1 }).map((_, r) => {
            const isSelected = selectedRound === r;
            const hasEventInRound = run.dialogue.events.some((ev) => ev.round === r);
            const hasTransitionInRound = run.dialogue.transitions.some(
              (tr) => (tr.fromRound !== null && tr.fromRound <= r && tr.toRound !== null && tr.toRound >= r)
            );

            return (
              <button
                key={r}
                onClick={() => onSelectRound(r)}
                className="flex flex-col items-center group relative cursor-pointer outline-none"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                    isSelected
                      ? "bg-violet-500 border-white scale-125"
                      : "bg-slate-900 border-slate-700 hover:border-slate-500"
                  }`}
                />
                <span
                  className={`text-[9px] font-mono mt-1.5 transition-all ${
                    isSelected ? "text-violet-300 font-bold" : "text-slate-500 group-hover:text-slate-400"
                  }`}
                >
                  R{r}
                </span>
                <span className="text-[8px] font-sans text-slate-600 hidden sm:block">
                  {roundLabels[r] || ""}
                </span>

                {/* Micro indicators below for rounds containing data */}
                <div className="flex gap-0.5 mt-1 justify-center">
                  {hasEventInRound && <span className="w-1 h-1 rounded-full bg-cyan-400" title="Dialog" />}
                  {hasTransitionInRound && <span className="w-1 h-1 rounded-full bg-red-400" title="Kipppunkt" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ACTOR PROFILE PANEL COMPONENT                                              */
/* -------------------------------------------------------------------------- */
interface PatternActorPanelProps {
  actor: PatternActorV1 | null;
  onClear: () => void;
}

export const PatternActorPanel: React.FC<PatternActorPanelProps> = ({ actor, onClear }) => {
  if (!actor) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center shadow-lg">
        <div className="p-3 bg-slate-850 text-slate-500 rounded-full mb-3">
          <User className="w-6 h-6" />
        </div>
        <h4 className="text-slate-300 font-bold text-xs">Kein Muster-Akteur selektiert</h4>
        <p className="text-slate-400 text-[10px] mt-1.5 max-w-[200px]">
          Klicken Sie auf ein Element im 3D-Musterraum, um psychologische Reflexionsdaten anzuzeigen.
        </p>
      </div>
    );
  }

  const confidenceBorder: Record<string, string> = {
    high: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
    medium: "border-blue-500/20 text-blue-400 bg-blue-500/5",
    low: "border-orange-500/20 text-orange-400 bg-orange-500/5",
    speculative: "border-purple-500/20 text-purple-400 bg-purple-500/5"
  };

  const confidenceLabels: Record<string, string> = {
    high: "Hohe Evidenz",
    medium: "Mittlere Evidenz",
    low: "Niedrige Evidenz",
    speculative: "Spekulativer Entwurf"
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full flex flex-col justify-between shadow-lg relative overflow-hidden">
      {/* Visual Accent */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: actor.colorLayer ? COLOR_MAP[actor.colorLayer] : "#ffffff" }}
      />
      
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{actor.kind}</span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">{actor.label}</h3>
          </div>
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-slate-300 text-[10px] font-mono border border-slate-800 hover:border-slate-700 bg-slate-950 px-2 py-0.5 rounded"
          >
            Schliessen
          </button>
        </div>

        {actor.role && (
          <p className="text-slate-300 text-xs mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-medium">
            {actor.role}
          </p>
        )}

        {/* Confidence Badge */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${confidenceBorder[actor.confidence] || "border-slate-750"}`}>
            {confidenceLabels[actor.confidence] || actor.confidence}
          </span>
          <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
            Aktivierung: {Math.round(actor.activation * 100)}%
          </span>
          <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-805 px-2 py-0.5 rounded">
            Tension: {Math.round(actor.tension * 100)}%
          </span>
        </div>

        {/* Epistemic Labels list */}
        {actor.epistemicLabels && actor.epistemicLabels.length > 0 && (
          <div className="mt-3">
            <h5 className="text-[10px] font-mono text-slate-500 uppercase">Epistemischer Status:</h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {actor.epistemicLabels.map((lbl) => (
                <span key={lbl} className="text-[8px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Core detailed textual content */}
        <div className="mt-4 space-y-3.5 pt-3.5 border-t border-slate-800">
          {actor.selfExplanation && (
            <div>
              <h5 className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Selbstdeutung (Autopilot-Absicht)
              </h5>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed pl-2.5 border-l-2 border-slate-755 italic">
                {actor.selfExplanation}
              </p>
            </div>
          )}

          {actor.externalChallenge && (
            <div>
              <h5 className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Externe Herausforderung (Spiegelung)
              </h5>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                {actor.externalChallenge}
              </p>
            </div>
          )}

          {actor.usefulTension && (
            <div>
              <h5 className="text-[10px] font-mono text-slate-300 font-bold">Heilsame Polaritaet / Useful Tension</h5>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                {actor.usefulTension}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety exclusion constraints (notToInfer) */}
      <div className="mt-5 pt-3 border-t border-slate-800 shrink-0">
        <h5 className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Ausschlussgrenzen (Not to Infer):
        </h5>
        {actor.notToInfer && actor.notToInfer.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {actor.notToInfer.map((inf) => (
              <span key={inf} className="text-[8px] font-sans font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">
                Nicht {inf}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[9px] text-slate-600 block mt-0.5">Keine Ausschlussgrenzen hinterlegt.</span>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* DIALOG TIMELINE COMPONENT                                                  */
/* -------------------------------------------------------------------------- */
interface PatternDialogueTimelineProps {
  events: AgentDialogueEventV1[];
  actors: PatternActorV1[];
  selectedRound: number;
}

export const PatternDialogueTimeline: React.FC<PatternDialogueTimelineProps> = ({
  events,
  actors,
  selectedRound
}) => {
  const [filterActor, setFilterActor] = useState<string>("all");

  // Filter events by selected timeline round
  const currentRoundEvents = events.filter((ev) => ev.round === selectedRound);

  const filteredEvents = filterActor === "all" 
    ? currentRoundEvents 
    : currentRoundEvents.filter((ev) => ev.actorId === filterActor);

  const claimTypeColor: Record<string, string> = {
    assertion: "bg-red-500/15 text-red-300 border border-red-500/20",
    defense: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
    reframe: "bg-purple-500/15 text-purple-300 border border-purple-500/20",
    challenge: "bg-orange-500/15 text-orange-300 border border-orange-500/20",
    concession: "bg-green-500/15 text-green-300 border border-green-500/20"
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Simulierter Dialog-Stream fuer Runde {selectedRound}
        </h3>

        {/* Filter Selection */}
        <select
          value={filterActor}
          onChange={(e) => setFilterActor(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">Alle Akteure</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-6 text-center text-slate-400 text-xs">
          Keine aufgezeichneten Interaktions-Dialoge fuer diese Runde vorliegend.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const actorObj = actors.find((a) => a.id === ev.actorId);
            const actorColor = actorObj?.colorLayer ? COLOR_MAP[actorObj.colorLayer] : "#ffffff";

            return (
              <div key={ev.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 relative">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: actorColor }} />
                    <span className="text-xs font-bold text-slate-100">
                      {actorObj?.label || ev.actorId}
                    </span>
                    <span className="text-[9px] font-mono text-slate-550 border border-slate-800 px-1.5 py-0.2 rounded">
                      {ev.actionType}
                    </span>
                  </div>

                  {ev.claimType && (
                    <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded ${claimTypeColor[ev.claimType] || "bg-slate-800"}`}>
                      {ev.claimType}
                    </span>
                  )}
                </div>

                {/* Dialog content text */}
                <p className="text-slate-200 text-xs italic leading-relaxed font-sans">
                  &ldquo;{ev.content}&rdquo;
                </p>

                {/* Claim Statement */}
                {ev.claim && (
                  <div className="mt-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <p className="text-[9px] font-mono text-slate-500 uppercase">Kernanspruch (Kompensations-Glaube):</p>
                    <p className="text-slate-300 text-xs mt-0.5">{ev.claim}</p>
                  </div>
                )}

                {/* Claim Tags */}
                {ev.claimTags && ev.claimTags.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {ev.claimTags.map((tag) => (
                      <span key={tag} className="text-[8px] font-mono bg-slate-850 px-1.5 py-0.5 rounded text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CONFLICT PANEL COMPONENT                                                   */
/* -------------------------------------------------------------------------- */
interface PatternConflictPanelProps {
  conflicts: PatternConflictV1[];
  actors: PatternActorV1[];
  selectedConflictId: string | null;
  onSelectConflict: (id: string) => void;
}

export const PatternConflictPanel: React.FC<PatternConflictPanelProps> = ({
  conflicts,
  actors,
  selectedConflictId,
  onSelectConflict
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <AlertTriangle className="w-4 h-4 text-rose-400" />
        Analysierte Muster-Konfliktlinien und Dynamiken
      </h3>

      <div className="space-y-3.5">
        {conflicts.map((conf) => {
          const actA = actors.find((a) => a.id === conf.actorA);
          const actB = actors.find((a) => a.id === conf.actorB);
          const isSelected = selectedConflictId === conf.id;

          return (
            <div
              key={conf.id}
              onClick={() => onSelectConflict(conf.id)}
              className={`bg-slate-950/40 p-4 rounded-xl border cursor-pointer hover:border-slate-650 transition-all ${
                isSelected ? "border-rose-500 ring-1 ring-rose-500/20" : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider">{conf.conflictType}</span>
                  <span className="text-[10px] text-slate-500">Confidence: {conf.confidence}</span>
                </div>
                {isSelected && (
                  <span className="text-[8px] font-mono text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded animate-pulse">
                    Im 3D-Modell selektiert
                  </span>
                )}
              </div>

              {/* Polarities elements visual link */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 border border-slate-850 rounded-lg p-2.5 my-2">
                <div className="text-center sm:text-left flex-1">
                  <span className="text-[10px] font-mono font-bold" style={{ color: COLOR_MAP[actA?.colorLayer || "white"] }}>
                    {actA?.label || conf.actorA}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1 italic">&ldquo;{conf.claimA}&rdquo;</p>
                </div>
                <div className="text-[10px] text-rose-500 font-mono text-center shrink-0 uppercase tracking-widest px-2.5">
                  &lt; VS &gt;
                </div>
                <div className="text-center sm:text-right flex-1">
                  <span className="text-[10px] font-mono font-bold" style={{ color: COLOR_MAP[actB?.colorLayer || "white"] }}>
                    {actB?.label || conf.actorB}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1 italic">&ldquo;{conf.claimB}&rdquo;</p>
                </div>
              </div>

              {conf.usefulTension && (
                <div className="mt-3 pt-3 border-t border-slate-850">
                  <p className="text-[9px] font-mono text-slate-500 uppercase">Wachstumspotenzial (Useful Tension):</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5 font-sans">
                    {conf.usefulTension}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENARIO BRANCHES PANEL                                                    */
/* -------------------------------------------------------------------------- */
interface ScenarioBranchesPanelProps {
  branches: ScenarioBranchV1[];
}

export const ScenarioBranchesPanel: React.FC<ScenarioBranchesPanelProps> = ({ branches }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-400" />
          Projezierte Szenarien-Verzweigungen und Branches
        </h3>
        <p className="text-[10px] text-amber-300/80 mt-1 leading-normal font-sans">
          <strong>Projektionsergebnis:</strong> Simulierte Verlaeufe der Autopilot-Verstärkung vs. bewusster Musterunterbrechung. Dies stellt KEINE definitiven Vorhersagen oder Prophezeiungen dar (Not to Predict).
        </p>
      </div>

      <div className="space-y-4">
        {branches.map((b) => {
          const tendencyColor: Record<string, string> = {
            amplification: "bg-rose-500/15 text-rose-300 border-rose-500/20",
            interruption: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
            stabilization: "bg-blue-500/15 text-blue-300 border-blue-500/20"
          };

          return (
            <div key={b.id} className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded border ${tendencyColor[b.tendencyType] || "bg-slate-800 text-slate-300"}`}>
                  {b.tendencyType}
                </span>
              </div>

              <div className="max-w-[85%]">
                <h4 className="text-xs font-bold text-slate-100">{b.title}</h4>
                <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-sans">{b.summary}</p>
              </div>

              {/* Under the hood technical vectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-950/80 border border-slate-850 p-3 rounded-lg text-[10px]">
                <div>
                  <p className="text-slate-500 font-mono uppercase">Trigger-Bedingung:</p>
                  <p className="text-slate-300 mt-0.5">{b.triggerDescription}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-mono uppercase font-bold">Moegliches Resultat (Simuliert):</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{b.possibleOutcome}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-[9px]">
                <div className="bg-slate-900 border border-slate-850 p-1 rounded text-center">
                  <span className="text-slate-500">Wahrscheinlichkeit:</span>{" "}
                  <span className="text-rose-400 font-bold">{Math.round((b.probabilityWeight || 0) * 100)}%</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-1 rounded text-center">
                  <span className="text-slate-500">Zeithorizont:</span>{" "}
                  <span className="text-slate-350">{b.horizonRelevance}</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-1 rounded text-center">
                  <span className="text-slate-500">Kohaerenz-Delta:</span>{" "}
                  <span className={b.coherenceDelta && b.coherenceDelta > 0 ? "text-emerald-400" : "text-rose-400"}>
                    {b.coherenceDelta && b.coherenceDelta > 0 ? "+" : ""}
                    {b.coherenceDelta}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-1 rounded text-center">
                  <span className="text-slate-500">Tension-Delta:</span>{" "}
                  <span className={b.tensionDelta && b.tensionDelta > 0 ? "text-rose-400" : "text-emerald-400"}>
                    {b.tensionDelta && b.tensionDelta > 0 ? "+" : ""}
                    {b.tensionDelta}
                  </span>
                </div>
              </div>

              {/* Reflection question strictly required for the Observe phase */}
              {b.reflectiveQuestion && (
                <div className="mt-3 flex items-start gap-1.5 bg-violet-500/5 border border-violet-500/10 p-2.5 rounded-lg">
                  <HelpCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-violet-400 uppercase font-bold">Reflexive Leitfrage:</span>
                    <p className="text-slate-200 text-[11px] leading-relaxed mt-0.5 font-sans font-medium">
                      &ldquo;{b.reflectiveQuestion}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* GROWTH CURVES PANEL                                                        */
/* -------------------------------------------------------------------------- */
interface GrowthCurvesPanelProps {
  run: PatternAmpRunV1;
}

export const GrowthCurvesPanel: React.FC<GrowthCurvesPanelProps> = ({ run }) => {
  const [selectedActor, setSelectedActor] = useState<string>("H1");
  const curves = run.growthCurves;

  const actorCurves = curves.filter((p) => p.actorId === selectedActor);

  // Group by round to feed to recharts
  const chartData = Array.from({ length: 8 }).map((_, round) => {
    const pt = actorCurves.find((c) => c.round === round);
    return {
      name: `Ronde ${round}`,
      activation: pt ? pt.activation * 100 : 0,
      tension: pt ? pt.tension * 100 : 0,
      coherence: pt && pt.coherence ? pt.coherence * 100 : 0
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          Aktivierungszyklus-Verlaeufe (Growth Curves)
        </h3>

        <select
          value={selectedActor}
          onChange={(e) => setSelectedActor(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-300 outline-none cursor-pointer"
        >
          {run.dialogue.actors.map((act) => (
            <option key={act.id} value={act.id}>
              {act.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-56 w-full bg-slate-950 rounded-xl p-3 border border-slate-850">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
            <YAxis stroke="#64748b" fontSize={9} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", fontSize: 10 }}
              labelStyle={{ color: "#a78bfa" }}
            />
            <RechartsLine type="monotone" dataKey="activation" stroke="#10b981" strokeWidth={2.5} name="Aktivierung" />
            <RechartsLine type="monotone" dataKey="tension" stroke="#ef4444" strokeWidth={2.5} name="Spannung" />
            <RechartsLine type="monotone" dataKey="coherence" stroke="#3b82f6" strokeWidth={1.5} name="Kohaerenz" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-3 justify-center text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-[#10b981] rounded-full" />
          Aktivierung
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-[#ef4444] rounded-full" />
          Spannung
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-[#3b82f6] rounded-full" />
          Kohaerenz
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* NARRATIVE STREAMS PANEL                                                    */
/* -------------------------------------------------------------------------- */
interface NarrativeStreamsPanelProps {
  streams: NarrativeStreamV1[];
  actors: PatternActorV1[];
}

export const NarrativeStreamsPanel: React.FC<NarrativeStreamsPanelProps> = ({ streams, actors }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Layers className="w-4 h-4 text-violet-400" />
        Narrative Hauptstroeme und Musterthemen
      </h3>

      <div className="space-y-4">
        {streams.map((s) => (
          <div key={s.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-200">{s.title}</h4>
            <span className="text-[9px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded mt-1.5 inline-block">
              Dominante Dynamik: {s.dominantDynamic}
            </span>
            <p className="text-slate-300 text-xs mt-2.5 leading-relaxed font-sans">{s.summary}</p>

            <div className="mt-3.5 pt-3.5 border-t border-slate-850 flex items-center flex-wrap gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase mr-1.5">Involvierte Akteure:</span>
              {s.actorIds.map((actId) => {
                const actObj = actors.find((a) => a.id === actId);
                const tagColor = actObj?.colorLayer ? COLOR_MAP[actObj.colorLayer] : "#ffffff";

                return (
                  <span
                    key={actId}
                    style={{ borderColor: `${tagColor}20`, color: tagColor }}
                    className="text-[9px] font-mono bg-slate-950 border px-2 py-0.5 rounded"
                  >
                    {actObj?.label || actId}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SEED & PROVENANCE PANEL                                                    */
/* -------------------------------------------------------------------------- */
interface SeedProvenancePanelProps {
  provenance: PatternProvenanceV1;
  runId: string;
}

export const SeedProvenancePanel: React.FC<SeedProvenancePanelProps> = ({ provenance, runId }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <FileCode className="w-4 h-4 text-blue-400" />
        Datenherkunft, Seeds & Provenance Audit
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Core details */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-2">Versionsdaten-Referenzen:</h4>
          <table className="w-full text-left font-mono text-[10px] text-slate-350 space-y-1">
            <tbody>
              <tr>
                <td className="text-slate-500 py-1">Lauf Referenz ID:</td>
                <td className="text-slate-200 py-1 text-right">{runId}</td>
              </tr>
              {provenance.seedDocumentId && (
                <tr>
                  <td className="text-slate-500 py-1">Seed Document ID:</td>
                  <td className="text-emerald-400 py-1 text-right">{provenance.seedDocumentId}</td>
                </tr>
              )}
              {provenance.seedVersion && (
                <tr>
                  <td className="text-slate-500 py-1">Code Seed Version:</td>
                  <td className="text-slate-300 py-1 text-right">{provenance.seedVersion}</td>
                </tr>
              )}
              {provenance.promptVersion && (
                <tr>
                  <td className="text-slate-500 py-1">Prompt Blueprint:</td>
                  <td className="text-slate-300 py-1 text-right">{provenance.promptVersion}</td>
                </tr>
              )}
              {provenance.normalizerVersion && (
                <tr>
                  <td className="text-slate-500 py-1">Normalizer Kernel:</td>
                  <td className="text-slate-300 py-1 text-right">{provenance.normalizerVersion}</td>
                </tr>
              )}
              {provenance.modelProvider && (
                <tr>
                  <td className="text-slate-500 py-1">Inference Engine:</td>
                  <td className="text-slate-200 py-1 text-right">{provenance.modelProvider} ({provenance.modelName})</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Miro Shark references */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-2">
              MiroSharkService Orchestrierung:
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-805 rounded-lg font-mono text-[9px] space-y-1 text-slate-300">
              <div>Endpoint: {provenance.mirosharkEndpoint || "Keine Verbindung"}</div>
              <div>Shark Run-ID: {provenance.mirosharkRunId || "MISSING"}</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-850">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Raw Artifact Referenzen:</h4>
            <div className="flex gap-2.5 flex-wrap">
              {provenance.rawExportRefs.map((file) => (
                <span
                  key={file}
                  className="flex items-center gap-1 font-mono text-[9px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  {file}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MIRO EXPORT PLACEHOLDER PORT                                               */
/* -------------------------------------------------------------------------- */
export const MiroExportPanel: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-center">
      <div className="max-w-md mx-auto py-6">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 mb-3.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
          Miro Export nicht verbunden
        </h3>
        <p className="text-slate-400 text-xs mt-2 font-sans">
          Die Anbindung an das kollaborative Miro Board (Zwecks Export von Frames, Notizen und Growth Curves) ist für diesen Preview-Container nicht konfiguriert oder das Auth-Token ist abgelaufen.
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Miro ist nicht der Simulationsservice und nicht die authoritative Datenquelle.
        </p>
        <button
          disabled
          className="bg-slate-800 text-slate-500 font-semibold text-xs py-2 px-4 rounded-lg mt-5 flex items-center justify-center gap-2 mx-auto border border-slate-700 cursor-not-allowed outline-none"
        >
          Board exportieren (Inaktiv)
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MICROSERVICES & GATEWAY ARCHITECTURE PANEL - DEEP CORE SPECIFICATION       */
/* -------------------------------------------------------------------------- */
export const ArchitecturePanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"services" | "communication" | "gateway">("services");
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("user-service");

  const rawKongConfig = `_format_version: "2.1"
services:
  - name: user-service (Benutzerverwaltung)
    url: http://user-service.internal.cluster:8080
    plugins:
      - name: jwt
        config:
          run_on_preflight: true
    routes:
      - name: auth-login
        paths: [- /api/v1/auth/login]
        methods: [POST]
      - name: user-profiles
        paths: [- /api/v1/users]
        methods: [GET, PUT, PATCH]

  - name: pattern-service (Produktkatalog / Muster-Modul)
    url: http://pattern-service.internal.cluster:8081
    routes:
      - name: bazi-patterns
        paths: [- /api/v1/patterns]
        methods: [GET]
    plugins:
      - name: rate-limiting
        config:
          minute: 300
          policy: local

  - name: simulation-service (Bestellabwicklung / Run-Engine)
    url: http://simulation-service.internal.cluster:8082
    routes:
      - name: simulation-trigger
        paths: [- /api/v1/simulations/run]
        methods: [POST]
      - name: simulation-status
        paths: [- /api/v1/simulations/status]
        methods: [GET]
    plugins:
      - name: rate-limiting
        config:
          minute: 60
          policy: local
      - name: jwt
        config:
          secret_is_base64: false

  - name: exporter-service (Miro / Board-Integration)
    url: http://exporter-service.internal.cluster:8083
    routes:
      - name: board-export
        paths: [- /api/v1/export/miro]
        methods: [POST]`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(rawKongConfig);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const servicesData = [
    {
      id: "user-service",
      name: "User-Service (Benutzerverwaltung)",
      health: "health_checked",
      host: "auth-service.internal.cluster:8080",
      version: "v3.1.2",
      endpoints: [
        { method: "POST", path: "/api/v1/auth/login", desc: "Überprüft JWT-Anmeldungen und generiert Session-Muster." },
        { method: "GET", path: "/api/v1/users/{userId}", desc: "Ruft das Anwenderprofil einschl. Bazi-Geburtsdaten-Seeds ab." },
        { method: "PUT", path: "/api/v1/users/{userId}/bazi-data", desc: "Aktualisiert die Dayun Berechnungsfaktoren des Nutzers." }
      ],
      responsibilities: [
        "Sichere Verschlüsselung & Speicherung von Bazi-Geburtselementen",
        "OAuth-Schnittstelle zur externen Identitätssynchronisation",
        "JWT Session Token Ausstellung und Bereitstellung kryptografischer Schlüssel für das API Gateway"
      ],
      db: "PostgreSQL Master Cluster (Replicated)",
      syncMode: "Synchron (REST für Login/Profil)",
      asyncMode: "Asynchron (Kafka Event bei Profilaktualisierung)"
    },
    {
      id: "pattern-service",
      name: "Pattern-Service (Musterkatalog / Bazi-Dayun)",
      health: "health_checked",
      host: "catalog-service.internal.cluster:8081",
      version: "v1.4.0",
      endpoints: [
        { method: "GET", path: "/api/v1/patterns", desc: "Listet alle kosmischen Archetypen, Zyklen und Fünf-Elemente-Werte." },
        { method: "GET", path: "/api/v1/patterns/{patternId}", desc: "Gibt Details eines spezifischen Energiemusters zurück." }
      ],
      responsibilities: [
        "Verwaltung der zentralen Wissensdatenbank kosmologischer Konfigurationen",
        "Validierung von Wertebereichen und Mustermatritzen zur Runden-Simulationsvorbereitung",
        "Caching-Layer für statische Elementarprofile zur Verhinderung von Datenbank-Hotspots"
      ],
      db: "Redis Distributed Cache + PostgreSQL Read-Replica",
      syncMode: "Synchron (gRPC für Simulationen)",
      asyncMode: "N/A"
    },
    {
      id: "simulation-service",
      name: "Simulation-Engine (Bestellabwicklung / Run-Kern)",
      health: "health_checked",
      host: "simulation-worker.internal.cluster:8082",
      version: "v2.4.0",
      endpoints: [
        { method: "POST", path: "/api/v1/simulations/run", desc: "Initiiert einen neuen agentischen Durchlauf (Queued)." },
        { method: "GET", path: "/api/v1/simulations/status/{runId}", desc: "Liefert den Fortschritt der laufenden Zyklogenese-Runden." },
        { method: "GET", path: "/api/v1/simulations/runs/{runId}/events", desc: "Streamt Live-Events der Akteure (WebSockets/SSE)." }
      ],
      responsibilities: [
        "Ausführung der agentischen Verteilungsberechnungen auf den LLM/Bazi Engine Clustern",
        "Ermittlung von Spannungskurven, Akteurskonflikten und Narrative-Trendströmen",
        "Persistierung historischer Simulations-Läufe"
      ],
      db: "Event Store (Cassandra) + Redis für rundenbasierte Zwischenzustände",
      syncMode: "Synchron (REST für Status-Pollen)",
      asyncMode: "Asynchron (Kafka Consumer für 'simulation.requested')"
    },
    {
      id: "exporter-service",
      name: "Miro-Exporter & Integration",
      health: "degraded",
      host: "exporter-service.internal.cluster:8083",
      version: "v1.0.1",
      endpoints: [
        { method: "POST", path: "/api/v1/export/miro", desc: "Generiert Boards, Frames und verschiebt Haftnotizen per REST." },
        { method: "GET", path: "/api/v1/export/status/{exportId}", desc: "Abfrage des Webhook-Exportfortschritts." }
      ],
      responsibilities: [
        "Übersetzung der normalisierten Simulationsstrukturen in Miro OAuth HTTP Payload",
        "Zweidimensionale Grid-Vektorberechnung zur Platzierung von Akteurs-Gruppen auf dem Board",
        "Umgang mit Third-Party API-Ratenbegrenzungen (Rate Limiting Backoff)"
      ],
      db: "None (Stateless Service)",
      syncMode: "Synchron (REST)",
      asyncMode: "Asynchron (Arbeitswarteschlange über lokalem Worker-Pool)"
    }
  ];

  const currentServiceObj = servicesData.find((s) => s.id === selectedService) || servicesData[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Software-Architektur & API-Gateway Cockpit
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Microservice-Registrierungen, Kommunikationsmuster und Gateway-Topologie nach Software-Architektenvorgaben.
          </p>
        </div>

        {/* Subtab selection */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg shrink-0">
          <button
            onClick={() => setActiveSubTab("services")}
            className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-all ${
              activeSubTab === "services"
                ? "bg-slate-800 text-emerald-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            1. Kern-Microservices
          </button>
          <button
            onClick={() => setActiveSubTab("communication")}
            className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-all ${
              activeSubTab === "communication"
                ? "bg-slate-800 text-sky-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            2. Kommunikation
          </button>
          <button
            onClick={() => setActiveSubTab("gateway")}
            className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-all ${
              activeSubTab === "gateway"
                ? "bg-slate-800 text-violet-450"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            3. Kong API-Gateway
          </button>
        </div>
      </div>

      {/* SUBTAB CONTENT 1: MICROSERVICES DETAILS */}
      {activeSubTab === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Microservices Left Rail */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">Service-Registrierung</h3>
            {servicesData.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                  selectedService === s.id
                    ? "bg-[#111827] border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                    : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 hover:border-slate-800"
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200">{s.name.split(" (")[0]}</h4>
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{s.version} • {s.host}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.health === "health_checked" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-amber-500 animate-pulse"}`} />
                  <span className="text-[9px] font-mono text-slate-400 uppercase">{s.health === "health_checked" ? "Aktiv" : "Degradiert"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Microservice Specs Area */}
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Auszugebener Service-Steckbrief</span>
                  <h3 className="text-base font-bold text-white font-sans mt-0.5">{currentServiceObj.name}</h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                  Datenspeicher: {currentServiceObj.db}
                </span>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2 mb-4">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold">Hauptverantwortlichkeiten:</h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 font-sans leading-relaxed">
                  {currentServiceObj.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Endpoint table docs */}
              <div className="space-y-2 mt-4">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold">Exponierte API-Endpunkte:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse border border-slate-850 bg-slate-950/40 rounded-lg">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-850">
                        <th className="p-2 w-16">Methode</th>
                        <th className="p-2 w-48">Pfad</th>
                        <th className="p-2">Beschreibung / Funktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentServiceObj.endpoints.map((ep, i) => (
                        <tr key={i} className="border-b border-slate-850/60 hover:bg-slate-950/20">
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ep.method === "POST" ? "bg-sky-500/10 text-sky-400" : ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                              {ep.method}
                            </span>
                          </td>
                          <td className="p-2 text-slate-200 text-[11px] truncate select-all">{ep.path}</td>
                          <td className="p-2 text-slate-400 text-[11px] font-sans">{ep.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Synchroner Datenfluss: <strong className="text-emerald-400">{currentServiceObj.syncMode}</strong></span>
              <span>Asynchrones Kommunikationsmuster: <strong className="text-sky-400">{currentServiceObj.asyncMode}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 2: COMMUNICATION PATTERNS */}
      {activeSubTab === "communication" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Muster A: Synchrone Interaktion (gRPC & HTTP/REST)</span>
              <h3 className="text-sm font-bold text-slate-200 mt-1 font-sans">Echtzeit-Schnittstellen für blockierende Vorgänge</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Gezielter Einsatz für latenzkritische, synchrone Prozesse. So sendet das API-Gateway bspw. Authentifizierungsprüfungen über extrem schnelle interne **gRPC-Kanäle** (HTTP/2 Multiplexing) direkt an den <code className="text-slate-300 font-mono">user-service</code>, da eine Client-Anfrage ohne Tokenvalidierung nicht fortgesetzt werden kann.
              </p>
              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Protokolle: <strong className="text-emerald-400">gRPC (HTTP/2 Protocol Buffers) oder RESTful HTTP/1.1</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Anwendungsfälle: Login, Authentifikations-Handshake, Abrufen spezifischer Bazi-Dayun Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Vorteil: Extrem geringe Latenz, direkte Erfolgsrückmeldung & strukturierte Typensicherheit</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider">Muster B: Asynchrone Interaktion (Event-Driven Broker / Kafka)</span>
              <h3 className="text-sm font-bold text-slate-200 mt-1 font-sans">Entkoppelte Pipelines für Rechenintensive Zyklen</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Da das Berechnen agentischer Dayun-Verläufe, das Erzeugen von Spannungskurven sowie die MiroSharkAI-Synthese viel Rechenleistung erfordern, arbeitet unsere Architektur entkoppelt. Das API-Gateway nimmt den Trigger an, liefert sofort eine Empfangsbestätigung und schickt ein Event an den **Message Broker (Apache Kafka oder RabbitMQ)**. Der <code className="text-slate-300 font-mono">simulation-service</code> holt sich den Auftrag und verarbeitet diesen asynchron.
              </p>
              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                  <span>Protokolle / Broker: <strong className="text-sky-400">Apache Kafka (Events) / RabbitMQ (Queues)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                  <span>Anwendungsfälle: Starten großer Simulationsläufe, Versenden von Status-Updates, Protokollierung im Edge/Auditstream</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                  <span>Vorteil: Keine blockierten Threads im Client, automatische Skalierung der Worker, Schutz vor Überlastung</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Map Sketch */}
          <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Interne Kommunikationsmatrix</h3>
              
              <div className="space-y-6 relative py-4">
                {/* Client Box */}
                <div className="flex justify-center">
                  <div className="w-48 bg-slate-900 border border-emerald-500/30 rounded px-3 py-2 text-center text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Frontend Client</span>
                    Muster-Beobachter UI
                  </div>
                </div>

                {/* Down arrows */}
                <div className="text-center font-mono text-[10px] text-slate-500 -my-2">
                  HTTP REST • TLS • Rate-Limited
                </div>

                {/* Gateway Box */}
                <div className="flex justify-center">
                  <div className="w-56 bg-slate-800 border border-violet-500/40 rounded px-3 py-2.5 text-center text-xs font-bold shadow-[0_0_12px_rgba(139,92,246,0.1)]">
                    <span className="text-[9px] text-violet-400 block uppercase font-mono">Zentrale Control Plane</span>
                    Kong API Gateway Active Node
                  </div>
                </div>

                {/* Matrix paths */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded relative text-center">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/20 z-0"></div>
                    <span className="text-[9px] text-emerald-400 font-mono block uppercase relative z-10 bg-slate-950 mx-auto w-max px-1">Synchron (gRPC)</span>
                    <div className="text-[11px] font-bold text-slate-200 mt-1 relative z-10">Gateway ⇆ User-Service</div>
                    <p className="text-[10px] text-slate-500 font-sans mt-1 relative z-10 leading-snug">Zwecks OAuth-Anmeldung & Token-Verifizierung (Latenz &lt; 2ms)</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-sky-500/20 rounded relative text-center">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-sky-500/20 z-0"></div>
                    <span className="text-[9px] text-sky-400 font-mono block uppercase relative z-10 bg-slate-950 mx-auto w-max px-1">Asynchron (Kafka)</span>
                    <div className="text-[11px] font-bold text-slate-200 mt-1 relative z-10">Gateway → simulation.req</div>
                    <p className="text-[10px] text-slate-500 font-sans mt-1 relative z-10 leading-snug">Warteschlange für Zyklegenese-Runden-Threads. Worker skalieren autark.</p>
                  </div>
                </div>

                {/* Event Store */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Zentraler Zustandsspeicher (Storage)</span>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">PostgreSQL Cluster + Redis Cache + Cassandra Event Log</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-850 mt-4">
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                <strong>Architektenbeurteilung:</strong> Durch diese hybride Einteilung bleibt die Plattform extrem widerstandsfähig (resilient). Falls der rechenintensive Simulation-Cluster unter Volllast arbeitet, beeinträchtigt dies zu keinem Zeitpunkt die Kernfunktionen wie Login, Authentifizierung oder Web-Musterabfragen über das Gateway.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 3: KONG API GATEWAY */}
      {activeSubTab === "gateway" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Kong Info Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-violet-400 uppercase font-bold tracking-wider">Gateway-Auswahl: Kong Enterprise</span>
              <h3 className="text-sm font-bold text-slate-200 mt-1 font-sans">Sicherheit, Ratenbegrenzung & Intelligentes Routing</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Für unsere Microservices-Architektur wird <strong>Kong API Gateway</strong> als zentrale Einlass-Schleuse betrieben. Es agiert als Reverse-Proxy und kapselt alle dahinter liegenden Services vor dem offenen Internet.
              </p>
            </div>

            <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-300">
              <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1">Gateway-Features und Plugins:</h4>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Zentrale Routing-Tabelle</strong>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">Mappt eintreffende Anfragen anhand von Pfaden (/api/v1/*) auf interne RPC-Ports.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">JWT Authenticator-Plugin</strong>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">Fängt Anfragen für private Routen ab, validiert die Session-Tokens und setzt User-Header.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Schutz per Ratenbegrenzung</strong>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">Verhindert Botnet-Fluten. Die Simulationen sind auf max. 60 Aufrufe pro Minute limitiert.</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-violet-950/20 rounded border border-violet-500/20 text-[10px] text-violet-300 font-sans leading-relaxed">
              <strong>Info für Bereitstellung:</strong> Das Gateway liest diese Konfigurationsstruktur deklarativ über eine Konfigurationsdatei (<code className="font-mono text-[9px] text-[#a78bfa]">kong.yml</code>) ein. Somit entfällt lästiges DB-Milling und das Cluster startet in &lt; 1 Sekunde.
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-violet-400" />
                <span className="font-mono text-[10px] text-slate-350 font-bold">kong.yml (Deklarative Kong-Konfiguration)</span>
              </div>
              <button
                onClick={handleCopyYaml}
                className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded transition-all flex items-center gap-1"
              >
                {copiedYaml ? "Kopiert!" : "Code Kopieren"}
              </button>
            </div>

            <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[10px] overflow-y-auto leading-relaxed h-[320px] scrollbar">
              <pre>{rawKongConfig}</pre>
            </div>

            <div className="bg-slate-900/60 p-2.5 font-mono text-[9px] text-slate-500 text-center border-t border-slate-850">
              KONG GATEWAY SERVICE-MAPPER • VERSION 2.1 • ZERO DOWNTIME DEPLOYMENT
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

