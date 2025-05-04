import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    constructor(private storage: Storage) {}

    async uploadFile(file: File, path: string): Promise<string> {
        const storageRef = ref(this.storage, path);
        const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
    }
}