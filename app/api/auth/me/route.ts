import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("pathify_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const payload = verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });
  } catch (error) {
    console.error("Gagal memverifikasi pengguna:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
