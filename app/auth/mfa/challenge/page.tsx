import MfaClient from "@/components/login/MfaClient";
import { ensureMfaPage } from "@/lib/permissions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MfaChallengePage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {};
  const candidate = typeof params.callbackUrl === "string" ? params.callbackUrl : "/";
  const callbackUrl = candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";

  await ensureMfaPage("challenge", callbackUrl);

  return <MfaClient mode="challenge" callbackUrl={callbackUrl} />;
}
