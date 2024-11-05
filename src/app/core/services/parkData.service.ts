import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParkDataService {
  private descriptions: string[] = [
    'El Parque Nacional Yosemite, situado en las montañas de Sierra Nevada de California, es famoso por sus impresionantes acantilados de granito, cascadas, secuoyas gigantes y biodiversidad. Es un destino ideal para los amantes de la naturaleza y los aventureros.',
    'El Parque Central de Nueva York es un gran parque urbano en el corazón de Manhattan. Es un oasis verde que ofrece diversas actividades recreativas, lagos, senderos y una vibrante vida cultural, siendo un refugio tanto para residentes como para turistas.',
    'El Parque Nacional Torres del Paine, ubicado en la Patagonia chilena, es conocido por sus majestuosos picos de granito, lagos cristalinos y extensos glaciares. Es un paraíso para los excursionistas y fotógrafos que buscan paisajes impresionantes.'
  ];
  private names: string[] = [
    'Parque Nacional Yosemite',
    'Parque Central de Nueva York',
    'Parque Nacional Torres del Paine'
  ];
  private imageUrls: string[] = [
    'https://img.freepik.com/foto-gratis/parque-camino-madera-bancos_1137-254.jpg',
    'https://img.freepik.com/foto-gratis/parque-camino-madera-bancos_1137-254.jpg',
    'https://img.freepik.com/foto-gratis/parque-camino-madera-bancos_1137-254.jpg'
  ];
  private links: string[] = ['http://enlace1.com', 'http://enlace2.com', 'http://enlace3.com'];
  private currentIndex: number = 0;

  constructor() { }

  getNextData() {
    const data = {
      description: this.descriptions[this.currentIndex],
      name: this.names[this.currentIndex],
      imageUrl: this.imageUrls[this.currentIndex],
      link: this.links[this.currentIndex]
    };

    this.currentIndex = (this.currentIndex + 1) % this.descriptions.length;

    return data;
  }
}