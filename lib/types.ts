// lib/types.ts — shared types for Affiliate Portal

export interface Notification {
  id: number;
  user_id: string | null;
  is_admin: boolean;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}
