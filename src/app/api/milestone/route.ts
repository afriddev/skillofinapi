"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { milestoneImpl } from "@/app/impl/milestoneImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.authToken || !request.id) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await milestoneImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR, error },
      { status: 500 }
    );
  }
}
