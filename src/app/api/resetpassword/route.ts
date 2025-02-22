"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { handleLoginIMPL } from "@/app/impl/loginImpl";
import { resetPasswordImpl } from "@/app/impl/resetPasswordImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.emailId) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await resetPasswordImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
