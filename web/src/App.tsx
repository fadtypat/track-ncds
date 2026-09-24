import {AuthProvider, useAuth} from "./auth/AuthProvider";
import {AuthCard} from "./components/AuthCard";
import {HomePage, PendingApprovalPage, VerifyEmailPage} from "./pages/AccountStatusPages";
import {AuthActionPage} from "./pages/AuthActionPage";
import {ForgotPasswordPage} from "./pages/ForgotPasswordPage";
import {LoginPage} from "./pages/LoginPage";
import {SignUpPage} from "./pages/SignUpPage";
import {RouterProvider, useRouter} from "./router";

function Routes() {
  const {path} = useRouter();
  const {state} = useAuth();

  // หน้าที่เปิดได้โดยไม่ต้องเข้าสู่ระบบ
  if (path === "/auth/action") return <AuthActionPage />;

  if (state.status === "loading") {
    return <AuthCard title="กำลังโหลด…"><p className="type-body">กรุณารอสักครู่</p></AuthCard>;
  }

  if (state.status === "signed-out") {
    if (path === "/signup") return <SignUpPage />;
    if (path === "/forgot-password") return <ForgotPasswordPage />;
    return <LoginPage />;
  }

  // เข้าสู่ระบบแล้ว — ทุก path ผ่านการตรวจสถานะบัญชีก่อนเสมอ
  if (state.status === "unverified") return <VerifyEmailPage user={state.user} />;
  if (state.status === "pending-approval") return <PendingApprovalPage />;
  return <HomePage displayName={state.displayName} role={state.role} />;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </RouterProvider>
  );
}
