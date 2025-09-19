import { Request, Response, Router } from "express";
import { BankService } from "./bank.service";
import {
    ApiResponse,
    CreateAccountRequest,
} from './types';

const router = Router()
const bankService = new BankService();

router.post('/createAccount', (req: Request<{}, ApiResponse<any>, CreateAccountRequest>, res: Response) => {
    try {
        const newAccount = bankService.createAccount(req.body)
        res.status(201).json({ success: true, data: newAccount });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router