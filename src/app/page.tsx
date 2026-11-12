"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * `/` → dashboard; the route guard sends signed-out visitors to /login. Client-side so the app
 * can be served as a static export (Cloudflare Worker static assets).
 */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
