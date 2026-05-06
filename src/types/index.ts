export interface PartnerState {
  name: string;
  thinking: number;
  feeling: number;
  together: boolean;
  lastUpdated: number;
}

export interface UserDoc {
  email: string;
  displayName: string;
  coupleId: string | null;
  createdAt: number;
}

export interface CoupleDoc {
  members: Record<string, true>;
  createdAt: number;
  partners: Record<string, PartnerState>;
  history?: Record<string, HistoryEntry>;
}

export interface HistoryEntry {
  partners: Record<string, { thinking: number; feeling: number }>;
  coupleNet: number;
  together: Record<string, boolean>;
  timestamp: number;
}

export interface InviteCodeDoc {
  coupleId: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  redeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: number;
}

export interface Suggestion {
  text: string;
  emoji: string;
  context: 'together' | 'apart' | 'both';
}
