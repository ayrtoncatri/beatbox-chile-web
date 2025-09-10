import LoginClient from "../../../components/login/LoginClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Iniciar sesión — Beatbox Chile" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};

  const registered = !!sp.registered;
  const callbackUrl =
    typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <LoginClient registered={registered} callbackUrl={callbackUrl} />
    </main>
  );
}
