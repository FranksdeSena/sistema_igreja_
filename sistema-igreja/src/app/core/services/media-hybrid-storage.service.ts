import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, merge, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { MediaStorageService } from './media-storage.service';
import { SupabaseMediaService } from './supabase-media.service';
import { SupabaseInitService } from './supabase-init.service';
import { MediaItem } from '../../shared/models';

/**
 * Serviço de Armazenamento Híbrido
 * Gerencia dados em IndexedDB (local) e Supabase (cloud)
 * Prioriza cloud quando disponível, fallback para local
 *
 * Fluxo:
 * 1. Upload local → IndexedDB
 * 2. Sincronizar com cloud → Supabase
 * 3. Cache cloud localmente
 * 4. Fallback offline-first
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
    private localStorageService: MediaStorageService,
    private supabaseMediaService: SupabaseMediaService,
    private supabaseInit: SupabaseInitService
  ) {
    // Monitora disponibilidade da cloud
    this.checkCloudAvailability();
  }

  /**
   * Verifica se Supabase está disponível
   */
  private checkCloudAvailability(): void {
    const isAvailable = this.supabaseInit.isInitialized();
    this.isCloudAvailableSubject.next(isAvailable);
    console.log(`☁️ Cloud disponível: ${isAvailable}`);
  }

  /**
   * Faz upload de mídia
   * 1. Salva em IndexedDB imediatamente
   * 2. Sincroniza com cloud em background
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
        status: this.isCloudAvailableSubject.value ? 'syncing' : 'published',
      };

      await this.localStorageService.saveMediaItem(newMedia);
      console.log(`✅ Mídia salva localmente: ${newMedia.id}`);

      // Sincroniza com cloud em background
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
    try {
      if (!this.isCloudAvailableSubject.value) {
        console.log('Cloud não disponível, pulando sincronização');
        return;
      }

      this.isSyncingSubject.next(true);
      console.log(`🔄 Sincronizando para cloud: ${mediaItem.id}`);

      // Upload do arquivo
      const cloudUrl = await this.supabaseMediaService.uploadMediaToCloud(mediaItem, this.churchId);

      // Salvar metadados
      await this.supabaseMediaService.saveMediaMetadata({
        ...mediaItem,
        mediaUrl: cloudUrl,
        status: 'published',
      });

      // Atualizar status localmente
      await this.localStorageService.updateMediaItem(mediaItem.id, {
        status: 'published',
        mediaUrl: cloudUrl,
        updatedAt: new Date(),
      });

      this.lastCloudSyncSubject.next(new Date());
      console.log(`✅ Sincronizado para cloud: ${mediaItem.id}`);
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      // Mantém status 'syncing' para retry posterior
    } finally {
      this.isSyncingSubject.next(false);
    }
  }

  /**
   * Obtém mídias publicadas
   * Prioriza dados da cloud, fallback para local
   */
  getPublishedMedia(): Observable<MediaItem[]> {
    if (this.isCloudAvailableSubject.value) {
      // Tenta cloud primeiro
      return this.supabaseMediaService.getPublishedMedia(this.churchId).pipe(
        tap((items) => {
          console.log(`☁️ ${items.length} mídias recuperadas da cloud`);
          // Cache localmente
          items.forEach((item) =>
            this.localStorageService
              .saveMediaItem(item)
              .catch((err) => console.warn('Erro ao cachear:', err))
          );
        }),
        catchError((error) => {
          console.warn('Erro ao buscar cloud, usando cache local:', error);
          return this.localStorageService.getMediaItems();
        })
      );
    } else {
      // Usa apenas local quando cloud não disponível
      return this.localStorageService.getMediaItems();
    }
  }

  /**
   * Incrementa views (sincroniza com cloud)
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

      // Sincroniza com cloud
      if (this.isCloudAvailableSubject.value) {
        await this.supabaseMediaService
          .incrementViews(mediaId)
          .catch((err) => console.warn('Erro ao sincronizar views:', err));
      }
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
    }
  }

  /**
   * Incrementa likes (sincroniza com cloud)
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

      // Sincroniza com cloud
      if (this.isCloudAvailableSubject.value) {
        await this.supabaseMediaService
          .incrementLikes(mediaId)
          .catch((err) => console.warn('Erro ao sincronizar likes:', err));
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  }

  /**
   * Deleta mídia (soft delete na cloud)
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // Deleta localmente
      await this.localStorageService.deleteMediaItem(mediaId);
      console.log(`🗑️ Mídia deletada localmente: ${mediaId}`);

      // Sincroniza com cloud
      if (this.isCloudAvailableSubject.value) {
        await this.supabaseMediaService
          .deleteMedia(mediaId)
          .catch((err) => console.warn('Erro ao sincronizar delete:', err));
      }
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

      // Sincroniza com cloud
      if (this.isCloudAvailableSubject.value) {
        // Aqui você pode chamar um método de update do Supabase
        console.log('Atualizando na cloud...');
      }
    } catch (error) {
      console.error('Erro ao atualizar mídia:', error);
      throw error;
    }
  }

  /**
   * Força sincronização manual de itens pendentes
   */
  async forceSyncPending(): Promise<void> {
    try {
      if (!this.isCloudAvailableSubject.value) {
        console.log('Cloud não disponível para sincronização');
        return;
      }

      this.isSyncingSubject.next(true);
      console.log('🔄 Sincronizando itens pendentes...');

      // Obtém todos os itens localmente
      const localItems = (await new Promise<MediaItem[]>((resolve) => {
        this.localStorageService.getMediaItems().subscribe((items) => {
          resolve(items);
        });
      })) as MediaItem[];

      // Sincroniza apenas os pendentes
      const pendingItems = localItems.filter((item) => item.status === 'syncing');

      for (const item of pendingItems) {
        await this.syncToCloud(item);
      }

      console.log(`✅ ${pendingItems.length} itens sincronizados`);
    } catch (error) {
      console.error('Erro na sincronização forçada:', error);
    } finally {
      this.isSyncingSubject.next(false);
    }
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
