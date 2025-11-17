import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { SecretariaService } from '../../core/services/secretaria.service';
import { Document, Communication, Report, SecretariaSummary } from '../../shared/models';

@Component({
  selector: 'app-secretaria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Secretaria</h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            Gerencie documentos, comunicações e relatórios
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- Total Documentos -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Documentos</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ summary.totalDocuments }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📄</span>
          </div>
        </div>

        <!-- Total Comunicações -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Comunicações</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-blue-600 break-words">
              {{ summary.totalCommunications }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💬</span>
          </div>
        </div>

        <!-- Pendentes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Pendentes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-yellow-600 break-words">
              {{ summary.pendingCommunications }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⏳</span>
          </div>
        </div>

        <!-- Total Relatórios -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Relatórios</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ summary.totalReports }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📊</span>
          </div>
        </div>

        <!-- Recentes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Recentes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ summary.recentDocuments }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⭐</span>
          </div>
        </div>
      </div>

      <!-- Abas de Navegação -->
      <div class="card">
        <div class="flex gap-2 flex-wrap">
          <button
            (click)="switchTab('documents')"
            [class.bg-primary-blue]="currentTab === 'documents'"
            [class.text-white]="currentTab === 'documents'"
            [class.bg-gray-100]="currentTab !== 'documents'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            📄 Documentos
          </button>
          <button
            (click)="switchTab('communications')"
            [class.bg-primary-blue]="currentTab === 'communications'"
            [class.text-white]="currentTab === 'communications'"
            [class.bg-gray-100]="currentTab !== 'communications'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            💬 Comunicações
          </button>
          <button
            (click)="switchTab('reports')"
            [class.bg-primary-blue]="currentTab === 'reports'"
            [class.text-white]="currentTab === 'reports'"
            [class.bg-gray-100]="currentTab !== 'reports'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            📊 Relatórios
          </button>
        </div>
      </div>

      <!-- TAB: DOCUMENTOS -->
      <ng-container *ngIf="currentTab === 'documents'">
        <!-- Barra de Pesquisa -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              [(ngModel)]="searchQueryDocuments"
              (input)="onSearchDocuments()"
              placeholder="Pesquisar por título, descrição ou tags..."
              class="input-field flex-1 w-full md:w-auto"
            />
            <button (click)="onSearchDocuments()" class="btn-primary">🔍 Buscar</button>
            <button (click)="clearSearchDocuments()" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4">
            <select
              [(ngModel)]="selectedDocumentCategory"
              (change)="onCategoryChange()"
              class="input-field flex-1"
            >
              <option value="">Todas as Categorias</option>
              <option *ngFor="let cat of documentCategories" [value]="cat">{{ cat }}</option>
            </select>
            <select
              [(ngModel)]="selectedDocumentStatus"
              (change)="onDocumentStatusChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Status</option>
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">⏸️ Inativo</option>
              <option value="arquivo">📦 Arquivo</option>
            </select>
          </div>
        </div>

        <!-- Botão Novo Documento -->
        <div class="flex justify-end">
          <button routerLink="novo-documento" class="btn-primary flex items-center gap-2 text-sm">
            <span class="text-lg">➕</span>
            <span>Novo Documento</span>
          </button>
        </div>

        <!-- Tabela Documentos (Desktop) -->
        <div class="hidden md:block card-hover overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Data Criação
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of filteredDocuments" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                  {{ doc.title }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  <span class="badge">{{ doc.category }}</span>
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  {{ doc.createdAt | date : 'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm">
                  <span [ngClass]="getDocumentStatusBadgeClass(doc.status)">
                    {{ getDocumentStatusLabel(doc.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex gap-2 justify-center">
                    <button
                      (click)="onExportPDF('document', doc)"
                      class="text-green-600 hover:text-green-700 text-sm"
                      title="Exportar PDF"
                    >
                      📄
                    </button>
                    <button
                      (click)="onPrint('document', doc)"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                      title="Imprimir"
                    >
                      🖨️
                    </button>
                    <a
                      [routerLink]="['/secretaria/editar-documento', doc.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                      title="Editar"
                    >
                      ✏️
                    </a>
                    <button
                      (click)="onDeleteDocument(doc.id)"
                      class="text-red-600 hover:text-red-700 text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Documentos (Mobile) -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let doc of filteredDocuments" class="card-hover">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ doc.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ doc.createdAt | date : 'dd/MM/yyyy' }}</p>
              </div>
              <span [ngClass]="getDocumentStatusBadgeClass(doc.status)" class="text-xs">
                {{ getDocumentStatusLabel(doc.status) }}
              </span>
            </div>
            <div class="flex gap-2 mb-3 flex-wrap">
              <span class="badge text-xs">{{ doc.category }}</span>
              <span class="text-xs text-gray-600">{{ formatFileSize(doc.fileSize) }}</span>
            </div>
            <div class="flex gap-2 flex-col">
              <div class="flex gap-2">
                <button (click)="onExportPDF('document', doc)" class="flex-1 btn-success text-xs">
                  <div class="flex gap-2 mb-3 flex-wrap">
                    <span class="badge text-xs">{{ doc.category }}</span>
                  </div>
                  🖨️ Impr.
                </button>
              </div>
              <div class="flex gap-2">
                <a
                  [routerLink]="['/secretaria/editar-documento', doc.id]"
                  class="flex-1 btn-primary text-xs text-center"
                >
                  ✏️ Editar
                </a>
                <button (click)="onDeleteDocument(doc.id)" class="flex-1 btn-danger text-xs">
                  🗑️ Deletar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensagem vazia -->
        <div *ngIf="filteredDocuments.length === 0" class="card-hover text-center py-12">
          <p class="text-gray-600 text-lg">📋 Nenhum documento encontrado</p>
          <p class="text-gray-500 text-sm mt-2">Clique em "Novo Documento" para começar</p>
        </div>
      </ng-container>

      <!-- TAB: COMUNICAÇÕES -->
      <ng-container *ngIf="currentTab === 'communications'">
        <!-- Barra de Pesquisa -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              [(ngModel)]="searchQueryCommunications"
              (input)="onSearchCommunications()"
              placeholder="Pesquisar por assunto ou mensagem..."
              class="input-field flex-1 w-full md:w-auto"
            />
            <button (click)="onSearchCommunications()" class="btn-primary">🔍 Buscar</button>
            <button (click)="clearSearchCommunications()" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4">
            <select
              [(ngModel)]="selectedCommunicationType"
              (change)="onCommunicationTypeChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Tipos</option>
              <option *ngFor="let type of communicationTypes" [value]="type">{{ type }}</option>
            </select>
            <select
              [(ngModel)]="selectedCommunicationStatus"
              (change)="onCommunicationStatusChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Status</option>
              <option value="rascunho">✏️ Rascunho</option>
              <option value="agendado">📅 Agendado</option>
              <option value="enviado">✅ Enviado</option>
              <option value="nao_enviado">❌ Não Enviado</option>
            </select>
          </div>
        </div>

        <!-- Botão Nova Comunicação -->
        <div class="flex justify-end">
          <button routerLink="nova-comunicacao" class="btn-primary flex items-center gap-2 text-sm">
            <span class="text-lg">➕</span>
            <span>Nova Comunicação</span>
          </button>
        </div>

        <!-- Tabela Comunicações (Desktop) -->
        <div class="hidden md:block card-hover overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assunto</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Destinatário
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let comm of filteredCommunications" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                  {{ comm.subject }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  <span class="badge">{{ comm.type }}</span>
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ comm.recipient }}</td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  {{
                    comm.sentDate || comm.scheduledDate || comm.createdAt
                      | date : 'dd/MM/yyyy HH:mm'
                  }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm">
                  <span [ngClass]="getCommunicationStatusBadgeClass(comm.status)">
                    {{ getCommunicationStatusLabel(comm.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex gap-2 justify-center">
                    <button
                      (click)="onExportPDF('communication', comm)"
                      class="text-green-600 hover:text-green-700 text-sm"
                      title="Exportar PDF"
                    >
                      📄
                    </button>
                    <button
                      (click)="onPrint('communication', comm)"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                      title="Imprimir"
                    >
                      🖨️
                    </button>
                    <a
                      [routerLink]="['/secretaria/editar-comunicacao', comm.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                      title="Editar"
                    >
                      ✏️
                    </a>
                    <button
                      *ngIf="comm.type === 'whatsapp' && comm.phoneNumber"
                      (click)="onSendWhatsApp(comm)"
                      class="text-green-500 hover:text-green-700 text-sm"
                      title="Enviar via WhatsApp"
                    >
                      💬
                    </button>
                    <button
                      *ngIf="comm.status === 'rascunho'"
                      (click)="onSendCommunication(comm.id)"
                      class="text-green-600 hover:text-green-700 text-sm"
                      title="Enviar"
                    >
                      📤
                    </button>
                    <button
                      (click)="onDeleteCommunication(comm.id)"
                      class="text-red-600 hover:text-red-700 text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Comunicações (Mobile) -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let comm of filteredCommunications" class="card-hover">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ comm.subject }}</p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ comm.sentDate || comm.createdAt | date : 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <span [ngClass]="getCommunicationStatusBadgeClass(comm.status)" class="text-xs">
                {{ getCommunicationStatusLabel(comm.status) }}
              </span>
            </div>
            <div class="flex gap-2 mb-3 flex-wrap">
              <span class="badge text-xs">{{ comm.type }}</span>
              <span class="text-xs text-gray-600">{{ comm.recipient }}</span>
            </div>
            <div class="flex gap-2 flex-col">
              <div class="flex gap-2">
                <button
                  (click)="onExportPDF('communication', comm)"
                  class="flex-1 btn-success text-xs"
                >
                  📄 PDF
                </button>
                <button (click)="onPrint('communication', comm)" class="flex-1 btn-primary text-xs">
                  🖨️ Impr.
                </button>
              </div>
              <div class="flex gap-2">
                <a
                  [routerLink]="['/secretaria/editar-comunicacao', comm.id]"
                  class="flex-1 btn-primary text-xs text-center"
                >
                  ✏️ Editar
                </a>
                <button
                  *ngIf="comm.type === 'whatsapp' && comm.phoneNumber"
                  (click)="onSendWhatsApp(comm)"
                  class="flex-1 btn-success text-xs"
                >
                  💬 WhatsApp
                </button>
                <button
                  *ngIf="comm.status === 'rascunho'"
                  (click)="onSendCommunication(comm.id)"
                  class="flex-1 btn-success text-xs"
                >
                  📤 Enviar
                </button>
                <button (click)="onDeleteCommunication(comm.id)" class="flex-1 btn-danger text-xs">
                  🗑️ Deletar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensagem vazia -->
        <div *ngIf="filteredCommunications.length === 0" class="card-hover text-center py-12">
          <p class="text-gray-600 text-lg">💬 Nenhuma comunicação encontrada</p>
          <p class="text-gray-500 text-sm mt-2">Clique em "Nova Comunicação" para começar</p>
        </div>
      </ng-container>

      <!-- TAB: RELATÓRIOS -->
      <ng-container *ngIf="currentTab === 'reports'">
        <!-- Barra de Pesquisa -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              [(ngModel)]="searchQueryReports"
              (input)="onSearchReports()"
              placeholder="Pesquisar por título ou período..."
              class="input-field flex-1 w-full md:w-auto"
            />
            <button (click)="onSearchReports()" class="btn-primary">🔍 Buscar</button>
            <button (click)="clearSearchReports()" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4">
            <select
              [(ngModel)]="selectedReportType"
              (change)="onReportTypeChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Tipos</option>
              <option *ngFor="let type of reportTypes" [value]="type">{{ type }}</option>
            </select>
            <select
              [(ngModel)]="selectedReportStatus"
              (change)="onReportStatusChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Status</option>
              <option value="rascunho">✏️ Rascunho</option>
              <option value="finalizado">✅ Finalizado</option>
              <option value="enviado">📤 Enviado</option>
            </select>
          </div>
        </div>

        <!-- Botão Novo Relatório -->
        <div class="flex justify-end">
          <button routerLink="novo-relatorio" class="btn-primary flex items-center gap-2 text-sm">
            <span class="text-lg">➕</span>
            <span>Novo Relatório</span>
          </button>
        </div>

        <!-- Tabela Relatórios (Desktop) -->
        <div class="hidden md:block card-hover overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Período</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Gerada</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of filteredReports" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                  {{ report.title }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  <span class="badge">{{ report.type }}</span>
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ report.period }}</td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  {{ report.generatedDate | date : 'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm">
                  <span [ngClass]="getReportStatusBadgeClass(report.status)">
                    {{ getReportStatusLabel(report.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex gap-2 justify-center">
                    <a
                      [routerLink]="['/secretaria/visualizar-relatorio', report.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                      title="Visualizar"
                    >
                      👁️
                    </a>
                    <button
                      (click)="onExportPDF('report', report)"
                      class="text-green-600 hover:text-green-700 text-sm"
                      title="Exportar PDF"
                    >
                      📄
                    </button>
                    <button
                      (click)="onPrint('report', report)"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                      title="Imprimir"
                    >
                      🖨️
                    </button>
                    <a
                      [routerLink]="['/secretaria/editar-relatorio', report.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                      title="Editar"
                    >
                      ✏️
                    </a>
                    <button
                      (click)="onDeleteReport(report.id)"
                      class="text-red-600 hover:text-red-700 text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Relatórios (Mobile) -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let report of filteredReports" class="card-hover">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ report.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ report.period }}</p>
              </div>
              <span [ngClass]="getReportStatusBadgeClass(report.status)" class="text-xs">
                {{ getReportStatusLabel(report.status) }}
              </span>
            </div>
            <div class="flex gap-2 mb-3 flex-wrap">
              <span class="badge text-xs">{{ report.type }}</span>
              <span class="text-xs text-gray-600">{{
                report.generatedDate | date : 'dd/MM/yyyy'
              }}</span>
            </div>
            <div class="flex gap-2 flex-col">
              <div class="flex gap-2">
                <a
                  [routerLink]="['/secretaria/visualizar-relatorio', report.id]"
                  class="flex-1 btn-primary text-xs text-center"
                >
                  👁️ Ver
                </a>
                <button (click)="onExportPDF('report', report)" class="flex-1 btn-success text-xs">
                  📄 PDF
                </button>
                <button (click)="onPrint('report', report)" class="flex-1 btn-primary text-xs">
                  🖨️ Impr.
                </button>
              </div>
              <div class="flex gap-2">
                <a
                  [routerLink]="['/secretaria/editar-relatorio', report.id]"
                  class="flex-1 btn-primary text-xs text-center"
                >
                  ✏️ Editar
                </a>
                <button (click)="onDeleteReport(report.id)" class="flex-1 btn-danger text-xs">
                  🗑️ Deletar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensagem vazia -->
        <div *ngIf="filteredReports.length === 0" class="card-hover text-center py-12">
          <p class="text-gray-600 text-lg">📊 Nenhum relatório encontrado</p>
          <p class="text-gray-500 text-sm mt-2">Clique em "Novo Relatório" para começar</p>
        </div>
      </ng-container>
    </div>
  `,
})
export class SecretariaComponent implements OnInit {
  currentTab: 'documents' | 'communications' | 'reports' = 'documents';

  // Documentos
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  searchQueryDocuments = '';
  selectedDocumentCategory = '';
  selectedDocumentStatus = '';
  documentCategories: string[] = [];

  // Comunicações
  communications: Communication[] = [];
  filteredCommunications: Communication[] = [];
  searchQueryCommunications = '';
  selectedCommunicationType = '';
  selectedCommunicationStatus = '';
  communicationTypes: string[] = [];

  // Relatórios
  reports: Report[] = [];
  filteredReports: Report[] = [];
  searchQueryReports = '';
  selectedReportType = '';
  selectedReportStatus = '';
  reportTypes: string[] = [];

  summary: SecretariaSummary = {
    totalDocuments: 0,
    totalCommunications: 0,
    totalReports: 0,
    pendingCommunications: 0,
    recentDocuments: 0,
    draftReports: 0,
  };

  constructor(private secretariaService: SecretariaService) {}

  ngOnInit(): void {
    this.documentCategories = this.secretariaService.getDocumentCategories();
    this.communicationTypes = this.secretariaService.getCommunicationTypes();
    this.reportTypes = this.secretariaService.getReportTypes();

    this.loadDocuments();
    this.loadCommunications();
    this.loadReports();
    this.loadSummary();
  }

  switchTab(tab: 'documents' | 'communications' | 'reports'): void {
    this.currentTab = tab;
  }

  // ========== DOCUMENTOS ==========

  loadDocuments(): void {
    this.secretariaService.getDocuments().subscribe((docs) => {
      this.documents = docs;
      this.applyDocumentFilters();
    });
  }

  onSearchDocuments(): void {
    this.applyDocumentFilters();
  }

  clearSearchDocuments(): void {
    this.searchQueryDocuments = '';
    this.selectedDocumentCategory = '';
    this.selectedDocumentStatus = '';
    this.applyDocumentFilters();
  }

  onCategoryChange(): void {
    this.applyDocumentFilters();
  }

  onDocumentStatusChange(): void {
    this.applyDocumentFilters();
  }

  applyDocumentFilters(): void {
    let filtered = this.documents;

    if (this.searchQueryDocuments) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(this.searchQueryDocuments.toLowerCase()) ||
          d.description.toLowerCase().includes(this.searchQueryDocuments.toLowerCase())
      );
    }

    if (this.selectedDocumentCategory) {
      filtered = filtered.filter((d) => d.category === this.selectedDocumentCategory);
    }

    if (this.selectedDocumentStatus) {
      filtered = filtered.filter((d) => d.status === this.selectedDocumentStatus);
    }

    this.filteredDocuments = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  onDeleteDocument(id: string): void {
    if (confirm('Tem certeza que deseja deletar este documento?')) {
      this.secretariaService.deleteDocument(id);
      this.loadDocuments();
      this.loadSummary();
    }
  }

  // ========== COMUNICAÇÕES ==========

  loadCommunications(): void {
    this.secretariaService.getCommunications().subscribe((comms) => {
      this.communications = comms;
      this.applyCommunicationFilters();
    });
  }

  onSearchCommunications(): void {
    this.applyCommunicationFilters();
  }

  clearSearchCommunications(): void {
    this.searchQueryCommunications = '';
    this.selectedCommunicationType = '';
    this.selectedCommunicationStatus = '';
    this.applyCommunicationFilters();
  }

  onCommunicationTypeChange(): void {
    this.applyCommunicationFilters();
  }

  onCommunicationStatusChange(): void {
    this.applyCommunicationFilters();
  }

  applyCommunicationFilters(): void {
    let filtered = this.communications;

    if (this.searchQueryCommunications) {
      filtered = filtered.filter(
        (c) =>
          c.subject.toLowerCase().includes(this.searchQueryCommunications.toLowerCase()) ||
          c.message.toLowerCase().includes(this.searchQueryCommunications.toLowerCase())
      );
    }

    if (this.selectedCommunicationType) {
      filtered = filtered.filter((c) => c.type === this.selectedCommunicationType);
    }

    if (this.selectedCommunicationStatus) {
      filtered = filtered.filter((c) => c.status === this.selectedCommunicationStatus);
    }

    this.filteredCommunications = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  onSendCommunication(id: string): void {
    this.secretariaService.sendCommunication(id);
    this.loadCommunications();
    this.loadSummary();
  }

  onSendWhatsApp(comm: Communication): void {
    if (!comm.phoneNumber) {
      alert('Número de telefone não disponível');
      return;
    }

    try {
      // Formata o número de telefone removendo caracteres especiais
      const phoneFormatted = comm.phoneNumber.replace(/\D/g, '');

      // Encoda a mensagem para URL
      const messageEncoded = encodeURIComponent(comm.message);

      // URL do WhatsApp Web
      const whatsappUrl = `https://wa.me/${phoneFormatted}?text=${messageEncoded}`;

      // Abre em nova aba
      window.open(whatsappUrl, '_blank');

      // Marca como enviado
      this.secretariaService.sendCommunication(comm.id);
      this.loadCommunications();
      this.loadSummary();
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      alert('Erro ao abrir WhatsApp');
    }
  }

  onDeleteCommunication(id: string): void {
    if (confirm('Tem certeza que deseja deletar esta comunicação?')) {
      this.secretariaService.deleteCommunication(id);
      this.loadCommunications();
      this.loadSummary();
    }
  }

  // ========== RELATÓRIOS ==========

  loadReports(): void {
    this.secretariaService.getReports().subscribe((reports) => {
      this.reports = reports;
      this.applyReportFilters();
    });
  }

  onSearchReports(): void {
    this.applyReportFilters();
  }

  clearSearchReports(): void {
    this.searchQueryReports = '';
    this.selectedReportType = '';
    this.selectedReportStatus = '';
    this.applyReportFilters();
  }

  onReportTypeChange(): void {
    this.applyReportFilters();
  }

  onReportStatusChange(): void {
    this.applyReportFilters();
  }

  applyReportFilters(): void {
    let filtered = this.reports;

    if (this.searchQueryReports) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(this.searchQueryReports.toLowerCase()) ||
          r.period.toLowerCase().includes(this.searchQueryReports.toLowerCase())
      );
    }

    if (this.selectedReportType) {
      filtered = filtered.filter((r) => r.type === this.selectedReportType);
    }

    if (this.selectedReportStatus) {
      filtered = filtered.filter((r) => r.status === this.selectedReportStatus);
    }

    this.filteredReports = filtered.sort(
      (a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
    );
  }

  onDeleteReport(id: string): void {
    if (confirm('Tem certeza que deseja deletar este relatório?')) {
      this.secretariaService.deleteReport(id);
      this.loadReports();
      this.loadSummary();
    }
  }

  // ========== SUMMARY ==========

  loadSummary(): void {
    this.secretariaService.getSecretariaSummary().subscribe((summary) => {
      this.summary = summary;
    });
  }

  // ========== HELPERS ==========

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getDocumentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ativo':
        return 'badge badge-success';
      case 'inativo':
        return 'badge badge-warning';
      case 'arquivo':
        return 'badge badge-secondary';
      default:
        return 'badge';
    }
  }

  getDocumentStatusLabel(status: string): string {
    switch (status) {
      case 'ativo':
        return '✅ Ativo';
      case 'inativo':
        return '⏸️ Inativo';
      case 'arquivo':
        return '📦 Arquivo';
      default:
        return status;
    }
  }

  getCommunicationStatusBadgeClass(status: string): string {
    switch (status) {
      case 'rascunho':
        return 'badge badge-warning';
      case 'agendado':
        return 'badge badge-primary';
      case 'enviado':
        return 'badge badge-success';
      case 'nao_enviado':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  }

  getCommunicationStatusLabel(status: string): string {
    switch (status) {
      case 'rascunho':
        return '✏️ Rascunho';
      case 'agendado':
        return '📅 Agendado';
      case 'enviado':
        return '✅ Enviado';
      case 'nao_enviado':
        return '❌ Não Enviado';
      default:
        return status;
    }
  }

  getReportStatusBadgeClass(status: string): string {
    switch (status) {
      case 'rascunho':
        return 'badge badge-warning';
      case 'finalizado':
        return 'badge badge-success';
      case 'enviado':
        return 'badge badge-primary';
      default:
        return 'badge';
    }
  }

  getReportStatusLabel(status: string): string {
    switch (status) {
      case 'rascunho':
        return '✏️ Rascunho';
      case 'finalizado':
        return '✅ Finalizado';
      case 'enviado':
        return '📤 Enviado';
      default:
        return status;
    }
  }

  // ========== EXPORT PDF & PRINT ==========

  onExportPDF(type: string, data: any): void {
    try {
      const pdf = new jsPDF();
      let fileName = '';
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const textWidth = pageWidth - 2 * margin;

      // Função auxiliar para adicionar texto quebrado
      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(text, textWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize / 3);
        if (isBold) pdf.setFont('helvetica', 'normal');
      };

      if (type === 'document') {
        const doc = data as Document;
        fileName = `documento-${doc.id}.pdf`;

        // Título
        addWrappedText('DOCUMENTO', 18, true);
        yPosition += 3;

        // Conteúdo
        addWrappedText(`Título: ${doc.title}`, 11);
        addWrappedText(`Categoria: ${doc.category}`, 11);
        addWrappedText(`Status: ${doc.status}`, 11);
        addWrappedText(`Data: ${new Date(doc.createdAt).toLocaleDateString('pt-BR')}`, 11);
        yPosition += 5;

        addWrappedText('Descrição:', 11, true);
        addWrappedText(doc.description, 10);
        yPosition += 5;

        if (doc.tags && doc.tags.length > 0) {
          addWrappedText(`Tags: ${doc.tags.join(', ')}`, 10);
          yPosition += 3;
        }

        if (doc.notes) {
          addWrappedText('Notas:', 11, true);
          addWrappedText(doc.notes, 10);
        }
      } else if (type === 'communication') {
        const comm = data as Communication;
        fileName = `comunicacao-${comm.id}.pdf`;

        // Título
        addWrappedText('COMUNICAÇÃO', 18, true);
        yPosition += 3;

        // Conteúdo
        addWrappedText(`Assunto: ${comm.subject}`, 11);
        addWrappedText(`Tipo: ${comm.type}`, 11);
        addWrappedText(`Destinatário: ${comm.recipient}`, 11);
        addWrappedText(`Status: ${comm.status}`, 11);
        addWrappedText(`Data: ${new Date(comm.createdAt).toLocaleDateString('pt-BR')}`, 11);
        yPosition += 5;

        addWrappedText('Mensagem:', 11, true);
        addWrappedText(comm.message, 10);
        yPosition += 5;

        if (comm.notes) {
          addWrappedText('Notas:', 11, true);
          addWrappedText(comm.notes, 10);
        }
      } else if (type === 'report') {
        const report = data as Report;
        fileName = `relatorio-${report.id}.pdf`;

        // Título
        addWrappedText('RELATÓRIO', 18, true);
        yPosition += 3;

        // Conteúdo
        addWrappedText(`Título: ${report.title}`, 11);
        addWrappedText(`Tipo: ${report.type}`, 11);
        addWrappedText(`Período: ${report.period}`, 11);
        addWrappedText(`Data: ${new Date(report.generatedDate).toLocaleDateString('pt-BR')}`, 11);
        addWrappedText(`Status: ${report.status}`, 11);
        yPosition += 5;

        addWrappedText('Conteúdo:', 11, true);
        addWrappedText(report.content, 10);
      }

      // Rodapé com data
      yPosition = pageHeight - 10;
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString(
          'pt-BR'
        )}`,
        margin,
        yPosition
      );

      // Download PDF
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar arquivo em PDF');
    }
  }

  onPrint(type: string, data: any): void {
    try {
      let content = '';
      let title = '';

      if (type === 'document') {
        const doc = data as Document;
        title = doc.title;
        content = `
<h2>${doc.title}</h2>
<p><strong>Categoria:</strong> ${doc.category}</p>
<p><strong>Data Upload:</strong> ${doc.uploadDate.toString()}</p>
<p><strong>Status:</strong> ${doc.status}</p>
<p><strong>Descrição:</strong></p>
<p>${doc.description}</p>
<p><strong>Tags:</strong> ${doc.tags.join(', ')}</p>
<p><strong>Notas:</strong> ${doc.notes}</p>
        `;
      } else if (type === 'communication') {
        const comm = data as Communication;
        title = comm.subject;
        content = `
<h2>${comm.subject}</h2>
<p><strong>Tipo:</strong> ${comm.type}</p>
<p><strong>Destinatário:</strong> ${comm.recipient}</p>
<p><strong>Status:</strong> ${comm.status}</p>
<p><strong>Data:</strong> ${comm.createdAt.toString()}</p>

<h3>Mensagem:</h3>
<p>${comm.message.replace(/\n/g, '<br>')}</p>

<p><strong>Notas:</strong> ${comm.notes}</p>
        `;
      } else if (type === 'report') {
        const report = data as Report;
        title = report.title;
        content = `
<h2>${report.title}</h2>
<p><strong>Tipo:</strong> ${report.type}</p>
<p><strong>Período:</strong> ${report.period}</p>
<p><strong>Data:</strong> ${report.generatedDate.toString()}</p>
<p><strong>Status:</strong> ${report.status}</p>

<h3>Conteúdo:</h3>
<p>${report.content.replace(/\n/g, '<br>')}</p>
        `;
      }

      // Abrir janela de impressão
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { color: #2563EB; }
              h3 { color: #1e40af; margin-top: 20px; }
              p { margin: 10px 0; line-height: 1.6; }
              strong { color: #374151; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao abrir página de impressão');
    }
  }
}
