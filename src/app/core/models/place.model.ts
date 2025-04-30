import { Image } from "./imageMap.model";

export interface Place {
    src: string;
    alt: string;
    title: string;
    description: string;
    images: Image[];
    lat: number;  // Agregado para latitud
    lng: number;  // Agregado para longitud
    firebaseId: string;  // Añadimos firebaseId al modelo Place
  }
  