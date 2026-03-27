import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireCsrf } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError as NextResponse;

  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
