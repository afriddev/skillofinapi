"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { getMeIMPL } from "@/app/impl/getMeImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request?.authToken && !request?.emailId) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status, data } = await getMeIMPL(request);
    console.log(data)

    const response = NextResponse.json({ message, data }, { status });

    return response;
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
