import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import PublicRoute from "../../components/auth/PublicRoute";

export default function SignIn() {
  return (
    <PublicRoute>
      <PageMeta
        title="Đăng nhập"
        description="Đăng nhập vào tài khoản của bạn để tiếp tục sử dụng dịch vụ."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </PublicRoute>
  );
}
