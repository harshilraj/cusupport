import express from "express";

import { callAI } from "../services/ai.js";
import {
  appendConversation,
  getConversationHistory,
  getUser,
  upsertUser,
} from "../services/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, user_id, platform } = req.body || {};

    console.log("STEP 1: Incoming request");
    console.log(req.body);
    console.log("Incoming:", req.body);

    if (!message || !user_id || !platform) {
      return res.status(400).json({
        error: "message, user_id, and platform are required",
      });
    }

    console.log("STEP 2: Fetching user");
    const existing = await getUser(user_id);
    const history = await getConversationHistory(user_id);

    console.log("STEP 3: Calling AI");
    const aiResponse = await callAI({
      message,
      platform,
      user_id,
      conversation_history: history,
      known_data: existing || {},
    });

    console.log("STEP 4: AI response:", aiResponse);
    console.log("AI:", aiResponse);

    const extracted = aiResponse.extracted_data || {};
    const leadData = {
      id: user_id,
      name: extracted.name || existing?.name,
      email: extracted.email || existing?.email,
      phone: extracted.phone || existing?.phone,
      status: aiResponse.update_fields?.status || existing?.status || "NEW",
      last_contacted: new Date().toISOString(),
      followup_count: existing?.followup_count ?? 0,
    };

    console.log("Saving lead:", leadData);

    console.log("STEP 5: Writing to Supabase");
    await upsertUser(leadData);
    await appendConversation({
      user_id,
      message,
      reply: aiResponse.reply,
    });

    return res.json({
      reply: aiResponse.reply,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
