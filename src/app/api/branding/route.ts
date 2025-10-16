import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const appDir = process.cwd();
    const brandingPath = path.join(appDir, "branding.json");
    const buf = await fs.readFile(brandingPath);
    const json = JSON.parse(buf.toString());
    return NextResponse.json(json, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err) {
    // Exclusivamente via branding.json: sem fallback de env
    return NextResponse.json(
      {},
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
        status: 200
      }
    );
  }
}
