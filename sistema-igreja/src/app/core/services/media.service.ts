import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MediaItem, MediaStats } from '../../shared/models';
import { MediaStorageService } from './media-storage.service';

/**
 * Serviço de Mídia com suporte a IndexedDB
 * Gerencia upload, listagem, busca e estatísticas de mídias
 * Integrado com armazenamento persistente para produção
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private mediaItemsSubject = new BehaviorSubject<MediaItem[]>([]);
  private mediaItems$ = this.mediaItemsSubject.asObservable();

  constructor(private storageService: MediaStorageService) {
    // Sincroniza mídias do armazenamento persistente com memória
    this.storageService.getMediaItems().subscribe((items) => {
      this.mediaItemsSubject.next(items);
    });
  }

  // ========== MÍDIAS ==========

  getMediaItems(): Observable<MediaItem[]> {
    return this.mediaItems$;
  }

  getMediaItemById(id: string): Observable<MediaItem | undefined> {
    return new Observable((observer) => {
      this.mediaItems$.subscribe((items) => {
        observer.next(items.find((item) => item.id === id));
        observer.complete();
      });
    });
  }

  getMediaByType(type: 'photo' | 'video' | 'document'): Observable<MediaItem[]> {
    return this.mediaItems$.pipe(
      map((items) => items.filter((item) => item.type === type && item.status === 'published'))
    );
  }

  getPublishedMedia(): Observable<MediaItem[]> {
    return this.mediaItems$.pipe(
      map((items) =>
        items
          .filter((item) => item.status === 'published')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
    );
  }

  uploadMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newMedia: MediaItem = {
      ...media,
      id: `media-${Date.now()}`,
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salva no IndexedDB de forma assincronizada
    this.storageService
      .saveMediaItem(newMedia)
      .then(() => {
        console.log(`Mídia salva com sucesso: ${newMedia.id}`);
      })
      .catch((error) => {
        console.error('Erro ao salvar mídia:', error);
      });
  }

  updateMedia(id: string, media: Partial<Omit<MediaItem, 'id' | 'createdAt'>>): void {
    // Atualiza no IndexedDB de forma assincronizada
    this.storageService
      .updateMediaItem(id, media)
      .then(() => {
        console.log(`Mídia atualizada: ${id}`);
      })
      .catch((error) => {
        console.error('Erro ao atualizar mídia:', error);
      });
  }

  deleteMedia(id: string): void {
    // Deleta do IndexedDB de forma assincronizada
    this.storageService
      .deleteMediaItem(id)
      .then(() => {
        console.log(`Mídia deletada: ${id}`);
      })
      .catch((error) => {
        console.error('Erro ao deletar mídia:', error);
      });
  }

  publishMedia(id: string): void {
    this.updateMedia(id, { status: 'published' });
  }

  archiveMedia(id: string): void {
    this.updateMedia(id, { status: 'archived' });
  }

  incrementViews(id: string): void {
    this.mediaItems$.subscribe((items) => {
      const item = items.find((m) => m.id === id);
      if (item && item.views !== undefined) {
        this.updateMedia(id, { views: item.views + 1 });
      }
    });
  }

  likeMedia(id: string): void {
    this.mediaItems$.subscribe((items) => {
      const item = items.find((m) => m.id === id);
      if (item && item.likes !== undefined) {
        this.updateMedia(id, { likes: item.likes + 1 });
      }
    });
  }

  searchMedia(query: string): Observable<MediaItem[]> {
    return new Observable((observer) => {
      this.mediaItems$.subscribe((items) => {
        const filtered = items.filter(
          (item) =>
            (item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description?.toLowerCase().includes(query.toLowerCase()) ||
              item.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))) &&
            item.status === 'published'
        );
        observer.next(filtered);
      });
    });
  }

  getMediaStats(): Observable<MediaStats> {
    return this.mediaItems$.pipe(
      map((items) => {
        const published = items.filter((item) => item.status === 'published');
        return {
          totalItems: published.length,
          totalPhotos: published.filter((item) => item.type === 'photo').length,
          totalVideos: published.filter((item) => item.type === 'video').length,
          totalDocuments: published.filter((item) => item.type === 'document').length,
          totalViews: published.reduce((sum, item) => sum + (item.views || 0), 0),
          totalLikes: published.reduce((sum, item) => sum + (item.likes || 0), 0),
        };
      })
    );
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  generateThumbnail(file: File, type: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (type === 'photo') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(undefined);
      }
    });
  }

  getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration));
      };
      video.src = URL.createObjectURL(file);
    });
  }
}
