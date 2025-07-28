import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import PublicRoute from "../../components/auth/PublicRoute";

export default function SignUp() {
  return (
    <PublicRoute>
      <PageMeta
        title="Đăng ký"
        description="Đăng ký tài khoản mới để bắt đầu sử dụng dịch vụ của chúng tôi."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </PublicRoute>
  );
}
