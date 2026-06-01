import {
  PatternAmpRunV1,
  DataQualityV1,
  PatternRunErrorV1
} from "./contracts.ts";

export type PatternAmpViewState =
  | { phase: "auth_check" }
  | { phase: "loading_state" }
  | { phase: "missing_source"; dataQuality: DataQualityV1 }
  | {
      phase: "ready_no_run";
      dataQuality: DataQualityV1;
      latestRun: PatternAmpRunV1 | null;
    }
  | {
      phase: "running";
      runId: string;
      roundsCompleted?: number;
      roundsTotal?: number;
    }
  | { phase: "completed"; run: PatternAmpRunV1 }
  | { phase: "partial_usable"; run: PatternAmpRunV1 }
  | { phase: "failed"; errors: PatternRunErrorV1[]; run?: PatternAmpRunV1 }
  | { phase: "error"; message: string };
