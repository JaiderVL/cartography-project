import mapboxgl from 'mapbox-gl';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LngLat, Map, Marker } from 'mapbox-gl';
import { MarkerService } from '../../core/services/marker.service';
import { environment } from '../../../environments/environment.prod';
import { PlaceCardComponent } from "./place-card/place-card.component";
import { Marker as MarkerModel } from '../../core/models/marker.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service'; // Importamos AuthService

mapboxgl.accessToken = environment.mapbox_key;

interface MarkerAndColor {
  id: number;
  color: string;
  marker: Marker;
  name: string;
  description: string;
  coverImage: string;
  images: string[];
  firebaseId?: string;
  dragListener?: () => void;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, PlaceCardComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('map') divMap!: ElementRef;

  public showCards = false;
  public isMapRoute = false;
  public selectedMarkerInfo: any = null;
  public selectedMarkerName: string = '';
  public selectedMarkerDescription: string = '';
  public selectedMarkerCoverImage: string = '';
  public selectedMarkerImages: string[] = [];

  public markers: MarkerAndColor[] = [];
  public markerId: number = 0;

  public currentZoom: number = 13;
  public map?: Map;
  public currentPosition: LngLat = new LngLat(-74.3740312, 4.3391638);
  private markersSubscription!: Subscription;

  public isEditMode: boolean = false;

  public selectedMarkerId: string = '';

