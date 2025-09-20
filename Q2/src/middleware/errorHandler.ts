import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse } from "../bank/types";
import { isBaseError } from "../utils/errors";

export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiResponse<null> | { success: false; error: string | ApiError }>,
  _next: NextFunction
) {
  if (isBaseError(err)) {
    const apiError: ApiError = { msg: err.message, code: err.code };
    return res.status(err.statusCode).json({ 
        success: false, 
        errors: [apiError]
    });
  }

  // 非預期錯誤：不要洩漏細節，並將錯誤輸出到伺服器日誌
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ success: false, error: "Internal server error" });
}
