import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LngLat, Map } from 'mapbox-gl';

@Component({
  templateUrl: './zoom-range-page.component.html',
  styleUrl: './zoom-range-page.component.css'
})
export class ZoomRangePageComponent implements AfterViewInit, OnDestroy {

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

    this.mapListener();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  mapListener() {
    if (!this.map) throw 'Mapa no inicializado';

    this.map.on('zoom', (ev) => {
      this.currentZoom = this.map!.getZoom();
    });

    this.map.on('zoomstart', (ev) => {
      if (this.map!.getZoom() > 13) return;
      this.map!.zoomTo(13);
    });

    this.map.on('zoomend', (ev) => {
      if (this.map!.getZoom() < 16) return;
      this.map!.zoomTo(16);
    });

    this.map.on('move', () => {
      this.currentPosition = this.map!.getCenter();
    });
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  zoomChanged(value: string) {
    this.currentZoom = Number(value);
    this.map?.zoomTo(this.currentZoom);
  }
}

