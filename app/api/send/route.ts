import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      message: "Placeholder endpoint ready for follow-up delivery."
    },
    { status: 202 }
  );
}
