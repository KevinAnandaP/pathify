import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { completed } = body;

    if (completed === undefined) {
      return NextResponse.json({ error: "Parameter 'completed' tidak disediakan." }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        completed: Boolean(completed),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status tugas di database." }, { status: 500 });
  }
}
