"use server";

import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import paymentSecretsModel from "@/app/mongodb/models/paymentSecretModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.emailId || !request.amount) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    try {
      await connectDB("users");
      const clientSecretsData = await paymentSecretsModel?.findOne({
        emailId: decodeString(request?.emailId),
      });
      for (
        let index = 0;
        index < clientSecretsData?.clientSecrets?.length;
        index++
      ) {
        if (
          clientSecretsData?.clientSecrets[index]?.amount ===
          parseInt(request?.amount)
        ) {
          return NextResponse.json(
            {
              message: responseEnums?.SUCCESS,
              clientSecret:
                clientSecretsData?.clientSecrets[index]?.clientSecret,
            },
            {
              status: 200,
            }
          );
        }
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(request?.amount) * 100,
        currency: "usd",
      });
      console.log(paymentIntent?.client_secret);
      await paymentSecretsModel.findOneAndUpdate(
        { emailId: decodeString(request?.emailId) },
        {
          $push: {
            clientSecrets: {
              $each: [
                {
                  amount: request?.amount ?? 0,
                  currency: "usd",
                  clientSecret: paymentIntent?.client_secret,
                },
              ],
              $position: 0,
            },
          },
        },
        { upsert: true, new: true }
      );

      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
          clientSecret: paymentIntent?.client_secret,
        },
        {
          status: 200,
        }
      );
    } catch (e) {
      console.log(e)
      return NextResponse.json(
        {
          message: responseEnums?.ERROR,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
