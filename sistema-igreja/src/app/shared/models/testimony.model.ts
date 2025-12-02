export interface Testimony {
  id: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  content: string;
  category?: string; // Ex: "Cura", "Salvação", "Provisão", "Família"
  isApproved: boolean; // Moderação
  isPublic: boolean; // Exibir no site público
  createdAt: string | Date;
  updatedAt: string | Date;
}
