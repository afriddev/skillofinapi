"use server";
import { exceptionEnums } from "@/app/enums/responseEnums";
import { deleteImpl } from "@/app/impl/deleImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.emailId || !request.method || !request?.id) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await deleteImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
