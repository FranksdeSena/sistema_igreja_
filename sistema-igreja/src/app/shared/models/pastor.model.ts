// Pregação/Sermão
export interface Sermon {
  id: string;
  churchId: string;
  title: string;
  pastor: string;
  biblicalText: string; // Ex: João 3:16
  date: Date;
  duration: number; // em minutos
  summary: string;
  topicCategory: string; // Salvação, Amor, Fé, Graça, Missão, Outro
  status: 'scheduled' | 'completed' | 'cancelled';
  audioUrl?: string;
  videoUrl?: string;
  attendance: number; // Número de pessoas que assistiram
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Visita Pastoral
export interface PastoralVisit {
  id: string;
  churchId: string;
  memberId: string;
  memberName: string;
  pastor: string;
  date: Date;
  time: string; // HH:MM format
  visitType: string; // Acompanhamento, Oração, Aconselhamento, Doença, Bem-vindo, Outro
  subject: string;
  outcome: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  followUpNeeded: boolean;
  followUpDate?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Resumo de Atividades Pastorais
export interface PastoralSummary {
  totalSermons: number;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  totalAttendance: number;
  averageDuration: number;
}

// Palavra do Pastor (Mensagem Diária)
export interface PastorDailyMessage {
  id: string;
  churchId: string;
  title: string;
  pastor: string;
  message: string;
  biblicalText?: string; // Ex: Salmos 23:1
  date: Date;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
