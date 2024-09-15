import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Event } from '../models/event.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return collectionData(this.eventsCollection, { idField: 'id' }) as Observable<Event[]>;
  }

  // Agregar un evento
  addEvent(event: Event): Observable<void> {
    return from(addDoc(this.eventsCollection, event)).pipe(
      map(() => {})
    );
  }

  // Actualizar un evento
  updateEvent(event: Event): Observable<void> {
    const eventDocRef = doc(this.firestore, `events/${event.id}`);
    return from(updateDoc(eventDocRef, { ...event })).pipe(
      map(() => {})
    );
  }

  // Eliminar un evento
  deleteEvent(eventId: string): Observable<void> {
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    return from(deleteDoc(eventDocRef)).pipe(
      map(() => {})
    );
  }
}
