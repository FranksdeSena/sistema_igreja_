export interface Ministry {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  volunteerIds: string[]; // IDs dos membros voluntários
  category: string; // Ex: "Louvor", "Mídia", "Infantil", "Intercessão"
  meetingDay?: string;
  meetingTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSchedule {
  id: string;
  ministryId: string;
  ministryName: string;
  date: string;
  eventId?: string; // Opcional: vincular a um evento
  volunteerIds: string[]; // Voluntários escalados
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
