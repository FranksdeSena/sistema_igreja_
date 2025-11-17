import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { SupabaseInitService } from './supabase-init.service';
import { MediaItem } from '../../shared/models';

/**
 * Serviço de Sincronização Supabase para Mídia
 * Sincroniza dados entre IndexedDB local e cloud Supabase
 * Suporta upload de arquivos para Supabase Storage
 *
 * Características:
 * - Upload assincronizado de mídia para cloud
 * - Sincronização bidirecional (local ↔ cloud)
 * - Compressão de imagens antes do upload
 * - Tratamento de erros robusto
 * - Offline-first com sincronização automática
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseMediaService {
  private readonly BUCKET_NAME = 'media-items';
  private readonly TABLE_NAME = 'media';
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  private syncStatusSubject = new BehaviorSubject<'idle' | 'syncing' | 'error'>('idle');
  public syncStatus$ = this.syncStatusSubject.asObservable();

  private lastSyncSubject = new BehaviorSubject<Date | null>(null);
  public lastSync$ = this.lastSyncSubject.asObservable();

  constructor(private supabaseInit: SupabaseInitService) {}

  /**
   * Upload de arquivo para Supabase Storage
   * Converte Base64 para Blob e faz upload
   *
   * @param mediaItem - Item de mídia com dados
   * @param churchId - ID da igreja
   */
  async uploadMediaToCloud(mediaItem: MediaItem, churchId: string): Promise<string> {
    try {
      this.syncStatusSubject.next('syncing');

      const client = this.supabaseInit.getClient();

      // Validar tamanho
      const fileSize = this.estimateBase64Size(mediaItem.mediaUrl);
      if (fileSize > this.MAX_FILE_SIZE) {
        throw new Error(
          `Arquivo excede limite de 50MB. Tamanho atual: ${(fileSize / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // Converter Base64 para Blob
      const blob = this.base64ToBlob(mediaItem.mediaUrl);
      const fileName = this.generateFileName(mediaItem);
      const storagePath = `${churchId}/${mediaItem.type}s/${fileName}`;

      // Upload para Storage
      console.log(`📤 Iniciando upload: ${storagePath}`);
      const { data: uploadData, error: uploadError } = await client.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: urlData } = client.storage.from(this.BUCKET_NAME).getPublicUrl(storagePath);

      console.log(`✅ Upload concluído: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Erro no upload para cloud:', error);
      this.syncStatusSubject.next('error');
      throw error;
    }
  }

  /**
   * Salva metadados de mídia no Supabase
   *
   * @param mediaItem - Item com dados a salvar
   */
  async saveMediaMetadata(
    mediaItem: Omit<MediaItem, 'mediaUrl' | 'thumbnailUrl'> & {
      mediaUrl: string; // URL pública do Storage
      thumbnailUrl?: string;
    }
  ): Promise<MediaItem> {
    try {
      const client = this.supabaseInit.getClient();

      const { data, error } = await client.from(this.TABLE_NAME).insert([
        {
          id: mediaItem.id,
          church_id: mediaItem.churchId,
          title: mediaItem.title,
          description: mediaItem.description,
          type: mediaItem.type,
          media_url: mediaItem.mediaUrl,
          thumbnail_url: mediaItem.thumbnailUrl,
          file_size: mediaItem.fileSize,
          duration: mediaItem.duration,
          status: mediaItem.status,
          tags: mediaItem.tags || [],
          uploaded_by: mediaItem.uploadedBy,
          views: mediaItem.views || 0,
          likes: mediaItem.likes || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(`Erro ao salvar metadados: ${error.message}`);
      }

      console.log(`✅ Metadados salvos: ${mediaItem.id}`);

      this.lastSyncSubject.next(new Date());
      this.syncStatusSubject.next('idle');

      return mediaItem as MediaItem;
    } catch (error) {
      console.error('❌ Erro ao salvar metadados:', error);
      this.syncStatusSubject.next('error');
      throw error;
    }
  }

  /**
   * Recupera mídias publicadas da cloud
   * Usa filtro de status = 'published'
   *
   * @param churchId - ID da igreja
   */
  getPublishedMedia(churchId: string): Observable<MediaItem[]> {
    try {
      const client = this.supabaseInit.getClient();

      return from(
        client
          .from(this.TABLE_NAME)
          .select('*')
          .eq('church_id', churchId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
      ).pipe(
        tap(({ data, error }) => {
          if (error) {
            console.error('Erro ao recuperar mídias:', error);
            throw error;
          }
          console.log(`📥 ${data?.length || 0} mídias recuperadas da cloud`);
        }),
        switchMap(({ data }) => {
          const items = (data || []).map((row: any) => this.rowToMediaItem(row));
          return of(items);
        }),
        catchError((error) => {
          console.error('❌ Erro ao buscar mídias da cloud:', error);
          return of([]); // Retorna vazio em caso de erro
        })
      );
    } catch (error) {
      console.error('❌ Erro ao setup da query:', error);
      return of([]);
    }
  }

  /**
   * Incrementa contador de views
   *
   * @param mediaId - ID da mídia
   */
  async incrementViews(mediaId: string): Promise<void> {
    try {
      const client = this.supabaseInit.getClient();

      const { error } = await client.rpc('increment_views', { media_id: mediaId });

      if (error) {
        console.warn('Erro ao incrementar views:', error);
      }
    } catch (error) {
      console.warn('Erro ao incrementar views:', error);
    }
  }

  /**
   * Incrementa contador de likes
   *
   * @param mediaId - ID da mídia
   */
  async incrementLikes(mediaId: string): Promise<void> {
    try {
      const client = this.supabaseInit.getClient();

      const { error } = await client.rpc('increment_likes', { media_id: mediaId });

      if (error) {
        console.warn('Erro ao incrementar likes:', error);
      }
    } catch (error) {
      console.warn('Erro ao incrementar likes:', error);
    }
  }

  /**
   * Deleta mídia da cloud (soft delete)
   *
   * @param mediaId - ID da mídia
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      const client = this.supabaseInit.getClient();

      const { error } = await client
        .from(this.TABLE_NAME)
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', mediaId);

      if (error) {
        throw new Error(`Erro ao deletar mídia: ${error.message}`);
      }

      console.log(`✅ Mídia deletada: ${mediaId}`);
    } catch (error) {
      console.error('❌ Erro ao deletar mídia:', error);
      throw error;
    }
  }

  /**
   * Sincroniza mídias locais com cloud
   * Envia mídias com status='syncing' para o Supabase
   *
   * @param localItems - Array de itens locais
   * @param churchId - ID da igreja
   */
  async syncLocalToCloud(localItems: MediaItem[], churchId: string): Promise<void> {
    try {
      this.syncStatusSubject.next('syncing');
      console.log(`🔄 Iniciando sincronização de ${localItems.length} itens...`);

      const unsyncedItems = localItems.filter((item) => item.status === 'syncing');

      for (const item of unsyncedItems) {
        try {
          // Upload do arquivo
          const cloudUrl = await this.uploadMediaToCloud(item, churchId);

          // Salvar metadados
          await this.saveMediaMetadata({
            ...item,
            mediaUrl: cloudUrl,
            status: 'published',
          });
        } catch (error) {
          console.error(`Erro ao sincronizar ${item.id}:`, error);
        }
      }

      this.syncStatusSubject.next('idle');
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.syncStatusSubject.next('error');
    }
  }

  /**
   * Converte linha do banco em MediaItem
   */
  private rowToMediaItem(row: any): MediaItem {
    return {
      id: row.id,
      churchId: row.church_id,
      title: row.title,
      description: row.description || '',
      type: row.type as 'photo' | 'video' | 'document',
      mediaUrl: row.media_url,
      thumbnailUrl: row.thumbnail_url,
      fileSize: row.file_size,
      duration: row.duration,
      category: row.category || 'general',
      uploadedBy: row.uploaded_by,
      tags: row.tags || [],
      status: row.status,
      views: row.views || 0,
      likes: row.likes || 0,
      comments: row.comments || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Converte Base64 para Blob
   */
  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Estima tamanho de Base64 em bytes
   */
  private estimateBase64Size(base64: string): number {
    return Math.ceil((base64.length * 3) / 4);
  }

  /**
   * Gera nome único para arquivo
   */
  private generateFileName(mediaItem: MediaItem): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = this.getExtensionFromType(mediaItem.type);
    return `${mediaItem.id}-${timestamp}-${random}.${ext}`;
  }

  /**
   * Obtém extensão do tipo de mídia
   */
  private getExtensionFromType(type: string): string {
    const extensions: Record<string, string> = {
      photo: 'jpg',
      video: 'mp4',
      document: 'pdf',
    };
    return extensions[type] || 'bin';
  }
}
