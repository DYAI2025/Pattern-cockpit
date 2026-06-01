import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getScenarioA, getScenarioB, getScenarioC } from "./src/lib/pattern-amp/scenarios.ts";
import { PatternAmpRunV1 } from "./src/lib/pattern-amp/contracts.ts";

// Setup global or modular variables to hold current state
let latestRun: PatternAmpRunV1 | null = null;
let currentActiveRun: {
  runId: string;
  status: "queued" | "running" | "completed" | "partial_usable" | "failed";
  roundsCompleted: number;
  roundsTotal: number;
  scenarioType: "completed" | "partial_usable" | "failed";
  timer?: NodeJS.Timeout;
} | null = null;

// The default source quality when no run has been completed yet
const defaultDataQuality = {
  status: "missing_source" as const,
  sourceCompleteness: {
    "H1-H7_Hypothesen": "missing" as const,
    "Eingabedokumente": "missing" as const,
    "Bazi_Dayun_Calculations": "missing" as const,
    "Agent_Dialog_Logs": "missing" as const
  },
  warnings: ["Keine historische Simulationsbasis gefunden."],
  blockingMissing: ["Eingabedokumente"]
};

const app = express();
app.use(express.json());

// API endpoints
app.get("/api/pattern-amp/state", (req, res) => {
  if (currentActiveRun) {
    return res.json({
      dataQuality: {
        status: "running",
        sourceCompleteness: {
          "H1-H7_Hypothesen": "partial",
          "Eingabedokumente": "present",
          "Bazi_Dayun_Calculations": "present",
          "Agent_Dialog_Logs": "partial"
        },
        warnings: [],
        blockingMissing: []
      },
      latestRun: latestRun,
      canStartRun: false,
      status: currentActiveRun.status,
      runId: currentActiveRun.runId,
      roundsCompleted: currentActiveRun.roundsCompleted,
      roundsTotal: currentActiveRun.roundsTotal
    });
  }

  if (latestRun) {
    return res.json({
      dataQuality: latestRun.dataQuality,
      latestRun: latestRun,
      canStartRun: true,
      status: latestRun.status
    });
  }

  return res.json({
    dataQuality: defaultDataQuality,
    latestRun: null,
    canStartRun: true,
    status: "missing_source"
  });
});

app.post("/api/pattern-amp/run", (req, res) => {
  if (currentActiveRun) {
    return res.status(400).json({
      message: "Es laeuft bereits eine aktive Pattern AMP Simulation."
    });
  }

  const { scenario = "completed" } = req.body;
  const runId = `run_${Math.random().toString(36).substring(2, 9)}`;

  // Start background periodic interval simulation
  currentActiveRun = {
    runId,
    status: "running",
    roundsCompleted: 0,
    roundsTotal: 7,
    scenarioType: scenario as any
  };

  const timer = setInterval(() => {
    if (!currentActiveRun) {
      clearInterval(timer);
      return;
    }

    if (currentActiveRun.roundsCompleted < currentActiveRun.roundsTotal) {
      currentActiveRun.roundsCompleted += 1;
    } else {
      // Simulation finished. Map the computed scenario.
      clearInterval(timer);
      const type = currentActiveRun.scenarioType;

      if (type === "completed") {
        latestRun = getScenarioA(runId);
      } else if (type === "partial_usable") {
        latestRun = getScenarioB(runId);
      } else {
        latestRun = getScenarioC(runId);
      }

      currentActiveRun = null;
    }
  }, 2000); // Progress round every 2 seconds

  currentActiveRun.timer = timer;

  res.json({
    runId,
    status: "queued"
  });
});

app.get("/api/pattern-amp/run/:id", (req, res) => {
  const { id } = req.params;

  // Check if it is the active background run
  if (currentActiveRun && currentActiveRun.runId === id) {
    return res.json({
      runId: id,
      status: "running",
      roundsCompleted: currentActiveRun.roundsCompleted,
      roundsTotal: currentActiveRun.roundsTotal,
      dataQuality: {
        status: "running",
        sourceCompleteness: {
          "H1-H7_Hypothesen": "partial",
          "Eingabedokumente": "present",
          "Bazi_Dayun_Calculations": "present",
          "Agent_Dialog_Logs": "partial"
        },
        warnings: [],
        blockingMissing: []
      }
    });
  }

  if (latestRun && latestRun.runId === id) {
    return res.json(latestRun);
  }

  // Not found or previous run
  return res.status(404).json({
    message: `Keine Simulation mit ID ${id} verfuegbar.`
  });
});

app.get("/api/pattern-amp/run/:id/raw", (req, res) => {
  const { id } = req.params;

  if (latestRun && latestRun.runId === id) {
    return res.json({
      provenance: latestRun.provenance,
      rawExports: [
        {
          file: "raw_export_agent_dialog.json",
          sizeBytes: 15420,
          description: "Roh-Export der simulierten Dialogtexte zwischen H1-H7.",
          schema: "AgentDialogueEventV1[]"
        },
        {
          file: "raw_export_trajectories.json",
          sizeBytes: 8120,
          description: "Roh-Koordinaten-Verlaeufe und Gedaechtnis-Vektoren des Phasenraums.",
          schema: "GrowthCurvePointV1[]"
        }
      ]
    });
  }

  return res.status(404).json({
    message: `Keine Roh-Daten fuer ID ${id} gefunden.`
  });
});

// Admin reset route to allow easy testing and full reset of flows
app.post("/api/pattern-amp/reset", (req, res) => {
  if (currentActiveRun && currentActiveRun.timer) {
    clearInterval(currentActiveRun.timer);
  }
  currentActiveRun = null;
  latestRun = null;
  res.json({ message: "Plattform-Zustand erfolgreich zurueckgesetzt." });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pattern AMP Server] Express running on port ${PORT}`);
  });
}

startServer();
