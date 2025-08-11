import { useEffect, useState } from "react";
import { Transaction, TransactionType } from "../../types";
import { statisticsApiCaller } from "../../api_caller/StatisticsApiCaller";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Link, useNavigate } from "react-router";

export default function RecentTransactions() {
  const navigate = useNavigate();
  const top = 4;
  const [loading, setLoading] = useState<boolean>(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const getData = () => {
    statisticsApiCaller.getTopRecentTransactions(top)
      .then((result) => {
        setRecentTransactions(result);
      })
      .catch((error) => {
        console.error("Error fetching recent transaction", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const onSelect = (transactionId: number) => {
    navigate(`/transactions/${transactionId}`);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Những giao dịch gần đây
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Top {recentTransactions.length} giao dịch gần đây nhất
          </p>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {loading ? (
            <TableRow>
              <TableCell colSpan={100} className="text-center py-6 text-gray-500 dark:text-gray-400">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : (
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!recentTransactions || recentTransactions.length == 0 ? (
                <TableRow>
                  <TableCell colSpan={100} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Không có giao dịch nào được tìm thấy.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {recentTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                      onClick={() => transaction.id !== undefined
                        && onSelect
                        && onSelect(transaction.id)}
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
                              <div className="text-sm font-semibold">
                                {transaction.description} - {" "}
                                <span className="text-sm text-gray-400">
                                  {(transaction.date && new Date(transaction.date).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  }))}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {transaction.merchant}
                              </div>
                            </span>
                          </div>
                          <div>
                            <span className={`text-sm font-bold ${
                              transaction.transactionType === TransactionType.EXPENSE ?
                                "text-red-500" :
                                "text-green-500"}`}
                            >
                              {transaction.amount !== undefined &&
                                transaction.transactionType === TransactionType.INCOME ? '+' : '-'}
                              {transaction?.amount?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          )}
        </Table>
        {recentTransactions && recentTransactions.length > 0 && (
          <div className="text-center mt-3 text-gray-500 dark:text-gray-400">
            <Link to="/transactions" className="text-sm">
              Xem tất cả các giao dịch <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
