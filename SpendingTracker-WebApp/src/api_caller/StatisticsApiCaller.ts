import { AmountsByYearResult, IncomeExpenseResult, IncomeExpenseSummaryResult, PeriodUnit, Transaction } from "../types";

const GET_INCOME_EXPENSE_SUMMARY_URL = "/api/statistics/get-income-expense-summary";
const GET_INCOME_EXPENSE_CUSTOM_RANGE_URL = "/api/statistics/get-income-expense-custom-range";
const GET_EXPENSE_BY_CATEGORY_CUSTOM_RANGE = "/api/statistics/get-expense-by-category-custom-range";
const GET_TOP_RECENT_TRANSACTIONS_URL = "/api/statistics/get-top-recent";
const GET_MONTHLY_AMOUNTS_BY_YEAR_URL = "/api/statistics/amounts/monthly-by-year";

/**
 * Gets the summary of total income and expense in the selected period,
 * also calculating the differences compared to the previous period.
 * This method may return rollover, which is the leftover/overspent amount
 * from the previous period to the selected one
 * @param isoReferenceDate 
 * @param period 
 * @param rolloverRequired
 * @returns Total income and expense of the selected period, including the income and expense change, and rollover amount from the previous period
 */
export function getIncomeExpenseSummary(
  isoReferenceDate: string = new Date().toISOString(),
  period: PeriodUnit,
  rolloverRequired: boolean
) : Promise<IncomeExpenseSummaryResult>
{
  let url = `${GET_INCOME_EXPENSE_SUMMARY_URL}?referenceDate=${isoReferenceDate}
              &period=${period}&rolloverRequired=${rolloverRequired}`;

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
 * Gets the total income and expense in the selected date range
 * @param isoDateFrom - date from in ISO format
 * @param isoDateTo - date to in ISO format
 * @returns Total income and expense of the selected date range
 */
export function getIncomeExpenseCustomRange(isoDateFrom: string, isoDateTo: string)
  : Promise<IncomeExpenseResult>
{
  let url = `${GET_INCOME_EXPENSE_CUSTOM_RANGE_URL}?dateFrom=${isoDateFrom}&dateTo=${isoDateTo}`;

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
 * Gets the total expense by category in the selected date range
 * @param isoDateFrom - date from in ISO format
 * @param isoDateTo - date to in ISO format
 * @returns A Record containing the category name and it's corresponding total expense
 */
export function getExpenseByCategoryCustomRange(isoDateFrom: string, isoDateTo: string)
  : Promise<Record<string, number>>
{
  let url = `${GET_EXPENSE_BY_CATEGORY_CUSTOM_RANGE}?dateFrom=${isoDateFrom}&dateTo=${isoDateTo}`;

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
 * @returns The list containing top 3 transactions
 */
export function getTopRecentTransactions(top: number)
  : Promise<Transaction[]>
{
  return fetch(`${GET_TOP_RECENT_TRANSACTIONS_URL}?top=${top}`, {
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
 * @returns Monthly income and expense throughout the selected year
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
  getIncomeExpenseSummary: (
    isoReferenceDate: string,
    period: PeriodUnit,
    rolloverRequired: boolean
  ) => Promise<IncomeExpenseSummaryResult>
  getIncomeExpenseCustomRange: (isoDateFrom: string, isoDateTo: string) => Promise<IncomeExpenseResult>
  getExpenseByCategoryCustomRange: (isoDateFrom: string, isoDateTo: string) => Promise<Record<string, number>>
  getTopRecentTransactions: (top: number) => Promise<Transaction[]>
  getMonthlyAmountsByYear: (year: number) => Promise<AmountsByYearResult>
};

export const statisticsApiCaller: StatisticsApiCaller = {
  getIncomeExpenseSummary,
  getIncomeExpenseCustomRange,
  getExpenseByCategoryCustomRange,
  getTopRecentTransactions,
  getMonthlyAmountsByYear,
};