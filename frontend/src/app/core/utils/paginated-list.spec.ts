import { of, throwError } from 'rxjs';
import { loadPage, nextPageIndex, previousPageIndex, PaginatedListState } from './paginated-list';
import { Page } from '../models/item.model';

describe('paginated-list utils', () => {
  function createState(): PaginatedListState<number> {
    return {
      items: [],
      currentPage: 0,
      totalPages: 0,
      isLoading: true,
      errorMessage: ''
    };
  }

  it('should apply a successful page result to the state', () => {
    const state = createState();
    const page: Page<number> = { content: [1, 2], number: 1, totalPages: 3, totalElements: 5 };

    loadPage(state, of(page), 'error');

    expect(state.items).toEqual([1, 2]);
    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(3);
    expect(state.isLoading).toBeFalse();
  });

  it('should expose the given error message when the request fails', () => {
    const state = createState();

    loadPage(state, throwError(() => new Error('network error')), 'Impossible de récupérer les elements.');

    expect(state.errorMessage).toBe('Impossible de récupérer les elements.');
    expect(state.isLoading).toBeFalse();
  });

  it('should return the previous page index when not on the first page', () => {
    expect(previousPageIndex({ currentPage: 2 })).toBe(1);
  });

  it('should return null for the previous page index on the first page', () => {
    expect(previousPageIndex({ currentPage: 0 })).toBeNull();
  });

  it('should return the next page index when not on the last page', () => {
    expect(nextPageIndex({ currentPage: 0, totalPages: 3 })).toBe(1);
  });

  it('should return null for the next page index on the last page', () => {
    expect(nextPageIndex({ currentPage: 2, totalPages: 3 })).toBeNull();
  });
});
