"use server";

import {
  responseEnums,
  exceptionEnums,
  userEnums,
} from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { authToken } = await req.json();

    if (!authToken) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const emailId = decodeString(authToken);
    await connectDB("users");
    const user = await userModel.findOne({ emailId });

    if (!user) {
      return NextResponse.json(
        { message: userEnums.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    await userModel.updateOne({ emailId }, { $set: { loggedIn: false } });

    const response = NextResponse.json(
      { message: responseEnums.SUCCESS },
      { status: 200 }
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
