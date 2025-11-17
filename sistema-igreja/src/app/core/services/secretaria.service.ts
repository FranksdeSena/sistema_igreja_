import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Document,
  Communication,
  Report,
  SecretariaSummary,
  MemberCommunicationData,
  CommunicationRecipientFilter,
  CommunicationPreview,
} from '../../shared/models';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root',
})
export class SecretariaService {
  constructor(private membersService: MembersService) {}
  // Documentos
  private documentsSubject = new BehaviorSubject<Document[]>([
    {
      id: '1',
      churchId: 'church-1',
      title: 'Regulamento Interno da Igreja',
      category: 'regulamento',
      description: 'Documento com as normas de funcionamento interno',
      fileName: 'regulamento-interno.pdf',
      fileUrl: 'https://exemplo.com/regulamento.pdf',
      fileSize: 245000,
      uploadedBy: 'Admin',
      uploadDate: new Date('2025-09-15'),
      lastModified: new Date('2025-11-10'),
      version: 3,
      status: 'ativo',
      tags: ['regulamento', 'interno', '2025'],
      notes: 'Última atualização: Novembro 2025',
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-11-10'),
    },
    {
      id: '2',
      churchId: 'church-1',
      title: 'Ata da Reunião de Liderança - Novembro 2025',
      category: 'ata',
      description: 'Registro da reunião de liderança',
      fileName: 'ata-lideranca-nov-2025.pdf',
      fileUrl: 'https://exemplo.com/ata-nov.pdf',
      fileSize: 156000,
      uploadedBy: 'Secretário',
      uploadDate: new Date('2025-11-17'),
      lastModified: new Date('2025-11-17'),
      version: 1,
      status: 'ativo',
      tags: ['ata', 'liderança', 'reunião'],
      notes: 'Arquivo recente',
      createdAt: new Date('2025-11-17'),
      updatedAt: new Date('2025-11-17'),
    },
  ]);

  // Comunicações
  private communicationsSubject = new BehaviorSubject<Communication[]>([
    {
      id: '1',
      churchId: 'church-1',
      type: 'circular',
      subject: 'Aviso: Alteração de Horário do Culto',
      recipient: 'todos',
      message: 'Informamos que o culto de domingo será realizado às 19h em vez de 18h.',
      status: 'enviado',
      sentDate: new Date('2025-11-15'),
      sender: 'Pastoria',
      readBy: ['member-1', 'member-2', 'member-3'],
      responseCount: 2,
      notes: 'Comunicado importante sobre mudança de horário',
      createdAt: new Date('2025-11-15'),
      updatedAt: new Date('2025-11-15'),
    },
    {
      id: '2',
      churchId: 'church-1',
      type: 'whatsapp',
      subject: 'Confirmação de Presença',
      recipient: 'custom',
      phoneNumber: '+55 11 98765-4321',
      recipientList: ['+55 11 98765-4321', '+55 11 91234-5678'],
      message: 'Olá! Gostaria de confirmar sua presença no evento de domingo.',
      status: 'rascunho',
      sender: 'Secretário',
      readBy: [],
      responseCount: 0,
      notes: 'Mensagem via WhatsApp',
      createdAt: new Date('2025-11-17'),
      updatedAt: new Date('2025-11-17'),
    },
  ]);

  // Relatórios
  private reportsSubject = new BehaviorSubject<Report[]>([
    {
      id: '1',
      churchId: 'church-1',
      title: 'Relatório Financeiro - Outubro 2025',
      type: 'financial',
      period: 'Outubro 2025',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      generatedBy: 'Tesoureiro',
      generatedDate: new Date('2025-11-05'),
      content:
        'Relatório detalhado das finanças do mês de outubro com análise de receitas e despesas.',
      summary: {
        totalItems: 45,
        highlights: ['Aumento de 15% em dízimos', 'Despesas reduzidas'],
        metrics: { receita: 5500, despesa: 3200, saldo: 2300 },
      },
      status: 'finalizado',
      recipients: ['pastor-1', 'tesoureiro-1'],
      createdAt: new Date('2025-11-05'),
      updatedAt: new Date('2025-11-05'),
    },
    {
      id: '2',
      churchId: 'church-1',
      title: 'Relatório de Frequência - Novembro 2025',
      type: 'attendance',
      period: 'Novembro 2025',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-30'),
      generatedBy: 'Secretário',
      generatedDate: new Date('2025-11-17'),
      content: 'Análise de frequência nos cultos do mês de novembro.',
      summary: {
        totalItems: 4,
        highlights: ['Média de 150 pessoas por culto'],
        metrics: { culto1: 155, culto2: 148, culto3: 152, culto4: 151 },
      },
      status: 'rascunho',
      createdAt: new Date('2025-11-17'),
      updatedAt: new Date('2025-11-17'),
    },
  ]);