  // Variables para manejar el markerId de los query params
  private markerIdFromParams: string | null = null;
  private queryParamsProcessed: boolean = false;
  private displayAllMarkers: boolean = true;
  public userRole: string | null = null; // Variable para almacenar el rol del usuario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private markerService: MarkerService,
    private authService: AuthService // Inyectamos AuthService para acceder al rol del usuario

  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ajuste en la condición para considerar parámetros de consulta
        this.isMapRoute = event.url.startsWith('/home/map');
      }
    });
  }

  ngOnInit(): void {

      // Suscribirse al rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.userRole = role; // Guardamos el rol actual del usuario
    });

    // Suscribirse a los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      this.markerIdFromParams = params['markerId'] || null;

      if (this.markerIdFromParams) {
        this.displayAllMarkers = false;
      } else {
        this.displayAllMarkers = true;
      }
    });
    
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap() {
    if (!this.divMap) {
      console.warn('¡Contenedor del mapa no encontrado!');
      return;
    }

    this.map = new Map({
      container: this.divMap.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.36476117425241, 4.338275508822856],
      zoom: 13,
    });

    this.map.on('load', () => {
      console.log('Mapa inicializado correctamente');

      // Escuchar cambios en Firestore en tiempo real
      this.listenToFirestoreChanges();
    });
  }

  listenToFirestoreChanges() {
    this.markersSubscription = this.markerService.getMarkersRealtime().subscribe((markersFromFirebase: MarkerModel[]) => {
      console.log('Cambios detectados en Firestore:', markersFromFirebase);

      // Actualizar localStorage con los datos más recientes
      localStorage.setItem('plainMarkers', JSON.stringify(markersFromFirebase));

      if (this.displayAllMarkers) {
        // Si se deben mostrar todos los marcadores
        this.updateMapMarkers(markersFromFirebase);

        // Si hay un markerId y no se ha procesado, resaltar el marcador
        if (this.markerIdFromParams && !this.queryParamsProcessed) {
          this.highlightMarkerById(this.markerIdFromParams);
          this.queryParamsProcessed = true;
        }
      } else {
        // Si solo se debe mostrar un marcador específico
        const markerToDisplay = markersFromFirebase.find(marker => marker.firebaseId === this.markerIdFromParams);
        if (markerToDisplay) {
          // Actualizar marcadores con solo el marcador seleccionado
          this.updateMapMarkers([markerToDisplay]);
          this.highlightMarkerById(this.markerIdFromParams!);
        } else {
          console.warn('No se encontró el marcador especificado.');
        }
        this.queryParamsProcessed = true;
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.markersSubscription) {
      this.markersSubscription.unsubscribe();
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    console.log(`Modo de edición: ${this.isEditMode ? 'Activado' : 'Desactivado'}`);

    // Actualizar todos los marcadores para que sean arrastrables o no según el modo de edición
    this.markers.forEach((markerObj) => {
      markerObj.marker.setDraggable(this.isEditMode);

      // Si el modo de edición está activado, añade el evento para actualizar la posición
      if (this.isEditMode) {
        markerObj.dragListener = () => this.confirmMarkerUpdate(markerObj.marker, markerObj.id);
        markerObj.marker.on('dragend', markerObj.dragListener);
      } else {
        // Si el modo de edición está desactivado, elimina el evento 'dragend'
        if (markerObj.dragListener) {
          markerObj.marker.off('dragend', markerObj.dragListener);
          markerObj.dragListener = undefined; // Limpia la referencia
        }
      }
    });
  }

  // async createMarker(lnglat?: LngLat) {
  //   if (!this.map) {
  //     console.error('El mapa no está inicializado');
  //     return;
  //   }

  //   // Activa el modo edición antes de crear el marcador
  //   if (!this.isEditMode) {
  //     this.isEditMode = true;
  //     this.toggleEditMode();
  //   }

  //   const position = lnglat || this.map.getCenter();
  //   const name = prompt('Por favor, ingresa un nombre para el nuevo marcador:');
  //   const description = prompt('Por favor, ingresa una descripción para el marcador:');

  //   // Puedes personalizar el color en el futuro
  //   const color = prompt('Por favor, ingresa un color para el marcador (en formato hexadecimal):', '#ff0000') || '#ff0000';

  //   // Solicita la URL de la imagen de portada
  //   const coverImage = prompt('Ingresa la URL de la imagen de portada para el marcador:', '') || '';

  //   // Suponemos que se solicitan 6 URLs de imágenes adicionales
  //   const images = Array(6).fill(null).map((_, index) =>
  //     prompt(`Ingresa la URL de la imagen ${index + 1} para el marcador (puede dejar vacío si no hay imagen):`, '') || ''
  //   ).filter(url => url); // Filtra cualquier URL vacía

  //   if (name && description) {
  //     this.markerId++;
  //     const id = this.markerId;

  //     const marker = new Marker({
  //       color: color,
  //       draggable: true // Siempre lo hacemos arrastrable al crear el marcador
  //     })
  //       .setLngLat(position)
  //       .addTo(this.map);

  //     // Guarda el objeto marcador con un dragListener undefined inicialmente
  //     const markerObj: MarkerAndColor = { id, color, marker, name, description, coverImage, images };

  //     // Añade el evento de actualización si el modo de edición está activado
  //     markerObj.dragListener = () => this.confirmMarkerUpdate(marker, id);
  //     marker.on('dragend', markerObj.dragListener);

  //     this.markers.push(markerObj);

  //     const markerData: MarkerModel = { id, name, description, lng: position.lng, lat: position.lat, color, coverImage, images };
  //     await this.saveMarkerToFirebaseAndLocalStorage(markerData, marker);

  //     // Añadir evento para mostrar el nombre al pasar el cursor
  //     this.addMarkerTooltip(marker, name);

  //     // Añadir evento de clic para mostrar la tarjeta de detalles
  //     marker.getElement().addEventListener('click', () => {
  //       this.onMarkerClick(markerObj);
  //     });
  //   }
  // }
  async createMarker(lnglat?: LngLat) {
    if (!this.map) {
      console.error('El mapa no está inicializado');
      return;
    }
  
    // Activa el modo edición antes de crear el marcador
    if (!this.isEditMode) {
      this.isEditMode = true;
      this.toggleEditMode();
    }
  
    const position = lnglat || this.map.getCenter();
    const name = prompt('Por favor, ingresa un nombre para el nuevo marcador:');
    const description = prompt('Por favor, ingresa una descripción para el marcador:');
    
    // Solicitar detalles del marcador
    const color = prompt('Por favor, ingresa un color para el marcador (en formato hexadecimal):', '#ff0000') || '#ff0000';
    const coverImage = prompt('Ingresa la URL de la imagen de portada para el marcador:', '') || '';
    
    const images = Array(6).fill(null).map((_, index) =>
      prompt(`Ingresa la URL de la imagen ${index + 1} para el marcador (puede dejar vacío si no hay imagen):`, '') || ''
    ).filter(url => url); // Filtra las URLs vacías
  
    if (name && description) {
      this.markerId++;
      const id = this.markerId;
  
      // Crear el marcador en el mapa
      const marker = new Marker({
        color: color,
        draggable: true
      })
      .setLngLat(position)
      .addTo(this.map);
  
      // Guarda el objeto marcador con un dragListener undefined inicialmente
      const markerObj: MarkerAndColor = { id, color, marker, name, description, coverImage, images };
      markerObj.dragListener = () => this.confirmMarkerUpdate(marker, id);
      marker.on('dragend', markerObj.dragListener);
  
      this.markers.push(markerObj);
  
      // Datos del marcador con ratings y averageRating
      const markerData: MarkerModel = {
        id, 
        name, 
        description, 
        lng: position.lng, 
        lat: position.lat, 
        color, 
        coverImage, 
        images,
        ratings: [], // Inicializamos el array de calificaciones vacío
        averageRating: 0, // Inicializamos la calificación promedio a 0
        userRatings:[],
        comments:[],
      };
  
      // Guardamos el marcador en Firebase y LocalStorage
      await this.saveMarkerToFirebaseAndLocalStorage(markerData, marker);
  
      // Añadir eventos para el marcador
      this.addMarkerTooltip(marker, name);
      marker.getElement().addEventListener('click', () => {
        this.onMarkerClick(markerObj);
      });
    }
  }
  

  // Añade el evento para mostrar un tooltip con el nombre del marcador
  addMarkerTooltip(marker: Marker, name: string) {
    const markerElement = marker.getElement();
    markerElement.title = name; // Usa el atributo `title` para mostrar el tooltip
  }

  onMarkerClick(markerObj: MarkerAndColor) {
    this.showCards = true;
    this.selectedMarkerInfo = markerObj.marker.getLngLat();
    this.selectedMarkerName = markerObj.name; // Almacena el nombre del marcador seleccionado
    this.selectedMarkerDescription = markerObj.description; // Almacena la descripción del marcador seleccionado
    this.selectedMarkerCoverImage = markerObj.coverImage; // Almacena la imagen de portada
    this.selectedMarkerImages = markerObj.images; // Almacena las imágenes adicionales del marcador seleccionado
    this.selectedMarkerId = markerObj.firebaseId || '';
    console.log('Se hizo clic en el marcador:', markerObj);

    // Mueve la vista al marcador seleccionado
    this.map?.flyTo({
      center: markerObj.marker.getLngLat(),
      zoom: 14,
    });
  }

  closePlaceCards() {
    this.showCards = false;
    this.selectedMarkerInfo = null;
    this.selectedMarkerName = ''; // Limpia el nombre del marcador seleccionado
    this.selectedMarkerId = '';
    this.selectedMarkerDescription = ''; // Limpia la descripción del marcador seleccionado
    this.selectedMarkerCoverImage = ''; // Limpia la imagen de portada seleccionada
    this.selectedMarkerImages = []; // Limpia las imágenes adicionales del marcador seleccionado
  }

  async saveMarkerToFirebaseAndLocalStorage(markerData: MarkerModel, marker: Marker) {
    try {
      console.log('Guardando nuevo marcador en Firebase:', markerData);

      // Guardar el marcador y obtener el ID de Firebase
      const firebaseId = await this.markerService.addMarker(markerData);
      markerData.firebaseId = firebaseId; // Guarda el ID de Firebase en el marcador

      // Actualizar el objeto markerObj con el firebaseId
      const markerObj = this.markers.find(m => m.id === markerData.id);
      if (markerObj) {
        markerObj.firebaseId = firebaseId;
      }

      // Añadir nuevo marcador a localStorage
      this.addMarkerToLocalStorage(markerData);
      console.log('Marcador guardado en localStorage:', markerData);

      // Evento para actualizar el marcador cuando se mueva
      marker.on('dragend', () => this.confirmMarkerUpdate(marker, markerData.id));
    } catch (error) {
      console.error('Error al guardar marcador:', error);
    }
  }

  addMarkerToLocalStorage(markerData: MarkerModel) {
    // Obtener marcadores existentes de localStorage
    const plainMarkersString = localStorage.getItem("plainMarkers") ?? '[]';
    const plainMarkers: MarkerModel[] = JSON.parse(plainMarkersString);

    // Añadir nuevo marcador al arreglo
    plainMarkers.push(markerData);

    // Guardar los marcadores actualizados en localStorage
    localStorage.setItem("plainMarkers", JSON.stringify(plainMarkers));
    console.log('Nuevo marcador agregado a localStorage:', markerData);
  }

  async confirmMarkerUpdate(marker: Marker, id: number) {
    const newLngLat = marker.getLngLat();
    console.log(`Marcador con ID ${id} movido a nueva posición:`, newLngLat);

    const confirmUpdate = window.confirm('¿Quieres actualizar la ubicación de este marcador?');

    if (confirmUpdate) {
      try {
        // Buscar el marcador en localStorage para obtener su firebaseId
        const plainMarkersString = localStorage.getItem("plainMarkers") ?? '[]';
        const plainMarkers: MarkerModel[] = JSON.parse(plainMarkersString);
        const markerToUpdate = plainMarkers.find(m => m.id === id);

        if (markerToUpdate && markerToUpdate.firebaseId) {
          // Obtener las calificaciones y el promedio del marcador
          const ratings = markerToUpdate.ratings || []; // Asegúrate de que ratings esté disponible
          const averageRating = markerToUpdate.averageRating || 0; // Asegúrate de que averageRating esté disponible
  
          // Actualiza el marcador en Firebase usando el firebaseId
          console.log(`Actualizando marcador con firebaseId ${markerToUpdate.firebaseId} en Firebase`);
          await this.markerService.updateMarker(markerToUpdate.firebaseId, newLngLat.lng, newLngLat.lat, ratings, averageRating);
  
          // Actualiza el marcador en localStorage
          this.updateMarkerInLocalStorage(id, newLngLat.lng, newLngLat.lat, markerToUpdate.firebaseId);
          console.log(`Marcador con ID ${id} actualizado en localStorage`);
        } else {
          console.error(`No se encontró el firebaseId para el marcador con ID ${id}`);
        }
      } catch (error) {
        console.error('Error al actualizar marcador:', error);
      }
    }
  }

  updateMarkerInLocalStorage(id: number, lng: number, lat: number, firebaseId?: string) {
    const plainMarkersString = localStorage.getItem("plainMarkers") ?? '[]';
    const plainMarkers: MarkerModel[] = JSON.parse(plainMarkersString);

    // Encuentra el marcador por su ID y actualiza las coordenadas y el firebaseId
    const markerIndex = plainMarkers.findIndex(marker => marker.id === id);
    if (markerIndex !== -1) {
      plainMarkers[markerIndex].lng = lng;
      plainMarkers[markerIndex].lat = lat;
      if (firebaseId) {
        plainMarkers[markerIndex].firebaseId = firebaseId;
      }
      console.log(`Marcador con ID ${id} encontrado y actualizado en localStorage:`, plainMarkers[markerIndex]);

      // Guarda los marcadores actualizados en localStorage
      localStorage.setItem("plainMarkers", JSON.stringify(plainMarkers));
    } else {
      console.warn(`Marcador con ID ${id} no encontrado en localStorage.`);
    }
  }

  updateMapMarkers(markersFromFirebase: MarkerModel[]) {
    // Limpiar marcadores existentes en el mapa
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = [];

    // Añadir nuevos marcadores del observable de Firebase
    markersFromFirebase.forEach(({ id, name, description, lng, lat, color, coverImage, images, firebaseId }) => {
      const coordinates = new LngLat(lng, lat);

      this.markerId = Math.max(this.markerId, id);

      if (this.map) {
        const marker = new Marker({
          color: color,
          draggable: this.isEditMode // Define si el marcador es arrastrable según el estado de edición
        })
          .setLngLat(coordinates)
          .addTo(this.map);

        const markerObj: MarkerAndColor = { id, color, marker, name, description, coverImage, images, firebaseId };

        this.markers.push(markerObj);

        // Solo añadir el evento si el modo de edición está activado
        if (this.isEditMode) {
          markerObj.dragListener = () => this.confirmMarkerUpdate(marker, id);
          marker.on('dragend', markerObj.dragListener);
        }

        // Añadir el tooltip con el nombre
        this.addMarkerTooltip(marker, name);

        // Añadir evento de clic para mostrar la tarjeta de detalles
        marker.getElement().addEventListener('click', () => {
          this.onMarkerClick(markerObj);
        });
      }
    });
  }

  // Método para resaltar el marcador por su ID
  highlightMarkerById(markerId: string) {
    const markerObj = this.markers.find(markerObj => markerObj.firebaseId === markerId);

    if (markerObj) {
      // Mostrar la tarjeta de información del marcador
      this.onMarkerClick(markerObj);

      // Centrar el mapa en el marcador
      this.map?.flyTo({
        center: markerObj.marker.getLngLat(),
        zoom: 14,
      });
    } else {
      console.warn('No se encontró un marcador con el ID proporcionado.');
    }
  }

  loadMarkersFromLocalStorage() {
    const plainMarkersString = localStorage.getItem("plainMarkers") ?? '[]';
    const plainMarkers: MarkerModel[] = JSON.parse(plainMarkersString);

    console.log('Cargando marcadores desde localStorage:', plainMarkers);

    plainMarkers.forEach(({ id, name, description, lng, lat, color, coverImage, images, firebaseId }) => {
      const coordinates = new LngLat(lng, lat);

      this.markerId = Math.max(this.markerId, id);

      if (this.map) {
        const marker = new Marker({
          color: color,
          draggable: this.isEditMode // Define si el marcador es arrastrable según el estado de edición
        })
          .setLngLat(coordinates)
          .addTo(this.map);

        const markerObj: MarkerAndColor = { id, color, marker, name, description, coverImage, images, firebaseId };

        this.markers.push(markerObj);

        // Solo añadir el evento si el modo de edición está activado
        if (this.isEditMode) {
          markerObj.dragListener = () => this.confirmMarkerUpdate(marker, id);
          marker.on('dragend', markerObj.dragListener);
        }

        // Añadir el tooltip con el nombre
        this.addMarkerTooltip(marker, name);

        // Añadir evento de clic para mostrar la tarjeta de detalles
        marker.getElement().addEventListener('click', () => {
          this.onMarkerClick(markerObj);
        });
      }
    });
  }
}