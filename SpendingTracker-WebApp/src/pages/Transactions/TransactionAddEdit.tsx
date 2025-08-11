import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import { Option, Transaction, TransactionType } from "../../types";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import flatpickr from "flatpickr";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createTransaction, fetchTransaction, updateTransaction } from "../../api_caller/TransactionApiCaller";
import ModalSelect from "../../components/form/ModalSelect";
import { fetchCategoryOptions } from "../../api_caller/CategoryApiCaller";
// import TextArea from "../../components/form/input/TextArea";
// import FileInput from "../../components/form/input/FileInput";

const transactionTypes = [
  { value: TransactionType.INCOME + "", label: "Thu nhập" },
  { value: TransactionType.EXPENSE + "", label: "Chi tiêu" },
];

export default function TransactionAddEdit() {
  const navigate = useNavigate();

  const { id } = useParams();
  const location = useLocation();
  const transactionFromState: Transaction = location.state?.transaction;

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [newTransaction, setNewTransaction] = useState<Transaction | undefined>();
  const datePickerRef = React.useRef<flatpickr.Instance | null>(null);

  const handleError = (message:string, error: any) => {
    alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    console.error(message, error);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!confirm("Bạn có chắc chắn muốn lưu?")) {
      return;
    }

    if (newTransaction) {
      try {
        setLoading(true);
        let transactionResult: Transaction = {};
        if (id) {
          transactionResult = await updateTransaction(newTransaction);
        } else {
          transactionResult = await createTransaction(newTransaction);
        }
        
        alert("Đã lưu giao dịch thành công!");
        
        const navigatePath =
          transactionResult.id ? `/transactions/${transactionResult.id}` :
          id ? `/transactions/${id}` :
          "/transactions";
        navigate(navigatePath);
      } catch (error) {
        handleError("Error saving transaction:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  // Set transaction from state or fetch from API if not available (in edit mode)
  useEffect(() => {
    if (transactionFromState && id) {
      setNewTransaction(transactionFromState);
    } else if(!transactionFromState && id) {
      setLoading(true);
      fetchTransaction(parseInt(id))
        .then((transaction) => {
          setNewTransaction({
            ...transaction,
            date: transaction.date && new Date(transaction.date),
            createdAt: transaction.createdAt && new Date(transaction.createdAt),
            updatedAt: transaction.updatedAt && new Date(transaction.updatedAt),
          });
        })
        .catch((error) => {
          handleError("Error fetching transaction:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);
  
  useEffect(() => {
    fetchCategoryOptions()
      .then((options) => {
        setCategoryOptions(options);
      })
      .catch((error) => {
        handleError("Error fetching category options:", error);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, []);
    
  return (
    <>
      <PageMeta
        title={id ? "Cập nhật giao dịch" : "Tạo giao dịch mới"}
        description={id ? "Cập nhật giao dịch" : "Tạo giao dịch mới"}
      />
      <PageBreadcrumb
        pageTitles={[
          { title: "Giao dịch", path: "/transactions" },
          { title: id ? "Cập nhật giao dịch" : "Tạo giao dịch mới",
            path: id ? `/transactions/${id}/edit` : "/transactions/create" },
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {id ? "Cập nhật giao dịch" : "Tạo giao dịch mới"}
        </h3>
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  {id ? `Mã giao dịch: ${id}` : "Thông tin giao dịch"}
                </h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Mô tả ngắn<span className="text-red-500">*</span>
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Input
                        required
                        disabled={loading}
                        placeholder="VD: Đi ăn ngoài"
                        maxLength={40}
                        value={newTransaction?.description || ""}
                        onChange={(e) =>
                          setNewTransaction((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Bên giao dịch<span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Input
                        disabled={loading}
                        placeholder="Người, tổ chức giao dịch"
                        required
                        value={newTransaction?.merchant || ""}
                        onChange={(e) =>
                          setNewTransaction((prev) => ({
                            ...prev,
                            merchant: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Ngày<span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <DatePicker
                        id="date"
                        mode="single"
                        required
                        disabled={loading}
                        defaultDate={newTransaction?.date || undefined}
                        confirmOnly={false}
                        onChange={(date) => {
                          if (date && date[0]) {
                            setNewTransaction((prev) => ({
                              ...prev,
                              date: date[0],
                            }));
                          }
                        }}
                        placeholder="Ngày giao dịch"
                        instanceRef={(fp) => (datePickerRef.current = fp)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Loại giao dịch<span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Select
                        required
                        disabled={loading}
                        placeholder="Chọn loại giao dịch"
                        options={transactionTypes}
                        defaultValue={transactionFromState?.transactionType?.toString()}
                        onChange={(selectedOption) => {
                          setNewTransaction((prev) => ({
                            ...prev,
                            transactionType:
                              selectedOption as unknown as TransactionType,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {newTransaction &&
                      newTransaction.transactionType == TransactionType.INCOME
                        ? "Khoản nhận về (VNĐ)"
                        : "Khoản đã chi (VNĐ)"}
                      <span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <Input
                        required
                        disabled={loading}
                        placeholder={(10000).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        })}
                        type="number"
                        value={newTransaction?.amount || ""}
                        onChange={(e) =>
                          setNewTransaction((prev) => ({
                            ...prev,
                            amount: parseFloat(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Phân loại giao dịch<span className="text-red-500">*</span>
                    </p>
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      <ModalSelect
                        defaultValue={newTransaction?.categoryId + ""}
                        disabled={loading || loadingOptions}
                        options={categoryOptions}
                        onChange={(value) => {
                          setNewTransaction((prev) => ({
                            ...prev,
                            categoryId: parseInt(value),
                          }))
                        }}
                        placeholder={loading || loadingOptions ? "Đang tải..." : "Chọn danh mục"}
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
            <Button size="sm" type="submit" disabled={loading}>
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
