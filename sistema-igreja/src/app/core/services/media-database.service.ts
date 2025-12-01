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
  limit,
  increment
} from '@angular/fire/firestore';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MediaItem } from '../../shared/models';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable({
  providedIn: 'root',
})
export class MediaDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private cloudinaryService = inject(CloudinaryService);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
  private mediaCollection: CollectionReference<DocumentData>;

  // Tempo de retenção de mídias (em dias)
  private readonly RETENTION_DAYS = 30;

  constructor() {
    this.mediaCollection = collection(this.firestore, 'media');
  }

  /**
   * Faz upload de arquivo para Cloudinary e salva metadados no Firestore
   */
  async uploadMedia(
    file: File,
    metadata: Omit<MediaItem, 'id' | 'mediaUrl' | 'thumbnailUrl' | 'createdAt' | 'updatedAt' | 'fileSize'>
  ): Promise<string> {
    try {
      // 1. Upload do arquivo para Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadFile(file);

      // 2. Calcular data de expiração (30 dias a partir de agora)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // 3. Calcular duração para vídeos
      let duration: number | undefined;
      if (metadata.type === 'video' && cloudinaryResult.duration) {
        duration = Math.round(cloudinaryResult.duration);
      }

      // 4. Salvar metadados no Firestore
      // 4. Preparar dados para o Firestore (removendo undefined)
      const mediaData: any = {
        ...metadata,
        mediaUrl: cloudinaryResult.secure_url,
        thumbnailUrl: cloudinaryResult.thumbnail_url || cloudinaryResult.secure_url, // Fallback para imagem
        fileSize: cloudinaryResult.bytes,
        cloudinaryPublicId: cloudinaryResult.public_id,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      // Adicionar duração apenas se existir (Firestore não aceita undefined)
      if (duration) {
        mediaData.duration = duration;
      }

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
   * Incrementa curtidas de uma mídia
   */
  async likeMedia(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'media', id);
    await updateDoc(docRef, {
      likes: increment(1),
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Incrementa visualizações de uma mídia
   */
  async incrementViews(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'media', id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  }

  /**
   * Deleta mídia do Firestore
   * Nota: Arquivos do Cloudinary ficam lá (deletar requer backend)
   */
  async deleteMedia(id: string): Promise<void> {
    try {
      // Buscar dados da mídia
      const mediaDoc = await getDoc(doc(this.firestore, 'media', id));
      if (!mediaDoc.exists()) {
        throw new Error('Mídia não encontrada');
      }

      const mediaData = mediaDoc.data() as MediaItem;

      // Deletar documento do Firestore
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
