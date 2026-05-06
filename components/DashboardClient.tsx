"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchConversations,
  fetchLeads,
  getSessionUserId,
  sendChatMessage,
  sendFollowUp
} from "@/lib/api";
import type { Conversation, Lead } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatusChip } from "@/components/StatusChip";

type DashboardClientProps = {
  initialLeads: Lead[];
  initialConversations: Conversation[];
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

function conversationsToMessages(items: Conversation[]): ChatMessage[] {
  return items.flatMap((conversation) => [
    {
      id: `${conversation.id}-user`,
      role: "user" as const,
      text: conversation.userMessage
    },
    {
      id: `${conversation.id}-ai`,
      role: "ai" as const,
      text: conversation.aiReply
    }
  ]);
}

export function DashboardClient({
  initialLeads
}: DashboardClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads ?? []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [userId, setUserId] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const refreshDashboard = useCallback(async (activeUserId = userId) => {
    if (!activeUserId) {
      return;
    }

    setIsRefreshing(true);

    try {
      const [nextLeads, nextConversations] = await Promise.all([
        fetchLeads(activeUserId),
        fetchConversations(activeUserId)
      ]);

      setLeads(Array.isArray(nextLeads) ? nextLeads : []);
      setConversations(
        Array.isArray(nextConversations) ? nextConversations : []
      );
      setChatMessages(
        conversationsToMessages(
          Array.isArray(nextConversations) ? nextConversations : []
        )
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [userId]);

  async function submitChatMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = chatInput.trim();

    if (!message || isChatSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message
    };

    setChatInput("");
    setChatMessages((currentMessages) => [...currentMessages, userMessage]);
    setIsChatSending(true);

    try {
      const activeUserId = userId || getSessionUserId();
      setUserId(activeUserId);
      const reply = await sendChatMessage(message, activeUserId);

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: reply
        }
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown API error";

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `ai-error-${Date.now()}`,
          role: "ai",
          text: errorMessage
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  }

  async function triggerFollowUp() {
    const activeUserId = userId || getSessionUserId();
    setUserId(activeUserId);
    setIsSending(true);

    try {
      await sendFollowUp(activeUserId);
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    const activeUserId = getSessionUserId();
    setUserId(activeUserId);
    refreshDashboard(activeUserId);
  }, [refreshDashboard]);

  const metrics = useMemo(() => {
    const converted = leads.filter((lead) => lead.converted).length;

    return [
      { label: "Total Leads", value: leads.length.toLocaleString() },
      { label: "Converted", value: converted.toLocaleString() },
      {
        label: "Active Conversations",
        value: conversations.length.toLocaleString()
      }
    ];
  }, [leads, conversations]);

  return (
    <main className="mx-auto max-w-[1280px] px-6">
      <section className="py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-normal text-text-secondary">
              Customer desk
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Support and lead management
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-text-secondary">
            A quiet operating view for lead quality, current conversations, and
            follow-up work.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <p className="text-sm text-text-secondary">{metric.label}</p>
              <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-text-primary">
                {metric.value}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section id="leads" className="scroll-mt-20 py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Leads
          </h2>
          <span className="text-sm text-text-secondary">{leads.length} total</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <Card key={lead.email}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    {lead.name}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">{lead.email}</p>
                  <p className="mt-1 text-sm text-text-secondary">{lead.phone}</p>
                </div>
                <StatusChip status={lead.status} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="conversations" className="scroll-mt-20 py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Conversations
          </h2>
          <span className="text-sm text-text-secondary">
            {conversations.length} active
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {conversations.map((conversation, index) => (
            <article
              key={conversation.id}
              className={`p-6 ${
                index < conversations.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="font-heading text-base font-bold tracking-tight">
                  {conversation.leadName}
                </p>
                <time className="font-mono text-xs text-text-secondary">
                  {conversation.timestamp}
                </time>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase text-text-secondary">
                    User message
                  </p>
                  <p className="text-sm leading-6 text-text-primary">
                    {conversation.userMessage}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase text-text-secondary">
                    AI reply
                  </p>
                  <p className="text-sm leading-6 text-text-primary">
                    {conversation.aiReply}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Live Chat
          </h2>
          <span className="font-mono text-xs text-text-secondary">
            {userId ? userId.slice(0, 8) : "loading"}
          </span>
        </div>

        <div className="flex min-h-[520px] flex-col rounded-xl border border-border bg-surface">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {chatMessages.map((message) => (
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                key={message.id}
              >
                <p
                  className={`max-w-[78%] rounded-xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-text-primary"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {isChatSending ? (
              <div className="flex justify-start">
                <p className="max-w-[78%] rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-secondary">
                  Thinking...
                </p>
              </div>
            ) : null}
          </div>

          <form
            className="flex gap-3 border-t border-border p-4"
            onSubmit={submitChatMessage}
          >
            <label className="sr-only" htmlFor="chat-message">
              Message
            </label>
            <input
              className="min-h-11 flex-1 rounded-md border border-border bg-surface px-4 text-sm text-text-primary transition duration-200 placeholder:text-text-secondary focus:outline-none focus:ring-[3px] focus:ring-primary/40"
              disabled={isChatSending}
              id="chat-message"
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type a message"
              value={chatInput}
            />
            <Button disabled={isChatSending || !chatInput.trim()} type="submit">
              Send
            </Button>
          </form>
        </div>
      </section>

      <section className="pb-16 pt-12">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Actions
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Queue outreach and refresh current lead data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              disabled={isSending}
              onClick={triggerFollowUp}
              variant="primary"
            >
              {isSending ? "Triggering..." : "Trigger Follow-up"}
            </Button>
            <Button
              disabled={isRefreshing}
              onClick={() => refreshDashboard()}
              variant="secondary"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
