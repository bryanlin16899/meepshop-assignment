import { Request, Response, Router } from "express";
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
    (
        req: Request<{}, ApiResponse<any>, CreateAccountRequest>, 
        res: Response
    ) => {
        try {
            const newAccount = bankService.createAccount(req.body)
            res.status(201).json({ success: true, data: newAccount });
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
);

// 取得所有帳戶
router.get(
    '/getAllAccounts', 
    (
        req: Request, 
        res: Response
    ) => {
        try {
            const accounts = bankService.getAllAccounts();
            res.json({ success: true, data: accounts });
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
)

// 取得單個帳戶
router.get(
    '/getAccount', 
    (
        req: Request<any, any, any, { id: string }>, 
        res: Response
    ) => {
        try {
            const account = bankService.getAccount(req.query.id)
            res.json({ success: true, data: account })
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
)

// 存入金額到指定帳戶
router.post(
    '/deposit',
    validate(depositWithdrawSchema),
    (
        req: Request<any, ApiResponse<any>, DepositRequest>, 
        res: Response
    ) => {
        try {
            const account = bankService.deposit(req.body);
            res.json({ success: true, data: account });
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
)

// 從指定帳戶提取金額
router.post(
    '/withdraw',
    validate(depositWithdrawSchema),
    (
        req: Request<any, ApiResponse<any>, withdrawRequest>,
        res: Response
    ) => {
        try {
            const account = bankService.withdraw(req.body);
            res.json({ success: true, data: account });
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
)

// 轉帳
router.post(
    '/transfer',
    validate(transferSchema),
    (
        req: Request,
        res: Response
    ) => {
        try {
            const result = bankService.transfer(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            //TODO Error handling
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
)
export default router