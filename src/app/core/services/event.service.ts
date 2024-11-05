import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Event } from '../models/event.model';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventsCollection;

  constructor(private firestore: Firestore) {
    this.eventsCollection = collection(this.firestore, 'events');
  }

  // Obtener todos los eventos
  getEvents(): Observable<Event[]> {
    return collectionData(this.eventsCollection, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Error al obtener eventos', error);
        return of([]);
      })
    ) as Observable<Event[]>;
  }

  // Agregar un evento
  addEvent(event: Event): Observable<void> {
    return from(addDoc(this.eventsCollection, event)).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error al agregar evento', error);
        return of();
      })
    );
  }

  // Actualizar un evento
  updateEvent(event: Event): Observable<void> {
    const eventDocRef = doc(this.firestore, `events/${event.id}`);
    return from(updateDoc(eventDocRef, { ...event })).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error al actualizar evento', error);
        return of();
      })
    );
  }

  // Eliminar un evento
  deleteEvent(eventId: string): Observable<void> {
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    return from(deleteDoc(eventDocRef)).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error al eliminar evento', error);
        return of();
      })
    );
  }
}