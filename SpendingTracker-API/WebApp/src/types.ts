//Constants
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;
export const APP_BASE_URL = "/app";

//Utils
export interface PageTitle {
  title: string;
  path: string;
  state?: any;
}

//Enums
export enum AccountType {
    CASH = "CASH",
    BANK = "BANK",
    CREDIT = "CREDIT",
}

export enum TransactionType {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}

export enum PeriodUnit {
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR"
}

export enum FlagBoolean {
    TRUE = "TRUE",
    FALSE = "FALSE"
}

//Entities
export interface Transaction {
  id?: string;
  description?: string;
  merchant?: string;
  transactionType?: TransactionType;
  date?: Date;
  amount?: number;
  note?: string;
  attachmentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

//Filter params
export interface BaseFilterParams {
  searchString?: string;
  pageNumber: number;
  pageSize: number;
}

export interface TransactionFilterParams extends BaseFilterParams {
  dateFrom?: Date;
  dateTo?: Date;
  transactionType?: TransactionType;
}

//DTO
export interface PagedListResult<T extends any> {
  totalBudget?: number;
  totalItemCount: number;
  pageCount: number;
  pageSize: number;
  pageNumber: number;
  items: T[];
}