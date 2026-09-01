import { redirect } from "next/navigation";

export default function ClientReportsRedirect() {
  redirect("/clients/dashboard/documents");
}
