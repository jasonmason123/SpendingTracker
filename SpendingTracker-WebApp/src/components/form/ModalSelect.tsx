import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/modal";
import { Option } from "../../types";

interface ModalSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  modalTitle?: string;
}

const ModalSelect: React.FC<ModalSelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  required,
  className = "",
  defaultValue = "",
  disabled = false,
  modalTitle,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [options]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value == selectedValue);
    return found?.label ?? "";
  }, [options, selectedValue]);

  const filteredOptions = useMemo(() => {
    return options.filter((o) =>
      o.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const openModal = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm(""); // reset search each time
    }
  };

  const closeModal = () => setIsOpen(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    closeModal();
  };

  const inputDisabledClasses = disabled
    ? " text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
    : "";

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={openModal}
        className={`relative h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-left text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${
          selectedValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"
        } ${inputDisabledClasses} ${className}`}
        aria-required={required}
      >
        <span>{selectedValue ? selectedLabel : placeholder}</span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <i className="fa-solid fa-chevron-down" />
        </span>
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-md w-[90%] mx-auto p-4"
      >
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {modalTitle || placeholder}
            </h3>
          </div>

          {/* Search Field */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          />

          {/* Options */}
          <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <ul className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isActive = option.value == selectedValue;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm transition flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                          isActive
                            ? "bg-brand-50/60 text-brand-700 dark:bg-white/[0.03] dark:text-brand-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => handleSelect(option.value)}
                      >
                        <span>{option.label}</span>
                        {isActive && (
                          <span className="ml-3 text-brand-600 dark:text-brand-400">
                            <i className="fa-solid fa-check" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                  No results found
                </li>
              )}
            </ul>
          </div>

          {/* Clear Button */}
          {selectedValue && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedValue("");
                  onChange("");
                }}
                className="w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border border-red-300 rounded-lg hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/30"
              >
                Xóa lựa chọn
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ModalSelect;