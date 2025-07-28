import { useNavigate, useParams } from "react-router";
import Input from "../form/input/InputField";
import { useState } from "react";
import { APP_BASE_URL } from "../../types";


export default function VerifyAccountForm() {
  const [otp, setOtp] = useState("");
  const { key } = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/resend/${key}`, {
        method: "GET",
        credentials: "include",
      });
  
      if (res.ok) {
        //Replace the old key with the new one
        const data = await res.json();
        navigate(`${APP_BASE_URL}/verify-account/${data.key}`, { replace: true });
        setIsLoading(false);
      } else {
        const err = await res.json();
        console.error("Verification failed:", err);
        // Show error message
        setErrorMessage("Mã xác thực không chính xác. Vui lòng thử lại.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("otp", otp);
  
    try {
      setIsLoading(true);
      const res = await fetch(`/api/verify-account/${key}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      if (res.ok) {
        window.location.href = "/";
      } else {
        const err = await res.json();
        console.error("Verification failed:", err);
        // Show error message
        setErrorMessage("Mã xác thực không chính xác. Vui lòng thử lại.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setIsLoading(false);
    }
  };  

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Xác thực tài khoản
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/70">
            Chúng tôi vừa gửi một mã xác thực đến email của bạn. Vui lòng nhập mã gồm 6 chữ số bên dưới để tiếp tục.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <Input
            disabled={isLoading}
            placeholder="Nhập mã OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {errorMessage && (
            <div className="text-sm text-red-500">{errorMessage}</div>
          )}

          <button
            onClick={handleSubmit}
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className="w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
          >
            Xác nhận
          </button>

          <div className="text-sm text-center text-gray-600 dark:text-white/70">
            Không nhận được mã?{" "}
            <button
              type="button"
              className="font-semibold text-brand-500 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                handleResend();
              }}
            >
              Gửi lại mã
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
