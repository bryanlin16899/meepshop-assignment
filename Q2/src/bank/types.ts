export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateAccountRequest {
  initialBalance?: number;
  name: string;
}

export interface DepositRequest {
  id: string;
  amount: number;
}

export interface withdrawRequest extends DepositRequest {}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}