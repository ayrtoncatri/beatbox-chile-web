import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PublicationStatus, PublicationType } from "@prisma/client";

function toInt(value: string | null, fallback: number) {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tipoParam = searchParams.get("tipo");
    const page = toInt(searchParams.get("page"), 1);
    const pageSize = Math.min(20, toInt(searchParams.get("pageSize"), 5));
    const skip = (page - 1) * pageSize;

    const where: Prisma.PublicacionWhereInput = {
      estado: PublicationStatus.publicado,
    };

    if (
      tipoParam === PublicationType.blog ||
      tipoParam === PublicationType.noticia
    ) {
      where.tipo = tipoParam;
    }

    const [total, data] = await Promise.all([
      prisma.publicacion.count({ where }),
      prisma.publicacion.findMany({
        where,
        orderBy: { fecha: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: skip + data.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch {
    return NextResponse.json(
      {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      { status: 200 }
    );
  }
}