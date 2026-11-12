import { redirect } from "next/navigation";

/** `/` → dashboard; the route guard sends signed-out visitors to /login. */
export default function Home() {
  redirect("/dashboard");
}
