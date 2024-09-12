// place.service.ts
import { Injectable } from '@angular/core';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import { Place } from '../models/place.model';
import { Marker } from '../models/marker.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  constructor(private firestore: Firestore) {}

  getPlaceById(firebaseId: string): Observable<Place> {
    const markerDoc = doc(this.firestore, `markers/${firebaseId}`);
    return docData(markerDoc, { idField: 'firebaseId' }).pipe(
      map((marker: Marker) => ({
        src: marker.coverImage,
        alt: marker.name,
        title: marker.name,
        description: marker.description,
        images: marker.images.map((imgUrl, index) => ({
          src: imgUrl,
          alt: `Image ${index + 1}`,
        })),
        firebaseId: marker.firebaseId,
      }))
    );
  }
}
