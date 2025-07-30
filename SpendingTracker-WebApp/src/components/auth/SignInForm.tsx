import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { APP_BASE_URL } from "../../types";
import { authenticationApiCaller } from "../../api_caller/AuthenticationApiCaller";


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const SIGN_IN_WITH_PASSKEY_ROUTE = `/api/auth/signin-passkey`;

  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      await authenticationApiCaller.signIn(credentials, isRemembered)
        .then((response) => {
          if (response.ok) {
            window.location.href = APP_BASE_URL;
          } else {
            setErrorMessage("Email hoặc mật khẩu chưa chính xác. Vui lòng thử lại.");
          }
        });
    } catch (error) {
      console.error("Sign in error: ", error);
      setErrorMessage("Có lỗi bên phía máy chủ. Vui lòng báo cáo sự cố và thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignInWithGoogle = async () => {
    authenticationApiCaller.signInWithGoogle(isRemembered)
      .then((response) => {
        if (!response.ok) {
          setErrorMessage("Đăng nhập với Google không thành công. Vui lòng thử lại.");
        }
      })
      .catch((error) => {
        console.error("Sign in with Google error: ", error);
        setErrorMessage("Có lỗi xảy ra khi đăng nhập với Google. Vui lòng thử lại.");
      });
  }

  const handleSignInWithPasskey = async (email: string) => {
    try {
      if(email.trim() === "") {
        setErrorMessage("Vui lòng nhập email trước khi đăng nhập bằng passkey.");
        setIsEmailValid(false);
        return;
      }
      
      setIsLoading(true);
      // Step 1: Call backend to get assertion options
      const response = await fetch(SIGN_IN_WITH_PASSKEY_ROUTE, {
        method: 'POST',
        body: new URLSearchParams({ email }), // Because [FromForm]
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error("Could not start sign-in");
      }

      const { assertionOptions } = await response.json();
  
      // Step 2: Transform the assertionOptions into the format needed by WebAuthn
      const decodeBase64Url = (input: string): Uint8Array => {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const binary = atob(padded);
        return Uint8Array.from(binary, char => char.charCodeAt(0));
      };
  
      const transformAssertionOptions = (options: any): PublicKeyCredentialRequestOptions => {
        return {
          ...options,
          challenge: decodeBase64Url(options.challenge),
          allowCredentials: options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: decodeBase64Url(cred.id),
          })),
        };
      };
  
      const publicKey = transformAssertionOptions(assertionOptions);
  
      // Step 3: Get the credential from the browser
      const getCredential = async (publicKey: PublicKeyCredentialRequestOptions) => {
        const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
  
        const toBase64Url = (buffer: ArrayBuffer) =>
          btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  
        const response = credential.response as AuthenticatorAssertionResponse;

        return {
          id: credential.id,
          rawId: toBase64Url(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: toBase64Url(credential.response.clientDataJSON),
            authenticatorData: toBase64Url(response.authenticatorData),
            signature: toBase64Url(response.signature),
            userHandle: response.userHandle
              ? toBase64Url(response.userHandle)
              : null,
          }
        };
      };
  
      const credential = await getCredential(publicKey);
  
      // Step 4: Send the result back to the backend for final verification
      const finishPasskeySignIn = async (credentialResponse: any) => {
        const res = await fetch(`/api/signin-passkey/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentialResponse),
        });
  
        if (res.ok) window.location.href = "/";
          
        throw new Error("Sign-in failed");
      };
  
      await finishPasskeySignIn(credential);
  
    } catch (error) {
      console.error("Sign-in with passkey failed:", error);
      setErrorMessage("Đăng nhập bằng passkey không thành công. Vui lòng thử lại.");
      setIsEmailValid(false);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button
                onClick={handleSignInWithGoogle}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-3 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
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
                Đăng nhập với Google
              </button>
              <button
                onClick={() => handleSignInWithPasskey(credentials.email)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-3 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <i className="fa-solid fa-key text-lg"></i>
                Đăng nhập bằng Passkey
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
              handleSignIn();
            }}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    disabled={isLoading}
                    error={!isEmailValid || errorMessage != null}
                    required
                    placeholder="info@gmail.com"
                    onChange={(e) => setCredentials({
                      ...credentials,
                      email: e.target.value,
                    })}
                  />
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      error={errorMessage != null}
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu của bạn"
                      required
                      onChange={(e) => setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })}
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
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      disabled={isLoading}
                      checked={isRemembered}
                      onChange={setIsRemembered}
                      id="keepLoggedIn"
                    />
                    <label
                      htmlFor="keepLoggedIn"
                      className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400 cursor-pointer"
                    >
                      Duy trì đăng nhập
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                    Đăng nhập
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Chưa có tài khoản? {""}
                <Link
                  to="/sign-up"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
