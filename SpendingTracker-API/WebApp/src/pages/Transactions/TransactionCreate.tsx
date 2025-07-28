import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import { Transaction, TransactionType } from "../../types";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
// import TextArea from "../../components/form/input/TextArea";
// import FileInput from "../../components/form/input/FileInput";

const transactionTypes = [
  { value: TransactionType.INCOME + "", label: "Thu nhập" },
  { value: TransactionType.EXPENSE + "", label: "Chi tiêu" },
];

const createTransaction = (transaction: Transaction) => {
  alert(`Tạo giao dich: ${transaction.merchant}`);
};

interface TransactionCreateProps {
  transaction?: Transaction;
}

export default function TransactionCreate({
  transaction,
}: TransactionCreateProps) {
  const [newTransaction, setNewTransaction] = useState<Transaction | undefined>(
    transaction
  );
  return (
    <>
      <PageMeta title="Tạo giao dịch mới" description="Tạo giao dịch mới" />
      <PageBreadcrumb
        pageTitles={[
          { title: "Giao dịch", path: "/transactions" },
          { title: "Tạo giao dịch mới", path: "/transactions/create" },
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Tạo giao dịch mới
        </h3>
        <form
          className="space-y-6"
          onSubmit={() => {
            createTransaction(newTransaction as Transaction);
          }}
        >
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Thông tin chung
                </h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Tài khoản nguồn<span className="text-red-500">*</span>
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Select
                        required
                        placeholder="Chọn tài khoản nguồn"
                        options={[]}
                        onChange={() => {}}
                      />
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {newTransaction &&
                      newTransaction.transactionType == TransactionType.INCOME
                        ? "Khoản nhận về (VNĐ)"
                        : "Khoản đã chi (VNĐ)"}
                      <span className="text-red-500">*</span>
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Input required placeholder="10000" />
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Loại giao dịch<span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Select
                        required
                        placeholder="Chọn loại giao dịch"
                        options={transactionTypes}
                        onChange={(selectedOption) => {
                          setNewTransaction((prev) => ({
                            ...prev,
                            transactionType:
                              selectedOption as unknown as TransactionType,
                          }));
                          console.log(newTransaction);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Bên giao dịch
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Input placeholder="Người, tổ chức giao dịch" />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Danh mục
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Select
                        placeholder="Chọn giao dịch"
                        options={[]}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
                  Tệp đính kèm
                </h4>
                <FileInput />
                <p className="text-gray-500 text-xs mt-2">
                  Kích cỡ file tối đa 10MB, chấp nhận các định dạng: .jpg, .png, .pdf
                </p>
              </div>
            </div>
          </div> */}

          {/* <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="gap-6 lg:flex-row lg:items-start lg:justify-between">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
                Ghi chú
              </h4>
              <TextArea placeholder="Ghi ghi chú của bạn tại đây..." />
            </div>
          </div> */}

          <div className="flex justify-end gap-4">
            <Button size="sm" variant="outline">
              Xem trước
            </Button>
            <Button size="sm" type="submit">
              Tạo
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
