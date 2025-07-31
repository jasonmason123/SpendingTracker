import { AmountsByYearResult, IncomeExpenseResult, Transaction } from "../types";

const GET_INCOME_EXPENSE_BY_PERIOD_URL = "/api/statistics/get-income-expense-by-period";
const GET_TOP_3_RECENT_TRANSACTIONS_URL = "/api/statistics/get-top-3-recent";
const GET_MONTHLY_AMOUNTS_BY_YEAR_URL = "/api/statistics/amounts/monthly-by-year";

/**
 * Gets the total income and expense in the selected period
 * @param isoDateFrom - date from in ISO format
 * @param isoDateTo - date to in ISO format
 */
export function getIncomeExpenseByPeriod(isoDateFrom: string, isoDateTo: string)
  : Promise<IncomeExpenseResult>
{
  let url = `${GET_INCOME_EXPENSE_BY_PERIOD_URL}?dateFrom=${isoDateFrom}&dateTo=${isoDateTo}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  .then((response) => {
    if(!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return response.json();
  });
}

/**
 * Gets top 3 most recent transactions
 */
export function getTopThreeRecentTransactions()
  : Promise<Transaction[]>
{
  return fetch(GET_TOP_3_RECENT_TRANSACTIONS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  .then((response) => {
    if(!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return response.json();
  });
}

/**
 * Gets the total income and expense of each month across the selected year
 * @param year - the selected year
 */
export function getMonthlyAmountsByYear(year: number)
  : Promise<AmountsByYearResult>
{
  let url = `${GET_MONTHLY_AMOUNTS_BY_YEAR_URL}?year=${year}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  .then((response) => {
    if(!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return response.json();
  });
}

export interface StatisticsApiCaller {
  getIncomeExpenseByPeriod: (isoDateFrom: string, isoDateTo: string) => Promise<IncomeExpenseResult>
  getTopThreeRecentTransactions: () => Promise<Transaction[]>
  getMonthlyAmountsByYear: (year: number) => Promise<AmountsByYearResult>
};

export const statisticsApiCaller: StatisticsApiCaller = {
  getIncomeExpenseByPeriod,
  getTopThreeRecentTransactions,
  getMonthlyAmountsByYear,
};