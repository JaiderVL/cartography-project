import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParkImageService {
  getImages() {
    return [
      { link: '#link1', src: 'https://img.freepik.com/foto-gratis/parque-camino-madera-bancos_1137-254.jpg', alt: 'Imagen 1' },
      { link: '#link2', src: 'https://laredhispana.org/wp-content/uploads/2018/10/Mejorar-el-parque-de-tu-ciudad-859x639.jpg', alt: 'Imagen 2' },
      { link: '#link3', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 3' },
      { link: '#link4', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 4' },
      { link: '#link5', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 5' },
      { link: '#link6', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 6' }
    ];
  }
  constructor() { }

}
