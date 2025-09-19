import { body } from 'express-validator'

export const createAccountSchema = [
    body('name')
        .isString()
        .withMessage('請輸入帳戶名'),
    body('initialBalance')
      .isNumeric()
      .withMessage('金額必須為數字')
      .toFloat()
  ]