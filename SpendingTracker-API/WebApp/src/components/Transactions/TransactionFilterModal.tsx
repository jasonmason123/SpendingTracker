import { useState, useRef, useEffect } from "react";
import { TransactionFilterParams, TransactionType } from "../../types";
import Label from "../form/Label";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import DatePicker from "../form/date-picker";
import Switch from "../form/switch/Switch";
import flatpickr from "flatpickr";

interface TransactionFilterModalProps {
  isOpen: boolean;
  filterParams: TransactionFilterParams;
  onClose: () => void;
  onFilter: (filterParams: TransactionFilterParams) => void;
  onUpdateFiltersUsed?: (filterNames: string[]) => void;
  className?: string;
}

const transactionTypeOptions = [
  { value: TransactionType.INCOME as unknown as string, label: "Thu nhập" },
  { value: TransactionType.EXPENSE as unknown as string, label: "Chi tiêu" },
];

const getUsedFilters = (filterParams: TransactionFilterParams) => {
  const usedFilters: string[] = [];
  if (filterParams.transactionType) usedFilters.push("transactionType");
  if (filterParams.dateFrom) usedFilters.push("dateFrom");
  if (filterParams.dateTo) usedFilters.push("dateTo");
  return usedFilters;
};

export default function TransactionFilterModal({
  isOpen,
  filterParams,
  onClose,
  onFilter,
  onUpdateFiltersUsed,
  className,
}: TransactionFilterModalProps) {
  const [localFilterParams, setLocalFilterParams] = useState<TransactionFilterParams>(filterParams);
  const [isDateRange, setIsDateRange] = useState(false);
  const datePickerRef = useRef<flatpickr.Instance | null>(null);

  const handleDateChange = (selectedDates: Date[]) => {
    if (isDateRange) {
      // Date range mode
      if (selectedDates.length >= 2) {
        const dateFrom = new Date(selectedDates[0]);
        dateFrom.setHours(0, 0, 0, 0); // Start of day
        
        const dateTo = new Date(selectedDates[1]);
        dateTo.setHours(23, 59, 59, 999); // End of day
        
        setLocalFilterParams((prev) => ({
          ...prev,
          dateFrom,
          dateTo,
          dateRecorded: undefined,
        }));
      }
    } else {
      // Single date mode
      if (selectedDates.length > 0) {
        const selectedDate = new Date(selectedDates[0]);
        selectedDate.setHours(0, 0, 0, 0); // Start of day
        
        setLocalFilterParams((prev) => ({
          ...prev,
          dateFrom: selectedDate,
          dateTo: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000 - 1), // End of day
          dateRecorded: selectedDate,
        }));
      }
    }
  };

  const handleToggleDateMode = (checked: boolean) => {
    setIsDateRange(checked);
    // Clear date fields when switching modes
    setLocalFilterParams((prev) => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      dateRecorded: undefined,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setLocalFilterParams(filterParams);
      // Determine initial mode based on existing date filters
      setIsDateRange(!!(filterParams.dateFrom && filterParams.dateTo && 
        filterParams.dateFrom.getTime() !== filterParams.dateTo.getTime()));
    }
  }, [isOpen, filterParams]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Bộ lọc tìm kiếm giao dịch
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Sử dụng bộ lọc tìm kiếm để tìm những giao dịch bạn cần tìm
          </p>
        </div>
        <form className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Loại giao dịch</Label>
                <Select
                  defaultValue={filterParams.transactionType as unknown as string}
                  placeholder="Chọn loại giao dịch"
                  onChange={(selectedValue) =>
                    setLocalFilterParams((prev) => ({
                      ...prev,
                      transactionType:
                      selectedValue as unknown as TransactionType,
                    }))
                  }
                  options={transactionTypeOptions}
                />
              </div>

              {/* Date Mode Toggle */}
              <div className="flex items-center justify-between">
                <Label>Chế độ ngày</Label>
                <Switch
                  label={isDateRange ? "Khoảng ngày" : "Ngày cụ thể"}
                  defaultChecked={isDateRange}
                  onChange={handleToggleDateMode}
                />
              </div>

              {/* Date Picker */}
              <div className="lg:col-span-2">
                <Label>{isDateRange ? "Khoảng ngày ghi nhận" : "Ngày ghi nhận"}</Label>
                <DatePicker
                    id="dateRange"
                    mode={isDateRange ? "range" : "single"}
                    defaultDate={isDateRange ? 
                      (localFilterParams.dateFrom && localFilterParams.dateTo ? 
                        [localFilterParams.dateFrom, localFilterParams.dateTo] : undefined) :
                      localFilterParams.dateFrom
                    }
                    maxDate={new Date()}
                    onChange={handleDateChange}
                    placeholder={isDateRange ? "Chọn khoảng ngày" : "Chọn ngày"}
                    instanceRef={(fp) => (datePickerRef.current = fp)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onFilter(localFilterParams);
                if (onUpdateFiltersUsed) {
                  const used = getUsedFilters(localFilterParams);
                  onUpdateFiltersUsed(used);
                }
                onClose();
              }}
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
