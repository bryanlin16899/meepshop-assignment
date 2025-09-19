import { v4 as uuid } from 'uuid';
import { Account } from "../schema";
import { CreateAccountRequest } from "./types";

export class BankService {
    private accounts: Map<string, Account> = new Map(); 
    private accountTransactions: Map<string, string[]> = new Map();

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

    getAllAccounts(): Account[] {
        return Array.from(this.accounts.values())
    }

    getAccount(accountId: string): Account {
        const account = this.accounts.get(accountId)
        if (!account) {
            throw new Error("該帳戶不存在")
        }
        return account
    }
}