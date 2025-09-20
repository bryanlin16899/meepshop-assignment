import { randomUUID as uuid } from 'crypto';
import { Account, Transaction, TransactionType } from "../schema";
import { CreateAccountRequest, DepositRequest, TransactionHistoryResponse, TransferRequest, withdrawRequest as WithdrawRequest } from "./types";

export class BankService {
    private accounts: Map<string, Account> = new Map(); 
    private transactions: Map<string, Transaction> = new Map();
    private accountTransactions: Map<string, string[]> = new Map();

    // 新建帳戶
    createAccount(request: CreateAccountRequest): Account {
        const { initialBalance = 0, name } = request;

        if (initialBalance < 0) {
            throw new Error("存款不能為負值。")
        }

        const account: Account = {
            id: uuid(),
            name: name,
            balance: initialBalance,
            createdAt: new Date()
        };

        this.accounts.set(account.id, account);
        this.accountTransactions.set(account.id, []);

        // 建立帳戶時有預設金額才會記錄 transaction
        if (initialBalance > 0) {
            this.recordTransaction({
                fromAccountId: null,
                toAccountId: account.id,
                amount: initialBalance,
                type: TransactionType.DEPOSIT,
                description: "建立帳戶時存入。"
            })
        }

        return account;
    }

    // 取得所有帳戶
    getAllAccounts(): Account[] {
        return Array.from(this.accounts.values())
    }

    // 取得單個帳戶
    getAccount(accountId: string): Account {
        const account = this.accounts.get(accountId)
        if (!account) {
            throw new Error("該帳戶不存在")
        }
        return account
    }

    // 存入金額到指定帳戶
    deposit(request: DepositRequest): Account {
        const { id, amount } = request;

        if (amount <= 0) {
            throw new Error("存入金額不能為負值。")
        }

        const account = this.getAccount(id);
        account.balance += amount;

        this.recordTransaction({
            fromAccountId: null,
            toAccountId: id,
            amount,
            type: TransactionType.DEPOSIT
        })

        return account;
    }

    // 從指定帳戶提取金額
    withdraw(request: WithdrawRequest): Account {
        const { id, amount } = request;

        if (amount <= 0) {
            throw new Error("提款金額不能為負值。");
        }

        const account = this.getAccount(id);
        if (account.balance < amount) {
            throw new Error("提款金額大於帳戶餘額。")
        }
        account.balance -= amount

        this.recordTransaction({
            fromAccountId: null,
            toAccountId: id,
            amount,
            type: TransactionType.WITHDRAWAL
        })

        return account;
    }

    // 轉帳
    transfer(request: TransferRequest): { fromAccount: Account; toAccount: Account; } {
        const { fromAccountId, toAccountId, amount } = request;

        if (amount <= 0) {
            throw new Error("提款金額不能為負值。");
        }

        if (fromAccountId === toAccountId) {
        throw new Error('Cannot transfer to the same account');
        }

        const fromAccount = this.getAccount(fromAccountId);
        const toAccount = this.getAccount(toAccountId);

        if (fromAccount.balance < amount) {
            throw new Error(`${fromAccount.id} 金額不足。餘額：${fromAccount.balance}`);
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        this.recordTransaction({
            fromAccountId: fromAccountId,
            toAccountId: toAccountId,
            amount,
            type: TransactionType.TRANSFER
        })

        return { fromAccount, toAccount };
    }

    // 取得所有交易紀錄
    getAllTransactionLogs(): Transaction[] {
        return Array.from(this.transactions.values())
            .sort((a, b) => b.createAt.getTime() - a.createAt.getTime());
    }

    // 取得各別帳號的交易紀錄，從 transactions filter out accountTransactions
    getAccountTransactionLogs(accountId: string): TransactionHistoryResponse{
        this.getAccount(accountId)

        const transactionIds = this.accountTransactions.get(accountId) || [];
        const transactions = transactionIds.map(id => this.transactions.get(id)).filter((transaction): transaction is Transaction => transaction != undefined).sort((a, b) => b.createAt.getTime() - a.createAt.getTime());

        return {
            accountId,
            transactions
        }
    }

    // util function, 用來儲存交易紀錄
    private recordTransaction(
        transactionData: {
            fromAccountId: string | null;
            toAccountId: string | null;
            amount: number;
            type: TransactionType;
            description?: string;
    }): Transaction {
        const transaction: Transaction = {
            id: uuid(),
            ...transactionData,
            createAt: new Date()
        };

        this.transactions.set(transaction.id, transaction);

        if (transaction.fromAccountId) {
            const fromTransactions = this.accountTransactions.get(transaction.fromAccountId) || [];
            fromTransactions.push(transaction.id);
            this.accountTransactions.set(transaction.fromAccountId, fromTransactions);
        }

        if (transaction.toAccountId) {
            const toTransactions = this.accountTransactions.get(transaction.toAccountId) || [];
            toTransactions.push(transaction.id);
            this.accountTransactions.set(transaction.toAccountId, toTransactions);
        }

        return transaction;
    }
}