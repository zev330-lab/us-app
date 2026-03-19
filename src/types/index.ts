export interface PartnerState {
  name: string;
  thinking: number;
  feeling: number;
  together: boolean;
  lastUpdated: number;
}

export interface CoupleData {
  partners: {
    zev: PartnerState;
    irit: PartnerState;
  };
  history: Record<string, HistoryEntry>;
}

export interface HistoryEntry {
  zev: { thinking: number; feeling: number };
  irit: { thinking: number; feeling: number };
  coupleNet: number;
  together: { zev: boolean; irit: boolean };
  timestamp: number;
}

export interface Suggestion {
  text: string;
  emoji: string;
  context: 'together' | 'apart' | 'both';
}

export interface SuggestionBucket {
  min: number;
  max: number;
  label: string;
  suggestions: Suggestion[];
}

export type PartnerId = 'zev' | 'irit';

export const PARTNER_MAP: Record<string, PartnerId> = {
  "zev330@gmail.com": "zev",
  "iritfeldmanpsyd@gmail.com": "irit"
};

export const COUPLE_ID = "zev-irit";

export const PARTNER_NAMES: Record<PartnerId, string> = {
  zev: "Zev",
  irit: "Irit"
};
