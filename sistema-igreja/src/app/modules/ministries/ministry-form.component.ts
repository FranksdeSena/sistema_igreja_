import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MinistriesDatabaseService } from '../../core/services/ministries-database.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Member } from '../../shared/models/member.model';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ministry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <button routerLink=".." class="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <span>⬅️</span> Voltar
        </button>
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isEditMode ? 'Editar Ministério' : 'Novo Ministério' }}
        </h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Ministério *</label>
          <input formControlName="name" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select formControlName="category" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white">
            <option value="">Selecione uma categoria</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Líder *</label>
          <select formControlName="leaderId" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white">
            <option value="">Selecione um líder</option>
            <option *ngFor="let member of members$ | async" [value]="member.id">{{ member.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea formControlName="description" rows="3" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"></textarea>
        </div>

        <div class="flex justify-end gap-4 pt-4 border-t">
          <button type="button" routerLink=".." class="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid || isLoading" class="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50">
            {{ isLoading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Criar') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class MinistryFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ministryId: string | null = null;
  isLoading = false;
  members$: Observable<Member[]>;
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private ministriesService: MinistriesDatabaseService,
    private membersService: MembersDatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.members$ = this.membersService.getMembers();
    this.categories = this.ministriesService.getCategories();
    
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      leaderId: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.ministryId = id;
      this.loadMinistry(id);
    }
  }

  loadMinistry(id: string) {
    this.ministriesService.getMinistryById(id).subscribe(ministry => {
      if (ministry) {
        this.form.patchValue(ministry);
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formValue = this.form.value;

    try {
      const leader = await firstValueFrom(this.membersService.getMemberById(formValue.leaderId));

      const ministryData = {
        ...formValue,
        leaderName: leader?.name || 'Líder Desconhecido',
        volunteerIds: this.isEditMode ? undefined : []
      };

      if (this.isEditMode && this.ministryId) {
        await this.ministriesService.updateMinistry(this.ministryId, ministryData);
      } else {
        await this.ministriesService.addMinistry(ministryData);
      }
      
      this.router.navigate(['/dashboard/ministerios']);
    } catch (error) {
      console.error('Erro ao salvar ministério:', error);
      alert('Erro ao salvar ministério.');
    } finally {
      this.isLoading = false;
    }
  }
}
