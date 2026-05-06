import { DashboardClient } from "@/components/DashboardClient";
import { getConversations, getLeads } from "@/lib/data";

export default async function DashboardPage() {
  const [leads, conversations] = await Promise.all([
    getLeads(),
    getConversations()
  ]);

  return (
    <DashboardClient
      initialConversations={conversations}
      initialLeads={leads}
    />
  );
}
