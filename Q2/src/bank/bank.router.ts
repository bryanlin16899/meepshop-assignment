import { Request, Response, Router } from "express";
import validate from "../validation/validation";
import { createAccountSchema } from "../validation/validationSchemas";
import { BankService } from "./bank.service";
import {
    ApiResponse,
    CreateAccountRequest,
} from './types';

const router = Router()
const bankService = new BankService();

// 新建帳戶
router.post('/createAccount', validate(createAccountSchema)  ,(req: Request<{}, ApiResponse<any>, CreateAccountRequest>, res: Response) => {
    try {
        const newAccount = bankService.createAccount(req.body)
        res.status(201).json({ success: true, data: newAccount });
    } catch (error) {
        // Error handling
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// 取得所有帳戶
router.get('/accounts', (req: Request, res: Response) => {
    try {
        const accounts = bankService.getAllAccounts();
        res.json({ success: true, data: accounts });
    } catch (error) {
        // Error handling
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

// 取得單個帳戶
router.get('/accounts/:id', (req: Request<{ id: string }>, res: Response) => {
    try {
        const account = bankService.getAccount(req.params.id)
        res.json({ success: true, data: account })
    } catch (error) {
        // Error handling
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

export default router