"use server";

import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import { handleLoginIMPL } from "@/app/impl/loginImpl";
import { userLoginPayloadType } from "@/app/types/userType";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request: userLoginPayloadType = await req.json();

    if (!request.emailId || !request.password) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status, authToken } = await handleLoginIMPL(request);

    const response = NextResponse.json({ message }, { status });

    if (message === responseEnums.SUCCESS && authToken) {
      response.cookies.set("authToken", authToken,{
        secure:false
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
