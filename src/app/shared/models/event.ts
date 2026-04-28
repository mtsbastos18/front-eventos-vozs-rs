export interface EventModel {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  bannerUrl?: string;
  registeredCount?: number;
}
