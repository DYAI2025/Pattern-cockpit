import React, { useState, useEffect } from "react";
import { AlertCircle, Terminal, HelpCircle, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import PatternSpace3D from "../pattern-space-3d/PatternSpace3D.tsx";
import PatternAmpHeader from "./PatternAmpHeader.tsx";
import {
  PatternAmpStateBanner,
  PatternAmpTimelineScrubber,
  PatternActorPanel,
  PatternDialogueTimeline,
  PatternConflictPanel,
  ScenarioBranchesPanel,
  GrowthCurvesPanel,
  NarrativeStreamsPanel,
  SeedProvenancePanel,
  MiroExportPanel,
  ArchitecturePanel
} from "./PatternAmpPanels.tsx";
import { PatternAmpViewState } from "../../lib/pattern-amp/state-machine.ts";
import { PatternAmpRunV1 } from "../../lib/pattern-amp/contracts.ts";
import { getPatternAmpState, startPatternAmpRun } from "../../lib/pattern-amp/api.ts";

const PatternAmpCockpit: React.FC = () => {
  const [viewState, setViewState] = useState<PatternAmpViewState>({ phase: "auth_check" });
  const [selectedMode, setSelectedMode] = useState<"observe" | "dialogue" | "amplify">("observe");
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("observe_data");

  // Mount safety check for Canvas
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydrate state on start
  const refreshState = async () => {
    try {
      const state = await getPatternAmpState();
      
      if (state.status === "running") {
        setViewState({
          phase: "running",
          runId: (state as any).runId,
          roundsCompleted: (state as any).roundsCompleted || 0,
          roundsTotal: (state as any).roundsTotal || 7
        });
      } else if (state.latestRun) {
        if (state.latestRun.status === "completed") {
          setViewState({ phase: "completed", run: state.latestRun });
        } else if (state.latestRun.status === "partial_usable") {
          setViewState({ phase: "partial_usable", run: state.latestRun });
        } else if (state.latestRun.status === "failed") {
          setViewState({
            phase: "failed",
            errors: state.latestRun.errors,
            run: state.latestRun
          });
        }
      } else {
        setViewState({ phase: "missing_source", dataQuality: state.dataQuality });
      }
    } catch (err: any) {
      setViewState({ phase: "error", message: err.message || "Failed to poll state from host." });
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Polling tracker for active simulations
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (viewState.phase === "running") {
      interval = setInterval(async () => {
        try {
          const state = await getPatternAmpState();
          
          if (state.status === "running") {
            setViewState({
              phase: "running",
              runId: (state as any).runId,
              roundsCompleted: (state as any).roundsCompleted || 0,
              roundsTotal: (state as any).roundsTotal || 7
            });
          } else {
            // Finished. Refresh components.
            if (interval) clearInterval(interval);
            refreshState();
          }
        } catch (err) {
          // Robust retry on short network glitches
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewState.phase]);

  // Command simulations trigger
  const handleTriggerSimulation = async (scenario: "completed" | "partial_usable" | "failed") => {
    try {
      setViewState({ phase: "loading_state" });
      const res = await startPatternAmpRun({ scenario });
      
      setViewState({
        phase: "running",
        runId: res.runId,
        roundsCompleted: 0,
        roundsTotal: 7
      });
    } catch (err: any) {
      setViewState({ phase: "error", message: err.message || "MiroSharkService Simulation konnte nicht initiiert werden." });
    }
  };

  // Full admin reset
  const handleResetState = async () => {
    try {
      setViewState({ phase: "loading_state" });
      await fetch("/api/pattern-amp/reset", { method: "POST" });
      setSelectedRound(0);
      setSelectedActorId(null);
      setSelectedConflictId(null);
      refreshState();
    } catch (err) {
      refreshState();
    }
  };

  // Select actor helper which highlights associated values
  const handleSelectActorId = (id: string | null) => {
    setSelectedActorId(id);
    if (id) {
      setSelectedConflictId(null);
    }
  };

  const handleSelectConflictId = (id: string) => {
    setSelectedConflictId(id);
    setSelectedActorId(null);
  };

  // Quick fallback layout when API is unreachable or boot checks fail
  if (viewState.phase === "auth_check" || viewState.phase === "loading_state") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-sm text-center">
          <Cpu className="w-10 h-10 text-violet-500 animate-spin mb-3.5" />
          <h3 className="text-white font-sans font-bold text-sm">Pattern AMP wird aufgebaut...</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Synapsen-Gitter und 3D Phasenraeume werden initialisiert. Bitte warten...
          </p>
        </div>
      </div>
    );
  }

  if (viewState.phase === "error") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-sm">Plattform-Verbindungsfehler</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            Das Cockpit konnte keine Verbindung zum backend Microservices-Gateway herstellen.
          </p>
          <div className="bg-slate-950 border border-slate-850 p-2 text-rose-400 font-mono text-[9px] mt-3 rounded overflow-hidden text-ellipsis">
            {viewState.message}
          </div>
          <button
            onClick={refreshState}
            className="mt-5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow transition-all"
          >
            Verbindung wiederholen
          </button>
        </div>
      </div>
    );
  }

  // Ready states
  const hasLiveRun = viewState.phase === "completed" || viewState.phase === "partial_usable" || (viewState.phase === "failed" && viewState.run);
  const activeRunData = hasLiveRun ? (viewState as any).run as PatternAmpRunV1 : null;
  const currentActorObj = activeRunData ? activeRunData.dialogue.actors.find((a) => a.id === selectedActorId) || null : null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* 1. Header Layout block */}
      <PatternAmpHeader
        viewState={viewState}
        selectedMode={selectedMode}
        onSelectMode={(mode) => {
          setSelectedMode(mode);
          if (mode === "observe") {
            setActiveTab("observe_data");
          } else if (mode === "dialogue") {
            setActiveTab("dialogue_data");
          } else {
            setActiveTab("branches_data");
          }
        }}
        onTriggerSimulation={handleTriggerSimulation}
        onReset={handleResetState}
      />

      {/* 2. Detailed source state alerts banner */}
      <PatternAmpStateBanner
        status={viewState.phase}
        dataQuality={(viewState as any).dataQuality || (activeRunData ? activeRunData.dataQuality : {})}
        activeRun={viewState.phase === "running" ? viewState : null}
        onTriggerSimulation={handleTriggerSimulation}
        errors={(viewState as any).errors}
      />

      {/* Primary Cockpit Segment when simulations run exists */}
      {activeRunData ? (
        <div className="space-y-5">
          {/* Timeline slider scrubber */}
          <PatternAmpTimelineScrubber
            selectedRound={selectedRound}
            onSelectRound={setSelectedRound}
            maxRound={activeRunData.roundsCompleted ?? 7}
            run={activeRunData}
          />

          {/* Core Grid: Left (3D Space viewport) + Right (Selected elements detailed viewsheet) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Visualizer Block */}
            <div className="lg:col-span-2 h-[450px] min-h-[350px]">
              {isMounted && (
                <PatternSpace3D
                  run={activeRunData}
                  selectedActorId={selectedActorId}
                  onSelectActor={handleSelectActorId}
                  selectedConflictId={selectedConflictId}
                  onSelectConflict={handleSelectConflictId}
                  selectedRound={selectedRound}
                  mode={selectedMode}
                />
              )}
            </div>

            {/* Profile Detail Sheets (right col) */}
            <div className="h-[450px]">
              <PatternActorPanel actor={currentActorObj} onClear={() => handleSelectActorId(null)} />
            </div>
          </div>

          {/* Secondary Chronological Sliding Panel Lists */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-3 mb-5 overflow-x-auto select-none">
              <button
                onClick={() => setActiveTab("observe_data")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "observe_data"
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1. Observe: Verlaeufe & Zyklen (Growth Curves)
              </button>
              <button
                onClick={() => setActiveTab("dialogue_data")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "dialogue_data"
                    ? "bg-slate-800 text-violet-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                2. Dialogue: Konflikte & Gespraechs-Streams
              </button>
              <button
                onClick={() => setActiveTab("branches_data")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "branches_data"
                    ? "bg-slate-800 text-orange-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                3. Amplify: Scenario Branches
              </button>
              <button
                onClick={() => setActiveTab("provenance_data")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "provenance_data"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Provenance & Seeds
              </button>
              <button
                onClick={() => setActiveTab("miro_export")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "miro_export"
                    ? "bg-slate-800 text-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Miro Board Export
              </button>
              <button
                onClick={() => setActiveTab("architecture")}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all sm:ml-auto ${
                  activeTab === "architecture"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                System Architecture
              </button>
            </div>

            {/* Panel selector routers */}
            <div className="space-y-5">
              {activeTab === "observe_data" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GrowthCurvesPanel run={activeRunData} />
                  <NarrativeStreamsPanel streams={activeRunData.narrativeStreams} actors={activeRunData.dialogue.actors} />
                </div>
              )}

              {activeTab === "dialogue_data" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <PatternDialogueTimeline
                    events={activeRunData.dialogue.events}
                    actors={activeRunData.dialogue.actors}
                    selectedRound={selectedRound}
                  />
                  <PatternConflictPanel
                    conflicts={activeRunData.dialogue.conflicts}
                    actors={activeRunData.dialogue.actors}
                    selectedConflictId={selectedConflictId}
                    onSelectConflict={handleSelectConflictId}
                  />
                </div>
              )}

              {activeTab === "branches_data" && (
                <ScenarioBranchesPanel branches={activeRunData.branches} />
              )}

              {activeTab === "provenance_data" && (
                <SeedProvenancePanel provenance={activeRunData.provenance} runId={activeRunData.runId} />
              )}

              {activeTab === "miro_export" && (
                <MiroExportPanel />
              )}

              {activeTab === "architecture" && (
                <ArchitecturePanel />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PatternAmpCockpit;
