import express from "express";

import { appendConversation, getAllConversations } from "../services/db.js";
import { sendMessage } from "../services/sender.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const conversations = await getAllConversations(req.query.user_id);
    res.json({ conversations });
  } catch (error) {
    console.error("[ERROR]", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/send", async (req, res) => {
  try {
    const { user_id, platform, text } = req.body || {};

    if (!user_id || !platform || !text) {
      return res.status(400).json({
        ok: false,
        error: "user_id, platform, and text are required",
      });
    }

    await sendMessage(user_id, platform, text);
    const conversation = await appendConversation({
      user_id,
      message: "",
      reply: text,
    });

    res.json({ ok: true, conversation_id: conversation.id });
  } catch (error) {
    console.error("[ERROR]", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
