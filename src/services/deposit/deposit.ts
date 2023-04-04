import Dinero from "dinero.js";

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

  const portfolioMap = new Map<string, number>();
  let totalFundsDeposited = fundDeposits
    .map((x) => x.amountDeposited)
    .reduce(
      (prev, next) => prev.add(Dinero({ amount: next })),
      Dinero({ amount: 0 })
    );

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
        allocationAmount: Number(value.toFixed(2)),
      };
    }
  );

  return result;
}

function ProcessOneTimeDeposit(
  depositPlans: DepositPlan[],
  portfolioMap: Map<string, number>,
  totalFundsDeposited: Dinero.Dinero
) {
  let remainingFundsAfterAllocation = totalFundsDeposited;
  const oneTimeDeposit = depositPlans.find(
    (x) => x.type === DepositPlanType.OneTime
  );

  if (oneTimeDeposit !== undefined) {
    const totalAmountToAllocate = oneTimeDeposit.portfolios
      .map((x) => x.allocationAmount)
      .reduce(
        (prev, next) => prev.add(Dinero({ amount: next })),
        Dinero({ amount: 0 })
      );

    remainingFundsAfterAllocation = totalFundsDeposited.subtract(
      totalAmountToAllocate
    );
    if (remainingFundsAfterAllocation.getAmount() < 0) {
      oneTimeDeposit.portfolios.forEach((portfolio) => {
        if (totalAmountToAllocate.getAmount() > 0) {
          const percentageOfAllocation =
            portfolio.allocationAmount / totalAmountToAllocate.getAmount();
          Allocate(
            portfolioMap,
            portfolio,
            totalFundsDeposited.getAmount() * percentageOfAllocation
          );
        }
      });
    } else {
      oneTimeDeposit.portfolios.forEach((portfolio) => {
        Allocate(portfolioMap, portfolio, portfolio.allocationAmount);
      });
    }
  }

  return remainingFundsAfterAllocation.getAmount() < 0
    ? Dinero({ amount: 0 })
    : remainingFundsAfterAllocation;
}

function ProcessMonthlyDeposit(
  depositPlans: DepositPlan[],
  portfolioMap: Map<string, number>,
  totalFundsDeposited: Dinero.Dinero
) {
  const monthlyDeposit = depositPlans.find(
    (x) => x.type === DepositPlanType.Monthly
  );

  if (monthlyDeposit !== undefined) {
    const totalAmountToAllocate = monthlyDeposit.portfolios
      .map((x) => x.allocationAmount)
      .reduce(
        (prev, next) => prev.add(Dinero({ amount: next })),
        Dinero({ amount: 0 })
      );

    monthlyDeposit.portfolios.forEach((portfolio) => {
      if (totalAmountToAllocate.getAmount() > 0) {
        const percentageOfAllocation =
          portfolio.allocationAmount / totalAmountToAllocate.getAmount();
        Allocate(
          portfolioMap,
          portfolio,
          totalFundsDeposited.getAmount() * percentageOfAllocation
        );
      }
    });
  }
}

function Allocate(
  portfolioMap: Map<string, number>,
  portfolio: PortfolioAllocation,
  amount: number
) {
  const existingAmount = portfolioMap.get(portfolio.portfolioId);
  if (existingAmount === undefined) {
    portfolioMap.set(portfolio.portfolioId, amount);
  } else {
    portfolioMap.set(portfolio.portfolioId, existingAmount + amount);
  }
}
