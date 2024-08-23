import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParkImageService {
  getImages() {
    return [
      { link: '#link1', src: 'https://img.freepik.com/foto-gratis/parque-camino-madera-bancos_1137-254.jpg', alt: 'Imagen 1', lng: -74.37256106283085, lat: 4.336277215342071 },
      { link: '#link2', src: 'https://laredhispana.org/wp-content/uploads/2018/10/Mejorar-el-parque-de-tu-ciudad-859x639.jpg', alt: 'Imagen 2', lng: -74.37628964021381, lat: 4.339556193122362 },
      { link: '#link3', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 3', lng: -74.35850121876494, lat: 4.347379208743215 },
      { link: '#link4', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 4', lng: -74.36279944000312, lat: 4.343790442757266 },
      { link: '#link5', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 5', lng: -74.36940212925454, lat: 4.343222435064553 },
      { link: '#link6', src: 'https://via.placeholder.com/160x100', alt: 'Imagen 6', lng: -74.36888427121782, lat: 4.347534119137196 }
    ];
  }
  constructor() { }

}
