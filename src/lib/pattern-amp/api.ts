import {
  PatternAmpRunV1,
  DataQualityV1,
} from "./contracts.ts";

export async function getPatternAmpState(): Promise<{
  dataQuality: DataQualityV1;
  latestRun: PatternAmpRunV1 | null;
  canStartRun: boolean;
  status: string;
  runId?: string;
  roundsCompleted?: number;
  roundsTotal?: number;
}> {
  const response = await fetch("/api/pattern-amp/state");
  if (!response.ok) {
    throw new Error(`Failed to load state: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function startPatternAmpRun(input?: {
  forceNew?: boolean;
  scenario?: string;
}): Promise<{
  runId: string;
  status: "queued" | "running";
}> {
  const response = await fetch("/api/pattern-amp/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input || {}),
  });
  if (!response.ok) {
    if (response.status === 400) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to start pattern run");
    }
    throw new Error(`Failed to start pattern run: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getPatternAmpRun(runId: string): Promise<PatternAmpRunV1> {
  const response = await fetch(`/api/pattern-amp/run/${runId}`);
  if (!response.ok) {
    throw new Error(`Failed to load run ${runId}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getPatternAmpRunRaw(runId: string): Promise<{
  provenance: any;
  rawExports: any[];
}> {
  const response = await fetch(`/api/pattern-amp/run/${runId}/raw`);
  if (!response.ok) {
    throw new Error(`Failed to load raw details for ${runId}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
