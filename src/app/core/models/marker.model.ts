export interface Marker {
  id: number;
  name: string;
  description: string; 
  lng: number;
  lat: number;
  color: string; 
  images: string[]; 
  coverImage: string;
  firebaseId?: string; 
}
