import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PublicationStatus, PublicationType } from "@prisma/client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const tipo = searchParams.get("tipo") as PublicationType | null
  const limit = parseInt(searchParams.get("limit") || "5", 10)

  const where: any = {
    estado: PublicationStatus.publicado,
  }

  if (tipo) {
    where.tipo = tipo
  }

  const items = await prisma.publicacion.findMany({
    where,
    orderBy: { fecha: "desc" },
    take: limit,
  })

  return NextResponse.json({ data: items })
}