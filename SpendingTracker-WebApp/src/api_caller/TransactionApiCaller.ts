import { PagedListResult, Transaction, TransactionFilterParams } from "../types";
import { buildQueryString } from "../utils";

/**
 * Fetches a transaction by its ID from the API.
 * @param transactionId - The ID of the transaction to fetch.
 * @returns A promise that resolves to the fetched transaction.
 */
export function fetchTransaction(transactionId: number): Promise<Transaction> {
  return fetch(`/api/transactions/${transactionId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data: Transaction) => ({
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    }));
}

/**
 * Fetches a paginated list of transactions based on the provided filter parameters.
 * @param filterParam - The parameters to filter the transactions.
 * @returns A promise that resolves to a paginated list of transactions.
 */
export function fetchTransactionPagedList(filterParam: TransactionFilterParams): Promise<PagedListResult<Transaction>> {
  const queryString = buildQueryString(filterParam);
  return fetch(`/api/transactions/get-list?${queryString}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data: PagedListResult<Transaction>) => ({
      ...data,
      items: data.items.map((transaction) => ({
        ...transaction,
        date: transaction.date ? new Date(transaction.date) : undefined,
        createdAt: transaction.createdAt ? new Date(transaction.createdAt) : undefined,
        updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : undefined,
      })),
    }));
}

/**
 * Creates a new transaction by sending it to the API.
 * @param transaction - The transaction object to create.
 * @returns A promise that resolves to the created transaction.
 */
export function createTransaction(transaction: Transaction): Promise<Transaction> {
  return fetch("/api/transactions/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

/**
 * Updates an existing transaction by sending the updated data to the API.
 * @param transaction - The transaction object with updated data.
 * @returns A promise that resolves to the updated transaction.
 */
export function updateTransaction(transaction: Transaction): Promise<Transaction> {
  return fetch(`/api/transactions/update/${transaction.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

/**
 * Deletes a transaction by its ID.
 * @param transactionId - The ID of the transaction to delete.
 * @returns A promise that resolves when the transaction is deleted.
 */
export function deleteTransaction(transactionId: number): Promise<void> {
  return fetch(`/api/transactions/delete/${transactionId}`, {
    method: "DELETE",
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  });
}