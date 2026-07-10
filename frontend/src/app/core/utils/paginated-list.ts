import { Observable } from 'rxjs';
import { Page } from '../models/item.model';

export interface PaginatedListState<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  errorMessage: string;
}

export function loadPage<T>(
  state: PaginatedListState<T>,
  request: Observable<Page<T>>,
  errorMessage: string
): void {
  state.isLoading = true;
  state.errorMessage = '';

  request.subscribe({
    next: (result) => {
      state.items = result.content;
      state.currentPage = result.number;
      state.totalPages = result.totalPages;
      state.isLoading = false;
    },
    error: (error) => {
      console.error(error);
      state.errorMessage = errorMessage;
      state.isLoading = false;
    }
  });
}

export function previousPageIndex(state: Pick<PaginatedListState<unknown>, 'currentPage'>): number | null {
  return state.currentPage > 0 ? state.currentPage - 1 : null;
}

export function nextPageIndex(
  state: Pick<PaginatedListState<unknown>, 'currentPage' | 'totalPages'>
): number | null {
  return state.currentPage < state.totalPages - 1 ? state.currentPage + 1 : null;
}
