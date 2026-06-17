import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
      include: {
        tasks: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat detail mahasiswa dari database." }, { status: 500 });
  }
}
