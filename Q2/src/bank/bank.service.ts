import { v4 as uuid } from 'uuid';
import { Account } from "../schema";
import { CreateAccountRequest, DepositRequest, TransferRequest, withdrawRequest as WithdrawRequest } from "./types";

export class BankService {
    private accounts: Map<string, Account> = new Map(); 
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

        //TODO 紀錄 transaction

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

        //TODO 紀錄 transaction

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

        //TODO 紀錄 transaction

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

        //TODO 紀錄 transaction

        return { fromAccount, toAccount };
    }
}