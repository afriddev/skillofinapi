"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import handleSignUpIMPL from "@/app/impl/signupImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    if (!request?.emailId || !request?.firstName || !request?.password) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await handleSignUpIMPL(request);
    return NextResponse.json({ message }, { status });
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
