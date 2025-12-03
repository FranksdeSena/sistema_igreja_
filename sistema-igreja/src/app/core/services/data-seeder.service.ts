import { Injectable, inject } from '@angular/core';
import { PastorDatabaseService } from './pastor-database.service';
import { EventsDatabaseService } from './events-database.service';
import { MinistriesDatabaseService } from './ministries-database.service';
import { CellsDatabaseService } from './cells-database.service';
import { MembersDatabaseService } from './members-database.service';
import { Sermon } from '../../shared/models/pastor.model';
import { Event } from '../../shared/models/event.model';
import { Ministry } from '../../shared/models/ministry.model';
import { Cell } from '../../shared/models/cell.model';
import { Member } from '../../shared/models/member.model';

@Injectable({
  providedIn: 'root'
})
export class DataSeederService {
  private pastorService = inject(PastorDatabaseService);
  private eventsService = inject(EventsDatabaseService);
  private ministriesService = inject(MinistriesDatabaseService);
  private cellsService = inject(CellsDatabaseService);
  private membersService = inject(MembersDatabaseService);

  async seedAll(): Promise<void> {
    console.log('Iniciando seed de dados...');
    
    await this.seedSermons();
    await this.seedEvents();
    await this.seedMinistries();
    await this.seedCells();
    await this.seedMembers();
    
    console.log('Seed de dados concluído!');
  }

