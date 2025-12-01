export interface PastorWord {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Sermon {
  id: string;
  churchId?: string;
  title: string;
  series?: string;
  preacher?: string; // Usado no novo form
  pastor?: string;   // Usado no legacy form/service
  date: string | Date;
  scriptureReference?: string; // Usado no novo form
  biblicalText?: string;       // Usado no legacy form/service
  notes?: string;
  mediaUrl?: string; // Usado no novo form
  audioUrl?: string; // Usado no legacy form
  videoUrl?: string; // Usado no legacy form
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy?: string;
  duration?: number;
  summary?: string;
  topicCategory?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  attendance?: number;
}

export interface PastoralVisit {
  id: string;
  churchId: string;
  memberId: string;
  memberName: string;
  pastor: string;
  date: Date | string;
  time: string;
  visitType: string;
  subject: string;
  outcome: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  followUpNeeded: boolean;
  followUpDate?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
}

export interface PastoralSummary {
  totalSermons: number;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  totalAttendance: number;
  averageDuration: number;
}

export interface PastorDailyMessage {
  id: string;
  churchId: string;
  title: string;
  pastor: string;
  message: string;
  biblicalText: string;
  date: Date | string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
