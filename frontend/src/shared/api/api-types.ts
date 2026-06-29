export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiListResponse<T> = {
  data: T[];
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

export type ApiMutationResponse<T = unknown> = {
  data?: T;
  message?: string;
};
