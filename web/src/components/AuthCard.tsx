import type {ReactNode} from "react";

export function AuthCard({title, intro, children}: {title: string; intro?: ReactNode; children: ReactNode}) {
  return (
    <div className="app-bg">
      <main className="container auth-shell">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="type-eyebrow">NCDS CLINIC · AUTHENTICATION</span>
            <h1 className="type-section-title">{title}</h1>
            {intro && <p className="type-body">{intro}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function Callout({tone, title, children}: {tone: "info" | "tip" | "note" | "warn"; title: string; children?: ReactNode}) {
  return (
    <div className={`callout ${tone}`} role={tone === "warn" ? "alert" : "status"}>
      <span className="callout-title">{title}</span>
      {children && <p className="type-body" style={{color: "inherit"}}>{children}</p>}
    </div>
  );
}

export function PasswordRules({rules}: {rules: {id: string; label: string; met: boolean}[]}) {
  return (
    <ul className="password-rules" aria-label="เงื่อนไขรหัสผ่าน">
      {rules.map((rule) => (
        <li key={rule.id} className={rule.met ? "rule-met" : undefined}>
          {rule.label}
          <span className="visually-hidden">{rule.met ? " (ผ่าน)" : " (ยังไม่ผ่าน)"}</span>
        </li>
      ))}
    </ul>
  );
}
