import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import validate from '../validation/validation';
import { createAccountSchema, depositWithdrawSchema, transferSchema } from '../validation/validationSchemas';
import { BankService } from './bank.service';
import {
    ApiResponse,
    CreateAccountRequest,
    DepositRequest,
    withdrawRequest,
} from './types';
import errorHandler from '../middleware/errorHandler';

describe('Bank Router Integration Tests', () => {
  let app: express.Application;
  let bankService: BankService;

  beforeEach(() => {
    // Create fresh instances for each test
    bankService = new BankService();

    // Create a fresh router with the new service instance
    const router = Router();

    // Set up routes with the fresh service
    router.post(
        '/createAccount',
        validate(createAccountSchema),
        asyncHandler(async (req: express.Request<{}, ApiResponse<any>, CreateAccountRequest>, res: express.Response) => {
                const newAccount = await bankService.createAccount(req.body)
                res.status(201).json({ success: true, data: newAccount });
        })
    );

    router.get(
        '/getAllAccounts',
        asyncHandler((req: express.Request, res: express.Response) => {
                const accounts = bankService.getAllAccounts();
                res.json({ success: true, data: accounts });
        })
    )

    router.get(
        '/getAccount',
        asyncHandler((req: express.Request<any, any, any, { id: string }>, res: express.Response) => {
                const account = bankService.getAccount(req.query.id)
                res.json({ success: true, data: account })
        })
    )

    router.post(
        '/deposit',
        validate(depositWithdrawSchema),
        asyncHandler(async (req: express.Request<any, ApiResponse<any>, DepositRequest>, res: express.Response) => {
                const account = await bankService.deposit(req.body);
                res.json({ success: true, data: account });
        })
    )

    router.post(
        '/withdraw',
        validate(depositWithdrawSchema),
        asyncHandler(async (req: express.Request<any, ApiResponse<any>, withdrawRequest>, res: express.Response) => {
                const account = await bankService.withdraw(req.body);
                res.json({ success: true, data: account });
        })
    )

    router.post(
        '/transfer',
        validate(transferSchema),
        asyncHandler(async (req: express.Request, res: express.Response) => {
                const result = await bankService.transfer(req.body);
                res.json({ success: true, data: result });
        })
    )

    router.get(
        '/getAllTransactionLogs',
        asyncHandler((req: express.Request, res: express.Response) => {
                const history = bankService.getAllTransactionLogs();
                res.json({ success: true, data: history });
        })
    )

    router.get(
        '/getAccountTransactionLogs',
        asyncHandler((req: express.Request<any, any, any, { id: string }>, res: express.Response) => {
                const history = bankService.getAccountTransactionLogs(req.query.id);
                res.json({ success: true, data: history });
        })
    )

    app = express();
    app.use(express.json());
    app.use('/api/bank', router);
    app.use(errorHandler);
  });

  describe('Account Management', () => {
    describe('POST /api/bank/createAccount', () => {
      it('should create account with initial balance', async () => {
        const accountData = {
          name: 'Test User',
          initialBalance: 1000
        };

        const response = await request(app)
          .post('/api/bank/createAccount')
          .send(accountData)
          .expect(201);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            name: 'Test User',
            balance: 1000
          }
        });
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
      });

      it('should create account without initial balance (defaults to 0)', async () => {
        const accountData = {
          name: 'Test User'
        };

        const response = await request(app)
          .post('/api/bank/createAccount')
          .send(accountData)
          .expect(201);

        expect(response.body.data.balance).toBe(0);
        expect(response.body.data.name).toBe('Test User');
      });

      it('should return 400 for invalid account data', async () => {
        const invalidData = {
          name: '',
          initialBalance: -100
        };

        const response = await request(app)
          .post('/api/bank/createAccount')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.error).toBeDefined();
      });

      it('should return 400 for missing name', async () => {
        const invalidData = {
          initialBalance: 100
        };

        const response = await request(app)
          .post('/api/bank/createAccount')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/bank/getAllAccounts', () => {
      it('should return empty array when no accounts exist', async () => {
        const response = await request(app)
          .get('/api/bank/getAllAccounts')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: []
        });
      });

      it('should return all created accounts', async () => {
        // Create test accounts
        await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'User 1', initialBalance: 100 });

        await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'User 2', initialBalance: 200 });

        const response = await request(app)
          .get('/api/bank/getAllAccounts')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].name).toBe('User 1');
        expect(response.body.data[1].name).toBe('User 2');
      });
    });

    describe('GET /api/bank/getAccount', () => {
      it('should return account when it exists', async () => {
        // Create test account
        const createResponse = await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'Test User', initialBalance: 500 });

        const accountId = createResponse.body.data.id;

        const response = await request(app)
          .get(`/api/bank/getAccount?id=${accountId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: accountId,
            name: 'Test User',
            balance: 500
          }
        });
      });

      it('should return 404 when account does not exist', async () => {
        const response = await request(app)
          .get('/api/bank/getAccount?id=non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('該帳戶不存在');
      });

      it('should return 404 when id parameter is missing', async () => {
        await request(app)
          .get('/api/bank/getAccount')
          .expect(404);
      });
    });
  });

  describe('Transaction Operations', () => {
    let testAccount: any;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bank/createAccount')
        .send({ name: 'Test User', initialBalance: 1000 });
      testAccount = response.body.data;
    });

    describe('POST /api/bank/deposit', () => {
      it('should successfully deposit money', async () => {
        const depositData = {
          id: testAccount.id,
          amount: 500
        };

        const response = await request(app)
          .post('/api/bank/deposit')
          .send(depositData)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: testAccount.id,
            balance: 1500
          }
        });
      });

      it('should return 400 for invalid deposit amount', async () => {
        const invalidData = {
          id: testAccount.id,
          amount: -100
        };

        const response = await request(app)
          .post('/api/bank/deposit')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('存入金額不能為負值');
      });

      it('should return 404 for non-existent account', async () => {
        const invalidData = {
          id: 'non-existent-id',
          amount: 100
        };

        const response = await request(app)
          .post('/api/bank/deposit')
          .send(invalidData)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 for missing required fields', async () => {
        const invalidData = {
          amount: 100
        };

        await request(app)
          .post('/api/bank/deposit')
          .send(invalidData)
          .expect(400);
      });
    });

    describe('POST /api/bank/withdraw', () => {
      it('should successfully withdraw money', async () => {
        const withdrawData = {
          id: testAccount.id,
          amount: 300
        };

        const response = await request(app)
          .post('/api/bank/withdraw')
          .send(withdrawData)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: testAccount.id,
            balance: 700
          }
        });
      });

      it('should return 400 for insufficient funds', async () => {
        const invalidData = {
          id: testAccount.id,
          amount: 1500 // More than account balance
        };

        const response = await request(app)
          .post('/api/bank/withdraw')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('提款金額大於帳戶餘額');
      });

      it('should return 400 for invalid withdraw amount', async () => {
        const invalidData = {
          id: testAccount.id,
          amount: -100
        };

        const response = await request(app)
          .post('/api/bank/withdraw')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('提款金額不能為負值');
      });

      it('should return 404 for non-existent account', async () => {
        const invalidData = {
          id: 'non-existent-id',
          amount: 100
        };

        await request(app)
          .post('/api/bank/withdraw')
          .send(invalidData)
          .expect(404);
      });
    });

    describe('POST /api/bank/transfer', () => {
      let fromAccount: any;
      let toAccount: any;

      beforeEach(async () => {
        const fromResponse = await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'From User', initialBalance: 1000 });
        fromAccount = fromResponse.body.data;

        const toResponse = await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'To User', initialBalance: 500 });
        toAccount = toResponse.body.data;
      });

      it('should successfully transfer money between accounts', async () => {
        const transferData = {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: 300
        };

        const response = await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            fromAccount: {
              id: fromAccount.id,
              balance: 700
            },
            toAccount: {
              id: toAccount.id,
              balance: 800
            }
          }
        });
      });

      it('should return 400 for insufficient funds', async () => {
        const transferData = {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: 1500 // More than fromAccount balance
        };

        const response = await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('金額不足');
      });

      it('should return 400 for transfer to same account', async () => {
        const transferData = {
          fromAccountId: fromAccount.id,
          toAccountId: fromAccount.id,
          amount: 100
        };

        const response = await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toContain('轉出帳號與轉入帳號相同');
      });

      it('should return 400 for invalid transfer amount', async () => {
        const transferData = {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: -100
        };

        const response = await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 for non-existent from account', async () => {
        const transferData = {
          fromAccountId: 'non-existent-id',
          toAccountId: toAccount.id,
          amount: 100
        };

        await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(404);
      });

      it('should return 404 for non-existent to account', async () => {
        const transferData = {
          fromAccountId: fromAccount.id,
          toAccountId: 'non-existent-id',
          amount: 100
        };

        await request(app)
          .post('/api/bank/transfer')
          .send(transferData)
          .expect(404);
      });
    });
  });

  describe('Transaction History', () => {
    let account1: any;
    let account2: any;

    beforeEach(async () => {
      const response1 = await request(app)
        .post('/api/bank/createAccount')
        .send({ name: 'User 1', initialBalance: 1000 });
      account1 = response1.body.data;

      const response2 = await request(app)
        .post('/api/bank/createAccount')
        .send({ name: 'User 2', initialBalance: 500 });
      account2 = response2.body.data;
    });

    describe('GET /api/bank/getAllTransactionLogs', () => {
      it('should return all transaction logs', async () => {
        // Perform some transactions
        await request(app)
          .post('/api/bank/deposit')
          .send({ id: account1.id, amount: 200 });

        await request(app)
          .post('/api/bank/withdraw')
          .send({ id: account2.id, amount: 100 });

        await request(app)
          .post('/api/bank/transfer')
          .send({
            fromAccountId: account1.id,
            toAccountId: account2.id,
            amount: 300
          });

        const response = await request(app)
          .get('/api/bank/getAllTransactionLogs')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(5); // 2 initial deposits + 3 operations

        // Verify transaction types exist
        const transactionTypes = response.body.data.map((t: any) => t.type);
        expect(transactionTypes).toContain('DEPOSIT');
        expect(transactionTypes).toContain('WITHDRAWAL');
        expect(transactionTypes).toContain('TRANSFER');
      });

      it('should return transactions sorted by date (newest first)', async () => {
        await request(app)
          .post('/api/bank/deposit')
          .send({ id: account1.id, amount: 100 });

        await new Promise(resolve => setTimeout(resolve, 10));

        await request(app)
          .post('/api/bank/deposit')
          .send({ id: account1.id, amount: 200 });

        const response = await request(app)
          .get('/api/bank/getAllTransactionLogs')
          .expect(200);

        const transactions = response.body.data;
        expect(transactions[0].amount).toBe(200); // Most recent first
      });
    });

    describe('GET /api/bank/getAccountTransactionLogs', () => {
      it('should return account-specific transaction logs', async () => {
        // Perform transactions
        await request(app)
          .post('/api/bank/deposit')
          .send({ id: account1.id, amount: 200 });

        await request(app)
          .post('/api/bank/transfer')
          .send({
            fromAccountId: account1.id,
            toAccountId: account2.id,
            amount: 150
          });

        const response = await request(app)
          .get(`/api/bank/getAccountTransactionLogs?id=${account1.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.accountId).toBe(account1.id);
        expect(response.body.data.transactions).toHaveLength(3); // Initial + deposit + transfer
      });

      it('should return 404 for non-existent account', async () => {
        const response = await request(app)
          .get('/api/bank/getAccountTransactionLogs?id=non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return empty transactions for account with no activity', async () => {
        const response = await request(app)
          .post('/api/bank/createAccount')
          .send({ name: 'New User', initialBalance: 0 });

        const newAccount = response.body.data;

        const logsResponse = await request(app)
          .get(`/api/bank/getAccountTransactionLogs?id=${newAccount.id}`)
          .expect(200);

        expect(logsResponse.body.data.accountId).toBe(newAccount.id);
        expect(logsResponse.body.data.transactions).toEqual([]);
      });
    });
  });

  describe('End-to-End Workflows', () => {
    it('should handle complete banking workflow', async () => {
      // 1. Create two accounts
      const user1Response = await request(app)
        .post('/api/bank/createAccount')
        .send({ name: 'Alice', initialBalance: 1000 });
      const user1 = user1Response.body.data;

      const user2Response = await request(app)
        .post('/api/bank/createAccount')
        .send({ name: 'Bob', initialBalance: 500 });
      const user2 = user2Response.body.data;

      // 2. Alice deposits money
      await request(app)
        .post('/api/bank/deposit')
        .send({ id: user1.id, amount: 500 })
        .expect(200);

      // 3. Alice transfers money to Bob
      await request(app)
        .post('/api/bank/transfer')
        .send({
          fromAccountId: user1.id,
          toAccountId: user2.id,
          amount: 300
        })
        .expect(200);

      // 4. Bob withdraws money
      await request(app)
        .post('/api/bank/withdraw')
        .send({ id: user2.id, amount: 100 })
        .expect(200);

      // 5. Verify final balances
      const aliceResponse = await request(app)
        .get(`/api/bank/getAccount?id=${user1.id}`)
        .expect(200);
      expect(aliceResponse.body.data.balance).toBe(1200); // 1000 + 500 - 300

      const bobResponse = await request(app)
        .get(`/api/bank/getAccount?id=${user2.id}`)
        .expect(200);
      expect(bobResponse.body.data.balance).toBe(700); // 500 + 300 - 100

      // 6. Verify transaction history
      const allTransactionsResponse = await request(app)
        .get('/api/bank/getAllTransactionLogs')
        .expect(200);
      expect(allTransactionsResponse.body.data).toHaveLength(5); // 2 initial + 3 operations (deposit counted as part of creation)

      // 7. Verify individual account histories
      const aliceHistoryResponse = await request(app)
        .get(`/api/bank/getAccountTransactionLogs?id=${user1.id}`)
        .expect(200);
      expect(aliceHistoryResponse.body.data.transactions).toHaveLength(3); // Initial + deposit + transfer

      const bobHistoryResponse = await request(app)
        .get(`/api/bank/getAccountTransactionLogs?id=${user2.id}`)
        .expect(200);
      expect(bobHistoryResponse.body.data.transactions).toHaveLength(3); // Initial + transfer + withdrawal
    });

    it('should maintain data consistency across multiple operations', async () => {
      // Create accounts
      const accounts = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/bank/createAccount')
          .send({ name: `User ${i + 1}`, initialBalance: 1000 });
        accounts.push(response.body.data);
      }

      // Perform various operations
      await request(app)
        .post('/api/bank/transfer')
        .send({
          fromAccountId: accounts[0].id,
          toAccountId: accounts[1].id,
          amount: 200
        });

      await request(app)
        .post('/api/bank/transfer')
        .send({
          fromAccountId: accounts[1].id,
          toAccountId: accounts[2].id,
          amount: 300
        });

      await request(app)
        .post('/api/bank/deposit')
        .send({ id: accounts[0].id, amount: 100 });

      // Verify total balance is conserved
      const allAccountsResponse = await request(app)
        .get('/api/bank/getAllAccounts')
        .expect(200);

      const totalBalance = allAccountsResponse.body.data.reduce(
        (sum: number, account: any) => sum + account.balance,
        0
      );
      expect(totalBalance).toBe(3100); // 3000 initial + 100 deposit
    });
  });
});