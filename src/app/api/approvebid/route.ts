"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { approveBidImpl } from "@/app/impl/approveBidImpl";
import { postJobImpl } from "@/app/impl/postJobImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.authToken || !request.id || !request?.freelancerEmailId) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await approveBidImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR,error },
      { status: 500 }
    );
  }
}
