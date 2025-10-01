"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(\S+)?$/i;

const EditWildcardSchema = z.object({
  id: z.string().min(1),
  nombreArtistico: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  youtubeUrl: z.string().optional().refine(
    (val) => !val || YT_REGEX.test(val),
    { message: "URL de YouTube inválida" }
  ),
});

export async function editWildcard(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id") as string,
      nombreArtistico: formData.get("nombreArtistico")?.toString(),
      notes: formData.get("notes")?.toString(),
      youtubeUrl: formData.get("youtubeUrl")?.toString(),
    };
    const parsed = EditWildcardSchema.parse(data);

    const updated = await prisma.wildcard.update({
      where: { id: parsed.id },
      data: {
        nombreArtistico: parsed.nombreArtistico || undefined,
        notes: parsed.notes || undefined,
        youtubeUrl: parsed.youtubeUrl || undefined,
      },
    });

    return { ok: true, wildcard: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar" };
  }
}