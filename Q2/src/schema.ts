// 以下 DB Schema 用 interface 表示
// 銀行帳號
export interface Account {
    id: string;
    balance: number;
    createdAt: Date;
}

// 交易紀錄
export interface Transaction {
    id: string;
    fromAccountId: string | null;
    toAccountId: string | null;
    amount: number;
    type: TransactionType;
    createAt: Date
}

// 操作類型
export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    TRANSFER = 'TRANSFER',
    WITHDRAWAL = 'WITHDRAWAL'
}