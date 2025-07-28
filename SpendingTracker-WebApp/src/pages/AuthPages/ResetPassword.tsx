import PublicRoute from "../../components/auth/PublicRoute";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ResetPassword() {
  return (
    <PublicRoute>
      <PageMeta
        title="Khôi phục mật khẩu"
        description="Khôi phục mật khẩu tài khoản của bạn"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </PublicRoute>
  );
}