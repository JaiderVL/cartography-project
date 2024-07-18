import { Component, OnInit } from '@angular/core';
import { ParkDataService } from '../../core/services/parkData.service';
import { ParkImageService } from '../../core/services/parkImage.service'; // Verifica la ruta de importación
import { Image } from '../../core/models/image.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  description!: string;
  name!: string;
  imageUrl!: string;
  link!: string;
  images: Image[] = [];

  constructor(
    private parkDataService: ParkDataService,
    private parkImageService: ParkImageService // Inyecta el servicio
  ) { }

  ngOnInit(): void {
    this.updateContent();
    this.images = this.parkImageService.getImages(); // Obtén las imágenes del servicio

    setInterval(() => {
      this.updateContent();
    }, 10000); // 10000 ms = 10 segundos
  }

  updateContent() {
    const data = this.parkDataService.getNextData();
    this.description = data.description;
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.link = data.link;
  }
}