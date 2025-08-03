import { useState } from "react";
import Input from "../form/input/InputField";
import { Link } from "react-router";
import { authenticationApiCaller } from "../../api_caller/AuthenticationApiCaller";


export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await authenticationApiCaller.forgotPasswordRequest(email);

      if (res.ok) {
        setEmailSent(true);
      } else {
        setErrorMessage("Chúng tôi không nhận ra địa chỉ email này. Vui lòng thử lại.");
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
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
            {emailSent ?
              `Chúng tôi đã gửi hướng dẫn đến địa chỉ email ${email}. Vui lòng kiểm tra hộp thư đến của bạn.` :
              "Vui lòng nhập địa chỉ email mà bạn đã sử dụng để đăng ký tài khoản."}
          </p>
          {emailSent && (
            <div className="pt-2 text-center">
              <Link
                to="/sign-in"
                className="text-brand-500 hover:underline"
                onClick={e => isLoading && e.preventDefault()}
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          )}
        </div>
        {!emailSent && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {errorMessage && (
              <p className="mb-4 font-medium text-sm text-red-500">{errorMessage}</p>
            )}
            <Input
              disabled={isLoading}
              placeholder="Nhập địa chỉ email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
            >
              Gửi mã xác thực
            </button>
            <div className="pt-2 text-center">
              <Link
                to="/sign-in"
                className="text-brand-500 hover:underline"
                onClick={e => isLoading && e.preventDefault()}
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}