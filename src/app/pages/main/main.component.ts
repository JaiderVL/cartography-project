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
  description: string = '';
  name: string = '';
  imageUrl: string = '';
  currentMarkerId: string = '';
  images: { src: string; alt: string; lng: number; lat: number; markerId: string }[] = [];
  markers: Marker[] = [];
  currentMarkerIndex: number = 0;
  private markersSubscription!: Subscription;
  isLoading: boolean = true;
  errorMessage: string = '';
  defaultImageUrl: string = 'https://www.encoexpres.com.co/sites/default/files/portfolio-images/fusagasuga%20cundinamarca.jpg';
  private intervalId: any;

  constructor(
    private markerService: MarkerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMarkers();
  }

  ngOnDestroy(): void {
    if (this.markersSubscription) {
      this.markersSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private loadMarkers(): void {
    this.markersSubscription = this.markerService.getMarkersRealtime().subscribe({
      next: (markers) => {
        this.markers = markers;
        this.isLoading = false;
        
        if (this.markers.length > 0) {
          this.updateImages();
          this.updateContent();
          
          // Configurar rotación automática cada 5 segundos
          this.setupAutoRotation();
        } else {
          this.errorMessage = 'No se encontraron marcadores.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar marcadores. Por favor, intente más tarde.';
        console.error('Error al obtener marcadores:', error);
      }
    });
  }

  private setupAutoRotation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.updateContent();
    }, 5000);
  }

  updateContent(): void {
    if (this.markers.length === 0) return;

    const marker = this.markers[this.currentMarkerIndex];
    this.description = marker.description || 'Descripción no disponible';
    this.name = marker.name || 'Parque sin nombre';
    this.imageUrl = marker.coverImage?.trim() ? marker.coverImage : this.defaultImageUrl;
    this.currentMarkerId = marker.firebaseId || '';

    // Avanzar al siguiente marcador (circular)
    this.currentMarkerIndex = (this.currentMarkerIndex + 1) % this.markers.length;
  }

  updateImages(): void {
    // Mostrar hasta 6 marcadores en la galería
    const markersToShow = this.markers.slice(0, 6);
    
    this.images = markersToShow.map(marker => ({
      src: marker.coverImage?.trim() ? marker.coverImage : this.defaultImageUrl,
      alt: marker.name || 'Parque sin nombre',
      lng: marker.lng,
      lat: marker.lat,
      markerId: marker.firebaseId || ''
    }));

    // Si hay menos de 6 marcadores, completar con marcadores vacíos
    while (this.images.length < 6 && this.images.length > 0) {
      this.images.push({
        src: this.defaultImageUrl,
        alt: 'Próximamente',
        lng: 0,
        lat: 0,
        markerId: ''
      });
    }
  }

  loadMap(image: any): void {
    if (!image.markerId) {
      alert('Este parque no está disponible actualmente.');
      return;
    }
    
    this.router.navigate(['/home/map'], { 
      queryParams: { markerId: image.markerId },
      queryParamsHandling: 'merge'
    });
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImageUrl;
    event.target.classList.add('default-image');
  }



  scrollToContent() {
    const element = document.querySelector('.container-body-info');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}