import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: 'image' | 'video' | 'raw';
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;
  private uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

  /**
   * Faz upload de arquivo (foto ou vídeo) para o Cloudinary
   */
  async uploadFile(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'igreja'); // Organiza em pasta

    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Erro no upload Cloudinary (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      
      // Gera URL do thumbnail para vídeos
      let thumbnailUrl: string | undefined;
      if (data.resource_type === 'video') {
        thumbnailUrl = `https://res.cloudinary.com/${this.cloudName}/video/upload/so_0/${data.public_id}.jpg`;
      }

      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        resource_type: data.resource_type,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        duration: data.duration,
        thumbnail_url: thumbnailUrl || data.secure_url
      };
    } catch (error) {
      console.error('Erro ao fazer upload para Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Deleta arquivo do Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    // Nota: Deletar requer autenticação do servidor
    // Por enquanto, vamos apenas marcar como arquivado no Firestore
    console.warn('Delete do Cloudinary requer backend. Arquivo será arquivado no Firestore.');
  }

  /**
   * Gera URL otimizada para thumbnail
   */
  getThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${width},h_${height}/${publicId}`;
  }

  /**
   * Gera URL otimizada para imagem
   */
  getOptimizedImageUrl(publicId: string, width?: number): string {
    const transformation = width ? `w_${width},c_scale,q_auto,f_auto` : 'q_auto,f_auto';
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * Gera URL para vídeo
   */
  getVideoUrl(publicId: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/${publicId}`;
  }
}
