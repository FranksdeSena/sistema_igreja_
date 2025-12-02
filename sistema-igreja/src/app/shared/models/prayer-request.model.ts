export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  request: string;
  isApproved: boolean; // Moderação
  isPublic: boolean; // Exibir publicamente
  isPrayed: boolean; // Marcado como orado
  createdAt: string | Date;
  updatedAt: string | Date;
}
