import { responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import blogModel from "@/app/mongodb/models/blogModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req?.json();
    await connectDB("users");

    if (request?.emailId && !request?.id) {
      await blogModel.create({
        emailId: decodeString(request?.emailId),
        image: request?.image,
        title: request?.title,
        content: request?.content,
      });
      return NextResponse.json({
        message: responseEnums?.SUCCESS,
      });
    } else if (request?.id && request?.emailId) {
      await blogModel?.deleteOne({ _id: request?.id });
      const blogs = await blogModel?.find().sort({ createdAt: -1 });
      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
          data: blogs,
        },
        {
          status: 200,
        }
      );
    } else {
      const blogs = await blogModel?.find().sort({ createdAt: -1 });
      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
          data: blogs,
        },
        {
          status: 200,
        }
      );
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: responseEnums?.ERROR,
      },
      { status: 500 }
    );
  }
}
