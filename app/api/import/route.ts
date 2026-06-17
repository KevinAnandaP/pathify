import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { students } = body;

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: "Data masukan harus berupa array students." }, { status: 400 });
    }

    // Insert all students and their corresponding tasks in a transaction
    const count = await prisma.$transaction(async (tx) => {
      let processed = 0;
      for (const std of students) {
        await tx.student.create({
          data: {
            name: std.name,
            strugglesLogic: std.facts.strugglesLogic,
            strugglesCoreOOP: std.facts.strugglesCoreOOP,
            strugglesAdvancedOOP: std.facts.strugglesAdvancedOOP,
            strugglesDataStructures: std.facts.strugglesDataStructures,
            learningStyle: std.facts.learningStyle,
            diagnosisTitle: std.diagnosis.title,
            riskLevel: std.diagnosis.risk,
            explanation: std.diagnosis.explanation,
            tasks: {
              create: std.diagnosis.remediationTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                completed: t.completed || false,
              })),
            },
          },
        });
        processed++;
      }
      return processed;
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("POST /api/import error:", error);
    return NextResponse.json({ error: "Gagal menyimpan batch import ke database." }, { status: 500 });
  }
}
