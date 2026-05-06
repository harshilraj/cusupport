import {
  getConversations as getMockConversations,
  getLeads as getMockLeads,
  type Conversation,
  type Lead
} from "@/lib/data";

export const BASE_URL = "http://localhost:3001";
const USER_ID_KEY = "user_id";

type LeadsResponse = Lead[] | { data?: Lead[]; leads?: Lead[] };
type ConversationsResponse =
  | Conversation[]
  | { conversations?: Conversation[]; data?: Conversation[] };
type WebhookResponse =
  | string
  | {
      aiReply?: string;
      message?: string;
      reply?: string;
      response?: string;
      text?: string;
    };

type BackendConversation = Partial<Conversation> & {
  created_at?: string;
  message?: string;
  reply?: string;
  user_id?: string;
};

type BackendLead = Partial<Lead> & {
  id?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
    const data = (await res.json()) as T & { error?: string };
    console.log("API response:", data);

    if (!res.ok) {
      throw new Error(data.error ?? `Request failed: ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}

export function getSessionUserId(): string {
  const existingUserId = localStorage.getItem(USER_ID_KEY);

  if (existingUserId) {
    return existingUserId;
  }

  const userId = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, userId);

  return userId;
}

function normalizeLead(lead: BackendLead): Lead {
  const status = lead.status === "HOT" || lead.status === "WARM" ? lead.status : "COLD";

  return {
    converted: Boolean(lead.converted),
    email: lead.email ?? "Not provided",
    name: lead.name ?? lead.id ?? "Unknown lead",
    phone: lead.phone ?? "Not provided",
    status
  };
}

function normalizeConversation(conversation: BackendConversation): Conversation {
  return {
    aiReply: conversation.aiReply ?? conversation.reply ?? "",
    id: conversation.id ?? crypto.randomUUID(),
    leadName: conversation.leadName ?? conversation.user_id ?? "demo_user",
    timestamp:
      conversation.timestamp ?? conversation.created_at ?? new Date().toISOString(),
    userMessage: conversation.userMessage ?? conversation.message ?? ""
  };
}

export async function fetchLeads(userId: string): Promise<Lead[]> {
  try {
    const data = await request<LeadsResponse>(
      `/api/leads?user_id=${encodeURIComponent(userId)}`
    );

    if (Array.isArray(data)) {
      return data.map(normalizeLead);
    }

    return (data.leads ?? data.data)?.map(normalizeLead) ?? getMockLeads();
  } catch {
    return getMockLeads();
  }
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  try {
    const data = await request<ConversationsResponse>(
      `/api/conversations?user_id=${encodeURIComponent(userId)}`
    );

    if (Array.isArray(data)) {
      return data.map(normalizeConversation);
    }

    return (
      (data.conversations ?? data.data)?.map(normalizeConversation) ??
      getMockConversations()
    );
  } catch {
    return getMockConversations();
  }
}

export async function sendFollowUp(userId: string) {
  return request<{ ok: boolean; message?: string }>("/api/send", {
    body: JSON.stringify({
      platform: "web",
      text: "Follow-up requested from dashboard.",
      user_id: userId
    }),
    method: "POST"
  });
}

export async function sendChatMessage(
  message: string,
  userId: string
): Promise<string> {
  let data: WebhookResponse & { error?: string };

  try {
    const res = await fetch(`${BASE_URL}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        platform: "web"
      })
    });

    data = (await res.json()) as WebhookResponse & { error?: string };
    console.log("API response:", data);

    if (!res.ok) {
      throw new Error(
        typeof data === "object" && data.error
          ? data.error
          : `Request failed: ${res.status}`
      );
    }
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }

  if (typeof data === "string") {
    return data;
  }

  return (
    data.aiReply ??
    data.reply ??
    data.response ??
    data.message ??
    data.text ??
    "Message received."
  );
}
