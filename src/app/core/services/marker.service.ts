import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, addDoc, getDoc, CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
import { Marker } from '../models/marker.model';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; 


@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private markersCollection: CollectionReference<DocumentData>;


  constructor(private firestore: Firestore, private authService: AuthService) {
    this.markersCollection = collection(this.firestore, 'markers');
  }

  // Método para agregar un nuevo marcador y devolver el ID generado por Firebase
  // Método para agregar un nuevo marcador y devolver el ID generado por Firebase
  async addMarker(markerData: Marker): Promise<string> {
    try {
      const markerWithDefaults = {
        ...markerData,
        ratings: markerData.ratings || [],
        userRatings: markerData.userRatings || [],  // Inicializamos userRatings
        comments: markerData.comments || [],  // Inicializamos comments
        averageRating: markerData.averageRating || 0,
      };

      const docRef = await addDoc(this.markersCollection, markerWithDefaults);
      console.log('Marcador guardado en Firebase con ID:', docRef.id);
      return docRef.id; // Devuelve el ID generado por Firebase
    } catch (error) {
      console.error('Error al guardar marcador en Firebase:', error);
      throw error;
    }
  }


  // Método para actualizar un marcador existente usando el ID generado por Firebase
  async updateMarker(firebaseId: string, lng: number, lat: number,  ratings: number[], averageRating: number) {
    try {
      // Usar el ID generado por Firebase para actualizar el documento
      const markerDocRef = doc(this.firestore, `markers/${firebaseId}`);
      await updateDoc(markerDocRef, { 
        lng, 
        lat,
        ratings, // Actualizar las calificaciones
        averageRating // Actualizar la calificación promedio
      });
      console.log(`Marcador con ID ${firebaseId} actualizado en Firebase`);
    } catch (error) {
      console.error('Error al actualizar marcador en Firebase:', error);
      throw error;
    }
  }

  // Método para obtener todos los marcadores en tiempo real
  getMarkersRealtime(): Observable<Marker[]> {
    return collectionData(this.markersCollection, { idField: 'firebaseId' }) as Observable<Marker[]>;
  }







  // Método para agregar una calificación a un marcador y actualizar el promedio
  async rateMarker(markerId: string, rating: number, comment: string): Promise<void> {
    const markerRef = doc(this.firestore, `markers/${markerId}`);
    const markerDoc = await getDoc(markerRef);
  
    if (markerDoc.exists()) {
      const markerData = markerDoc.data() as Marker;
  
      // Obtener el ID del usuario desde AuthService
      const userId = this.authService.getCurrentUserId();  // Aquí obtienes el ID del usuario
  
      if (!userId) {
        console.error('Usuario no autenticado');
        return;
      }
  
      // Verificar si el usuario ya ha calificado este marcador
      const existingRating = markerData.userRatings.find((userRating) => userRating.userId === userId);
  
      if (existingRating) {
        alert('Ya has calificado este parque.');
        return;  // Si ya calificó, no se permite volver a calificar
      }
  
      // Agregar la calificación y comentario al array de userRatings
      markerData.userRatings.push({ userId, rating });
      markerData.comments.push({ userId, comment });
  
      // Agregar la calificación al array de ratings (para el promedio)
      const newRatings = [...markerData.ratings, rating];
  
      // Calcular el nuevo promedio
      const newAverage = newRatings.reduce((acc, curr) => acc + curr, 0) / newRatings.length;
  
      // Actualizar el marcador en Firestore
      await updateDoc(markerRef, {
        ratings: newRatings,
        userRatings: markerData.userRatings,  // Actualizamos las calificaciones por usuario
        comments: markerData.comments,  // Guardamos los comentarios
        averageRating: newAverage
      });
  
      console.log(`Marcador con ID ${markerId} calificado y promedio actualizado.`);
    }
  }
  
}
  



