import { redirect } from "next/navigation";
import { getUser } from "@/lib/server-utils";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
