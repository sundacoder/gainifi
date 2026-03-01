import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Logout successful" });
    res.cookies.delete("user_id");
    return res;
}
