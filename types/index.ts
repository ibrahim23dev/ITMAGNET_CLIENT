export type Role = 'admin' | 'agent' | 'customer';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export interface Ticket {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User | null;
  ticketNumber?: string;
  tags?: string[];
  isAIProcessed?: boolean;
  resolution?: string | null;
  attachments?: string[];
  closedAt?: string | null;
  aiMetadata?: {
    classification?: {
      suggestedTags?: string[];
    };
    similarTicketIds?: string[];
  };
}

export interface TicketListResponse {
  tickets: Ticket[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
}

export interface AiSuggestion {
  summary: string;
  reply: string;
  actions: string[];
  confidence: number;
  relatedTickets?: Ticket[];
}

export interface AnalyticsSnapshot {
  totalTickets: number;
  openTickets: number;
  highPriority: number;
  avgResolutionTime: string;
  topCategories: { category: string; count: number }[];
  riskTickets: { id: string; title: string; riskLevel: string }[];
}
