"use server";

import { responseEnums, exceptionEnums, userEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import userModel from "@/app/mongodb/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { emailId } = await req.json();

    if (!emailId) {
      return NextResponse.json({ message: exceptionEnums.BAD_REQUEST }, { status: 400 });
    }

    await connectDB("users");

    const user = await userModel.findOne({ emailId });

    if (!user) {
      return NextResponse.json({ message: userEnums.USER_NOT_FOUND }, { status: 404 });
    }

    await userModel.updateOne({ emailId }, { $set: { loggedIn: false } });

    const response = NextResponse.json({ message: responseEnums.SUCCESS }, { status: 200 });

    response.cookies.set("authToken", "", { expires: new Date(0) });
    response.cookies.set("ca", "", { expires: new Date(0) });

    return response;
    
  } catch (error) {
    return NextResponse.json({ message: exceptionEnums.SERVER_ERROR }, { status: 500 });
  }
}
