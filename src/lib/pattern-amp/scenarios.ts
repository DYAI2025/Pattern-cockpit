import { PatternAmpRunV1, PatternActorV1, AgentDialogueEventV1, PatternTransitionV1, PatternConflictV1, ScenarioBranchV1, GrowthCurvePointV1, PatternGraphV1, NarrativeStreamV1, PatternProvenanceV1 } from "./contracts.ts";

const SAFETY_NOTICE_DEFAULT = {
  title: "Reflexionswerkzeug - keine Therapie oder Diagnose",
  body: "Pattern AMP dient ausschliesslich der Spiegelung und Simulation von Verhaltensmustern zur Selbstbeobachtung. Es stellt keine klinische Diagnose, keine psychotherapeutische Behandlung und keine deterministische Zukunftsvorschau dar. Die Deutung und Interpretation verbleiben vollstaendig beim Anwender.",
  notTherapy: true,
  notDiagnosis: true,
  notPrediction: true,
  version: "1.0.0"
};

// HELPER: Generate growth curve and history for H1-H7 + Memory + Evidence
function generateGrowthCurves(runId: string, seed: number): GrowthCurvePointV1[] {
  const actors = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "Memory", "Evidence"];
  const points: GrowthCurvePointV1[] = [];

  actors.forEach((actorId, index) => {
    // Generate 8 rounds (0 to 7)
    for (let r = 0; r <= 7; r++) {
      const phase = r / 7;
      // build a smooth path
      const angle = phase * Math.PI * 1.5 + index * 0.5 + seed;
      const radius = 0.4 + Math.sin(phase * Math.PI + seed) * 0.3;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.sin(phase * Math.PI * 2 + index) * 0.4;

      const activation = Math.max(0, Math.sin(phase * Math.PI + index * 0.2) * 0.4 + 0.5);
      const tension = Math.max(0, Math.cos(phase * Math.PI * 1.5 + index * 0.3) * 0.45 + 0.5);
      const coherence = 0.6 + Math.sin(phase * Math.PI * 0.8) * 0.25;
      const ambiguity = 0.3 + Math.cos(phase * Math.PI * 0.8) * 0.25;

      points.push({
        id: `${runId}-${actorId}-g-${r}`,
        runId,
        actorId,
        round: r,
        t: phase,
        activation: parseFloat(activation.toFixed(3)),
        tension: parseFloat(tension.toFixed(3)),
        coherence: parseFloat(coherence.toFixed(3)),
        ambiguity: parseFloat(ambiguity.toFixed(3)),
        position3d: {
          x: parseFloat(x.toFixed(3)),
          y: parseFloat(y.toFixed(3)),
          z: parseFloat(z.toFixed(3))
        }
      });
    }
  });

  return points;
}

