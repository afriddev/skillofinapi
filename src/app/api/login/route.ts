"use server";

import { exceptionEnums, userEnums } from "@/app/enums/responseEnums";
import { handleLoginIMPL } from "@/app/impl/loginImpl";
import { userLoginPayloadType } from "@/app/types/userType";
import { getTodayDate } from "@/app/utils/appUtils";
import { encodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userAgent = req.headers.get("user-agent") || null;

  if (!userAgent) {
    return NextResponse.json(
      {
        message: userEnums?.UNAUTHORISED,
      },
      {
        status: 401,
      }
    );
  }

  try {
    const request: userLoginPayloadType = await req.json();

    if (!request.emailId || !request.password) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const authToken = encodeString(request?.emailId);
    const browserToken = encodeString(userAgent);
    const refreshToken = encodeString(getTodayDate());

    const { message, status, emailId } = await handleLoginIMPL({
      ...request,
      browserToken,
      authToken,
      refreshToken,
    });

    const response = NextResponse.json({ message, emailId }, { status });
    if (message === "SUCCESS") {
      response.cookies.set("refreshToken", refreshToken);
      response.cookies.set("browserToken", browserToken);
      response.cookies.set("authToken", authToken);
    }

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
