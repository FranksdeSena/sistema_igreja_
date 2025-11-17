// ========== DOCUMENTOS ==========
export interface Document {
  id: string;
  churchId: string;
  title: string;
  category: 'ata' | 'regulamento' | 'politica' | 'formulario' | 'outro';
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // em bytes
  uploadedBy: string;
  uploadDate: Date;
  lastModified: Date;
  version: number;
  status: 'ativo' | 'inativo' | 'arquivo';
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== COMUNICAÇÕES ==========
export interface Communication {
  id: string;
  churchId: string;
  type: 'email' | 'circular' | 'aviso' | 'boletim' | 'whatsapp';
  subject: string;
  recipient: 'todos' | 'pastores' | 'lideranca' | 'membros' | 'custom';
  recipientList?: string[]; // emails, telefones ou IDs
  phoneNumber?: string; // número de telefone para WhatsApp
  message: string;
  status: 'rascunho' | 'agendado' | 'enviado' | 'nao_enviado';
  sentDate?: Date;
  scheduledDate?: Date;
  sender: string;
  attachments?: string[]; // URLs
  readBy?: string[]; // IDs dos que leram
  responseCount: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== RELATÓRIOS ==========
export interface Report {
  id: string;
  churchId: string;
  title: string;
  type: 'financial' | 'attendance' | 'membership' | 'events' | 'pastoral' | 'custom';
  period: string; // ex: "Novembro 2025"
  startDate: Date;
  endDate: Date;
  generatedBy: string;
  generatedDate: Date;
  content: string;
  summary: {
    totalItems?: number;
    highlights?: string[];
    metrics?: Record<string, number>;
  };
  attachments?: string[]; // URLs
  status: 'rascunho' | 'finalizado' | 'enviado';
  recipients?: string[]; // IDs ou emails
  createdAt: Date;
  updatedAt: Date;
}

// ========== RESUMO SECRETARIA ==========
export interface SecretariaSummary {
  totalDocuments: number;
  totalCommunications: number;
  totalReports: number;
  pendingCommunications: number;
  recentDocuments: number; // últimos 30 dias
  draftReports: number;
}

// ========== INTEGRAÇÃO COM MEMBROS ==========
export interface MemberCommunicationData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: string;
  cellId?: string;
}

export interface CommunicationRecipientFilter {
  type: 'all' | 'leaders' | 'members' | 'cell' | 'role' | 'custom';
  cellId?: string; // Para filtrar por célula
  role?: string; // Para filtrar por função
  customIds?: string[]; // Para seleção personalizada
}

export interface CommunicationPreview {
  totalRecipients: number;
  recipients: MemberCommunicationData[];
  estimatedTime?: string; // Tempo estimado de entrega
}