export function getScenarioA(runId: string): PatternAmpRunV1 {
  const actors: PatternActorV1[] = [
    {
      id: "H1",
      runId,
      label: "H1 Antrieb & Ehrgeiz",
      sourceAgentName: "Agency_Bot",
      kind: "hypothesis",
      role: "Innerer Vorwaertstreiber und Leistungsbewertung",
      linkedHypotheses: ["H3", "H5"],
      activation: 0.85,
      tension: 0.72,
      confidence: "high",
      epistemicLabels: ["observed", "simulated"],
      position3d: { x: 0.6, y: -0.2, z: 0.4 },
      positionHistory: [
        { round: 0, position: { x: 0.1, y: -0.1, z: 0.1 } },
        { round: 1, position: { x: 0.2, y: -0.1, z: 0.2 } },
        { round: 2, position: { x: 0.3, y: -0.2, z: 0.25 } },
        { round: 3, position: { x: 0.4, y: -0.2, z: 0.3 } },
        { round: 4, position: { x: 0.5, y: -0.2, z: 0.35 } },
        { round: 5, position: { x: 0.6, y: -0.2, z: 0.4 } },
        { round: 6, position: { x: 0.62, y: -0.21, z: 0.41 } },
        { round: 7, position: { x: 0.65, y: -0.25, z: 0.42 } }
      ],
      colorLayer: "cyan",
      rawSourceRefs: ["doc_user_q_1", "doc_bazi_dayun_2026"],
      notToInfer: ["Klinischer Narzissmus", "Chronisches Burnout"],
      selfExplanation: "Ich simuliere permanenten Vorwaertsdrang, um moegliche Inkompetenzgefuehle auszugleichen und das Selbstbild von Leistungsfaehigkeit zu stabilisieren.",
      externalChallenge: "Die Simulation spiegelt, dass dieser Antrieb bei geringem externem Feedback in Leere kippt.",
      usefulTension: "Die Spannung treibt Produktivitaet, blockiert aber Regeneration.",
      visible: true
    },
    {
      id: "H2",
      runId,
      label: "H2 Beziehungsnaehe",
      sourceAgentName: "Affiliation_Bot",
      kind: "hypothesis",
      role: "Naehe-Distanz-Regler und Harmoniebestreben",
      linkedHypotheses: ["H6"],
      activation: 0.35,
      tension: 0.58,
      confidence: "medium",
      epistemicLabels: ["inferred"],
      position3d: { x: -0.2, y: -0.5, z: -0.3 },
      positionHistory: [
        { round: 0, position: { x: -0.1, y: -0.1, z: -0.1 } },
        { round: 4, position: { x: -0.15, y: -0.3, z: -0.2 } },
        { round: 7, position: { x: -0.2, y: -0.5, z: -0.3 } }
      ],
      colorLayer: "green",
      rawSourceRefs: ["doc_user_q_1"],
      notToInfer: ["Soziophobie", "Bindungsstoerung"],
      selfExplanation: "Ich schuetze das System vor emotionalem Kontrollverlust, indem ich Naehe primaer ueber intellektuelle Beitraege erzeuge, statt ueber verletzliche Expression.",
      externalChallenge: "Die Simulation legt nahe, dass der Rueckzug mit ansteigender Leistungsspannung korreliert.",
      usefulTension: "Sichert sachlichen Fokus, minimiert jedoch interpersonelle Resonanz.",
      visible: true
    },
    {
      id: "H3",
      runId,
      label: "H3 Kontrollanspruch",
      sourceAgentName: "Control_Bot",
      kind: "hypothesis",
      role: "Sicherheits- und Strukturdiktat",
      linkedHypotheses: ["H1", "H5"],
      activation: 0.78,
      tension: 0.81,
      confidence: "high",
      epistemicLabels: ["observed"],
      position3d: { x: 0.1, y: 0.7, z: 0.5 },
      positionHistory: [
        { round: 0, position: { x: 0.1, y: 0.2, z: 0.1 } },
        { round: 7, position: { x: 0.1, y: 0.7, z: 0.5 } }
      ],
      colorLayer: "orange",
      rawSourceRefs: ["doc_bazi_dayun_2026"],
      notToInfer: ["Zwanghafte Stoerung", "Kontrollwahn"],
      selfExplanation: "Ich reguliere das Angstniveau des Gesamtsystems durch akribische Strukturierung und Vermeidung ungeschuetzter Raeume.",
      externalChallenge: "Die Simulation wirft die Frage auf, wann Struktur von konstruktivem Halt in starre Enge umschlaegt.",
      usefulTension: "Erzeugt extreme Detailgenauigkeit, verringert aber die Anpassungsschnelligkeit.",
      visible: true
    },
    {
      id: "H4",
      runId,
      label: "H4 Kommunikation & Maske",
      sourceAgentName: "Express_Bot",
      kind: "hypothesis",
      role: "Verbaler Filter und Schutzpraesentation",
      linkedHypotheses: ["H1", "H6"],
      activation: 0.62,
      tension: 0.45,
      confidence: "medium",
      epistemicLabels: ["simulated", "speculative"],
      position3d: { x: 0.4, y: 0.3, z: -0.2 },
      colorLayer: "purple",
      rawSourceRefs: ["doc_user_q_1"],
      notToInfer: ["Expressive Stoerung"],
      selfExplanation: "Ich formuliere Botschaften so, dass sie allzeit souveraen und fachlich unangreifbar wirken.",
      externalChallenge: "In der Dynamik entsteht ein Muster der 'Perfektions-Kommunikation', die echten Ausdruck blockiert.",
      usefulTension: "Exzellenter professioneller Auftritt, verstaerkt jedoch die innere Isolationserfahrung.",
      visible: true
    },
    {
      id: "H5",
      runId,
      label: "H5 Selbstbild-Kohaerenz",
      sourceAgentName: "Coherence_Bot",
      kind: "hypothesis",
      role: "Konsistenzwaechter des Selbstbilds",
      linkedHypotheses: ["H1", "H3"],
      activation: 0.9,
      tension: 0.68,
      confidence: "high",
      epistemicLabels: ["observed"],
      position3d: { x: -0.1, y: 0.1, z: 0.1 },
      colorLayer: "blue",
      rawSourceRefs: ["doc_user_q_1", "doc_bazi_dayun_2026"],
      notToInfer: ["Identitaetsstoerung", "Ego-Fragmentierung"],
      selfExplanation: "Ich sorge dafuer, dass Abweichungen im Verhalten rationalisiert werden, um das Kernselbstbild aufrechtzuerhalten.",
      externalChallenge: "Der Wunsch nach absoluter Konsistenz erschwert die Integration unvollkommener Verhaltensanteile.",
      usefulTension: "Gibt hoehste Identitaetsstabilitaet, verlangsamt aber das transformative Lernen.",
      visible: true
    },
    {
      id: "H6",
      runId,
      label: "H6 Schutz & Rueckzug",
      sourceAgentName: "Defense_Bot",
      kind: "hypothesis",
      role: "Rettungsanker und Isolationstendenz",
      linkedHypotheses: ["H2", "H4"],
      activation: 0.51,
      tension: 0.74,
      confidence: "high",
      epistemicLabels: ["observed", "speculative"],
      position3d: { x: -0.6, y: -0.1, z: 0.3 },
      colorLayer: "red",
      rawSourceRefs: ["doc_user_q_1"],
      notToInfer: ["Klinische Depression", "Vermeidender Rueckzug"],
      selfExplanation: "Sobald die Spannungen in H1 und H3 unertraeglich werden, aktiviere ich den mentalen Notausstieg und ziehe das System in neutrale Distanz.",
      externalChallenge: "Die Simulation zeigt, dass Rueckzug die Symptome scheinbar lindert, die Kernkonflikte jedoch unberuehrt laesst.",
      usefulTension: "Schuetzt vor akuter Reizueberflutung, schraenkt den Handlungsradius jedoch ein.",
      visible: true
    },
    {
      id: "H7",
      runId,
      label: "H7 Transformationspotenzial",
      sourceAgentName: "Integration_Bot",
      kind: "hypothesis",
      role: "Bruecke zur bewussten Musterintegration",
      linkedHypotheses: ["H1", "H6"],
      activation: 0.28,
      tension: 0.32,
      confidence: "speculative",
      epistemicLabels: ["speculative", "not_diagnostic"],
      position3d: { x: 0.0, y: -0.8, z: 0.6 },
      colorLayer: "yellow",
      rawSourceRefs: [],
      notToInfer: ["Therapeutische Heilung"],
      selfExplanation: "Ich simuliere die Kapazitaet, gegensaetzliche Antriebe (wie H1 und H6) bewusst zu beobachten, ohne sofort in eine Autopilot-Aktion zu fallen.",
      externalChallenge: "H7 verhaelt sich derzeit noch primaer passiv und wird durch H1 und H3 unterdrueckt.",
      usefulTension: "Erzeugt heilsame Irritation, verlangt jedoch das Aushalten von Ambiguitaet.",
      visible: true
    },
    {
      id: "Memory",
      runId,
      label: "Verhaltensgedaechtnis",
      kind: "memory",
      role: "Speicher historischer Wiederholungszyklen",
      linkedHypotheses: [],
      activation: 0.45,
      tension: 0.2,
      confidence: "medium",
      epistemicLabels: ["observed"],
      position3d: { x: -0.4, y: 0.5, z: -0.6 },
      rawSourceRefs: ["doc_bazi_dayun_2026"],
      notToInfer: [],
      visible: true
    },
    {
      id: "Evidence",
      runId,
      label: "Verhaltensevidenz",
      kind: "evidence",
      role: "Nachgewiesene Verhaltensmuster aus Eingaben",
      linkedHypotheses: [],
      activation: 0.55,
      tension: 0.25,
      confidence: "high",
      epistemicLabels: ["observed"],
      position3d: { x: 0.5, y: -0.6, z: -0.5 },
      rawSourceRefs: ["doc_user_q_1"],
      notToInfer: [],
      visible: true
    }
  ];

  const events: AgentDialogueEventV1[] = [
    {
      id: "ev1",
      runId,
      round: 0,
      actorId: "H1",
      actionType: "Eintritt",
      content: "Ich muss sicherstellen, dass wir in dieser Simulationsrunde das Maximum leisten. Jeder Leerlauf verraet unvollkommene Planung.",
      claim: "Leerlauf signalisiert Inkompetenz.",
      claimType: "assertion",
      claimTags: ["Leistungsdruck", "Selbstwert"],
      epistemicLabels: ["observed"],
      rawSourceRefs: ["doc_user_q_1"]
    },
    {
      id: "ev2",
      runId,
      round: 1,
      actorId: "H3",
      actionType: "Replik",
      content: "Einverstanden. Ich habe saemtliche Achsen und Grenzwerte auf ein Maximum an Kontrolle justiert. Keine unvorhergesehene Interaktion ist erlaubt.",
      claim: "Sicherheit erfordert engste Strukturkontrolle.",
      claimType: "defense",
      claimTags: ["Kontrolle", "Angstabwehr"],
      epistemicLabels: ["observed"],
      rawSourceRefs: ["doc_bazi_dayun_2026"]
    },
    {
      id: "ev3",
      runId,
      round: 2,
      actorId: "H6",
      actionType: "Widerspruch",
      content: "Der Druck ist unertraeglich hoch. Wenn ihr das Tempo so steigert, werde ich die komplette Naehe blockieren und das Kommunikationssystem H4 trennen.",
      claim: "Extremer Druck erzwingt selbstschuetzenden Rueckzug.",
      claimType: "challenge",
      claimTags: ["Schutz", "Fokusverlust"],
      epistemicLabels: ["observed"],
      rawSourceRefs: ["doc_user_q_1"],
      relatedConflictId: "conf1"
    },
    {
      id: "ev4",
      runId,
      round: 4,
      actorId: "H4",
      actionType: "Kompromiss",
      content: "Ich kann moegliche Spannungen nach aussen abfedern. Wenn ich eine Maske der Souveraenitaet praesentiere, bemerkt niemand den inneren Rueckzug.",
      claim: "Formelle Maskierung tarnt inneren Rueckzug.",
      claimType: "reframe",
      claimTags: ["Kommunikation", "Filter"],
      epistemicLabels: ["simulated"],
      rawSourceRefs: []
    },
    {
      id: "ev5",
      runId,
      round: 6,
      actorId: "H7",
      actionType: "Beobachtung",
      content: "Interessant, wie H1 sofort auf H6 reagiert. Ist euch aufgefallen, dass diese Autopilot-Schleife seit Runde 2 ununterbrochen feuert?",
      claim: "Die Interaktion H1-H6 ist ein dominanter Zirkel.",
      claimType: "challenge",
      claimTags: ["Integration", "Metabebobachtung"],
      epistemicLabels: ["speculative"],
      rawSourceRefs: []
    }
  ];

  const transitions: PatternTransitionV1[] = [
    {
      id: "trans1",
      runId,
      actorId: "H1",
      fromRound: 1,
      toRound: 2,
      beforeState: "Konstruktiver Ehrgeiz",
      trigger: "Gefuehlte Diskrepanz zwischen Leistungsanspruch und erreichter Struktur",
      afterState: "Uebersteigertes Leistungsmuster (Hyper-Aktivitaet)",
      selfExplanation: "H1 verstaerkt die Frequenz, da Angst vor Kontrollverlust in H3 zunimmt.",
      patternMeaning: "Kipppunkt, an dem Ambition von funktionaler Steuerung in unbewussten Getriebenseinwechsel uebergeht.",
      confidence: "high",
      relatedHypothesisIds: ["H1", "H3"],
      notToInfer: ["Bipolare Dynamik"],
      rawSourceRefs: ["doc_user_q_1"]
    },
    {
      id: "trans2",
      runId,
      actorId: "H6",
      fromRound: 3,
      toRound: 4,
      beforeState: "Stille Abwehr",
      trigger: "Kollaps des Intellektualisierungs-Treibers unter Maximallast",
      afterState: "Mentaler Rueckzug und Isolation (Notausstieg)",
      selfExplanation: "H6 vollzieht den Sprung, um das Core-Selbstbild H5 vor dem Erleben von Versagen zu schuetzen.",
      patternMeaning: "Muster-Abruptbruch: Rueckzug aus Interaktion bei gleichzeitiger Fassadenwahrung.",
      confidence: "medium",
      relatedHypothesisIds: ["H6", "H4"],
      notToInfer: ["Klinischer Mutismus"],
      rawSourceRefs: ["doc_user_q_1"]
    }
  ];

  const conflicts: PatternConflictV1[] = [
    {
      id: "conf1",
      runId,
      actorA: "H1",
      actorB: "H6",
      conflictType: "contradiction",
      claimA: "Wir muessen uns unaufhoerlich optimieren und praesentieren.",
      claimB: "Wir muessen uns radikal distanzieren und unnahbar bleiben, um gesund zu bleiben.",
      usefulTension: "Die Reibung erzeugt eine permanente, ungerichtete Unruhe – eine Chance, die Polaritaet hinter dem Automuster bewusst zu dekonstruieren.",
      relatedHypothesisIds: ["H1", "H6"],
      confidence: "high",
      rawSourceRefs: ["doc_user_q_1"]
    },
    {
      id: "conf2",
      runId,
      actorA: "H3",
      actorB: "H2",
      conflictType: "reframe",
      claimA: "Ausschliesslich strikte Kontrollstrukturen sichern das System.",
      claimB: "Nur echte Beziehungsnaehe und Harmonie geben wirklichen Schutz.",
      usefulTension: "Sichtbarmachung der widerspruechlichen Schutzkonzepte (Isolation vs. ungeschuetzte Naehe).",
      relatedHypothesisIds: ["H3", "H2"],
      confidence: "medium",
      rawSourceRefs: ["doc_bazi_dayun_2026"]
    }
  ];

  const branches: ScenarioBranchV1[] = [
    {
      id: "branch1",
      runId,
      title: "Szenario-Abzweig: Autopilot-Eskalation",
      summary: "In diesem simulierten Verlauf verhaelt sich das Spannungsgefuege expansiv: Steigender Erwartungsdruck in H1 fuehrt zu absolutem Rueckzug H6, waehrend die Kommunikation H4 einfriert.",
      tendencyType: "amplification",
      confidence: "high",
      probabilityWeight: 0.65,
      horizonRelevance: "7_days",
      triggerDescription: "Anhalten der unkontrollierten Frequenzsteigerung ohne bewusste Dekompressionsphasen.",
      ifPattern: "Unterdrueckung der Trigger-Warnungen und anhaltende Aktivierung des H3 Kontrollreglers.",
      possibleOutcome: "Vollstaendiger energetischer Shutdown des Systems und voruebergehender Kommunikationsabbruch.",
      relatedHypothesisIds: ["H1", "H3", "H6"],
      involvedActorIds: ["H1", "H6", "H4"],
      coherenceDelta: -0.25,
      tensionDelta: 0.35,
      notToInfer: ["Garantierte Erschoepfungdepression", "Medizinisches Burnout"],
      reflectiveQuestion: "Was gewinnt das System an gefuehlter Sicherheit, wenn dieser unbewusste Zirkel sich weiter zuspitzt?",
      epistemicLabels: ["simulated", "speculative"],
      rawSourceRefs: ["doc_user_q_1"]
    },
    {
      id: "branch2",
      runId,
      title: "Szenario-Abzweig: Bewusstes Innehalten",
      summary: "Ein moeglicher konstruktiver Verlauf, initiiert durch bewusste Aktivierung des Integrationspotenzials H7. Die unbewusste Reiz-Reaktions-Kompensation H1-H6 wird verlangsamt.",
      tendencyType: "interruption",
      confidence: "medium",
      probabilityWeight: 0.35,
      horizonRelevance: "30_days",
      triggerDescription: "Etablierung eines wertfreien Beobachter-Raums unmittelbar nach Eintreten des ersten Triggers.",
      ifPattern: "Aushalten der inneren Leere bei verringertem Leistungsantrieb, ohne diesen sofort rationalisieren zu muessen.",
      possibleOutcome: "Deutlicher Spannungsabfall im gesamten System und Entlastung des Kommunikationskanals.",
      relatedHypothesisIds: ["H7", "H1", "H6"],
      involvedActorIds: ["H7", "H1", "H6"],
      coherenceDelta: 0.18,
      tensionDelta: -0.42,
      notToInfer: ["Sofortige psychologische Heilung"],
      reflectiveQuestion: "Welche unangenehme Wahrheit muss bewusster gefuehlt werden, damit der Kontrollanspruch weichen kann?",
      epistemicLabels: ["speculative", "not_diagnostic"],
      rawSourceRefs: []
    }
  ];

  const nodes: PatternGraphV1["nodes"] = [
    { id: "n-H1", runId, nodeType: "actor", label: "H1 Antrieb & Ehrgeiz", actorId: "H1", position3d: { x: 0.6, y: -0.2, z: 0.4 }, intensity: 0.85, tension: 0.72, confidence: "high", colorLayer: "cyan", visible: true },
    { id: "n-H2", runId, nodeType: "actor", label: "H2 Beziehungsnaehe", actorId: "H2", position3d: { x: -0.2, y: -0.5, z: -0.3 }, intensity: 0.35, tension: 0.58, confidence: "medium", colorLayer: "green", visible: true },
    { id: "n-H3", runId, nodeType: "actor", label: "H3 Kontrollanspruch", actorId: "H3", position3d: { x: 0.1, y: 0.7, z: 0.5 }, intensity: 0.78, tension: 0.81, confidence: "high", colorLayer: "orange", visible: true },
    { id: "n-H4", runId, nodeType: "actor", label: "H4 Kommunikation & Maske", actorId: "H4", position3d: { x: 0.4, y: 0.3, z: -0.2 }, intensity: 0.62, tension: 0.45, confidence: "medium", colorLayer: "purple", visible: true },
    { id: "n-H5", runId, nodeType: "actor", label: "H5 Selbstbild-Kohaerenz", actorId: "H5", position3d: { x: -0.1, y: 0.1, z: 0.1 }, intensity: 0.9, tension: 0.68, confidence: "high", colorLayer: "blue", visible: true },
    { id: "n-H6", runId, nodeType: "actor", label: "H6 Schutz & Rueckzug", actorId: "H6", position3d: { x: -0.6, y: -0.1, z: 0.3 }, intensity: 0.51, tension: 0.74, confidence: "high", colorLayer: "red", visible: true },
    { id: "n-H7", runId, nodeType: "actor", label: "H7 Transformationspotenzial", actorId: "H7", position3d: { x: 0.0, y: -0.8, z: 0.6 }, intensity: 0.28, tension: 0.32, confidence: "speculative", colorLayer: "yellow", visible: true },
    
    // Semantic connectors
    { id: "n-trans1", runId, nodeType: "transition", label: "Trigger: Kontrollverlust-Furcht", transitionId: "trans1", position3d: { x: 0.35, y: 0.25, z: 0.45 }, intensity: 0.7, tension: 0.6, confidence: "high", colorLayer: "white", visible: true },
    { id: "n-conf1", runId, nodeType: "conflict", label: "Konflikt: Getrieben vs. Isoliert", conflictId: "conf1", position3d: { x: 0.0, y: -0.15, z: 0.35 }, intensity: 0.9, tension: 0.95, confidence: "high", colorLayer: "rose", visible: true }
  ];

  const edges: PatternGraphV1["edges"] = [
    { id: "e1", runId, sourceId: "n-H1", targetId: "n-conf1", edgeType: "influences", strength: 0.8, confidence: "high" },
    { id: "e2", runId, sourceId: "n-H6", targetId: "n-conf1", edgeType: "contradicts", strength: 0.9, confidence: "high", conflictId: "conf1" },
    { id: "e3", runId, sourceId: "n-H3", targetId: "n-trans1", edgeType: "supports", strength: 0.75, confidence: "high" },
    { id: "e4", runId, sourceId: "n-trans1", targetId: "n-H1", edgeType: "amplifies", strength: 0.85, confidence: "high", label: "Kipppunkt" },
    { id: "e5", runId, sourceId: "n-H5", targetId: "n-H1", edgeType: "stabilizes", strength: 0.6, confidence: "medium" },
    { id: "e6", runId, sourceId: "n-H1", targetId: "n-H4", edgeType: "influences", strength: 0.7, confidence: "medium" }
  ];

  const graph: PatternGraphV1 = {
    runId,
    nodes,
    edges,
    axisMapping: {
      version: "1.0.0",
      x: "Handlung (Action) vs. Rueckzug (Withdrawal)",
      y: "Klarheit (Clarity) vs. Ambiguitaet (Ambiguity)",
      z: "Naehe (Closeness) vs. Grenze (Boundary)"
    }
  };

  const narrativeStreams: NarrativeStreamV1[] = [
    {
      id: "narr1",
      runId,
      title: "Der leistungsorientierte Getriebene",
      summary: "Dieser Strom beschreibt die Kernschleife der Simulation: Der User aktiviert unbewusst hohen Leistungsdrang (H1) zur Selbstbestaetigung, reguliert Moeglichkeiten ueber starren Kontrollanspruch (H3), verweigert verletzliche Naehe (H2), was schliesslich in einen psychischen Notausstieg/Rueckzug (H6) gipfelt.",
      actorIds: ["H1", "H3", "H2", "H6"],
      eventIds: ["ev1", "ev2", "ev3"],
      startRound: 0,
      endRound: 4,
      dominantDynamic: "Zirkulaere Kompensation",
      confidence: "high",
      epistemicLabels: ["observed", "inferred"],
      notToInfer: ["Unmündigkeit gegenüber eigenen Verhaltensweisen"]
    }
  ];

  const provenance: PatternProvenanceV1 = {
    seedDocumentId: "seed-bazi-poersch-2026",
    seedVersion: "1.2.0",
    promptVersion: "2.4.1",
    questionVersion: "1.0.3",
    normalizerVersion: "1.1.0-alpha",
    mirosharkRunId: "mshark_run_9942a",
    mirosharkEndpoint: "https://miroshark-core.internal.cloud.run",
    modelProvider: "Google AI Studio",
    modelName: "gemini-1.5-pro",
    runStartedAt: "2026-06-01T01:55:00Z",
    runCompletedAt: "2026-06-01T01:58:30Z",
    rawExportRefs: ["raw_export_agent_dialog.json", "raw_export_trajectories.json"],
    errorCode: undefined,
    errorMessage: undefined,
    partialUsableReason: undefined,
    normalizerWarnings: ["Identifizierte Hypothese H7 faellt unter die Spekulationsschwelle."]
  };

  const growthCurves = generateGrowthCurves(runId, 0.42);

  return {
    runId,
    status: "completed",
    roundsCompleted: 7,
    roundsTotal: 7,
    startedAt: "2026-06-01T01:55:00Z",
    completedAt: "2026-06-01T01:58:30Z",
    dataQuality: {
      status: "completed",
      overall: 0.92,
      sourceCompleteness: {
        "H1-H7_Hypothesen": "present",
        "Eingabedokumente": "present",
        "Bazi_Dayun_Calculations": "present",
        "Agent_Dialog_Logs": "present"
      },
      warnings: [],
      blockingMissing: []
    },
    safetyNotice: SAFETY_NOTICE_DEFAULT,
    dialogue: {
      runId,
      actors,
      events,
      transitions,
      conflicts,
      synthesis: {
        title: "Synthese des Perfectionist Autopiloten",
        summary: "Das System veranschaulicht eine starke Kopplung zwischen intellektuellem Leistungsantrieb und affektivem Rueckzug. Die Selbstregulierung erfolgt vorwiegend reaktiv. Echter Wandel beginnt, wenn der Rueckzug nicht laenger stillschweigend geschieht, sondern der Konflikt mit dem Antriebsteil offen gehalten und wahrgenommen wird.",
        keyDynamic: "Ueberstrapazierter Schutz autopiloter Kontrollschleifen.",
        openQuestion: "Welche Qualitaet entsteht im Handlungsraum, wenn das Erreichen von Ergebnissen nicht mehr den eigenen Lebensberechtigungsausweis finanzieren muss?",
        notToInfer: ["Klinischer Befund", "Indikation fuer Therapie"]
      }
    },
    branches,
    graph,
    growthCurves,
    narrativeStreams,
    provenance,
    errors: [],
    warnings: [],
    createdAt: "2026-06-01T01:55:00Z",
    updatedAt: "2026-06-01T01:58:30Z"
  };
}

