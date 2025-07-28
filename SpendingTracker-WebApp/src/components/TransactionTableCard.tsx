import { Link } from "react-router";
import TransactionsTable from "./Transactions/TransactionsTable";
import { Transaction, APP_BASE_URL } from "../types";

interface TransactionTableCardProps {
  title?: string;
  transactions: Transaction[];
}

export default function TransactionTableCard({
  title="Những giao dịch gần đây",
  transactions,
}: TransactionTableCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        {title}
      </h4>
      <TransactionsTable
        defaultTransactions={transactions as Transaction[]}
        fetchTransactions = {false}
      />
      {transactions && transactions.length > 0 && (
        <div className="text-center mt-4 text-gray-500 dark:text-gray-400">
          <Link to={APP_BASE_URL + "/transactions"} className="text-sm">
            Xem tất cả các giao dịch <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
}