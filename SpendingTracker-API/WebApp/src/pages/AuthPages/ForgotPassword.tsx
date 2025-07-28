import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import PublicRoute from "../../components/auth/PublicRoute";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ForgotPassword() {
  return (
    <PublicRoute>
      <PageMeta
        title="Khôi phục mật khẩu"
        description="Khôi phục mật khẩu tài khoản của bạn"
      />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </PublicRoute>
  );
}