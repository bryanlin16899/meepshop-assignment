import { Transaction } from "../schema";

export interface ApiError {
  msg: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: ApiError[];
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

export interface TransactionHistoryResponse {
  accountId: string;
  transactions: Transaction[];
}
