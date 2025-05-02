// export interface Marker {
//     id: number;
//     name: string;
//     description: string; 
//     lng: number;
//     lat: number;
//     color: string; 
//     images: string[]; 
//     coverImage: string;
//     firebaseId?: string; 

//     ratings: number[]; // Array de calificaciones
//     averageRating: number; // Promedio de las calificaciones
//   }

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

  ratings: number[];  // Array de calificaciones (general)
  userRatings: { userId: string; rating: number }[];  // Calificaciones por usuario
  comments: { userId: string; comment: string }[];  // Comentarios por usuario
  averageRating: number;  // Promedio de las calificaciones
}
