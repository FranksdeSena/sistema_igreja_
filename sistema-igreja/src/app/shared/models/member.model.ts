// Membro da igreja
export interface Member {
  id: string;
  churchId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate?: Date;
  joinDate: Date;
  cellId?: string;
  status: 'active' | 'inactive' | 'visiting';
  role?: string;
  photo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}


