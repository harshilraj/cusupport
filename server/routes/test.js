import express from "express";

import { supabase } from "../services/supabase.js";

const router = express.Router();

router.get("/db", async (_, res) => {
  console.log("[DB][READ START]", { table: "leads", route: "/test/db", limit: 5 });

  const { data, error } = await supabase.from("leads").select("*").limit(5);

  if (error) {
    console.error("[DB][READ ERROR]", error);
    return res.status(500).json({ ok: false, error });
  }

  console.log("[DB][READ OK]", { table: "leads", count: data?.length || 0 });
  return res.json({ ok: true, sample: data });
});

export default router;
