import PublicRoute from "../../components/auth/PublicRoute";
import VerifyAccountForm from "../../components/auth/VerifyAccountForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function VerifyAccount() {
  return (
    <PublicRoute>
      <PageMeta
        title="Verify Account"
        description="Verify Account by OTP" 
      />
      <AuthLayout>
        <VerifyAccountForm />
      </AuthLayout>
    </PublicRoute>
  );
}
