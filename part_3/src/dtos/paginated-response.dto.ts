export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    total: number;
  };
}
