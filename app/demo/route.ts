import { NextResponse } from "next/server";
import { DEMO_GROUP_ID, resetDemoGroup } from "@/lib/demo-group";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await resetDemoGroup();
  return NextResponse.redirect(new URL(`/g/${DEMO_GROUP_ID}`, req.url));
}
