"use server";
import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import postModel from "@/app/mongodb/models/postModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.authToken) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const emailId = decodeString(request?.authToken);

    try {
      await connectDB("users");
      await postModel.create({
        emailId,
        title: request?.title,
        content: request?.content,
      });
      const posts = await postModel.find().sort({ createdAt: -1 });
      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
          posts,
        },
        {
          status: 200,
        }
      );
    } catch (e) {
      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
