import { body } from 'express-validator'

export const createAccountSchema = [
    body('name')
        .isString()
        .withMessage('請輸入帳戶名'),
    body('initialBalance')
        .optional()
        .isFloat({min: 0})
        .withMessage('存款不能為負值')
  ]

export const depositWithdrawSchema = [
    body('id')
        .isString()
        .withMessage('請輸入帳戶ID'),
    body('amount')
        .isNumeric()
        .withMessage('金額必須為數字')
        .toFloat()
]

export const transferSchema = [
    body('fromAccountId')
        .isString()
        .withMessage('請輸入帳戶ID'),
    body('toAccountId')
        .isString()
        .withMessage('請輸入帳戶ID'),
    body('amount')
      .isNumeric()
      .withMessage('金額必須為數字')
      .toFloat()
]