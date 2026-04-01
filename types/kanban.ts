export type CardCategory = 'Urgent' | 'Information' | 'Promotional';
export type BoardSection = 'todo' | 'in_progress' | 'done';

export interface KanbanCard {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  category: CardCategory;
  next_action?: string;
  deadline?: string;
  ai_draft?: string;
  summary_bullets?: string; // JSON stringified array
  read_time?: string;
  board_section: BoardSection;
  created_at: string;
  updated_at: string;
}

export interface SummaryBullets {
  bullets: string[];
}

export interface CardPayload {
  sender_name: string;
  sender_email: string;
  subject: string;
  category: CardCategory;
  next_action?: string;
  deadline?: string;
  ai_draft?: string;
  summary_bullets?: SummaryBullets;
  read_time?: string;
}

export interface MoveCardPayload {
  id: string;
  board_section: BoardSection;
}

export interface UpdateCardPayload {
  id: string;
  ai_draft?: string;
}
