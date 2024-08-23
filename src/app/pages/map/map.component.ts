import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LngLat, Map, Marker } from 'mapbox-gl';
import { ParkImageService } from '../../core/services/parkImage.service';
import { environment } from '../../../environments/environments';

import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = environment.mapbox_key;

interface MarkerAndColor {
  color: string;
  marker: Marker;
}

interface PlainMarker {
  color: string;
  lnglat: number[];
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  @ViewChild('map') divMap?: ElementRef;

  public markers: MarkerAndColor[] = [];

  public currentZoom: number = 13;
  public map?: Map;
  public currentPosition: LngLat = new LngLat(-74.3740312, 4.3391638);

  constructor(private route: ActivatedRoute,
    private parkImageService: ParkImageService,
  ) { }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe(params => {
      const lng = parseFloat(params['lng']);
      const lat = parseFloat(params['lat']);
      this.initializeMap();
      if (lng || lat) {
        this.addMarker(new LngLat(lng, lat), '#ff0000');
      } else {
        this.loadDefaultMarkers();
      }
    });
  }

  initializeMap() {
    if (!this.divMap) throw 'El elemento HTML no fue encontrado';

    this.map = new Map({
      container: this.divMap.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.36476117425241, 4.338275508822856],
      zoom: 13,
    });
  }

  createMarker() {
    if (!this.map) return;

    const lnglat = this.map.getCenter();
    this.addMarker(lnglat, this.generateRandomColor())
  }

  addMarker(lnglat: LngLat, color: string) {
    if (!this.map) return;

    const marker = new Marker({
      color: color,
      draggable: true
    }).setLngLat(lnglat)
      .addTo(this.map);
    this.markers.push({ color, marker });
    this.saveToLocalStorage()
    marker.on('dragend', () => this.saveToLocalStorage());
  }

  deleteMarker(index: number) {
    this.markers[index].marker.remove();
    this.markers.splice(index, 1);
  }

  flyToPosition(lng: number, lat: number) {
    const position = new LngLat(lng, lat);
    this.map?.flyTo({
      zoom: 14,
      center: position
    });
  }


  saveToLocalStorage() {
    const plainMarker: PlainMarker[] = this.markers.map(({ color, marker }) => {
      return {
        color,
        lnglat: marker.getLngLat().toArray()
      };
    });
    localStorage.setItem("plainMarkers", JSON.stringify(plainMarker));
  }

  readFromLocalStorage() {
    const plainMarkersString = localStorage.getItem("plainMarkers") ?? '[]';
    const plainMarkers: PlainMarker[] = JSON.parse(plainMarkersString);
    plainMarkers.forEach(({ color, lnglat }) => {
      const [lng, lat] = lnglat;
      const coordinates = new LngLat(lng, lat);
      this.addMarker(coordinates, color);
    })
  }

  loadDefaultMarkers() {
    this.parkImageService.getImages().forEach(image => {
      this.addMarker(new LngLat(image.lng, image.lat), this.generateRandomColor());
    })
  }

  generateRandomColor(): string {
    return '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16));
  }
}
