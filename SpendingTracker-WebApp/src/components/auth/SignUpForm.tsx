import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { checkStrongPassword } from "../../utils";
import { APP_BASE_URL } from "../../types";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isNotStrongPassword, setIsNotStrongPassword] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const SIGN_UP_ROUTE = `/api/auth/sign-up?isWeb=true`;
  const SIGN_IN_WITH_GOOGLE_ROUTE = `/api/auth/google/web-sign-in`;

  const onSetEmail = (email: string) => {
    setCredentials((prev) => ({ ...prev, email }));
    if (isEmailDuplicated) {
      setIsEmailDuplicated(false);
    }
  }

  const onSetPassword = (password: string) => {
    if(!checkStrongPassword(password) && !isNotStrongPassword) {
      console.log("Password is not strong enough");
      setIsNotStrongPassword(true);
    } else if(checkStrongPassword(password) && isNotStrongPassword) {
      console.log("Password is strong enough");
      setIsNotStrongPassword(false);
    }
    setCredentials((prev) => ({ ...prev, password }));
  }

  const onCheckPasswordMatch = (confirmPassword: string) => {
    if (confirmPassword !== credentials.password && isPasswordMatch) {
      setIsPasswordMatch(false);
    } else if (confirmPassword === credentials.password && !isPasswordMatch) {
      setIsPasswordMatch(true);
    }
  }

  const handleSignUp = async () => {
    if (!isNotStrongPassword && isPasswordMatch) {
      try {
        setIsLoading(true);
        const res = await fetch(SIGN_UP_ROUTE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();

          if(isEmailDuplicated) {
            setIsEmailDuplicated(false);
          }
          //Navigate to verify account page
          navigate(`${APP_BASE_URL}/verify-account/${data.key}`);
        } else if(res.status === 409) {
          setIsEmailDuplicated(true);
        } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
          if(isEmailDuplicated) {
            setIsEmailDuplicated(false);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Sign in error: ", error);
        setErrorMessage("Có lỗi bên phía máy chủ. Vui lòng báo cáo sự cố và thử lại sau.");
        setIsLoading(false);
        if(isEmailDuplicated) {
          setIsEmailDuplicated(false);
        }
      }
    }
  }

  const handleSignUpWithGoogle = async () => {
    let url = SIGN_IN_WITH_GOOGLE_ROUTE;
    if(isChecked) {
      url += "?remember=true";
    }
    window.location.href = url;
  }
  
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng ký
            </h1>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button
                onAbort={handleSignUpWithGoogle}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                disabled={isLoading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Đăng ký với Google
              </button>
              <button
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                disabled={isLoading}
              >
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                Đăng ký với X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Hoặc
                </span>
              </div>
            </div>
            {errorMessage && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-500">
                {errorMessage}
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}>
              <div className="space-y-5">
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    disabled={isLoading}
                    error={isEmailDuplicated}
                    onChange={(e) => onSetEmail(e.target.value)}
                    required
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                  />
                  {isEmailDuplicated && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      Email đã tồn tại. Vui lòng chọn một email khác.
                    </p>
                  )}
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Mật khẩu<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      error={isNotStrongPassword}
                      required
                      placeholder="Nhập mật khẩu của bạn"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => onSetPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {isNotStrongPassword && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Nhập lại mật khẩu<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      error={!isPasswordMatch}
                      required
                      placeholder="Nhập lại mật khẩu của bạn"
                      type={showPasswordConfirm ? "text" : "password"}
                      onChange={(e) => onCheckPasswordMatch(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPasswordConfirm ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {!isPasswordMatch && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      Mật khẩu không khớp. Vui lòng thử lại.
                    </p>
                  )}
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    disabled={isLoading}
                    required
                    id="agree"
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <label htmlFor="agree" className="inline-block font-normal text-gray-500 dark:text-gray-400 cursor-pointer">
                    Khi tạo tài khoản, bạn đã đồng ý với những{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Điều khoản và điều kiện,
                    </span>{" "}
                    và{" "}
                    <span className="text-gray-800 dark:text-white">
                      Chính sách về quyền riêng tư
                    </span> của chúng tôi
                  </label>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                    Đăng ký
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Đã có tài khoản? {""}
                <Link
                  to="/sign-in"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
