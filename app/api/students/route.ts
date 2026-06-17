import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json({ error: "Gagal memuat data mahasiswa dari database." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, facts, diagnosis } = body;

    if (!name || !facts || !diagnosis) {
      return NextResponse.json({ error: "Data masukan tidak lengkap." }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        name,
        strugglesLogic: facts.strugglesLogic,
        strugglesCoreOOP: facts.strugglesCoreOOP,
        strugglesAdvancedOOP: facts.strugglesAdvancedOOP,
        strugglesDataStructures: facts.strugglesDataStructures,
        learningStyle: facts.learningStyle,
        diagnosisTitle: diagnosis.title,
        riskLevel: diagnosis.risk,
        explanation: diagnosis.explanation,
        tasks: {
          create: diagnosis.remediationTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            completed: t.completed || false,
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data diagnosis ke database." }, { status: 500 });
  }
}
