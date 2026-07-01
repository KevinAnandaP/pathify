import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          tasks: true,
        },
      });
      return NextResponse.json(student);
    }

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
    const { name, facts, diagnosis, userId } = body;

    if (!name || !facts || !diagnosis) {
      return NextResponse.json({ error: "Data masukan tidak lengkap." }, { status: 400 });
    }

    // Clean up any existing diagnosis for this user to prevent unique constraint failures
    if (userId) {
      await prisma.student.deleteMany({
        where: { userId },
      });
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
        userId: userId || null,
        tasks: {
          create: diagnosis.remediationTasks.map((t: { id: string; title: string; completed: boolean }) => ({
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
