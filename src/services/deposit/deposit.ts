import currency from "currency.js";
import { DepositPlanType } from "../../enums/DepositPlanType";
import { DepositPlan } from "../../models/deposit/DepositPlan";
import { FundDeposit } from "../../models/deposit/FundDeposit";
import { PortfolioAllocation } from "../../models/deposit/PortfolioAllocation";

export function GetDepositPlanId(depositPlan: DepositPlan) {
  return depositPlan.id;
}

export function Deposit(
  depositPlans: DepositPlan[],
  fundDeposits: FundDeposit[]
) {
  if (depositPlans.length === 0 || depositPlans.length > 2) {
    throw new Error("Invalid params");
  }

  const portfolioMap = new Map<string, currency>();
  let totalFundsDeposited = fundDeposits
    .map((x) => x.amountDeposited)
    .reduce((prev, next) => prev.add(next), currency(0));

  totalFundsDeposited = ProcessOneTimeDeposit(
    depositPlans,
    portfolioMap,
    totalFundsDeposited
  );
  ProcessMonthlyDeposit(depositPlans, portfolioMap, totalFundsDeposited);

  const result: PortfolioAllocation[] = Array.from(
    portfolioMap,
    ([key, value]) => {
      return {
        portfolioId: key,
        allocationAmount: value,
      };
    }
  );

  return result;
}

function ProcessOneTimeDeposit(
  depositPlans: DepositPlan[],
  portfolioMap: Map<string, currency>,
  totalFundsDeposited: currency
) {
  let remainingFundsAfterAllocation = totalFundsDeposited;
  const oneTimeDeposit = depositPlans.find(
    (x) => x.type === DepositPlanType.OneTime
  );

  if (oneTimeDeposit !== undefined) {
    const totalAmountToAllocate = oneTimeDeposit.portfolios
      .map((x) => x.allocationAmount)
      .reduce((prev, next) => prev.add(next), currency(0));

    remainingFundsAfterAllocation = totalFundsDeposited.subtract(
      totalAmountToAllocate
    );
    if (remainingFundsAfterAllocation < currency(0)) {
      oneTimeDeposit.portfolios.forEach((portfolio) => {
        const percentageOfAllocation = currency(
          portfolio.allocationAmount
        ).divide(totalAmountToAllocate.value);
        Allocate(
          portfolioMap,
          portfolio,
          totalFundsDeposited.multiply(percentageOfAllocation)
        );
      });
    } else {
      oneTimeDeposit.portfolios.forEach((portfolio) => {
        Allocate(portfolioMap, portfolio, currency(portfolio.allocationAmount));
      });
    }
  }

  return remainingFundsAfterAllocation < currency(0)
    ? currency(0)
    : remainingFundsAfterAllocation;
}

function ProcessMonthlyDeposit(
  depositPlans: DepositPlan[],
  portfolioMap: Map<string, currency>,
  totalFundsDeposited: currency
) {
  const monthlyDeposit = depositPlans.find(
    (x) => x.type === DepositPlanType.Monthly
  );

  if (monthlyDeposit !== undefined) {
    const totalAmountToAllocate = monthlyDeposit.portfolios
      .map((x) => x.allocationAmount)
      .reduce((prev, next) => prev.add(next), currency(0));

    monthlyDeposit.portfolios.forEach((portfolio) => {
      const percentageOfAllocation = currency(
        portfolio.allocationAmount
      ).divide(totalAmountToAllocate.value);
      Allocate(
        portfolioMap,
        portfolio,
        totalFundsDeposited.multiply(percentageOfAllocation)
      );
    });
  }
}

function Allocate(
  portfolioMap: Map<string, currency>,
  portfolio: PortfolioAllocation,
  amount: currency
) {
  const existingAmount = portfolioMap.get(portfolio.portfolioId);
  if (existingAmount === undefined) {
    portfolioMap.set(portfolio.portfolioId, amount);
  } else {
    portfolioMap.set(portfolio.portfolioId, existingAmount.add(amount));
  }
}
