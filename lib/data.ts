export type LeadStatus = "HOT" | "WARM" | "COLD";

export type Lead = {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  converted: boolean;
};

export type Conversation = {
  id: string;
  leadName: string;
  userMessage: string;
  aiReply: string;
  timestamp: string;
};

const leads: Lead[] = [
  {
    name: "Avery Rivers",
    email: "avery@northstar.io",
    phone: "+1 (415) 555-0194",
    status: "HOT",
    converted: true
  },
  {
    name: "Mina Patel",
    email: "mina@lumoscare.com",
    phone: "+1 (212) 555-0178",
    status: "WARM",
    converted: false
  },
  {
    name: "Jon Bell",
    email: "jon@clearpath.dev",
    phone: "+1 (312) 555-0182",
    status: "COLD",
    converted: false
  },
  {
    name: "Sofia Chen",
    email: "sofia@monarchhq.com",
    phone: "+1 (650) 555-0161",
    status: "HOT",
    converted: true
  },
  {
    name: "Theo Grant",
    email: "theo@fieldkit.co",
    phone: "+1 (646) 555-0147",
    status: "WARM",
    converted: false
  },
  {
    name: "Nora Ellis",
    email: "nora@harborops.com",
    phone: "+1 (206) 555-0136",
    status: "COLD",
    converted: false
  }
];

const conversations: Conversation[] = [
  {
    id: "conv_001",
    leadName: "Avery Rivers",
    userMessage: "Can we schedule a product walkthrough for the sales team?",
    aiReply:
      "Absolutely. I can share two availability windows and include a short agenda for the walkthrough.",
    timestamp: "09:42 AM"
  },
  {
    id: "conv_002",
    leadName: "Mina Patel",
    userMessage: "We need pricing for 25 support agents before Friday.",
    aiReply:
      "I can prepare a team pricing estimate and flag the timeline for a priority follow-up.",
    timestamp: "10:18 AM"
  },
  {
    id: "conv_003",
    leadName: "Theo Grant",
    userMessage: "Does the dashboard support importing leads from CSV?",
    aiReply:
      "Yes. CSV import is supported, and I can send the field mapping requirements next.",
    timestamp: "11:06 AM"
  }
];

export async function getLeads(): Promise<Lead[]> {
  return leads;
}

export async function getConversations(): Promise<Conversation[]> {
  return conversations;
}
