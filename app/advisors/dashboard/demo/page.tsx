import { redirect } from "next/navigation";

export default function AdvisorDemoRedirect() {
  redirect("/advisors/dashboard");
}
