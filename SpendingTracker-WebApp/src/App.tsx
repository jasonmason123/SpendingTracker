import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Suspense, lazy } from "react";
import { APP_BASE_URL } from "./types";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy imports so that the initial load is faster
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const VerifyAccount = lazy(() => import("./pages/AuthPages/VerifyAccount"));
const ForgotPassword = lazy(() => import("./pages/AuthPages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/AuthPages/ResetPassword"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Transactions = lazy(() => import("./pages/Transactions/Transactions"));
const TransactionDetails = lazy(() => import("./pages/Transactions/TransactionDetails"));
const TransactionCreate = lazy(() => import("./pages/Transactions/TransactionCreate"));
// import NotFound from "./pages/OtherPage/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Router basename={APP_BASE_URL}>
        <ScrollToTop />
        <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
          <Routes>
            {/* Dashboard Layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />

              {/* Transactions */}
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/:id/details" element={<TransactionDetails />} />
              <Route path="transactions/new" element={<TransactionCreate />} />

              {/* Others Page */}
              <Route path="profile" element={<UserProfiles />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="blank" element={<Blank />} />

              {/* Forms */}
              <Route path="form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="buttons" element={<Buttons />} />
              <Route path="avatars" element={<Avatars />} />
              <Route path="badges" element={<Badges />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="images" element={<Images />} />
              <Route path="videos" element={<Videos />} />

              {/* Charts */}
              <Route path="line-chart" element={<LineChart />} />
              <Route path="bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="verify-account/:key" element={<VerifyAccount />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:code" element={<ResetPassword />} />

            {/* Fallback Route */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
