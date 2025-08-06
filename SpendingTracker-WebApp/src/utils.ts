import { PeriodUnit, UserInfo } from "./types"

export const periodUnitOptions = [
  { value: PeriodUnit.DAY as any as string, label: "Ngày" },
  { value: PeriodUnit.WEEK as any as string, label: "Tuần" },
  { value: PeriodUnit.MONTH as any as string, label: "Tháng" },
  { value: PeriodUnit.YEAR as any as string, label: "Năm" },
]

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

export function getUserInfo(): UserInfo | null {
  const userInfoBase64 = getCookie("userInfo");
  if (!userInfoBase64) return null;

  try {
    const json = atob(userInfoBase64);
    const info = JSON.parse(json);
    return {
      username: info.username,
      email: info.email,
      dateJoined: info.dateJoined
    }
  } catch (err) {
    console.error("Failed to parse userInfo:", err);
    return null;
  }
}