export function getScenarioB(runId: string): PatternAmpRunV1 {
  // Scenario B is partial usable. Some inputs or hypotheses were missing or failed normalizer thresholds.
  const baseRun = getScenarioA(runId);
  
  // Let's filter out H3 and H5 from actors and graphs to simulate fragment data.
  const partialActors = baseRun.dialogue.actors.filter(a => a.id !== "H3" && a.id !== "H5");
  const partialNodes = baseRun.graph.nodes.filter(n => n.actorId !== "H3" && n.actorId !== "H5");
  const partialEdges = baseRun.graph.edges.filter(e => e.sourceId !== "n-H3" && e.targetId !== "n-H3" && e.sourceId !== "n-H5" && e.targetId !== "n-H5");
  
  return {
    ...baseRun,
    status: "partial_usable",
    dataQuality: {
      status: "partial_usable",
      overall: 0.58,
      sourceCompleteness: {
        "H1-H7_Hypothesen": "partial",
        "Eingabedokumente": "present",
        "Bazi_Dayun_Calculations": "missing",
        "Agent_Dialog_Logs": "partial"
      },
      warnings: [
        "Kontrollstruktur H3 konnte aufgrund fehlender BaZi-Berechnungen nicht normalisiert werden.",
        "Aktor H5 weist unvollstaendige Konsistenzindizes auf."
      ],
      blockingMissing: [],
      partialUsableReason: "Der Lauf war aufgrund fehlerhafter BaZi-Fakten unvollstaendig, liefert aber fuer H1, H2, H4 und H6 bereits wertvolle, stabil teilinterpretierte Verhaltenspfade."
    },
    dialogue: {
      ...baseRun.dialogue,
      actors: partialActors
    },
    graph: {
      ...baseRun.graph,
      nodes: partialNodes,
      edges: partialEdges
    },
    provenance: {
      ...baseRun.provenance,
      partialUsableReason: "BaZi-Fakten-Datenquelle war unvollstaendig, daher wurde die Normalisierung fuer H3 und H5 abgebrochen.",
      normalizerWarnings: [
        "Unzureichende Daten fuer Kontrollschleifen-Hypothesen.",
        "Reduzierung auf partielle Praesentation."
      ]
    },
    warnings: ["Partieller Datensatz geladen. Einige Panels zeigen begrenzte Visualisierungen."]
  };
}

export function getScenarioC(runId: string): PatternAmpRunV1 {
  // Scenario C is fully failed due to system exceptions or missing inputs.
  const baseRun = getScenarioA(runId);
  return {
    ...baseRun,
    status: "failed",
    dataQuality: {
      status: "failed",
      sourceCompleteness: {
        "H1-H7_Hypothesen": "missing",
        "Eingabedokumente": "missing",
        "Bazi_Dayun_Calculations": "missing",
        "Agent_Dialog_Logs": "missing"
      },
      warnings: ["Der MiroSharkService-Lauf lieferte keine parsebaren Artefakte."],
      blockingMissing: ["Eingabedokumente", "Strategie-Seed"]
    },
    errors: [
      {
        code: "ERR_MIROSHARK_SERVICE_TIMEOUT",
        message: "Der agentische Simulationsservice hat nach 180 Sekunden nicht geantwortet. Eventuell ist der interne Worker ueberlastet.",
        severity: "fatal",
        createdAt: "2026-06-01T02:00:00Z"
      }
    ],
    provenance: {
      ...baseRun.provenance,
      errorCode: "SIM_TIMEOUT_504",
      errorMessage: "MiroSharkService worker node failed to respond on internal port binding.",
      normalizerWarnings: []
    }
  };
}
