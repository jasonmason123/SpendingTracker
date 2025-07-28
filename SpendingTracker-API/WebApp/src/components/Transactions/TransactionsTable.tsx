import {
Table,
TableBody,
TableCell,
TableFooter,
TableRow,
} from "../ui/table";
  
import {  PagedListResult, Transaction, TransactionFilterParams, TransactionType } from "../../types";
import { useEffect, useState } from "react";
import React from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import TransactionFilterModal from "./TransactionFilterModal";
import { useNavigate } from "react-router";
import { buildQueryString } from "../../utils";
import Pagination from "../tables/Pagination";
import { APP_BASE_URL } from "../../types";

interface TransactionTableProps {
  isSearchAndFilterIncluded?: boolean;
  isPaginationIncluded?: boolean;
  isLineCountDisplayed?: boolean;
  defaultTransactions?: Transaction[];
  fetchTransactions?: boolean;
}

export default function TransactionsTable({
  isSearchAndFilterIncluded = false,
  isPaginationIncluded = false,
  isLineCountDisplayed = false,
  defaultTransactions,
  fetchTransactions = true,
} : TransactionTableProps) {
  const navigate = useNavigate();
  const [searchStr, setSearchStr] = useState<string>("");
  const [itemCount, setItemCount] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [filtersUsed, setFiltersUsed] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterParam, setFilterParam] = useState<TransactionFilterParams>({
    pageNumber: 1,
    pageSize: 10,
  });
  const { isOpen, openModal, closeModal } = useModal();

  const groupedTransactions = transactions?.reduce((acc, transaction) => {
    const dateKey = transaction.date &&
        new Date(transaction.date).toLocaleDateString('vi-VN');
    if (!dateKey) return acc;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const fetchData = async() => {
    setLoading(true);
    const queryString = buildQueryString(filterParam);
    try {
      const res = await fetch(`/api/transactions/list?${queryString}`, {
        method: "GET",
        credentials: "include",
      });

      const rawData = await res.json();
      
      if (!res.ok) {
        console.error("Unexpected response format or server error:", rawData);
      } else {
        const data = rawData as PagedListResult<Transaction>;
        setTransactions(data.items ?? []);
        itemCount != data.totalItemCount && setItemCount(data.totalItemCount);
        pageCount != data.pageCount && setPageCount(data.pageCount);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(fetchTransactions) {
      fetchData();
    }
  }
  , [filterParam]);

  //If search, other filter params will not be applied
  const onSearch = (searchStr: string) => {
    handleClearFilters();
    setFilterParam({
      pageNumber: 1,
      pageSize: 10,
      searchString: searchStr,
    });
  }

  //If filter, search will not be applied, pageNumber will be reset to 1
  const onFilter = (filterParams: TransactionFilterParams) => {
    setSearchStr("");
    setFilterParam({
      ...filterParams,
      pageNumber: 1,
      searchString: "",
    });
  }

  const onPageChange = (page: number) => {
    setFilterParam({
      ...filterParam,
      pageNumber: page,
    });
  }

  const onPageSizeChange = (pageSize: number) => {
    setFilterParam({
      ...filterParam,
      pageSize: pageSize,
    });
  }

  const onSelect = (transactionUid: string) => {
    navigate(`${APP_BASE_URL}/transactions/${transactionUid}/details`);
  }

  const updateFiltersUsed = (filterNames: string[]) => {
    setFiltersUsed(filterNames.length);
  }

  const handleClearFilters = () => {
    setFilterParam({
      pageNumber: 1,
      pageSize: 10,
    });
    setFiltersUsed(0);
  }
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {isSearchAndFilterIncluded && (
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05] flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto flex items-center gap-4 justify-center sm:justify-end">
              <div className="relative">
                <Button
                  onClick={openModal}
                  variant="outline"
                  size="sm"
                  startIcon={<i className="fa-solid fa-filter"></i>}
                >
                  Bộ lọc
                </Button>
                {filtersUsed > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-200 text-gray-800 dark:bg-gray-500 dark:text-white text-xs px-2 py-0.5 rounded-full">
                    {filtersUsed}
                  </span>
                )}
              </div>

              {filtersUsed > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <TransactionFilterModal
              isOpen={isOpen}
              filterParams={filterParam}
              onClose={closeModal}
              onFilter={onFilter}
              onUpdateFiltersUsed={updateFiltersUsed}
              className="max-w-[900px]"
            />

            <form className="w-full sm:w-1/4"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch!== undefined && onSearch(searchStr);
              }}
            >
              <div className="relative w-full max-w-sm flex items-center">
                <button
                  type="submit"
                  className="absolute left-2 text-gray-500 dark:text-gray-400 p-1"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
  
                <input
                  value={searchStr}
                  onChange={(e) => setSearchStr(e.target.value)}
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm shadow-theme-xs focus:border-brand-500 focus:ring-1 focus:outline-hidden focus:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-white/40 dark:focus:border-brand-400 dark:focus:ring-brand-800"
                />
              </div>
            </form>
          </div>
        )}
        <Table>
          {loading ? (
            <TableRow>
              <TableCell colSpan={100} className="text-center py-6 text-gray-500 dark:text-gray-400">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : (
            <>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {(!transactions || transactions.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={100} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Không có giao dịch nào được tìm thấy.
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(groupedTransactions).map(([date, group]) => {
                  const dayTotal = group.reduce((sum, t) => sum + (t.amount ?? 0), 0);
                  return (
                    <React.Fragment key={date}>
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="bg-gray-100 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-300 py-2 px-5"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{date}</span>
                            <span className={dayTotal >= 0 ? "text-green-500" : "text-red-500"}>
                              {dayTotal >= 0 && '+'}
                              {dayTotal.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND"
                              })}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

                      {group
                        .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
                        .map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                            onClick={() => transaction.id !== undefined && onSelect && onSelect(transaction.id)}
                          >
                            <TableCell className="px-4 py-3 sm:px-6 text-start">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full border
                                      ${transaction.transactionType === TransactionType.INCOME ? "border-green-500"
                                      : transaction.transactionType === TransactionType.EXPENSE ? "border-red-500" : ""}`}
                                  >
                                    {transaction.transactionType === TransactionType.INCOME ? (
                                      <i className="fa-solid fa-circle-dollar-to-slot text-green-500"></i>
                                    ) : transaction.transactionType === TransactionType.EXPENSE ? (
                                      <i className="fa-solid fa-wallet text-red-500"></i>
                                    ) : null}
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {/* Category name here (income, bill, budget, etc.) */}
                                    <div className="text-sm font-semibold">
                                      {transaction.description}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {transaction.merchant}
                                    </div>
                                  </span>
                                </div>
                                <div>
                                  <span className={`text-sm font-bold ${transaction.amount && transaction.amount < 0 ? "text-gray-600 dark:text-gray-300" : "text-green-500"}`}>
                                    {transaction.amount !== undefined && transaction.amount > 0 ? '+' : ''}
                                    {transaction?.amount?.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  </span>
                                  <i className="text-sm fa-solid fa-ellipsis-vertical ml-6 text-gray-600 dark:text-gray-400"></i>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  )
                })
              )}
              </TableBody>
            </>
          )}
          
          <TableFooter>
            <TableRow>
              <TableCell colSpan={100} className="!p-0">
                <div className="w-full flex justify-between items-center flex-col sm:flex-row px-4 py-3 gap-2">
                  {isLineCountDisplayed && transactions && (
                    <div>
                      <span className="text-sm text-gray-400">Số dòng đếm được: </span>
                      <span className="text-sm dark:text-white">
                        {itemCount}
                      </span>
                    </div>
                  )}
                  
                  {isPaginationIncluded && (
                    <Pagination
                      className="flex justify-end items-center gap-2 px-4 py-3 flex-col sm:flex-row"
                      pageNumber={filterParam.pageNumber}
                      pageCount={pageCount}
                      onPageChange={onPageChange}
                      onPageSizeChange={onPageSizeChange}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}