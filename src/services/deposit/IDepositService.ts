import { DepositPlan } from "../../models/deposit/DepositPlan";
import { FundDeposit } from "../../models/deposit/FundDeposit";
import { PortfolioAllocation } from "../../models/deposit/PortfolioAllocation";

export interface IDepositService {
  deposit: (
    depositPlans: DepositPlan[],
    fundDeposits: FundDeposit[]
  ) => PortfolioAllocation[];
}
