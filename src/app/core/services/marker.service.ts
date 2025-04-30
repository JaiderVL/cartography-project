import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, addDoc, getDoc, CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
import { Marker } from '../models/marker.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private markersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.markersCollection = collection(this.firestore, 'markers');
  }

  // Método para agregar un nuevo marcador y devolver el ID generado por Firebase
  async addMarker(markerData: Marker): Promise<string> {
    try {
      // Inicializar ratings como un array vacío y averageRating como 0 al agregar un nuevo marcador
      const markerWithDefaults = {
        ...markerData,
        ratings: markerData.ratings || [],  // Inicializar ratings como array vacío
        averageRating: markerData.averageRating || 0,  // Inicializar averageRating como 0
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
  async rateMarker(markerId: string, rating: number): Promise<void> {
    const markerRef = doc(this.firestore, `markers/${markerId}`);
    const markerDoc = await getDoc(markerRef);

    if (markerDoc.exists()) {
      const markerData = markerDoc.data() as Marker;

      // Agregar la calificación al array de ratings
      const newRatings = [...markerData.ratings, rating];

      // Calcular el nuevo promedio
      const newAverage = newRatings.reduce((acc, curr) => acc + curr, 0) / newRatings.length;

      // Actualizar el marcador en Firestore
      await updateDoc(markerRef, {
        ratings: newRatings,
        averageRating: newAverage
      });

      console.log(`Marcador con ID ${markerId} calificado y promedio actualizado.`);
    }
  }
}
  



