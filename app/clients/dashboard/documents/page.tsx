import { redirect } from "next/navigation";

export default function ClientDocumentsRedirect() {
  redirect("/clients/dashboard/reports");
}
