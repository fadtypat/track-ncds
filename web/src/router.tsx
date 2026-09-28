// router ขนาดเล็กพอสำหรับหน้าจอไม่กี่หน้า — technology-stack ยังไม่ได้เลือก routing library
import {createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode} from "react";

export type Path = "/" | "/login" | "/signup" | "/verify-email" | "/forgot-password" | "/auth/action" | "/admin/approvals" | "/patient" | "/dev/ai-test";

function buildHref(to: Path, query?: Record<string, string>): string {
  if (!query) return to;
  return `${to}?${new URLSearchParams(query).toString()}`;
}

const RouterContext = createContext<{path: string; search: string; navigate: (to: Path, query?: Record<string, string>) => void}>({
  path: "/",
  search: "",
  navigate: () => undefined,
});

export function RouterProvider({children}: {children: ReactNode}) {
  const [path, setPath] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(to: Path, query?: Record<string, string>) {
    const href = buildHref(to, query);
    window.history.pushState(null, "", href);
    setPath(to);
    setSearch(query ? `?${new URLSearchParams(query).toString()}` : "");
  }

  return <RouterContext.Provider value={{path, search, navigate}}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({to, query, ...props}: {to: Path; query?: Record<string, string>} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const {navigate} = useRouter();
  return (
    <a
      {...props}
      href={buildHref(to, query)}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(to, query);
      }}
    />
  );
}
