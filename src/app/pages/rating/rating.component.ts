import { Component, Input, OnInit } from '@angular/core';
import { Marker } from '../../core/models/marker.model';
import { MarkerService } from '../../core/services/marker.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {
  @Input() markerId!: string;  // ID del marcador/parque que estamos calificando
  currentRating: number = 0;  // Calificación seleccionada por el usuario
  maxRating: number = 5;  // Número máximo de estrellas (5 estrellas)
  stars: number[] = [];  // Array de estrellas (1 a 5)
  ratings: number[] = [];  // Array de calificaciones (obtendremos de Firestore)
  averageRating: number = 0;  // Promedio de las calificaciones

  constructor(private markerService: MarkerService) {}

  ngOnInit(): void {
    this.stars = Array(this.maxRating).fill(0).map((_, index) => index + 1);  // Crear el array de 5 estrellas
    this.loadCurrentRating();
  }

  // Cargar la calificación actual y el promedio
  loadCurrentRating(): void {
    this.markerService.getMarkersRealtime().subscribe((markers: Marker[]) => {
      const marker = markers.find(m => m.firebaseId === this.markerId);

      if (marker) {
        this.ratings = marker.ratings;  // Array de calificaciones del marcador
        this.averageRating = marker.averageRating;  // Promedio de calificación
        this.currentRating = this.averageRating;  // Mostrar el promedio como calificación inicial
      }
    });
  }

  // Función para manejar la calificación
  ratePark(rating: number): void {
    this.currentRating = rating;
    this.markerService.rateMarker(this.markerId, rating).then(() => {
      console.log('Calificación guardada en Firestore');
      this.loadCurrentRating();  // Actualizar el promedio después de calificar
    }).catch(error => {
      console.error('Error al guardar la calificación:', error);
    });
  }

  // Función para obtener la clase de la estrella seleccionada
  getStarClass(index: number): string {
    return index <= this.currentRating ? 'filled' : 'empty';
  }
}
