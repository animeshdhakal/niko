import { redirect } from "next/navigation";
import { getUser } from "@/lib/server-utils";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <SignupForm />;
}
