export interface Event {
  id?: string;
  title: string;
  timeFrom: string;
  timeTo: string;
  park: string;
  date: number;
  month: number;
  year: number;
  description?: string;
  lng: number;
  lat: number;
}