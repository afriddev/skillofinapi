"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { updateBidImpl } from "@/app/impl/updateBidImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (
      !request.authToken ||
      !request.bidAmount ||
      !request?.bidDescription ||
      !request?.projectId
    ) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await updateBidImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
