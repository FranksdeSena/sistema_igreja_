import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MediaDatabaseService } from '../../../core/services/media-database.service';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button routerLink=".." class="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Voltar para Galeria
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Upload de Mídia</h1>
        <p class="text-gray-600">Adicione novas fotos e vídeos ao mural</p>
      </div>

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed border-primary-blue rounded-lg p-12 text-center hover:bg-blue-50 transition-colors cursor-pointer relative"
        [class.bg-blue-50]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          class="hidden"
          multiple
          accept="image/*,video/*"
          (change)="onFileSelected($event)"
        />
        
        <div *ngIf="!selectedFiles.length && !isUploading">
          <p class="text-6xl mb-4">📤</p>
          <h3 class="text-xl font-medium text-gray-900">Clique ou arraste arquivos aqui</h3>
          <p class="text-gray-500 mt-2">Suporta JPG, PNG, MP4, WebM</p>
        </div>

        <!-- Progress -->
        <div *ngIf="isUploading" class="max-w-md mx-auto">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p class="text-lg font-medium text-gray-900">Enviando arquivos...</p>
          <p class="text-sm text-gray-500">{{ currentUploadIndex + 1 }} de {{ selectedFiles.length }}</p>
        </div>
      </div>

      <!-- Selected Files Preview -->
      <div *ngIf="selectedFiles.length > 0 && !isUploading" class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Arquivos Selecionados ({{ selectedFiles.length }})</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let file of selectedFiles; let i = index" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
            <!-- Preview -->
            <div class="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <img *ngIf="file.previewUrl && file.type === 'photo'" [src]="file.previewUrl" class="w-full h-full object-cover" />
              <div *ngIf="file.type === 'video'" class="w-full h-full flex items-center justify-center bg-black text-white">
                ▶️
              </div>
            </div>

            <!-- Metadata Form -->
            <div class="flex-1 space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  [(ngModel)]="file.title"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700">Descrição (Opcional)</label>
                <input
                  type="text"
                  [(ngModel)]="file.description"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Remove Button -->
            <button (click)="removeFile(i)" class="text-red-500 hover:text-red-700 self-start">
              ✕
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex justify-end gap-4">
          <button
            (click)="clearFiles()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            (click)="uploadAll()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fazer Upload de Todos
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MediaUploadComponent {
  isDragging = false;
  isUploading = false;
  selectedFiles: any[] = [];
  currentUploadIndex = 0;

  constructor(
    private mediaService: MediaDatabaseService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  private processFiles(fileList: FileList): void {
    Array.from(fileList).forEach(file => {
      const type = this.getFileType(file.type);
      if (!type) {
        alert(`Arquivo não suportado: ${file.name}`);
        return;
      }

      const fileData: any = {
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        type,
        previewUrl: null
      };

      if (type === 'photo') {
        const reader = new FileReader();
        reader.onload = (e) => fileData.previewUrl = e.target?.result;
        reader.readAsDataURL(file);
      }

      this.selectedFiles.push(fileData);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearFiles(): void {
    this.selectedFiles = [];
  }

  async uploadAll(): Promise<void> {
    if (this.isUploading || this.selectedFiles.length === 0) return;

    this.isUploading = true;
    this.currentUploadIndex = 0;

    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.currentUploadIndex = i;
        const item = this.selectedFiles[i];
        
        await this.mediaService.uploadMedia(item.file, {
          churchId: 'church-1', // TODO: Get from auth
          title: item.title,
          description: item.description,
          type: item.type,
          uploadedBy: 'Admin', // TODO: Get from auth
          status: 'published',
          tags: [item.type],
          views: 0,
          likes: 0
        });
      }

      // Sucesso
      this.router.navigate(['/dashboard/media']);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Ocorreu um erro durante o upload. Verifique o console.');
    } finally {
      this.isUploading = false;
    }
  }

  private getFileType(mimeType: string): 'photo' | 'video' | 'document' | null {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    return null;
  }
}
