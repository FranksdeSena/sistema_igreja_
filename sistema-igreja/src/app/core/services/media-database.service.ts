import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  CollectionReference,
  DocumentData,
  onSnapshot,
  Timestamp,
  limit
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MediaItem } from '../../shared/models';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class MediaDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
  private mediaCollection: CollectionReference<DocumentData>;

  // Tempo de retenção de mídias (em dias)
  private readonly RETENTION_DAYS = 30;

  constructor() {
    this.mediaCollection = collection(this.firestore, 'media');
  }

  /**
   * Faz upload de arquivo para Firebase Storage e salva metadados no Firestore
   */
  async uploadMedia(
    file: File,
    metadata: Omit<MediaItem, 'id' | 'mediaUrl' | 'thumbnailUrl' | 'createdAt' | 'updatedAt' | 'fileSize'>
  ): Promise<string> {
    try {
      // 1. Upload do arquivo para Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(this.storage, `media/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Gerar thumbnail se for imagem ou vídeo
      let thumbnailURL: string | undefined;
      if (metadata.type === 'photo' || metadata.type === 'video') {
        const thumbnailFile = await this.generateThumbnailFile(file, metadata.type);
        if (thumbnailFile) {
          const thumbnailRef = ref(this.storage, `media/thumbnails/${timestamp}_thumb_${file.name}`);
          const thumbResult = await uploadBytes(thumbnailRef, thumbnailFile);
          thumbnailURL = await getDownloadURL(thumbResult.ref);
        }
      }

      // 3. Calcular data de expiração (30 dias a partir de agora)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // 4. Salvar metadados no Firestore
      const mediaData = {
        ...metadata,
        mediaUrl: downloadURL,
        thumbnailUrl: thumbnailURL,
        fileSize: file.size,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      const docRef = await addDoc(this.mediaCollection, mediaData);

      // 5. Log de auditoria
      this.logAuditAction('CREATE', docRef.id, metadata.title, `Nova mídia enviada: ${metadata.title}`);

      return docRef.id;
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      throw error;
    }
  }

  /**
   * Lista todas as mídias em tempo real
   */
  getMedia(): Observable<MediaItem[]> {
    return new Observable<MediaItem[]>(observer => {
      const q = query(this.mediaCollection, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const media = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate() || new Date(),
              updatedAt: data['updatedAt']?.toDate() || new Date()
            } as MediaItem;
          });
          observer.next(media);
        },
        (error) => {
          console.error('Erro ao buscar mídias:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar mídias:', error);
        return of<MediaItem[]>([]);
      })
    );
  }

  /**
   * Lista mídias publicadas dos últimos X dias
   */
  getRecentMedia(days: number = 30): Observable<MediaItem[]> {
    return new Observable<MediaItem[]>(observer => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        this.mediaCollection,
        where('status', '==', 'published'),
        where('createdAt', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const media = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate() || new Date(),
              updatedAt: data['updatedAt']?.toDate() || new Date()
            } as MediaItem;
          });
          observer.next(media);
        },
        (error) => {
          console.error('Erro ao buscar mídias recentes:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<MediaItem[]>([]))
    );
  }

  /**
   * Obtém mídia por ID
   */
  getMediaById(id: string): Observable<MediaItem | undefined> {
    const docRef = doc(this.firestore, 'media', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as MediaItem;
        }
        return undefined;
      })
    );
  }

  /**
   * Atualiza metadados de mídia
   */
  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<void> {
    const docRef = doc(this.firestore, 'media', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    // Remove campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    );

    await updateDoc(docRef, updateData);

    this.logAuditAction('UPDATE', id, updates.title || 'Mídia', `Mídia atualizada: ${updates.title || id}`);
  }

  /**
   * Deleta mídia (arquivo do Storage + documento do Firestore)
   */
  async deleteMedia(id: string): Promise<void> {
    try {
      // 1. Buscar dados da mídia
      const mediaDoc = await getDoc(doc(this.firestore, 'media', id));
      if (!mediaDoc.exists()) {
        throw new Error('Mídia não encontrada');
      }

      const mediaData = mediaDoc.data() as MediaItem;

      // 2. Deletar arquivo do Storage
      if (mediaData.mediaUrl) {
        try {
          const fileRef = ref(this.storage, mediaData.mediaUrl);
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('Erro ao deletar arquivo do Storage:', error);
        }
      }

      // 3. Deletar thumbnail do Storage
      if (mediaData.thumbnailUrl) {
        try {
          const thumbRef = ref(this.storage, mediaData.thumbnailUrl);
          await deleteObject(thumbRef);
        } catch (error) {
          console.warn('Erro ao deletar thumbnail do Storage:', error);
        }
      }

      // 4. Deletar documento do Firestore
      await deleteDoc(doc(this.firestore, 'media', id));

      this.logAuditAction('DELETE', id, mediaData.title, `Mídia deletada: ${mediaData.title}`);
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      throw error;
    }
  }

  /**
   * Remove mídias expiradas (mais antigas que RETENTION_DAYS)
   */
  async deleteExpiredMedia(): Promise<number> {
    try {
      const now = Timestamp.now();
      const q = query(
        this.mediaCollection,
        where('expiresAt', '<=', now)
      );

      const snapshot = await getDocs(q);
      let deletedCount = 0;

      for (const docSnap of snapshot.docs) {
        try {
          await this.deleteMedia(docSnap.id);
          deletedCount++;
        } catch (error) {
          console.error(`Erro ao deletar mídia expirada ${docSnap.id}:`, error);
        }
      }

      console.log(`Limpeza automática: ${deletedCount} mídias expiradas removidas`);
      return deletedCount;
    } catch (error) {
      console.error('Erro na limpeza automática de mídias:', error);
      return 0;
    }
  }

  /**
   * Agenda limpeza automática periódica
   */
  scheduleAutoCleanup(intervalDays: number = 30): void {
    // Executar limpeza imediatamente
    this.deleteExpiredMedia();

    // Agendar limpeza periódica
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
    setInterval(() => {
      this.deleteExpiredMedia();
    }, intervalMs);

    console.log(`Limpeza automática agendada a cada ${intervalDays} dias`);
  }

  /**
   * Gera arquivo de thumbnail a partir de imagem ou vídeo
   */
  private async generateThumbnailFile(file: File, type: string): Promise<File | null> {
    return new Promise((resolve) => {
      if (type === 'photo') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' }));
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.7);
        };
        img.src = URL.createObjectURL(file);
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.onloadeddata = () => {
          video.currentTime = 1; // Captura frame em 1 segundo
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = (video.videoHeight / video.videoWidth) * 300;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' }));
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.7);
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Log de auditoria
   */
  private logAuditAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityId: string,
    entityName: string,
    description: string
  ): void {
    firstValueFrom(this.authService.currentUser$)
      .then(currentUser => {
        if (currentUser) {
          this.auditService.logAction({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            action,
            module: 'media',
            entityId,
            entityName,
            description
          });
        }
      })
      .catch(error => {
        console.error('Erro ao registrar log de auditoria:', error);
      });
  }
}
