import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Kobara API",
    version: "v1",
    docs: "https://kobara.app/docs",
    status: "active"
  });
}
