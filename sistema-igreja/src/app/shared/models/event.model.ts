// Evento
export interface Event {
  id: string;
  churchId: string;
  name: string;
  description: string;
  date: Date;
  time: string; // HH:MM format
  location: string;
  category: string; // Culto, Reunião, Treinamento, Social, Missão, Outra
  capacity?: number; // Capacidade máxima
  registered?: number; // Pessoas registradas
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  responsible?: string; // Responsável pelo evento
  coordinator?: string; // Coordenador
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Resumo de eventos
export interface EventSummary {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
}

// Inscrição em evento
export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  registeredAt: Date;
  status: 'registered' | 'attended' | 'cancelled';
}
