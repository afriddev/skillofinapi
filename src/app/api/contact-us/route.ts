import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import contactedUsersModel from "@/app/mongodb/models/contactedUsersModel";
import { getTodayDate } from "@/app/utils/appUtils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullName, emailId, phone } = await req?.json();

    if (fullName && emailId ) {
      await connectDB("users");
      const alreadyContactedUser = await contactedUsersModel.findOne({
        emailId,
      });

      if (!alreadyContactedUser)
      {
        await contactedUsersModel.create({
          emailId,
          message:"",
          phone,
          fullName,
        });
      }
        

      return NextResponse.json(
        {
          message: responseEnums.SUCCESS,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: responseEnums.SUCCESS,
        },
        {
          status: 200,
        }
      );
    }
  } catch {
    return NextResponse.json(
      {
        message: exceptionEnums?.BAD_REQUEST,
      },
      {
        status: 400,
      }
    );
  }
}
