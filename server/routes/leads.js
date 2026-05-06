import express from "express";

import { getLeads } from "../services/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leads = await getLeads(req.query.user_id);
    res.json({ leads });
  } catch (error) {
    console.error("[ERROR]", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
