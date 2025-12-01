import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Member } from '../../shared/models';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-birthdays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Aniversariantes</h1>
          <p class="text-sm text-gray-600 mt-1">
            Celebre a vida dos membros da sua igreja
          </p>
        </div>

        <!-- Filtro de Mês -->
        <div class="w-full md:w-64">
          <select
            [ngModel]="selectedMonth"
            (ngModelChange)="onMonthChange($event)"
            class="input-field w-full"
          >
            <option *ngFor="let month of months; let i = index" [value]="i">
              {{ month }}
            </option>
          </select>
        </div>
      </div>

      <!-- Lista de Aniversariantes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let member of filteredMembers$ | async"
          class="card-hover p-4 flex items-center gap-4"
        >
          <!-- Foto / Avatar -->
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            {{ member.photo || '👤' }}
          </div>

          <!-- Informações -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ member.name }}</h3>
            <p class="text-sm text-gray-600">
              {{ getBirthDateDisplay(member.birthDate) }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span class="badge badge-primary text-xs">
                {{ calculateAge(member.birthDate) }} anos
              </span>
              <span class="text-xs text-gray-500 truncate">{{ member.role || 'Membro' }}</span>
            </div>
          </div>

          <!-- Ações -->
          <button
            (click)="sendWhatsApp(member)"
            class="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Enviar Parabéns no WhatsApp"
          >
            <span class="text-xl">📱</span>
          </button>
        </div>
      </div>

      <!-- Estado Vazio -->
      <div
        *ngIf="(filteredMembers$ | async)?.length === 0"
        class="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <div class="text-4xl mb-3">🎂</div>
        <h3 class="text-lg font-medium text-gray-900">Nenhum aniversariante</h3>
        <p class="text-gray-500">Ninguém faz aniversário neste mês.</p>
      </div>
    </div>
  `,
})
export class BirthdaysComponent implements OnInit {
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  selectedMonth: number = new Date().getMonth();
  selectedMonthSubject = new BehaviorSubject<number>(this.selectedMonth);
  
  filteredMembers$: Observable<Member[]>;

  constructor(private membersService: MembersDatabaseService) {
    this.filteredMembers$ = combineLatest([
      this.membersService.getMembers(),
      this.selectedMonthSubject
    ]).pipe(
      map(([members, month]) => {
        console.log('🎂 Debug Aniversariantes:');
        console.log('Mês selecionado:', month, '(' + this.months[month] + ')');
        console.log('Total de membros:', members.length);
        
        const filtered = members
          .filter(m => {
            if (!m.birthDate) {
              console.log(`  - ${m.name}: SEM DATA DE NASCIMENTO ❌`);
              return false;
            }
            
            // Log do valor bruto
            console.log(`  - ${m.name}: birthDate RAW =`, m.birthDate, typeof m.birthDate);
            
            // Tentar criar Date
            let date: Date;
            try {
              date = new Date(m.birthDate);
              
              // Verificar se a data é válida
              if (isNaN(date.getTime())) {
                console.log(`    ⚠️ DATA INVÁLIDA! Não é possível converter para Date`);
                return false;
              }
            } catch (error) {
              console.log(`    ⚠️ ERRO ao converter:`, error);
              return false;
            }
            
            // Usar UTC para garantir consistência
            const isoString = date.toISOString();
            const mMonth = parseInt(isoString.substring(5, 7)) - 1;
            const mDay = parseInt(isoString.substring(8, 10));
            
            const isMatch = mMonth === month;
            
            console.log(`    Data ISO: ${isoString}`);
            console.log(`    Dia/Mês: ${mDay}/${mMonth + 1} (${this.months[mMonth]})`);
            console.log(`    Match com filtro? ${isMatch ? '✅' : '❌'}`);
            
            return isMatch;
          })
          .sort((a, b) => {
            const dateA = new Date(a.birthDate!);
            const dateB = new Date(b.birthDate!);
            return dateA.getUTCDate() - dateB.getUTCDate();
          });
        
        console.log('Aniversariantes encontrados:', filtered.length);
        return filtered;
      })
    );
  }

  ngOnInit(): void {}

  onMonthChange(monthIndex: string | number): void {
    this.selectedMonth = Number(monthIndex);
    this.selectedMonthSubject.next(this.selectedMonth);
  }

  getBirthDateDisplay(dateStr?: Date | string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Exibir dia/mês usando UTC para consistência visual
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  calculateAge(dateStr?: Date | string): number {
    if (!dateStr) return 0;
    const birthDate = new Date(dateStr);
    const today = new Date();
    
    // Ajuste simples de idade
    let age = today.getFullYear() - birthDate.getUTCFullYear();
    const m = today.getMonth() - birthDate.getUTCMonth();
    
    // Se ainda não chegou o mês, ou é o mês mas não chegou o dia
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getUTCDate())) {
      age--;
    }
    
    return age;
  }

  sendWhatsApp(member: Member): void {
    if (!member.whatsapp && !member.phone) {
      alert('Este membro não possui número de telefone cadastrado.');
      return;
    }

    const phone = (member.whatsapp || member.phone).replace(/\D/g, '');
    const firstName = member.name.split(' ')[0];
    const message = `Olá ${firstName}! 🎉\n\nA Igreja gostaria de te desejar um Feliz Aniversário! Que Deus continue te abençoando grandemente neste novo ano de vida.\n\nParabéns! 🎂🙏`;
    
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
