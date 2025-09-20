import { Request, Response, Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import validate from "../validation/validation";
import { createAccountSchema, depositWithdrawSchema, transferSchema } from "../validation/validationSchemas";
import { BankService } from "./bank.service";
import {
    ApiResponse,
    CreateAccountRequest,
    DepositRequest,
    withdrawRequest,
} from './types';

const router = Router()
const bankService = new BankService();

// 新建帳戶
router.post(
    '/createAccount', 
    validate(createAccountSchema),
    asyncHandler((req: Request<{}, ApiResponse<any>, CreateAccountRequest>, res: Response) => {
            const newAccount = bankService.createAccount(req.body)
            res.status(201).json({ success: true, data: newAccount });
    })
);

// 取得所有帳戶
router.get(
    '/getAllAccounts', 
    asyncHandler((req: Request, res: Response) => {
            const accounts = bankService.getAllAccounts();
            res.json({ success: true, data: accounts });
    })
)

// 取得單個帳戶
router.get(
    '/getAccount', 
    asyncHandler((req: Request<any, any, any, { id: string }>, res: Response) => {
            const account = bankService.getAccount(req.query.id)
            res.json({ success: true, data: account })
    })
)

// 存入金額到指定帳戶
router.post(
    '/deposit',
    validate(depositWithdrawSchema),
    asyncHandler((req: Request<any, ApiResponse<any>, DepositRequest>, res: Response) => {
            const account = bankService.deposit(req.body);
            res.json({ success: true, data: account });
    })
)

// 從指定帳戶提取金額
router.post(
    '/withdraw',
    validate(depositWithdrawSchema),
    asyncHandler((req: Request<any, ApiResponse<any>, withdrawRequest>, res: Response) => {
            const account = bankService.withdraw(req.body);
            res.json({ success: true, data: account });
    })
)

// 轉帳
router.post(
    '/transfer',
    validate(transferSchema),
    asyncHandler((req: Request, res: Response) => {
            const result = bankService.transfer(req.body);
            res.json({ success: true, data: result });
    })
)

// 取得所有交易紀錄
router.get(
    '/getAllTransactionLogs',
    asyncHandler((req: Request, res: Response) => {
            const history = bankService.getAllTransactionLogs();
            res.json({ success: true, data: history });
    })
)

// 取得各別帳號的交易紀錄
router.get(
    '/getAccountTransactionLogs',
    asyncHandler((req: Request<any, any, any, { id: string }>, res: Response) => {
            const history = bankService.getAccountTransactionLogs(req.query.id);
            res.json({ success: true, data: history });
    })
)
export default router
