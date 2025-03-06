import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import contactedUsersModel from "@/app/mongodb/models/contactedUsersModel";
import { getTodayDate } from "@/app/utils/appUtils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullName, emailId, phone, message } = await req?.json();

    if (fullName && emailId) {
      await connectDB("users");
      const alreadyContactedUser = await contactedUsersModel.findOne({
        emailId,
      });

      if (!alreadyContactedUser) {
        await contactedUsersModel.create({
          emailId,
          message,
          phone,
          fullName,
        });
      }
      const url = "https://freeemailapi.vercel.app/sendEmail/";

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          title: "Skillofin",
          subject: "A new user has contacted",
          fromEmail: process.env.FROM_EMAIL,
          passkey: process.env.PASS_KEY,
          toEmail: "contact@Skillofin.com",
          body: `Hello Admin,\n\nA new user has contacted you with the following details:\n\nFull Name: ${fullName}\nEmail: ${emailId}\nPhone: ${
            phone || "Not Provided"
          }\nMessage: ${
            message || "No message provided"
          }\n\nPlease review and take necessary action.\n\nBest Regards,\nYour System`,
        }),
      });

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
