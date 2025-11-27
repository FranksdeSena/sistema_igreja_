import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MediaStorageService } from './media-storage.service';
import { MediaItem } from '../../shared/models';

/**
 * Serviço de Armazenamento Híbrido
 * Gerencia dados em IndexedDB (local) e Cloud (Firebase - Futuro)
 * Atualmente operando em modo Local-First
 */
@Injectable({
  providedIn: 'root',
})
export class MediaHybridStorageService {
  private churchId = 'church-1'; // Usar do contexto da aplicação
  private isSyncingSubject = new BehaviorSubject<boolean>(false);
  public isSyncing$ = this.isSyncingSubject.asObservable();

  private lastCloudSyncSubject = new BehaviorSubject<Date | null>(null);
  public lastCloudSync$ = this.lastCloudSyncSubject.asObservable();

  private isCloudAvailableSubject = new BehaviorSubject<boolean>(false);
  public isCloudAvailable$ = this.isCloudAvailableSubject.asObservable();

  constructor(
    private localStorageService: MediaStorageService
  ) {
    // Monitora disponibilidade da cloud (Firebase)
    this.checkCloudAvailability();
  }

  /**
   * Verifica se Cloud está disponível
   */
  private checkCloudAvailability(): void {
    // TODO: Implementar verificação do Firebase Storage
    const isAvailable = false; // Temporariamente desabilitado até implementação do Firebase
    this.isCloudAvailableSubject.next(isAvailable);
    console.log(`☁️ Cloud disponível: ${isAvailable}`);
  }

  /**
   * Faz upload de mídia
   * 1. Salva em IndexedDB imediatamente
   * 2. Sincroniza com cloud em background (Futuro)
   */
  async uploadMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      // Salva localmente primeiro (immediate)
      const newMedia: MediaItem = {
        ...media,
        id: `media-${Date.now()}`,
        views: 0,
        likes: 0,
        comments: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published', // Como não tem cloud, já salva como publicado localmente
      };

      await this.localStorageService.saveMediaItem(newMedia);
      console.log(`✅ Mídia salva localmente: ${newMedia.id}`);

      // Sincroniza com cloud em background (Futuro)
      if (this.isCloudAvailableSubject.value) {
        this.syncToCloud(newMedia).catch((err) =>
          console.warn('Sincronização de fundo falhada:', err)
        );
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Sincroniza mídia com cloud
   * Envia arquivo para Storage e metadados para Database
   */
  private async syncToCloud(mediaItem: MediaItem): Promise<void> {
    // TODO: Implementar upload para Firebase Storage
    console.log('Sincronização com cloud pendente de implementação (Firebase)');
  }

  /**
   * Obtém mídias publicadas
   * Prioriza dados da cloud, fallback para local
   */
  getPublishedMedia(): Observable<MediaItem[]> {
    // Usa apenas local enquanto cloud não implementada
    return this.localStorageService.getMediaItems();
  }

  /**
   * Incrementa views
   */
  async incrementViews(mediaId: string): Promise<void> {
    try {
      // Atualiza localmente
      const item = await this.localStorageService.getMediaItem(mediaId);
      if (item) {
        await this.localStorageService.updateMediaItem(mediaId, {
          views: (item.views || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
    }
  }

  /**
   * Incrementa likes
   */
  async likeMedia(mediaId: string): Promise<void> {
    try {
      // Atualiza localmente
      const item = await this.localStorageService.getMediaItem(mediaId);
      if (item) {
        await this.localStorageService.updateMediaItem(mediaId, {
          likes: (item.likes || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  }

  /**
   * Deleta mídia
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // Deleta localmente
      await this.localStorageService.deleteMediaItem(mediaId);
      console.log(`🗑️ Mídia deletada localmente: ${mediaId}`);
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      throw error;
    }
  }

  /**
   * Atualiza mídia
   */
  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<void> {
    try {
      // Atualiza localmente
      await this.localStorageService.updateMediaItem(id, updates);
    } catch (error) {
      console.error('Erro ao atualizar mídia:', error);
      throw error;
    }
  }

  /**
   * Força sincronização manual de itens pendentes
   */
  async forceSyncPending(): Promise<void> {
     console.log('Sincronização forçada não disponível (Cloud offline)');
  }

  /**
   * Obtém status de sincronização
   */
  getSyncStatus(): {
    isSyncing: boolean;
    isCloudAvailable: boolean;
    lastSync: Date | null;
  } {
    return {
      isSyncing: this.isSyncingSubject.value,
      isCloudAvailable: this.isCloudAvailableSubject.value,
      lastSync: this.lastCloudSyncSubject.value,
    };
  }
}
