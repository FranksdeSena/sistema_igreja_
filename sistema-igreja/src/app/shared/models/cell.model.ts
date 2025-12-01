export interface Cell {
  id: string;
  name: string;
  leaderId: string; // ID do membro que é líder
  leaderName: string; // Desnormalizado para facilitar exibição
  memberIds: string[]; // IDs dos membros que fazem parte da célula
  host: string; // Anfitrião
  address: string;
  meetingDay: string; // Ex: "Quarta-feira"
  meetingTime: string; // Ex: "20:00"
  description?: string;
  createdAt: string;
  updatedAt: string;
}
