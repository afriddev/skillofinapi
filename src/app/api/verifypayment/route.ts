"use server";

import {
  exceptionEnums,
  paymentEnums,
  responseEnums,
} from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import paymentClientSecretModel from "@/app/mongodb/models/paymentSecretModel";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (
      !request.emailId ||
      !request.paymentIntent ||
      !(request?.freelancerEmailId || request?.pricing)
    ) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    try {
      await connectDB("users");

      //Retrive payment
      const paymentIntent = await stripe.paymentIntents.retrieve(
        request?.paymentIntent
      );

      //If payment success
      if (paymentIntent.status === "succeeded") {
        await paymentClientSecretModel.findOneAndUpdate(
          { emailId: decodeString(request?.emailId) },
          {
            $pull: {
              clientSecrets: { clientSecret: paymentIntent?.client_secret },
            },
          },
          { new: true }
        );

        if (request?.pricing) {
          await userModel.findOneAndUpdate(
            {
              emailId: decodeString(request?.emailId),
            },
            {
              $set: {
                planDetails: (request?.plan as string)?.toUpperCase() ?? "FREE",
              },
            }
          );
          return NextResponse.json(
            {
              message: paymentEnums?.PAYMENT_SUCCESS,
            },
            {
              status: 200,
            }
          );
        }

        //Verify payement for milestone
        const userData = await userModel?.findOne({
          emailId: request?.freelancerEmailId,
        });
        let paymentId = userData?.paymentConnectId;
        console.log(paymentId);

        if (!paymentId) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2025-01-27.acacia",
          });

          const account = await stripe.accounts.create({
            type: "express",
            email: request?.freelancerEmailId,
            country: "US",
            capabilities: {
              transfers: { requested: true },
              card_payments: {
                requested: true,
              },
            },
            business_type: "individual",
            default_currency: "USD",
          });
          paymentId = account?.id;
        }

        await userModel?.findOneAndUpdate(
          { emailId: request?.freelancerEmailId },
          {
            $set: {
              amount: userData?.amount + paymentIntent?.amount,
              paymentConnectId: paymentId,
            },
          }
        );

        return NextResponse.json(
          {
            message: paymentEnums?.PAYMENT_SUCCESS,
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: paymentIntent?.status,
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
