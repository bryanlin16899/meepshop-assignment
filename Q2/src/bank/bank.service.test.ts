import { TransactionType } from '../schema';
import { BadRequestError, InsufficientFundsError, NotFoundError } from '../utils/errors';
import { BankService } from './bank.service';

describe('BankService', () => {
  let bankService: BankService;

  beforeEach(() => {
    bankService = new BankService();
  });

  describe('Account Management', () => {
    describe('createAccount', () => {
      it('should create account with initial balance', async () => {
        const request = { name: 'Test User', initialBalance: 1000 };

        const account = await bankService.createAccount(request);

        expect(account).toMatchObject({
          name: 'Test User',
          balance: 1000,
        });
        expect(account.id).toBeDefined();
        expect(account.createdAt).toBeInstanceOf(Date);
      });

      it('should create account without initial balance (defaults to 0)', async () => {
        const request = { name: 'Test User' };

        const account = await bankService.createAccount(request);

        expect(account.balance).toBe(0);
        expect(account.name).toBe('Test User');
      });

      it('should create transaction log when account has initial balance', async () => {
        const request = { name: 'Test User', initialBalance: 500 };

        const account = await bankService.createAccount(request);
        const transactions = bankService.getAllTransactionLogs();

        expect(transactions).toHaveLength(1);
        expect(transactions[0]).toMatchObject({
          fromAccountId: null,
          toAccountId: account.id,
          amount: 500,
          type: TransactionType.DEPOSIT,
          description: '建立帳戶時存入。'
        });
      });

      it('should not create transaction log when account has no initial balance', async () => {
        const request = { name: 'Test User', initialBalance: 0 };

        await bankService.createAccount(request);
        const transactions = bankService.getAllTransactionLogs();

        expect(transactions).toHaveLength(0);
      });

      it('should reject negative initial balance', async () => {
        const request = { name: 'Test User', initialBalance: -100 };

        await expect(bankService.createAccount(request))
          .rejects.toThrow(BadRequestError);
        await expect(bankService.createAccount(request))
          .rejects.toThrow('存款不能為負值。');
      });
    });

    describe('getAllAccounts', () => {
      it('should return empty array when no accounts exist', () => {
        const accounts = bankService.getAllAccounts();
        expect(accounts).toEqual([]);
      });

      it('should return all created accounts', async () => {
        await bankService.createAccount({ name: 'User 1', initialBalance: 100 });
        await bankService.createAccount({ name: 'User 2', initialBalance: 200 });

        const accounts = bankService.getAllAccounts();

        expect(accounts).toHaveLength(2);
        expect(accounts[0].name).toBe('User 1');
        expect(accounts[1].name).toBe('User 2');
      });
    });

    describe('getAccount', () => {
      it('should return account when it exists', async () => {
        const createdAccount = await bankService.createAccount({ name: 'Test User', initialBalance: 100 });

        const account = bankService.getAccount(createdAccount.id);

        expect(account).toEqual(createdAccount);
      });

      it('should throw NotFoundError when account does not exist', () => {
        expect(() => bankService.getAccount('non-existent-id'))
          .toThrow(NotFoundError);
        expect(() => bankService.getAccount('non-existent-id'))
          .toThrow('該帳戶不存在');
      });
    });
  });

  describe('Deposit Operations', () => {
    let account: any;

    beforeEach(async () => {
      account = await bankService.createAccount({ name: 'Test User', initialBalance: 100 });
    });

    it('should successfully deposit money', async () => {
      const request = { id: account.id, amount: 500 };

      const updatedAccount = await bankService.deposit(request);

      expect(updatedAccount.balance).toBe(600);
      expect(updatedAccount.id).toBe(account.id);
    });

    it('should create transaction log for deposit', async () => {
      const request = { id: account.id, amount: 300 };

      await bankService.deposit(request);
      const transactions = bankService.getAllTransactionLogs();

      const depositTransaction = transactions.find(t => t.type === TransactionType.DEPOSIT && t.amount === 300);
      expect(depositTransaction).toMatchObject({
        fromAccountId: null,
        toAccountId: account.id,
        amount: 300,
        type: TransactionType.DEPOSIT
      });
    });

    it('should reject zero amount deposit', async () => {
      const request = { id: account.id, amount: 0 };

      await expect(bankService.deposit(request))
        .rejects.toThrow(BadRequestError);
      await expect(bankService.deposit(request))
        .rejects.toThrow('存入金額不能為負值。');
    });

    it('should reject negative amount deposit', async () => {
      const request = { id: account.id, amount: -100 };

      await expect(bankService.deposit(request))
        .rejects.toThrow(BadRequestError);
    });

    it('should reject deposit to non-existent account', async () => {
      const request = { id: 'non-existent-id', amount: 100 };

      await expect(bankService.deposit(request))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('Withdrawal Operations', () => {
    let account: any;

    beforeEach(async () => {
      account = await bankService.createAccount({ name: 'Test User', initialBalance: 1000 });
    });

    it('should successfully withdraw money', async () => {
      const request = { id: account.id, amount: 300 };

      const updatedAccount = await bankService.withdraw(request);

      expect(updatedAccount.balance).toBe(700);
    });

    it('should create transaction log for withdrawal', async () => {
      const request = { id: account.id, amount: 200 };

      await bankService.withdraw(request);
      const transactions = bankService.getAllTransactionLogs();

      const withdrawalTransaction = transactions.find(t => t.type === TransactionType.WITHDRAWAL && t.amount === 200);
      expect(withdrawalTransaction).toMatchObject({
        fromAccountId: null,
        toAccountId: account.id,
        amount: 200,
        type: TransactionType.WITHDRAWAL
      });
    });

    it('should reject withdrawal when insufficient funds', async () => {
      const request = { id: account.id, amount: 1500 };

      await expect(bankService.withdraw(request))
        .rejects.toThrow(InsufficientFundsError);
      await expect(bankService.withdraw(request))
        .rejects.toThrow('提款金額大於帳戶餘額。');
    });

    it('should reject zero amount withdrawal', async () => {
      const request = { id: account.id, amount: 0 };

      await expect(bankService.withdraw(request))
        .rejects.toThrow(BadRequestError);
      await expect(bankService.withdraw(request))
        .rejects.toThrow('提款金額不能為負值。');
    });

    it('should reject negative amount withdrawal', async () => {
      const request = { id: account.id, amount: -100 };

      await expect(bankService.withdraw(request))
        .rejects.toThrow(BadRequestError);
    });

    it('should reject withdrawal from non-existent account', async () => {
      const request = { id: 'non-existent-id', amount: 100 };

      await expect(bankService.withdraw(request))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('Transfer Operations', () => {
    let fromAccount: any;
    let toAccount: any;

    beforeEach(async () => {
      fromAccount = await bankService.createAccount({ name: 'From User', initialBalance: 1000 });
      toAccount = await bankService.createAccount({ name: 'To User', initialBalance: 500 });
    });

    it('should successfully transfer money between accounts', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 300
      };

      const result = await bankService.transfer(request);

      expect(result.fromAccount.balance).toBe(700);
      expect(result.toAccount.balance).toBe(800);
      expect(result.fromAccount.id).toBe(fromAccount.id);
      expect(result.toAccount.id).toBe(toAccount.id);
    });

    it('should create transaction log for transfer', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 250
      };

      await bankService.transfer(request);
      const transactions = bankService.getAllTransactionLogs();

      const transferTransaction = transactions.find(t => t.type === TransactionType.TRANSFER && t.amount === 250);
      expect(transferTransaction).toMatchObject({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 250,
        type: TransactionType.TRANSFER
      });
    });

    it('should reject transfer when insufficient funds', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 1500
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(InsufficientFundsError);
      await expect(bankService.transfer(request))
        .rejects.toThrow(`${fromAccount.id} 金額不足。餘額：${fromAccount.balance}`);
    });

    it('should reject transfer to same account', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: fromAccount.id,
        amount: 100
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(BadRequestError);
      await expect(bankService.transfer(request))
        .rejects.toThrow('轉出帳號與轉入帳號相同。');
    });

    it('should reject zero amount transfer', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 0
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(BadRequestError);
      await expect(bankService.transfer(request))
        .rejects.toThrow('提款金額不能為負值。');
    });

    it('should reject negative amount transfer', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: -100
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(BadRequestError);
    });

    it('should reject transfer from non-existent account', async () => {
      const request = {
        fromAccountId: 'non-existent-id',
        toAccountId: toAccount.id,
        amount: 100
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(NotFoundError);
    });

    it('should reject transfer to non-existent account', async () => {
      const request = {
        fromAccountId: fromAccount.id,
        toAccountId: 'non-existent-id',
        amount: 100
      };

      await expect(bankService.transfer(request))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('Transaction History', () => {
    let account1: any;
    let account2: any;

    beforeEach(async () => {
      account1 = await bankService.createAccount({ name: 'User 1', initialBalance: 1000 });
      account2 = await bankService.createAccount({ name: 'User 2', initialBalance: 500 });
    });

    describe('getAllTransactionLogs', () => {
      it('should return empty array when no transactions exist', () => {
        const emptyBankService = new BankService();
        const transactions = emptyBankService.getAllTransactionLogs();
        expect(transactions).toEqual([]);
      });

      it('should return all transactions sorted by date (newest first)', async () => {
        await bankService.deposit({ id: account1.id, amount: 200 });
        await new Promise(resolve => setTimeout(resolve, 5)); // Small delay to ensure different timestamps
        await bankService.withdraw({ id: account2.id, amount: 100 });
        await new Promise(resolve => setTimeout(resolve, 5));
        await bankService.transfer({ fromAccountId: account1.id, toAccountId: account2.id, amount: 300 });

        const transactions = bankService.getAllTransactionLogs();

        expect(transactions).toHaveLength(5); // 2 initial deposits + 3 operations
        expect(transactions[0].type).toBe(TransactionType.TRANSFER); // Most recent
        expect(transactions[1].type).toBe(TransactionType.WITHDRAWAL);
        expect(transactions[2].type).toBe(TransactionType.DEPOSIT);

        // Verify sorting by date
        for (let i = 0; i < transactions.length - 1; i++) {
          expect(transactions[i].createAt.getTime()).toBeGreaterThanOrEqual(transactions[i + 1].createAt.getTime());
        }
      });
    });

    describe('getAccountTransactionLogs', () => {
      it('should return account-specific transactions', async () => {
        await bankService.deposit({ id: account1.id, amount: 200 });
        await bankService.withdraw({ id: account2.id, amount: 100 });
        await bankService.transfer({ fromAccountId: account1.id, toAccountId: account2.id, amount: 150 });

        const account1Transactions = bankService.getAccountTransactionLogs(account1.id);
        const account2Transactions = bankService.getAccountTransactionLogs(account2.id);

        expect(account1Transactions.accountId).toBe(account1.id);
        expect(account1Transactions.transactions).toHaveLength(3); // Initial deposit + deposit + transfer

        expect(account2Transactions.accountId).toBe(account2.id);
        expect(account2Transactions.transactions).toHaveLength(3); // Initial deposit + withdrawal + transfer
      });

      it('should return transactions sorted by date (newest first)', async () => {
        await bankService.deposit({ id: account1.id, amount: 100 });
        await new Promise(resolve => setTimeout(resolve, 5));
        await bankService.deposit({ id: account1.id, amount: 200 });

        const result = bankService.getAccountTransactionLogs(account1.id);

        expect(result.transactions[0].amount).toBe(200); // Most recent deposit
      });

      it('should throw error for non-existent account', () => {
        expect(() => bankService.getAccountTransactionLogs('non-existent-id'))
          .toThrow(NotFoundError);
      });

      it('should return empty transactions for account with no activity', async () => {
        const newAccount = await bankService.createAccount({ name: 'New User', initialBalance: 0 });

        const result = bankService.getAccountTransactionLogs(newAccount.id);

        expect(result.accountId).toBe(newAccount.id);
        expect(result.transactions).toEqual([]);
      });
    });
  });

  describe('Concurrency and Atomic Operations', () => {
    it('should handle concurrent operations safely', async () => {
      const account = await bankService.createAccount({ name: 'Test User', initialBalance: 1000 });

      // Execute multiple concurrent operations
      const operations = [
        bankService.deposit({ id: account.id, amount: 100 }),
        bankService.withdraw({ id: account.id, amount: 50 }),
        bankService.deposit({ id: account.id, amount: 200 }),
        bankService.withdraw({ id: account.id, amount: 75 }),
      ];

      await Promise.all(operations);

      const finalAccount = bankService.getAccount(account.id);
      expect(finalAccount.balance).toBe(1175); // 1000 + 100 - 50 + 200 - 75
    });

    it('should handle concurrent transfers safely', async () => {
      const account1 = await bankService.createAccount({ name: 'User 1', initialBalance: 1000 });
      const account2 = await bankService.createAccount({ name: 'User 2', initialBalance: 1000 });

      // Execute concurrent transfers
      const transfers = [
        bankService.transfer({ fromAccountId: account1.id, toAccountId: account2.id, amount: 100 }),
        bankService.transfer({ fromAccountId: account2.id, toAccountId: account1.id, amount: 50 }),
        bankService.transfer({ fromAccountId: account1.id, toAccountId: account2.id, amount: 200 }),
      ];

      await Promise.all(transfers);

      const finalAccount1 = bankService.getAccount(account1.id);
      const finalAccount2 = bankService.getAccount(account2.id);

      expect(finalAccount1.balance).toBe(750); // 1000 - 100 + 50 - 200
      expect(finalAccount2.balance).toBe(1250); // 1000 + 100 - 50 + 200

      // Total balance should be conserved
      expect(finalAccount1.balance + finalAccount2.balance).toBe(2000);
    });
  });

  describe('Transaction Data Integrity', () => {
    it('should generate unique transaction IDs', async () => {
      const account = await bankService.createAccount({ name: 'Test User', initialBalance: 100 });

      await bankService.deposit({ id: account.id, amount: 100 });
      await bankService.withdraw({ id: account.id, amount: 50 });

      const transactions = bankService.getAllTransactionLogs();
      const transactionIds = transactions.map(t => t.id);
      const uniqueIds = new Set(transactionIds);

      expect(uniqueIds.size).toBe(transactions.length);
    });

    it('should maintain transaction timestamp accuracy', async () => {
      const account = await bankService.createAccount({ name: 'Test User', initialBalance: 100 });

      const beforeTime = new Date();
      await bankService.deposit({ id: account.id, amount: 100 });
      const afterTime = new Date();

      const transactions = bankService.getAllTransactionLogs();
      const depositTransaction = transactions.find(t => t.type === TransactionType.DEPOSIT && t.amount === 100);

      expect(depositTransaction?.createAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(depositTransaction?.createAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should correctly associate transactions with accounts', async () => {
      const account1 = await bankService.createAccount({ name: 'User 1', initialBalance: 500 });
      const account2 = await bankService.createAccount({ name: 'User 2', initialBalance: 300 });

      await bankService.transfer({ fromAccountId: account1.id, toAccountId: account2.id, amount: 200 });

      const account1Transactions = bankService.getAccountTransactionLogs(account1.id);
      const account2Transactions = bankService.getAccountTransactionLogs(account2.id);

      const transferTransaction1 = account1Transactions.transactions.find(t => t.type === TransactionType.TRANSFER);
      const transferTransaction2 = account2Transactions.transactions.find(t => t.type === TransactionType.TRANSFER);

      expect(transferTransaction1?.id).toBe(transferTransaction2?.id);
      expect(transferTransaction1?.fromAccountId).toBe(account1.id);
      expect(transferTransaction1?.toAccountId).toBe(account2.id);
    });
  });
});