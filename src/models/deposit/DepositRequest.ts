import { DepositPlan } from "./DepositPlan";
import { FundDeposit } from "./FundDeposit";

export interface DepositRequest {
  depositPlans: DepositPlan[];
  fundDeposits: FundDeposit[];
}
