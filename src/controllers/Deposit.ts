import { NextFunction, Request, Response } from "express";
import { DepositPlan } from "../models/deposit/DepositPlan";
import { DepositRequest } from "../models/deposit/DepositRequest";
import { DepositResponse } from "../models/deposit/DepositResponse";
import { FundDeposit } from "../models/deposit/FundDeposit";
import { Deposit } from "../services/deposit/deposit";

export const put = (
  req: Request<{}, {}, DepositRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.body.depositPlans === undefined ||
      req.body.fundDeposits === undefined
    ) {
      throw new Error("Invalid params");
    }

    const depositPlans: DepositPlan[] = req.body.depositPlans;
    const fundDeposits: FundDeposit[] = req.body.fundDeposits;
    const result = Deposit(depositPlans, fundDeposits);
    const response: DepositResponse = {
      allocations: result,
    };
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
