import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDashboardUrl(path: string = "") {
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app";
    if (baseUrl.includes("localhost")) {
      return `http://dashboard.localhost:3000${path}`;
    }
    return `https://dashboard.kobara.app${path}`;
  }
  
  const { hostname, port, protocol } = window.location;
  
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//dashboard.localhost${port ? `:${port}` : ""}${path}`;
  }
  
  if (hostname === "kobara.local" || hostname.endsWith(".kobara.local")) {
    return `${protocol}//dashboard.kobara.local${port ? `:${port}` : ""}${path}`;
  }

  return `https://dashboard.kobara.app${path}`;
}
