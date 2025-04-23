import { Image } from "./imageMap.model";

// export interface Place {
//     src: string;
//     alt: string;
//     title: string;
//     description: string;
//     images: Image[];
    
// }

export interface Place {
    src: string;
    alt: string;
    title: string;
    description: string;
    images: Image[];
    lat: number;  // Agregado para latitud
    lng: number;  // Agregado para longitud
}
