import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import confirmDatePlugin from "flatpickr/dist/plugins/confirmDate/confirmDate";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  confirmOnly?: boolean;
  onChange?: Hook | Hook[];
  defaultDate?: DateOption | DateOption[] | undefined;
  label?: string;
  placeholder?: string;
  dateFormat?: "d-m-Y" | "Y-m-d";
  maxDate?: DateOption;
  minDate?: DateOption;
  maxTime?: DateOption;
  minTime?: DateOption;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  instanceRef?: (fpInstance: flatpickr.Instance) => void;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  confirmOnly,
  label,
  defaultDate,
  placeholder,
  dateFormat = "d-m-Y",
  maxDate,
  minDate,
  maxTime,
  minTime,
  required,
  disabled,
  className,
  instanceRef,
}: PropsType) {
  const visibleInputRef = useRef<HTMLInputElement>(null);
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);
  const [dateValue, setDateValue] = useState<string>("");

  useEffect(() => {
    const inputEl = document.getElementById(id) as HTMLInputElement;
    if (!inputEl) return;

    const instance = flatpickr(inputEl, {
      locale: Vietnamese,
      plugins: confirmOnly
        ? [confirmDatePlugin({
              showAlways: false,
              theme: "light",
            }),
          ] : [],
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat,
      closeOnSelect: false,
      defaultDate,
      onChange: (selectedDates, dateStr, fpInstance) => {
        setDateValue(dateStr);

        if(!confirmOnly) {
          if (typeof onChange === "function") {
            onChange(selectedDates, dateStr, fpInstance);
          } else if (Array.isArray(onChange)) {
            onChange.forEach((fn) => fn(selectedDates, dateStr, fpInstance));
          }
        }
      },
      position: "auto",
      maxDate,
      minDate,
      maxTime,
      minTime,
      allowInput: true,
      onOpen: function (_selectedDates, _dateStr, instance) {
        instance._input.readOnly = true;
      },
      onClose: function (_selectedDates, _dateStr, instance) {
        instance._input.readOnly = false;
        instance._input.blur();
      },
    });

    let confirmBtn: HTMLButtonElement | null = null;
    function handleConfirm() {
      const selectedDates = instance.selectedDates;
      const dateStr = instance.input.value;

      setDateValue(dateStr);
      if (typeof onChange === "function") {
        onChange(selectedDates, dateStr, instance);
      } else if (Array.isArray(onChange)) {
        onChange.forEach((fn) => fn(selectedDates, dateStr, instance));
      }
    }

    if (confirmOnly) {
      confirmBtn = instance.calendarContainer.querySelector(
        ".flatpickr-confirm"
      ) as HTMLButtonElement;

      if (confirmBtn) {
        confirmBtn.addEventListener("click", handleConfirm);
      }
    }

    flatpickrRef.current = instance;

    // Set dateValue manually from the selected date
    const selected = instance.input.value;
    setDateValue(selected);

    if (instanceRef) {
      instanceRef(instance);
    }

    return () => {
      instance.destroy();
      confirmBtn?.removeEventListener("click", handleConfirm);
    };
  }, [
    mode,
    onChange,
    confirmOnly,
    id,
    defaultDate,
    maxDate,
    minDate,
    maxTime,
    minTime,
    dateFormat,
    instanceRef,
  ]);

  let inputClasses = "";
  if (disabled) {
    inputClasses +=
      " text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className={`relative ${className}`}>
        {/* Hidden input for required validation and focus */}
        {required && (
          <input
            type="text"
            value={dateValue}
            required
            onChange={() => {}}
            onInvalid={(e) => {
              e.preventDefault();
              visibleInputRef.current?.focus();
            }}
            className="sr-only"
            aria-hidden="true"
          />
        )}

        <input
          id={id}
          ref={visibleInputRef}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 ${inputClasses}`}
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
