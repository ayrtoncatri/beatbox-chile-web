import GoogleConsentClient from "@/components/login/GoogleConsentClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Privacidad y Google | Beatbox Chile" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSafeCallbackUrl(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default async function GoogleConsentPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};

  return <GoogleConsentClient callbackUrl={getSafeCallbackUrl(params.callbackUrl)} />;
}
