import { PeriodUnit } from "./types"

export const periodUnitOptions = [
  { value: PeriodUnit.DAY as any as string, label: "Ngày" },
  { value: PeriodUnit.WEEK as any as string, label: "Tuần" },
  { value: PeriodUnit.MONTH as any as string, label: "Tháng" },
  { value: PeriodUnit.YEAR as any as string, label: "Năm" },
]

export const daysOfWeek = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function getCycleUnitInText(cycleUnit: PeriodUnit) {
  return cycleUnit == PeriodUnit.DAY ? "ngày"
  : cycleUnit == PeriodUnit.WEEK ? "tuần"
  : cycleUnit == PeriodUnit.MONTH ? "tháng" : "năm"
}

export function getFrequencyInText(
  cycleUnit: PeriodUnit,
  interval: number,
  capitalizeFirstLetter: boolean = false
) {
  let cycleUnitText = "";
  switch(cycleUnit) {
    case PeriodUnit.DAY:
      cycleUnitText = "ngày";
      break;
    case PeriodUnit.WEEK:
      cycleUnitText = "tuần";
      break;
    case PeriodUnit.MONTH:
      cycleUnitText = "tháng";
      break;
    case PeriodUnit.YEAR:
      cycleUnitText = "năm";
      break;
  }

  if(interval <= 1) {
    return capitalizeFirstLetter ? `Hàng ${cycleUnitText}` : `hàng ${cycleUnitText}`;
  }

  return capitalizeFirstLetter ? `Mỗi ${interval} ${cycleUnitText}` : `mỗi ${interval} ${cycleUnitText}`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function checkStrongPassword(password: string) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial
  );
}

export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  const DEFAULTS: Record<string, any> = {
    pageNumber: 1,
    pageSize: 10,
  };

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      if (DEFAULTS[key] !== undefined && DEFAULTS[key] === value) {
        return; // skip default value
      }

      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  return query.toString();
}