import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Marker } from '../../core/models/marker.model';
import { FileUploadService } from '../../core/services/file-upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-create-marker-modal',
  templateUrl: './create-marker-modal.component.html',
  styleUrls: ['./create-marker-modal.component.css']
})
export class CreateMarkerModalComponent {
  @Input() isVisible = false;
  @Input() position: { lng: number; lat: number } = { lng: 0, lat: 0 };
  @Output() closeModal = new EventEmitter<void>();
  @Output() markerCreated = new EventEmitter<Marker>();

  markerData: Partial<Marker> = {
    name: '',
    description: '',
    color: '#ff0000',
    images: [],
    coverImage: '',
    ratings: [],
    userRatings: [],
    comments: [],
    averageRating: 0
  };

  coverImageFile: File | null = null;
  coverImagePreview: string | null = null;
  additionalImagesFiles: File[] = [];
  additionalImagesPreviews: string[] = [];
  isSubmitting = false;

  constructor(private fileUploadService: FileUploadService) {}

  close() {
    this.closeModal.emit();
  }

  onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.coverImageFile = input.files[0];
      this.previewImage(this.coverImageFile).then(preview => {
        this.coverImagePreview = preview;
      });
    }
  }

  onAdditionalImagesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.additionalImagesFiles = Array.from(input.files).slice(0, 6);
      this.additionalImagesPreviews = [];
      
      Promise.all(this.additionalImagesFiles.map(file => 
        this.previewImage(file)
      )).then(previews => {
        this.additionalImagesPreviews = previews;
      });
    }
  }

  private previewImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  async onSubmit() {
    if (!this.coverImageFile) {
      alert('Por favor, selecciona una imagen de portada');
      return;
    }

    this.isSubmitting = true;

    try {
      // Subir imagen de portada
      const coverImagePath = `markers/${Date.now()}_cover`;
      this.markerData.coverImage = await this.fileUploadService.uploadFile(
        this.coverImageFile, 
        coverImagePath
      );

      // Subir imágenes adicionales
      this.markerData.images = [];
      for (const [index, file] of this.additionalImagesFiles.entries()) {
        const path = `markers/${Date.now()}_${index}`;
        const url = await this.fileUploadService.uploadFile(file, path);
        this.markerData.images.push(url);
      }

      // Emitir el marcador creado
      this.markerCreated.emit({
        ...this.markerData,
        lng: this.position.lng,
        lat: this.position.lat,
        id: Date.now() // Temporal, se actualizará con el ID real de Firebase
      } as Marker);

      this.close();
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      alert('Error al crear el marcador. Por favor, intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }
}