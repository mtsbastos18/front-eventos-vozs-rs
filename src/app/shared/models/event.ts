export interface EventModel {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  image_path?: string;
  participants_count?: number;
  slug?: string;
}
