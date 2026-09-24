import {onAuthStateChanged, reload, signOut, type User} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from "react";

import {auth, db} from "../firebase";

// สถานะบัญชีตาม State Diagram ใน detailed-design/user-authentication-email-password.md
export type AccountState =
  | {status: "loading"}
  | {status: "signed-out"}
  | {status: "unverified"; user: User}
  | {status: "pending-approval"; user: User}
  | {status: "active"; user: User; displayName: string; role: string};

const ALLOWED_ROLES = ["แพทย์", "พยาบาล"];

interface AuthContextValue {
  state: AccountState;
  refresh(): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveState(user: User | null): Promise<AccountState> {
  if (!user) return {status: "signed-out"};
  // FR-09 — ยังไม่ยืนยันอีเมลห้ามใช้ฟีเจอร์อื่น (ฝั่งเซิร์ฟเวอร์ตรวจ email_verified ซ้ำด้วย)
  if (!user.emailVerified) return {status: "unverified", user};

  // role/isActive อยู่ใน users/{uid} เท่านั้น ไม่มีใน token (decision area 18)
  const snapshot = await getDoc(doc(db, "users", user.uid));
  const data = snapshot.data();
  if (!data || data.isActive !== true || !ALLOWED_ROLES.includes(data.role)) {
    return {status: "pending-approval", user};
  }
  return {status: "active", user, displayName: String(data.displayName ?? user.email), role: data.role};
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<AccountState>({status: "loading"});

  const apply = useCallback(async (user: User | null) => {
    try {
      setState(await resolveState(user));
    } catch {
      // อ่าน users/{uid} ไม่ได้ ถือว่ายังไม่ผ่านการอนุมัติ (fail-closed)
      setState(user ? {status: "pending-approval", user} : {status: "signed-out"});
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => void apply(user)), [apply]);

  const refresh = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      await reload(user);
      // บังคับออก ID token ใหม่ให้ email_verified ใน token ตรงกับสถานะล่าสุด
      await user.getIdToken(true);
    }
    await apply(auth.currentUser);
  }, [apply]);

  const logout = useCallback(() => signOut(auth), []);

  return <AuthContext.Provider value={{state, refresh, logout}}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
