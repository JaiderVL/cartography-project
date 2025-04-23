// place-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PlaceService } from '../../../core/services/place.service';
import { Place } from '../../../core/models/place.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.css'],
})
export class PlaceCardComponent implements OnInit {
  @Input() markerId!: string;
  public place$!: Observable<Place>;
  public modalImage: string | null = null;

  constructor(private placeService: PlaceService) {}

  ngOnInit() {
    if (this.markerId) {
      this.place$ = this.placeService.getPlaceById(this.markerId);
    } else {
      console.error('No se proporcionó markerId al PlaceCardComponent');
    }
  }

  // Método para mostrar la imagen en el modal
  showImageInModal(imageSrc: string) {
    this.modalImage = imageSrc;
  }

  // Método para cerrar el modal
  closeModal() {
    this.modalImage = null;
  }
  
  getDirections(lat: number, lng: number) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Crear enlaces para Google Maps y Waze
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}`;
        const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;

        // Redirigir a Google Maps o Waze
        window.open(googleMapsUrl, '_blank');  // O usa `wazeUrl` si prefieres redirigir a Waze
      });
    } else {
      alert('No se pudo obtener la ubicación del usuario');
    }
  }
}