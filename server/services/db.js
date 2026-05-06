import { hasSupabaseConfig, supabase } from "./supabase.js";

const memory = {
  conversations: [],
  leads: new Map(),
};

function cleanEmptyValues(partial) {
  return Object.fromEntries(
    Object.entries(partial).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}

function shouldUseMemory(error) {
  if (!hasSupabaseConfig) {
    return true;
  }

  console.error("[DB][SUPABASE FALLBACK]", error);
  return true;
}

function memoryUser(user_id) {
  const lead = memory.leads.get(user_id) || null;
  console.log("[DB][MEMORY READ OK]", {
    found: Boolean(lead),
    table: "leads",
    user_id,
  });
  return lead;
}

function memoryUpsertUser(partial) {
  const previous = memory.leads.get(partial.id) || {};
  const lead = { ...previous, ...partial };
  memory.leads.set(partial.id, lead);
  console.log("[DB][MEMORY WRITE OK]", { id: lead.id, table: "leads" });
  return lead;
}

function memoryAppendConversation({ user_id, message, reply }) {
  const row = {
    id: crypto.randomUUID(),
    message,
    reply,
    timestamp: new Date().toISOString(),
    user_id,
  };
  memory.conversations.push(row);
  console.log("[DB][MEMORY WRITE OK]", {
    id: row.id,
    table: "conversations",
  });
  return row;
}

function memoryConversationHistory(user_id) {
  const history = memory.conversations
    .filter((conversation) => conversation.user_id === user_id)
    .slice(-15);
  console.log("[DB][MEMORY READ OK]", {
    count: history.length,
    table: "conversations",
    user_id,
  });
  return history;
}

function memoryLeads(user_id) {
  const leads = Array.from(memory.leads.values())
    .filter((lead) => !user_id || lead.id === user_id)
    .reverse();
  console.log("[DB][MEMORY READ OK]", { count: leads.length, table: "leads" });
  return leads;
}

function memoryConversations(user_id) {
  const conversations = [...memory.conversations]
    .filter((conversation) => !user_id || conversation.user_id === user_id)
    .reverse();
  console.log("[DB][MEMORY READ OK]", {
    count: conversations.length,
    table: "conversations",
    user_id,
  });
  return conversations;
}

export async function getUser(user_id) {
  console.log("[DB][READ START]", { table: "leads", user_id });

  if (!hasSupabaseConfig) {
    return memoryUser(user_id);
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data || null;
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryUser(user_id);
    }
    throw error;
  }
}

export async function upsertUser(partial) {
  const clean = cleanEmptyValues(partial);
  console.log("[DB][WRITE START]", { data: clean, table: "leads" });

  if (!hasSupabaseConfig) {
    return memoryUpsertUser(clean);
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .upsert(clean, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryUpsertUser(clean);
    }
    throw error;
  }
}

export async function appendConversation({ user_id, message, reply }) {
  if (!hasSupabaseConfig) {
    return memoryAppendConversation({ message, reply, user_id });
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ message, reply, user_id })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryAppendConversation({ message, reply, user_id });
    }
    throw error;
  }
}

export async function getConversationHistory(user_id) {
  if (!hasSupabaseConfig) {
    return memoryConversationHistory(user_id);
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user_id)
      .order("timestamp", { ascending: false })
      .limit(15);

    if (error) {
      throw error;
    }

    return (data || []).reverse();
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryConversationHistory(user_id);
    }
    throw error;
  }
}

export async function getLeads(user_id) {
  if (!hasSupabaseConfig) {
    return memoryLeads(user_id);
  }

  try {
    let query = supabase
      .from("leads")
      .select("id,name,email,phone,status,last_contacted,followup_count")
      .order("last_contacted", { ascending: false });

    if (user_id) {
      query = query.eq("id", user_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryLeads(user_id);
    }
    throw error;
  }
}

export async function getAllConversations(user_id) {
  if (!hasSupabaseConfig) {
    return memoryConversations(user_id);
  }

  try {
    let query = supabase
      .from("conversations")
      .select("*")
      .order("timestamp", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    if (shouldUseMemory(error)) {
      return memoryConversations(user_id);
    }
    throw error;
  }
}
