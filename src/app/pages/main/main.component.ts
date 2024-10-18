import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MarkerService } from '../../core/services/marker.service';
import { Marker } from '../../core/models/marker.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  description!: string;
  name!: string;
  imageUrl!: string;
  currentMarkerId!: string;
  images: { src: string; alt: string; lng: number; lat: number; markerId: string }[] = [];
  markers: Marker[] = [];
  currentMarkerIndex: number = 0;
  private markersSubscription!: Subscription;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private markerService: MarkerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.markersSubscription = this.markerService.getMarkersRealtime().subscribe(
      markers => {
        this.markers = markers;
        this.isLoading = false;
        if (this.markers.length > 0) {
          this.updateImages(); // Inicializar las imágenes una vez
          this.updateContent();
          // Actualizar el contenido cada 10 segundos
          setInterval(() => {
            this.updateContent();
          }, 5000);
        } else {
          this.errorMessage = 'No se encontraron marcadores.';
        }
      },
      error => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar marcadores.';
        console.error('Error al obtener marcadores:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.markersSubscription) {
      this.markersSubscription.unsubscribe();
    }
  }

  updateContent() {
    if (this.markers.length === 0) return;

    // Actualizar el marcador principal
    const marker = this.markers[this.currentMarkerIndex];
    this.description = marker.description;
    this.name = marker.name;
    this.imageUrl = marker.coverImage && marker.coverImage.trim() !== '' ? marker.coverImage : 'https://www.encoexpres.com.co/sites/default/files/portfolio-images/fusagasuga%20cundinamarca.jpg';
    this.currentMarkerId = marker.firebaseId || '';

    // Actualizar el índice del marcador principal para la siguiente vez
    this.currentMarkerIndex = (this.currentMarkerIndex + 1) % this.markers.length;
  }

  updateImages() {
    this.images = this.markers.slice(0, 6).map(marker => ({
      src: marker.coverImage && marker.coverImage.trim() !== '' ? marker.coverImage : 'https://www.encoexpres.com.co/sites/default/files/portfolio-images/fusagasuga%20cundinamarca.jpg',
      alt: marker.name,
      lng: marker.lng,
      lat: marker.lat,
      markerId: marker.firebaseId || ''
    }));
  }

  loadMap(image: any) {
    const markerId = image.markerId;
    if (markerId) {
      this.router.navigate(['/map'], { queryParams: { markerId } });
    } else {
      alert('No se pudo cargar el mapa para este marcador.');
    }
  }

  onImageError(event: any) {
    event.target.src = 'https://www.encoexpres.com.co/sites/default/files/portfolio-images/fusagasuga%20cundinamarca.jpg';
  }
}
