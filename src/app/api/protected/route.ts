import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }

    return NextResponse.json({ message: `Hello ${payload.role}`});
}