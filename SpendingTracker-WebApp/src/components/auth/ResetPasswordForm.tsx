import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { checkStrongPassword } from "../../utils";
import { useParams } from "react-router";
import Button from "../ui/button/Button";


export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isNotStrongPassword, setIsNotStrongPassword] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { code } = useParams();

  const handleSubmit = async () => {
    if(!isNotStrongPassword && isPasswordMatch) {
      const formData = new FormData();
      formData.append("value", password);
  
      try {
        setIsLoading(true);
        const res = await fetch(`/api/reset-password/${code}`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
  
        if (res.ok) {
          setIsSuccessful(true);
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 3000);
        } else {
          const errorResponse = await res.json();
          console.log("Failed to reset password:", errorResponse);
          setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } catch (error) {
        console.log("Error resetting password", error);
        setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    }
  }

  const onSetPassword = (password: string) => {
    if(!checkStrongPassword(password) && !isNotStrongPassword) {
      setIsNotStrongPassword(true);
    } else if(checkStrongPassword(password) && isNotStrongPassword) {
      setIsNotStrongPassword(false);
    }
    setPassword(password);
  }

  const onCheckPasswordMatch = (confirmPassword: string) => {
    if (confirmPassword !== password && isPasswordMatch) {
      setIsPasswordMatch(false);
    } else if (confirmPassword === password && !isPasswordMatch) {
      setIsPasswordMatch(true);
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Khôi phục mật khẩu
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/70">
            Nhập mật khẩu mới của bạn để khôi phục tài khoản. Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>
        </div>
        {isSuccessful ? (
          <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
            <span className="font-medium">Mật khẩu đã được khôi phục thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.</span>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
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
              <div>
                <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                  Khôi phục mật khẩu
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}