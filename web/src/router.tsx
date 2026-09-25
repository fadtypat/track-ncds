// router ขนาดเล็กพอสำหรับหน้าจอไม่กี่หน้า — technology-stack ยังไม่ได้เลือก routing library
import {createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode} from "react";

export type Path = "/" | "/login" | "/signup" | "/verify-email" | "/forgot-password" | "/auth/action" | "/admin/approvals";

const RouterContext = createContext<{path: string; navigate: (to: Path) => void}>({
  path: "/",
  navigate: () => undefined,
});

export function RouterProvider({children}: {children: ReactNode}) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(to: Path) {
    window.history.pushState(null, "", to);
    setPath(to);
  }

  return <RouterContext.Provider value={{path, navigate}}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({to, ...props}: {to: Path} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const {navigate} = useRouter();
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(to);
      }}
    />
  );
}
