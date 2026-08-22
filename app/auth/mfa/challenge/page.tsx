import MfaClient from "@/components/login/MfaClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MfaChallengePage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {};
  const candidate = typeof params.callbackUrl === "string" ? params.callbackUrl : "/";
  const callbackUrl = candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";

  return <MfaClient mode="challenge" callbackUrl={callbackUrl} />;
}
