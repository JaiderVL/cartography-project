// event.model.ts
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
  markerId?: string; // Nuevo campo para el ID del marcador
}
