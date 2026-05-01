export interface Participant {
  id?: number;
  event_id: number;
  name: string;
  email: string;
  document: string;
  phone: string;
  created_at?: string;
}
