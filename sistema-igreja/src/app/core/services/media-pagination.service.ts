import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaItem } from '../../shared/models';

/**
 * Interface para controle de paginação
 */
export interface PaginationState {
  items: MediaItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  visibleItems: MediaItem[];
}

/**
 * Serviço de Paginação para Lazy Loading
 * Gerencia carregamento gradual de mídias
 * Otimizado para produção com limite de 5-8 itens por página
 */
@Injectable({
  providedIn: 'root',
})
export class MediaPaginationService {
  private readonly DEFAULT_PAGE_SIZE = 6; // 2-3 itens por linha (grid responsivo)
  private allItemsSubject = new BehaviorSubject<MediaItem[]>([]);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private pageSizeSubject = new BehaviorSubject<number>(this.DEFAULT_PAGE_SIZE);

  private paginationStateSubject = new BehaviorSubject<PaginationState>(this.calculateState());

  public allItems$ = this.allItemsSubject.asObservable();
  public currentPage$ = this.currentPageSubject.asObservable();
  public paginationState$ = this.paginationStateSubject.asObservable();

  constructor() {
    // Recalcula estado quando dados ou página mudam
    this.allItemsSubject.subscribe(() => this.updateState());
    this.currentPageSubject.subscribe(() => this.updateState());
    this.pageSizeSubject.subscribe(() => this.updateState());
  }

  /**
   * Define todos os itens a paginar
   * @param items - Array completo de mídias
   */
  setItems(items: MediaItem[]): void {
    this.allItemsSubject.next(items);
    // Reseta para primeira página ao mudar dados
    this.setCurrentPage(1);
  }

  /**
   * Obtém itens da página atual
   */
  getVisibleItems(): Observable<MediaItem[]> {
    return this.paginationState$.pipe(map((state) => state.visibleItems));
  }

  /**
   * Obtém estado completo de paginação
   */
  getPaginationState(): Observable<PaginationState> {
    return this.paginationState$;
  }

  /**
   * Define página atual
   * @param page - Número da página (1-indexed)
   */
  setCurrentPage(page: number): void {
    const maxPage = Math.ceil(this.allItemsSubject.value.length / this.pageSizeSubject.value);
    const validPage = Math.max(1, Math.min(page, maxPage || 1));
    this.currentPageSubject.next(validPage);
  }

  /**
   * Avança para próxima página
   */
  nextPage(): void {
    const state = this.paginationStateSubject.value;
    if (state.hasNextPage) {
      this.setCurrentPage(state.currentPage + 1);
    }
  }

  /**
   * Volta para página anterior
   */
  previousPage(): void {
    const state = this.paginationStateSubject.value;
    if (state.hasPreviousPage) {
      this.setCurrentPage(state.currentPage - 1);
    }
  }

  /**
   * Define tamanho de página (quantidade de itens)
   * @param size - Número de itens por página
   */
  setPageSize(size: number): void {
    if (size > 0 && size <= 50) {
      this.pageSizeSubject.next(size);
    }
  }

  /**
   * Obtém tamanho atual de página
   */
  getPageSize(): number {
    return this.pageSizeSubject.value;
  }

  /**
   * Carrega mais itens (para infinite scroll)
   * Incrementa página e retorna novos itens
   */
  loadMore(): Observable<MediaItem[]> {
    this.nextPage();
    return this.getVisibleItems();
  }

  /**
   * Calcula estado de paginação
   */
  private calculateState(): PaginationState {
    const allItems = this.allItemsSubject.value;
    const pageSize = this.pageSizeSubject.value;
    const currentPage = this.currentPageSubject.value;

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleItems = allItems.slice(startIndex, endIndex);

    return {
      items: allItems,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      visibleItems,
    };
  }

  /**
   * Atualiza estado de paginação
   */
  private updateState(): void {
    this.paginationStateSubject.next(this.calculateState());
  }

  /**
   * Reseta paginação
   */
  reset(): void {
    this.allItemsSubject.next([]);
    this.currentPageSubject.next(1);
    this.updateState();
  }
}
