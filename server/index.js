import "dotenv/config";

import cors from "cors";
import express from "express";

import conversationsRoutes from "./routes/conversations.js";
import leadsRoutes from "./routes/leads.js";
import testRoute from "./routes/test.js";
import webhookRoutes from "./routes/webhook.js";

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.body);
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "support-automation-server" });
});

app.use("/webhook", webhookRoutes);
app.use("/test", testRoute);
app.use("/leads", leadsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api", conversationsRoutes);

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ ok: false, error: err.message });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log("Server running on http://localhost:3001");
});
