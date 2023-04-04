import { DepositPlanType } from "../../enums/DepositPlanType";
import { PortfolioAllocation } from "./PortfolioAllocation";

export interface DepositPlan {
  id: string;
  type: DepositPlanType;
  portfolios: PortfolioAllocation[];
}