  // ========== DOCUMENTOS ==========

  getDocuments(): Observable<Document[]> {
    return this.documentsSubject.asObservable();
  }

  createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documentsSubject.next([...this.documentsSubject.value, newDoc]);
  }

  updateDocument(id: string, doc: Partial<Document>): void {
    const docs = this.documentsSubject.value.map((d) =>
      d.id === id ? { ...d, ...doc, updatedAt: new Date() } : d
    );
    this.documentsSubject.next(docs);
  }

  deleteDocument(id: string): void {
    this.documentsSubject.next(this.documentsSubject.value.filter((d) => d.id !== id));
  }

  searchDocuments(query: string): Document[] {
    return this.documentsSubject.value.filter(
      (d) =>
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.description.toLowerCase().includes(query.toLowerCase()) ||
        d.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  getDocumentsByCategory(category: string): Document[] {
    return this.documentsSubject.value.filter((d) => d.category === category);
  }

  getDocumentCategories(): string[] {
    return ['ata', 'regulamento', 'politica', 'formulario', 'outro'];
  }

  // ========== COMUNICAÇÕES ==========

  getCommunications(): Observable<Communication[]> {
    return this.communicationsSubject.asObservable();
  }

  createCommunication(comm: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newComm: Communication = {
      ...comm,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.communicationsSubject.next([...this.communicationsSubject.value, newComm]);
  }

  updateCommunication(id: string, comm: Partial<Communication>): void {
    const comms = this.communicationsSubject.value.map((c) =>
      c.id === id ? { ...c, ...comm, updatedAt: new Date() } : c
    );
    this.communicationsSubject.next(comms);
  }

  deleteCommunication(id: string): void {
    this.communicationsSubject.next(this.communicationsSubject.value.filter((c) => c.id !== id));
  }

  sendCommunication(id: string): void {
    const comms = this.communicationsSubject.value.map((c) =>
      c.id === id ? { ...c, status: 'enviado' as const, sentDate: new Date() } : c
    );
    this.communicationsSubject.next(comms);
  }

  scheduleCommunication(id: string, scheduledDate: Date): void {
    const comms = this.communicationsSubject.value.map((c) =>
      c.id === id ? { ...c, status: 'agendado' as const, scheduledDate } : c
    );
    this.communicationsSubject.next(comms);
  }

  searchCommunications(query: string): Communication[] {
    return this.communicationsSubject.value.filter(
      (c) =>
        c.subject.toLowerCase().includes(query.toLowerCase()) ||
        c.message.toLowerCase().includes(query.toLowerCase())
    );
  }

  getCommunicationTypes(): string[] {
    return ['email', 'circular', 'aviso', 'boletim', 'whatsapp'];
  }

  getCommunicationRecipients(): string[] {
    return ['todos', 'pastores', 'lideranca', 'membros', 'custom'];
  }

  // ========== RELATÓRIOS ==========

  getReports(): Observable<Report[]> {
    return this.reportsSubject.asObservable();
  }

  createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reportsSubject.next([...this.reportsSubject.value, newReport]);
  }

  updateReport(id: string, report: Partial<Report>): void {
    const reports = this.reportsSubject.value.map((r) =>
      r.id === id ? { ...r, ...report, updatedAt: new Date() } : r
    );
    this.reportsSubject.next(reports);
  }

  deleteReport(id: string): void {
    this.reportsSubject.next(this.reportsSubject.value.filter((r) => r.id !== id));
  }

  searchReports(query: string): Report[] {
    return this.reportsSubject.value.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.period.toLowerCase().includes(query.toLowerCase())
    );
  }

  getReportsByType(type: string): Report[] {
    return this.reportsSubject.value.filter((r) => r.type === type);
  }

  getReportTypes(): string[] {
    return ['financial', 'attendance', 'membership', 'events', 'pastoral', 'custom'];
  }

  // ========== RESUMO SECRETARIA ==========

  getSecretariaSummary(): Observable<SecretariaSummary> {
    const docs = this.documentsSubject.value;
    const comms = this.communicationsSubject.value;
    const reports = this.reportsSubject.value;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const summary: SecretariaSummary = {
      totalDocuments: docs.length,
      totalCommunications: comms.length,
      totalReports: reports.length,
      pendingCommunications: comms.filter((c) => c.status === 'rascunho').length,
      recentDocuments: docs.filter((d) => d.uploadDate > thirtyDaysAgo).length,
      draftReports: reports.filter((r) => r.status === 'rascunho').length,
    };

    return new BehaviorSubject(summary).asObservable();
  }

  // ========== INTEGRAÇÃO COM MEMBROS ==========

  /**
   * Busca membros com base em filtros para comunicação
   * Suporta filtros por: todos, líderes, membros, célula, função, ou lista personalizada
   * @param filter Configuração de filtro de destinatários
   * @returns Observable com lista de dados de membros para comunicação
   */
  getMembersForCommunication(
    filter: CommunicationRecipientFilter
  ): Observable<MemberCommunicationData[]> {
    return this.membersService.getMembers().pipe(
      map((members) => {
        let filtered = members;

        switch (filter.type) {
          case 'all':
            // Todos os membros ativos
            filtered = members.filter((m) => m.status === 'active');
            break;

          case 'leaders':
            // Apenas líderes
            filtered = members.filter(
              (m) => m.status === 'active' && m.role?.toLowerCase() === 'líder'
            );
            break;

          case 'members':
            // Apenas membros (não líderes)
            filtered = members.filter(
              (m) => m.status === 'active' && (!m.role || m.role.toLowerCase() !== 'líder')
            );
            break;

          case 'cell':
            // Membros de uma célula específica
            if (filter.cellId) {
              filtered = members.filter((m) => m.status === 'active' && m.cellId === filter.cellId);
            }
            break;

          case 'role':
            // Membros com uma função específica
            if (filter.role) {
              filtered = members.filter(
                (m) => m.status === 'active' && m.role?.toLowerCase() === filter.role?.toLowerCase()
              );
            }
            break;

          case 'custom':
            // Lista personalizada de IDs
            if (filter.customIds && filter.customIds.length > 0) {
              filtered = members.filter(
                (m) => m.status === 'active' && filter.customIds!.includes(m.id)
              );
            }
            break;

          default:
            filtered = [];
        }

        // Converte para MemberCommunicationData
        return filtered.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          whatsapp: m.whatsapp,
          role: m.role,
          cellId: m.cellId,
        }));
      })
    );
  }

  /**
   * Gera preview de comunicação com lista de destinatários
   * @param filter Configuração de filtro de destinatários
   * @returns Observable com preview da comunicação
   */
  getCommunicationPreview(filter: CommunicationRecipientFilter): Observable<CommunicationPreview> {
    return this.getMembersForCommunication(filter).pipe(
      map((recipients) => ({
        totalRecipients: recipients.length,
        recipients,
        estimatedTime: this.estimateDeliveryTime(recipients.length),
      }))
    );
  }

  /**
   * Busca um membro específico com dados de comunicação
   * @param memberId ID do membro
   * @returns Observable com dados do membro para comunicação
   */
  getMemberForCommunication(memberId: string): Observable<MemberCommunicationData | undefined> {
    return this.membersService.getMemberById(memberId).pipe(
      map((member) =>
        member
          ? {
              id: member.id,
              name: member.name,
              email: member.email,
              phone: member.phone,
              whatsapp: member.whatsapp,
              role: member.role,
              cellId: member.cellId,
            }
          : undefined
      )
    );
  }

  /**
   * Valida se um número de WhatsApp existe para um membro
   * @param memberId ID do membro
   * @returns Observable boolean indicando se tem WhatsApp
   */
  hasMemberWhatsApp(memberId: string): Observable<boolean> {
    return this.getMemberForCommunication(memberId).pipe(
      map((member) => !!member?.whatsapp && member.whatsapp.trim().length > 0)
    );
  }

  /**
   * Exporta lista de membros com WhatsApp para comunicação
   * Útil para envios em massa
   * @param filter Configuração de filtro
   * @returns Observable com lista de membros que têm WhatsApp
   */
  getMembersWithWhatsAppForCommunication(
    filter: CommunicationRecipientFilter
  ): Observable<MemberCommunicationData[]> {
    return this.getMembersForCommunication(filter).pipe(
      map((members) => members.filter((m) => m.whatsapp && m.whatsapp.trim().length > 0))
    );
  }

  /**
   * Calcula tempo estimado de entrega baseado na quantidade de destinatários
   * @param recipientCount Quantidade de destinatários
   * @returns String com tempo estimado
   */
  private estimateDeliveryTime(recipientCount: number): string {
    if (recipientCount === 0) return '0 minutos';
    if (recipientCount <= 10) return '1-2 minutos';
    if (recipientCount <= 50) return '5-10 minutos';
    if (recipientCount <= 100) return '10-15 minutos';
    return 'Consulte o administrador para envios em massa';
  }
}
