import {lazy, Suspense} from "react";

import {AuthProvider, useAuth} from "./auth/AuthProvider";
import {AuthCard} from "./components/AuthCard";
import {PendingApprovalPage, VerifyEmailPage} from "./pages/AccountStatusPages";
import {AdminApprovalPage} from "./pages/AdminApprovalPage";
import {AuthActionPage} from "./pages/AuthActionPage";
import {ForgotPasswordPage} from "./pages/ForgotPasswordPage";
import {LoginPage} from "./pages/LoginPage";
import {PatientListPage} from "./pages/PatientListPage";
import {SignUpPage} from "./pages/SignUpPage";
import {RouterProvider, useRouter} from "./router";

// หน้าทดสอบ AI มีเฉพาะตอน npm run dev — production build ตัดทิ้งทั้งโมดูล (คีย์จึงไม่หลุดไปในเว็บจริง)
const AiTestPage = import.meta.env.DEV
  ? lazy(() => import("./dev/AiTestPage").then((m) => ({default: m.AiTestPage})))
  : null;

function Routes() {
  const {path} = useRouter();
  const {state} = useAuth();

  // หน้าที่เปิดได้โดยไม่ต้องเข้าสู่ระบบ
  if (path === "/auth/action") return <AuthActionPage />;
  if (AiTestPage && path === "/dev/ai-test") return <Suspense><AiTestPage /></Suspense>;

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
  // หน้าของ Admin — บทบาทอื่นเปิด path นี้แล้วได้หน้ารายชื่อผู้ป่วยแทน
  if (path === "/admin/approvals" && state.role === "admin") return <AdminApprovalPage callerUid={state.user.uid} />;
  // ทุกบทบาทเห็นผู้ป่วยทุกราย (ACL.md, 2026-09-25)
  return <PatientListPage displayName={state.displayName} role={state.role} />;
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
