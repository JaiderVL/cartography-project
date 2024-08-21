import { Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor {
  color: string;
  marker: Marker;
}

interface PlainMarker {
  color: string;
  lnglat: number[];
}

@Component({
  templateUrl: './marker-page.component.html',
  styleUrl: './marker-page.component.css'
})
export class MarkerPageComponent {
  @ViewChild('map') divMap?: ElementRef;

  public markers: MarkerAndColor[] = [];

  public currentZoom: number = 13;
  public map?: Map;
  public currentPosition: LngLat = new LngLat(-74.3740312, 4.3391638);

  ngAfterViewInit(): void {
    if (!this.divMap) throw 'El elemento HTML no fue encontrado';

    this.map = new Map({
      container: this.divMap.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.currentPosition, // starting position [lng, lat]
      zoom: this.currentZoom, // starting zoom
    });

    this.readFromLocalStorage();
    /*
        const markerHtml = document.createElement('div');
        markerHtml.innerHTML = 
    
        const marker = new Marker({
          color: '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16))
        })
          .setLngLat(this.currentPosition)
          .addTo(this.map);
          */
  }

  createMarker() {
    if (!this.map) return;

    const color = '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16));
    const lnglat = this.map.getCenter();
    this.addMarker(lnglat, color)
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

  flyTo(marker: Marker) {
    this.map?.flyTo({
      zoom: 14,
      center: marker.getLngLat()
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
}
