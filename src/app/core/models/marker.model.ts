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

    ratings: number[]; // Array de calificaciones
    averageRating: number; // Promedio de las calificaciones
  }