import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CellsDatabaseService } from '../../core/services/cells-database.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Member } from '../../shared/models/member.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cell-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button routerLink=".." class="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <span>⬅️</span> Voltar
        </button>
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isEditMode ? 'Editar Célula' : 'Nova Célula' }}
        </h2>
        <p class="text-gray-500">Preencha os dados do pequeno grupo</p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        <!-- Nome e Descrição -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
          
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Célula *</label>
              <input formControlName="name" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ex: Célula Betel">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea formControlName="description" rows="3" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Breve descrição do grupo..."></textarea>
            </div>
          </div>
        </div>

        <!-- Liderança -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Liderança</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Líder *</label>
            <select formControlName="leaderId" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white">
              <option value="">Selecione um líder</option>
              <option *ngFor="let member of members$ | async" [value]="member.id">
                {{ member.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Selecione um membro cadastrado para ser o líder.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Anfitrião</label>
            <input formControlName="host" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ex: Casa do João">
          </div>
        </div>

        <!-- Encontros -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Encontros</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dia da Semana *</label>
              <select formControlName="meetingDay" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                <option value="">Selecione o dia</option>
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
              <input formControlName="meetingTime" type="time" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
            <input formControlName="address" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Endereço completo do local de reunião">
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4 pt-4 border-t">
          <button type="button" routerLink=".." class="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid || isLoading" class="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200">
            {{ isLoading ? 'Salvando...' : (isEditMode ? 'Atualizar Célula' : 'Criar Célula') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CellFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  cellId: string | null = null;
  isLoading = false;
  members$: Observable<Member[]>;

  constructor(
    private fb: FormBuilder,
    private cellsService: CellsDatabaseService,
    private membersService: MembersDatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.members$ = this.membersService.getMembers();
    
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      leaderId: ['', Validators.required],
      host: [''],
      meetingDay: ['', Validators.required],
      meetingTime: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.cellId = id;
      this.loadCell(id);
    }
  }

  loadCell(id: string) {
    this.cellsService.getCellById(id).subscribe(cell => {
      if (cell) {
        this.form.patchValue(cell);
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formValue = this.form.value;

    // Buscar nome do líder selecionado
    // Nota: Em uma app real, isso poderia ser otimizado, mas aqui vamos buscar da lista carregada ou fazer uma query rápida
    // Como members$ é observable, vamos pegar o valor atual de forma simplificada ou confiar que o ID está correto
    // Para simplificar, vou buscar o membro pelo ID para pegar o nome
    
    try {
      // Buscar o membro líder para pegar o nome
      const leader = await new Promise<Member | undefined>((resolve) => {
        this.membersService.getMemberById(formValue.leaderId).subscribe(m => resolve(m));
      });

      const cellData = {
        ...formValue,
        leaderName: leader?.name || 'Líder Desconhecido',
        memberIds: this.isEditMode ? undefined : [] // Inicializar vazio para novas células
      };

      if (this.isEditMode && this.cellId) {
        await this.cellsService.updateCell(this.cellId, cellData);
      } else {
        await this.cellsService.addCell(cellData);
      }
      
      this.router.navigate(['/dashboard/celulas']);
    } catch (error) {
      console.error('Erro ao salvar célula:', error);
      alert('Erro ao salvar célula.');
    } finally {
      this.isLoading = false;
    }
  }
}
