import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initDb, savePrediction, loadAllPredictions, getSummaryStats, deletePrediction, clearAllPredictions } from "./database";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  initDb();

  // API Routes
  app.get("/api/stats", (req, res) => {
    try {
      const stats = getSummaryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/predictions", (req, res) => {
    try {
      const predictions = loadAllPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  app.post("/api/predictions", (req, res) => {
    try {
      const result = savePrediction(req.body);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save prediction" });
    }
  });

  app.delete("/api/predictions/:id", (req, res) => {
    try {
      deletePrediction(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prediction" });
    }
  });

  app.delete("/api/predictions", (req, res) => {
    try {
      clearAllPredictions();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
