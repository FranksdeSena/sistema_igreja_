import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MediaItem, MediaStats } from '../../shared/models';
import { MediaDatabaseService } from './media-database.service';

/**
 * Serviço de Mídia com suporte a Firebase Storage e Firestore
 * Gerencia upload, listagem, busca e estatísticas de mídias
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor(private databaseService: MediaDatabaseService) {}

  // ========== MÍDIAS ==========

  getMediaItems(): Observable<MediaItem[]> {
    return this.databaseService.getMedia();
  }

  getMediaItemById(id: string): Observable<MediaItem | undefined> {
    return this.databaseService.getMediaById(id);
  }

  getMediaByType(type: 'photo' | 'video' | 'document'): Observable<MediaItem[]> {
    return this.databaseService.getMedia().pipe(
      map((items) => items.filter((item) => item.type === type && item.status === 'published'))
    );
  }

  getPublishedMedia(): Observable<MediaItem[]> {
    return this.databaseService.getMedia().pipe(
      map((items) =>
        items
          .filter((item) => item.status === 'published')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
    );
  }

  /**
   * Upload de mídia com arquivo
   */
  async uploadMediaWithFile(
    file: File,
    metadata: Omit<MediaItem, 'id' | 'mediaUrl' | 'thumbnailUrl' | 'createdAt' | 'updatedAt' | 'fileSize'>
  ): Promise<string> {
    return this.databaseService.uploadMedia(file, metadata);
  }

  /**
   * Upload de mídia (compatibilidade com código antigo que usa Base64)
   * @deprecated Use uploadMediaWithFile para novos uploads
   */
  uploadMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): void {
    console.warn('uploadMedia com Base64 está deprecated. Use uploadMediaWithFile.');
    // Não implementado - código antigo deve ser migrado para uploadMediaWithFile
  }

  updateMedia(id: string, media: Partial<Omit<MediaItem, 'id' | 'createdAt'>>): void {
    this.databaseService.updateMedia(id, media);
  }

  deleteMedia(id: string): void {
    this.databaseService.deleteMedia(id);
  }

  publishMedia(id: string): void {
    this.updateMedia(id, { status: 'published' });
  }

  archiveMedia(id: string): void {
    this.updateMedia(id, { status: 'archived' });
  }

  incrementViews(id: string): void {
    this.getMediaItemById(id).subscribe((item) => {
      if (item && item.views !== undefined) {
        this.updateMedia(id, { views: item.views + 1 });
      }
    });
  }

  likeMedia(id: string): void {
    this.getMediaItemById(id).subscribe((item) => {
      if (item && item.likes !== undefined) {
        this.updateMedia(id, { likes: item.likes + 1 });
      }
    });
  }

  searchMedia(query: string): Observable<MediaItem[]> {
    return this.databaseService.getMedia().pipe(
      map((items) =>
        items.filter(
          (item) =>
            (item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description?.toLowerCase().includes(query.toLowerCase()) ||
              item.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))) &&
            item.status === 'published'
        )
      )
    );
  }

  getMediaStats(): Observable<MediaStats> {
    return this.databaseService.getMedia().pipe(
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

  // ========== UTILITÁRIOS ==========

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
