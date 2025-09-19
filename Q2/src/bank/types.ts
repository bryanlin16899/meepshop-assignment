export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateAccountRequest {
  initialBalance?: number;
  name: string;
}
