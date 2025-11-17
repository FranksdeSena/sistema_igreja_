// ========== MURA DE MÍDIAS ==========
export interface MediaItem {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  type: 'photo' | 'video' | 'document';
  mediaUrl: string; // URL ou Base64 do arquivo
  thumbnailUrl?: string; // URL da miniatura
  fileSize: number; // em bytes
  duration?: number; // em segundos (para vídeos)
  category?: string; // Evento, Celebração, Teste, Outro
  uploadedBy: string; // ID ou nome de quem fez upload
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  likes?: number;
  comments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaStats {
  totalItems: number;
  totalPhotos: number;
  totalVideos: number;
  totalDocuments: number;
  totalViews: number;
  totalLikes: number;
}

export interface MediaGallery {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  items: MediaItem[];
  createdAt: Date;
  updatedAt: Date;
}
