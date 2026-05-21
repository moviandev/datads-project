export interface ApiResponse<T> {
  data: T;
  filters_applied?: Record<string, string | null>;
}
