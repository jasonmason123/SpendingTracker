import { Transaction, TransactionType } from "../../types";
import Badge from "../ui/badge/Badge";

interface TransactionInfoCardProps {
    transaction: Transaction;
}

export default function TransactionInfoCard({ transaction }: TransactionInfoCardProps) {  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Thông tin chung
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {transaction.transactionType === TransactionType.INCOME
                    && (transaction.amount && transaction.amount > 0) ? "Khoản nhận về" : "Khoản đã chi"}
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90 text-bold">
                {transaction.transactionType == TransactionType.INCOME ? (
                  <span className="text-green-500">
                    +{transaction.amount && transaction.amount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    })}
                  </span>
                ) : transaction.transactionType == TransactionType.EXPENSE ? (
                  <span className="text-red-500">
                    -{transaction.amount && transaction.amount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    })}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    {transaction.amount && transaction.amount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    })}
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Loại giao dịch
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                <Badge
                  size="sm"
                  className={
                    transaction.transactionType === TransactionType.INCOME ? "border-green-500"
                    : transaction.transactionType === TransactionType.EXPENSE ? "border-red-500"
                    : ""
                  }
                >
                  {transaction.transactionType === TransactionType.INCOME ? "Thu nhập" :
                   transaction.transactionType === TransactionType.EXPENSE ? "Chi tiêu" : null
                  }
                </Badge>
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bên giao dịch
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                {transaction?.merchant}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Danh mục
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                {transaction?.categoryName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
