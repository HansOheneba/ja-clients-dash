import { redirect } from "next/navigation";

export default function AdvisorDocumentsRedirect() {
  redirect("/advisors/dashboard/reports");
}
