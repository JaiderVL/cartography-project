import { Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

@Component({
  templateUrl: './marker-page.component.html',
  styleUrl: './marker-page.component.css'
})
export class MarkerPageComponent {
  @ViewChild('map') divMap?: ElementRef;

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

    const market = new Marker({
      color: color,
      draggable: true
    }).setLngLat(lnglat)
      .addTo(this.map);
  }
}
