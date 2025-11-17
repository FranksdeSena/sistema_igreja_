import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuração do Supabase
 * Variáveis de ambiente para acesso à API
 */
export const SUPABASE_CONFIG = {
  url: 'https://your-project.nuwyytkocwdrhywtmemj.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51d3l5dGtvY3dkcmh5d3RtZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDQxMDYsImV4cCI6MjA3ODk4MDEwNn0.T4c-X1v2bD-lsNPN0uQNCZPcjkX0-TVtNGaBGeUhlOo',
};

/**
 * Serviço de Inicialização do Supabase
 * Fornece instância única do cliente
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseInitService {
  private supabaseClient: SupabaseClient | null = null;

  /**
   * Inicializa cliente Supabase
   * Deve ser chamado na raiz da aplicação (main.ts ou app.component)
   */
  initialize(url: string, key: string): SupabaseClient {
    this.supabaseClient = createClient(url, key);
    console.log('✅ Supabase inicializado com sucesso');
    return this.supabaseClient;
  }

  /**
   * Obtém instância do cliente Supabase
   */
  getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error('Supabase não foi inicializado. Chame initialize() primeiro.');
    }
    return this.supabaseClient;
  }

  /**
   * Verifica se está inicializado
   */
  isInitialized(): boolean {
    return this.supabaseClient !== null;
  }
}
