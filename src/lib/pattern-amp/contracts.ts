export type PatternAmpRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial_usable"
  | "failed"
  | "missing_source";

export type EpistemicLabel =
  | "observed"
  | "inferred"
  | "simulated"
  | "speculative"
  | "missing"
  | "not_diagnostic";

export type SourceCompletenessState =
  | "present"
  | "partial"
  | "missing"
  | "missing_not_blocking";

export type ConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "speculative";

export type Position3D = {
  x: number;
  y: number;
  z: number;
  axisMappingVersion?: string;
};

export type SafetyNoticeV1 = {
  title: string;
  body: string;
  notTherapy: boolean;
  notDiagnosis: boolean;
  notPrediction: boolean;
  version: string;
};

export type DataQualityV1 = {
  status: PatternAmpRunStatus;
  overall?: number;
  sourceCompleteness: Record<string, SourceCompletenessState>;
  warnings: string[];
  blockingMissing: string[];
  partialUsableReason?: string;
};

export type PatternActorV1 = {
  id: string;
  runId: string;
  label: string;
  sourceAgentName?: string;
  kind:
    | "hypothesis"
    | "memory"
    | "evidence"
    | "user_proxy"
    | "summary"
    | "unknown";
  role?: string;
  linkedHypotheses: string[];
  activation: number;
  tension: number;
  confidence: ConfidenceLevel;
  epistemicLabels: EpistemicLabel[];
  position3d?: Position3D;
  positionHistory?: Array<{
    round: number | null;
    position: Position3D;
  }>;
  colorLayer?: string;
  rawSourceRefs: string[];
  notToInfer: string[];
  selfExplanation?: string | null;
  externalChallenge?: string | null;
  usefulTension?: string | null;
  visible?: boolean;
};

export type AgentDialogueEventV1 = {
  id: string;
  runId: string;
  round: number | null;
  actorId: string;
  platform?: "twitter" | "reddit" | "polymarket" | "system" | "unknown";
  actionType: string;
  content: string;
  claim?: string;
  claimType?:
    | "assertion"
    | "defense"
    | "reframe"
    | "challenge"
    | "concession"
    | "silence"
    | "unknown";
  targetActorId?: string | null;
  relatedTransitionId?: string | null;
  relatedConflictId?: string | null;
  claimTags: string[];
  epistemicLabels: EpistemicLabel[];
  rawSourceRefs: string[];
  createdAt?: string;
};

export type PatternTransitionV1 = {
  id: string;
  runId: string;
  actorId: string;
  fromRound: number | null;
  toRound: number | null;
  beforeState: string;
  trigger: string;
  afterState: string;
  selfExplanation: string;
  externalChallenge?: string | null;
  patternMeaning: string;
  confidence: ConfidenceLevel;
  relatedHypothesisIds: string[];
  notToInfer: string[];
  rawSourceRefs: string[];
};

export type PatternConflictV1 = {
  id: string;
  runId: string;
  actorA: string;
  actorB: string;
  conflictType:
    | "contradiction"
    | "reframe"
    | "amplification"
    | "stabilization"
    | "challenge";
  claimA: string;
  claimB: string;
  usefulTension: string;
  relatedHypothesisIds: string[];
  confidence: ConfidenceLevel;
  rawSourceRefs: string[];
};

export type ScenarioBranchV1 = {
  id: string;
  runId: string;
  title: string;
  summary: string;
  tendencyType:
    | "amplification"
    | "interruption"
    | "stabilization"
    | "integration"
    | "contradiction"
    | "drift"
    | "recalibration";
  confidence: ConfidenceLevel;
  probabilityWeight?: number | null;
  horizonRelevance: "now" | "7_days" | "30_days" | "unknown";
  triggerDescription?: string;
  ifPattern?: string;
  possibleOutcome?: string;
  relatedHypothesisIds: string[];
  involvedActorIds: string[];
  coherenceDelta?: number | null;
  tensionDelta?: number | null;
  notToInfer: string[];
  reflectiveQuestion?: string;
  epistemicLabels: EpistemicLabel[];
  rawSourceRefs: string[];
};

export type GrowthCurvePointV1 = {
  id: string;
  runId: string;
  actorId?: string;
  round: number | null;
  t: number;
  activation: number;
  tension: number;
  coherence?: number | null;
  ambiguity?: number | null;
  position3d?: Position3D;
  createdAt?: string;
};

export type PatternGraphNodeV1 = {
  id: string;
  runId: string;
  nodeType: "actor" | "transition" | "conflict" | "branch" | "hypothesis";
  label: string;
  actorId?: string;
  branchId?: string;
  transitionId?: string;
  conflictId?: string;
  position3d?: Position3D;
  intensity?: number;
  tension?: number;
  confidence?: ConfidenceLevel;
  colorLayer?: string;
  visible?: boolean;
};

export type PatternGraphEdgeV1 = {
  id: string;
  runId: string;
  sourceId: string;
  targetId: string;
  edgeType:
    | "supports"
    | "contradicts"
    | "reframes"
    | "amplifies"
    | "interrupts"
    | "stabilizes"
    | "influences"
    | "depends_on";
  strength: number;
  confidence: ConfidenceLevel;
  conflictId?: string;
  label?: string | null;
};

export type PatternGraphV1 = {
  runId: string;
  nodes: PatternGraphNodeV1[];
  edges: PatternGraphEdgeV1[];
  axisMapping: {
    version: string;
    x: string;
    y: string;
    z: string;
  };
};

export type NarrativeStreamV1 = {
  id: string;
  runId: string;
  title: string;
  summary: string;
  actorIds: string[];
  eventIds: string[];
  startRound?: number | null;
  endRound?: number | null;
  dominantDynamic?: string;
  confidence: ConfidenceLevel;
  epistemicLabels: EpistemicLabel[];
  notToInfer: string[];
};

export type PatternDialogueV1 = {
  runId: string;
  actors: PatternActorV1[];
  events: AgentDialogueEventV1[];
  transitions: PatternTransitionV1[];
  conflicts: PatternConflictV1[];
  synthesis?: {
    title: string;
    summary: string;
    keyDynamic: string;
    openQuestion?: string;
    notToInfer: string[];
  };
};

export type PatternProvenanceV1 = {
  seedDocumentId?: string | null;
  seedVersion?: string;
  promptVersion?: string;
  questionVersion?: string;
  normalizerVersion?: string;
  mirosharkRunId?: string | null;
  mirosharkEndpoint?: string | null;
  modelProvider?: string;
  modelName?: string;
  runStartedAt?: string;
  runCompletedAt?: string;
  rawExportRefs: string[];
  errorCode?: string;
  errorMessage?: string;
  partialUsableReason?: string;
  normalizerWarnings: string[];
};

export type PatternRunErrorV1 = {
  code: string;
  message: string;
  round?: number | null;
  severity: "fatal" | "warning" | "info";
  createdAt?: string;
};

export type PatternAmpRunV1 = {
  runId: string;
  userRef?: string;
  scenarioRunId?: string | null;
  status: PatternAmpRunStatus;
  roundsCompleted?: number;
  roundsTotal?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  dataQuality: DataQualityV1;
  safetyNotice: SafetyNoticeV1;
  dialogue: PatternDialogueV1;
  branches: ScenarioBranchV1[];
  graph: PatternGraphV1;
  growthCurves: GrowthCurvePointV1[];
  narrativeStreams: NarrativeStreamV1[];
  provenance: PatternProvenanceV1;
  errors: PatternRunErrorV1[];
  warnings: string[];
  createdAt?: string;
  updatedAt?: string;
};
