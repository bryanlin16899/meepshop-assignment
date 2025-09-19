import { v4 as uuid } from 'uuid';
import { Account } from "../schema";
import { CreateAccountRequest } from "./types";

export class BankService {
    private accounts: Map<string, Account> = new Map(); 
    private accountTransactions: Map<string, string[]> = new Map();

    createAccount(request: CreateAccountRequest = {}): Account {
        const { initialBalance = 0 } = request;

        if (initialBalance < 0) {
            throw new Error("存款不能為負值。")
        }

        const account: Account = {
            id: uuid(),
            balance: initialBalance,
            createdAt: new Date()
        };

        this.accounts.set(account.id, account);
        this.accountTransactions.set(account.id, []);

        //TODO 紀錄 transaction

        return account;
    }
}