import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBirthDateInput } from "@/lib/privacy/age";
import { parentalConsentError, persistParentalConsent } from "@/lib/privacy/parental";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const {
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    comunaId,
    birthDate,
    image,
    parentalGuardianName,
    parentalConsent,
  } = await req.json();

  try {
    const parsedBirthDate = parseBirthDateInput(
      typeof birthDate === "string" ? birthDate : null,
    );
    const parentalError = parentalConsentError(
      parsedBirthDate,
      typeof parentalGuardianName === "string" ? parentalGuardianName : "",
      parentalConsent === true || parentalConsent === "on",
    );
    if (parentalError) {
      return NextResponse.json({ error: parentalError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          birthDate: parsedBirthDate ?? undefined,
          comunaId: comunaId ? Number(comunaId) : undefined,
        },
        create: {
          userId: user.id,
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          birthDate: parsedBirthDate ?? undefined,
          comunaId: comunaId ? Number(comunaId) : undefined,
        },
      });

      await persistParentalConsent({
        tx,
        userId: user.id,
        email: user.email,
        birthDate: parsedBirthDate,
        guardianName: typeof parentalGuardianName === "string" ? parentalGuardianName : null,
        accepted: parentalConsent === true || parentalConsent === "on",
        headers: req.headers,
      });

      if (image !== undefined) {
        await tx.user.update({
          where: { id: user.id },
          data: { image },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}