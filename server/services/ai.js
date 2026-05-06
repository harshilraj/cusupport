import axios from "axios";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const MASTER_SYSTEM_PROMPT = `
You are a customer support automation assistant.
Your job is to reply helpfully, identify lead/customer details, and decide whether a human should follow up.

Return strict JSON only. No markdown. No prose outside JSON.

Required JSON shape:
{
  "reply": "customer-facing reply",
  "intent": "short intent label",
  "should_handoff": false,
  "extracted_data": {
    "name": null,
    "email": null,
    "phone": null
  },
  "update_fields": {
    "status": "NEW | WARM | HOT"
  }
}

Extract name, email, and phone when the customer provides them.
Set status to WARM for buying intent and HOT for repeated or urgent purchase intent.
`;

function parseJSONResponse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw error;
    }
    return JSON.parse(match[0]);
  }
}

export async function callAI(input) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await axios.post(
    OPENAI_URL,
    {
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: MASTER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      proxy: false,
      timeout: 30000,
    }
  );

  const content = response.data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseJSONResponse(content);
}
