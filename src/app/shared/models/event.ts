export interface EventModel {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  bannerUrl?: string;
  registeredCount?: number;
}