  private async seedSermons(): Promise<void> {
    console.log('Criando sermões...');
    const sermons: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'O Poder da Fé',
        preacher: 'Pr. João Silva',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana atrás
        scriptureReference: 'Hebreus 11:1',
        description: 'Uma mensagem inspiradora sobre como a fé move montanhas.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Exemplo
        series: 'Fé Inabalável',
        tags: ['Fé', 'Esperança']
      },
      {
        title: 'Vivendo em Comunidade',
        preacher: 'Pr. João Silva',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 semanas atrás
        scriptureReference: 'Atos 2:42',
        description: 'A importância de vivermos unidos em Cristo.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        series: 'Atos',
        tags: ['Comunhão', 'Igreja']
      },
      {
        title: 'A Importância da Oração',
        preacher: 'Pra. Maria Silva',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        scriptureReference: '1 Tessalonicenses 5:17',
        description: 'Como a oração transforma nossas vidas.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: ['Oração', 'Vida Espiritual']
      },
      {
        title: 'Graça Superabundante',
        preacher: 'Pr. João Silva',
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        scriptureReference: 'Romanos 5:20',
        description: 'Entendendo a profundidade da graça de Deus.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        series: 'Graça',
        tags: ['Graça', 'Salvação']
      },
      {
        title: 'Caminhando com Deus',
        preacher: 'Ev. Pedro Santos',
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        scriptureReference: 'Gênesis 5:24',
        description: 'Lições da vida de Enoque.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: ['Caminhada', 'Intimidade']
      }
    ];

    for (const sermon of sermons) {
      await this.pastorService.addSermon(sermon);
    }
  }

  private async seedEvents(): Promise<void> {
    console.log('Criando eventos...');
    const events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Culto de Celebração',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Daqui a 2 dias
        time: '19:00',
        location: 'Templo Principal',
        description: 'Venha celebrar ao Senhor conosco!',
        category: 'Culto',
        status: 'scheduled'
      },
      {
        name: 'Escola Bíblica Dominical',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Daqui a 5 dias
        time: '09:00',
        location: 'Salas de Aula',
        description: 'Aprendendo mais da Palavra de Deus.',
        category: 'Ensino',
        status: 'scheduled'
      },
      {
        name: 'Culto de Oração',
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        time: '20:00',
        location: 'Templo Principal',
        description: 'Tempo de intercessão e busca.',
        category: 'Culto',
        status: 'scheduled'
      },
      {
        name: 'Conferência de Jovens',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        time: '19:30',
        location: 'Auditório',
        description: 'Um tempo especial para a juventude.',
        category: 'Conferência',
        status: 'scheduled'
      },
      {
        name: 'Culto da Virada',
        date: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        time: '22:00',
        location: 'Templo Principal',
        description: 'Recebendo o ano novo na presença de Deus.',
        category: 'Culto',
        status: 'scheduled'
      }
    ];

    for (const event of events) {
      await this.eventsService.addEvent(event);
    }
  }

  private async seedMinistries(): Promise<void> {
    console.log('Criando ministérios...');
    const ministries: Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Louvor e Adoração',
        description: 'Responsável pela música e adoração nos cultos.',
        leaderName: 'Ana Paula',
        meetingDay: 'Sábado',
        meetingTime: '14:00',
        category: 'Louvor e Adoração',
        volunteerIds: []
      },
      {
        name: 'Mídia e Tecnologia',
        description: 'Responsável pela projeção, som e transmissão.',
        leaderName: 'Carlos Oliveira',
        meetingDay: 'Quarta',
        meetingTime: '19:00',
        category: 'Mídia e Tecnologia',
        volunteerIds: []
      },
      {
        name: 'Ministério Infantil',
        description: 'Ensino e cuidado das crianças durante os cultos.',
        leaderName: 'Sarah Costa',
        meetingDay: 'Domingo',
        meetingTime: '08:30',
        category: 'Infantil',
        volunteerIds: []
      },
      {
        name: 'Recepção e Acolhimento',
        description: 'Receber bem os membros e visitantes.',
        leaderName: 'Roberto Almeida',
        meetingDay: 'Domingo',
        meetingTime: '18:00',
        category: 'Recepção',
        volunteerIds: []
      }
    ];

    for (const ministry of ministries) {
      await this.ministriesService.addMinistry(ministry);
    }
  }

  private async seedCells(): Promise<void> {
    console.log('Criando células...');
    const cells: Omit<Cell, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Célula Betel',
        leaderName: 'Ricardo e Júlia',
        hostName: 'Família Souza',
        address: 'Rua das Flores, 123',
        meetingDay: 'Terça',
        meetingTime: '20:00',
        description: 'Célula mista para casais.',
        neighborhood: 'Centro',
        status: 'active'
      },
      {
        name: 'Célula Jovem Kadosh',
        leaderName: 'Felipe',
        hostName: 'Felipe',
        address: 'Av. Principal, 500',
        meetingDay: 'Sexta',
        meetingTime: '19:30',
        description: 'Célula voltada para jovens e adolescentes.',
        neighborhood: 'Jardim América',
        status: 'active'
      },
      {
        name: 'Célula Mulheres de Fé',
        leaderName: 'Pra. Maria',
        hostName: 'Dona Lúcia',
        address: 'Rua da Paz, 45',
        meetingDay: 'Quinta',
        meetingTime: '15:00',
        description: 'Tempo de comunhão entre mulheres.',
        neighborhood: 'Vila Nova',
        status: 'active'
      }
    ];

    for (const cell of cells) {
      await this.cellsService.addCell(cell);
    }
  }

  private async seedMembers(): Promise<void> {
    console.log('Criando membros...');
    // Criar alguns membros fictícios para popular a lista
    // Nota: Em um cenário real, evitaríamos criar usuários de auth, apenas registros no banco
    const members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'João Silva',
        email: 'joao.pastor@exemplo.com',
        phone: '(11) 99999-0001',
        role: 'Pastor Presidente',
        status: 'active',
        birthDate: new Date(1975, 5, 15).toISOString(),
        address: 'Rua da Igreja, 1',
        photo: 'https://ui-avatars.com/api/?name=Joao+Silva&background=0D8ABC&color=fff'
      },
      {
        name: 'Maria Silva',
        email: 'maria.pastora@exemplo.com',
        phone: '(11) 99999-0002',
        role: 'Pastora',
        status: 'active',
        birthDate: new Date(1978, 8, 20).toISOString(),
        address: 'Rua da Igreja, 1',
        photo: 'https://ui-avatars.com/api/?name=Maria+Silva&background=E91E63&color=fff'
      },
      {
        name: 'Ana Paula',
        email: 'ana.louvor@exemplo.com',
        phone: '(11) 99999-0003',
        role: 'Líder de Louvor',
        status: 'active',
        birthDate: new Date(1990, 2, 10).toISOString(),
        address: 'Rua das Músicas, 40',
        photo: 'https://ui-avatars.com/api/?name=Ana+Paula&background=9C27B0&color=fff'
      },
      {
        name: 'Carlos Oliveira',
        email: 'carlos.midia@exemplo.com',
        phone: '(11) 99999-0004',
        role: 'Líder de Mídia',
        status: 'active',
        birthDate: new Date(1995, 11, 5).toISOString(),
        address: 'Av. Tecnológica, 200',
        photo: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=2196F3&color=fff'
      },
      {
        name: 'Lúcia Santos',
        email: 'lucia.intercessao@exemplo.com',
        phone: '(11) 99999-0005',
        role: 'Líder de Intercessão',
        status: 'active',
        birthDate: new Date(1960, 0, 25).toISOString(),
        address: 'Rua da Oração, 7',
        photo: 'https://ui-avatars.com/api/?name=Lucia+Santos&background=FF9800&color=fff'
      }
    ];

    for (const member of members) {
      await this.membersService.addMember(member);
    }
  }
}
