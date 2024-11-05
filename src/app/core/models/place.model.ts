import { Image } from "./imageMap.model";

export interface Place {
    src: string;
    alt: string;
    title: string;
    description: string;
    images: Image[];
    
}