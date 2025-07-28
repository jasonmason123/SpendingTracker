import { Transaction } from "../../types";

interface TransactionNoteCardProps {
  transaction: Transaction
}

export default function TransactionNoteCard({ transaction }: TransactionNoteCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Ghi chú
          </h4>

          <div className="text-gray-800 dark:text-white/90">
            {transaction.note ? transaction.note : (
              <span className="text-gray-500 dark:text-gray-400">Không có ghi chú</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}