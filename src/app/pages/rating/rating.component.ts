import { Component, Input, OnInit } from '@angular/core';
import { Marker } from '../../core/models/marker.model';
import { MarkerService } from '../../core/services/marker.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [
    CommonModule,FormsModule
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
  hasRated: boolean = false;  // Para saber si el usuario ya ha calificado
  ratingCardOpen: boolean = false;  // Controla la visibilidad de la tarjeta flotante
  userComment: string = '';  // Comentario del usuario

  constructor(
    private markerService: MarkerService,
    private authService: AuthService  
  ) {}

  ngOnInit(): void {
    this.stars = Array(this.maxRating).fill(0).map((_, index) => index + 1);  // Crear el array de 5 estrellas
    this.loadCurrentRating();
  }

  // Cargar la calificación actual y el promedio
  loadCurrentRating(): void {
    this.markerService.getMarkersRealtime().subscribe((markers: Marker[]) => {
      const marker = markers.find(m => m.firebaseId === this.markerId);
  
      if (marker) {
        this.ratings = marker.ratings;
        this.averageRating = marker.averageRating;
        this.currentRating = this.averageRating;
        // Verificamos si el usuario ya ha calificado
        const userId = this.authService.getCurrentUserId();  // Obtén el ID del usuario
        this.hasRated = marker.userRatings.some((rating) => rating.userId === userId);  // Si el usuario ya calificó
      }
    });
  }

  // Función para manejar la calificación del usuario
  ratePark(rating: number): void {
    this.currentRating = rating;  // Solo actualizamos el valor de currentRating
  }

  // Función para obtener la clase de la estrella seleccionada (para el promedio)
  getStarClass(index: number): string {
    return index < this.averageRating ? 'filled' : 'empty';  // Promedio
  }

  // Función para obtener la clase de la estrella seleccionada por el usuario
  getStarClassForUser(index: number): string {
    return index < this.currentRating ? 'filled' : 'empty';  // Estrellas interactivas para el usuario
  }

  // Abrir la tarjeta flotante de calificación
  openRatingCard(): void {
    this.ratingCardOpen = true;  // Abrimos la tarjeta flotante para calificar
  }

  // Función para enviar la calificación y el comentario
  submitRating(): void {
    if (this.currentRating > 0) {
      const userComment = this.userComment || '';  // Obtenemos el comentario, si lo hay

      this.markerService.rateMarker(this.markerId, this.currentRating, userComment).then(() => {
        this.ratingCardOpen = false;
        this.loadCurrentRating();
        this.hasRated = true;  // Aseguramos que se actualice el estado de hasRated
      });
    }
  }
  closeRatingCard(): void {
    this.ratingCardOpen = false;  // Cerramos la tarjeta flotante
  }

}