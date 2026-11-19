import { Sessions } from "@/components/Sessions";

export default function Page() {
  const partnerKey = process.env["SPORTSHUB_PARTNER_API_KEY"]?.trim() ?? "";
  return <Sessions partnerKey={partnerKey} />;
}
