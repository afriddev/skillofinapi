"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { updateProfileImpl } from "@/app/impl/updateProfileImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.authToken || !request.method || !request?.data) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status, data } = await updateProfileImpl(request);

    const response = NextResponse.json({ message, data }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
