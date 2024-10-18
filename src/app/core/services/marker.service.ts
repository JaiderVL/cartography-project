import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, addDoc, CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
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
      const docRef = await addDoc(this.markersCollection, markerData);
      console.log('Marcador guardado en Firebase con ID:', docRef.id);
      return docRef.id; // Devuelve el ID generado por Firebase
    } catch (error) {
      console.error('Error al guardar marcador en Firebase:', error);
      throw error;
    }
  }

  // Método para actualizar un marcador existente usando el ID generado por Firebase
  async updateMarker(firebaseId: string, lng: number, lat: number) {
    try {
      // Usar el ID generado por Firebase para actualizar el documento
      const markerDocRef = doc(this.firestore, `markers/${firebaseId}`);
      await updateDoc(markerDocRef, { lng, lat });
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
}