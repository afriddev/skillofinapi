"use server";

import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.authToken || !request.amount) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(request?.amount) * 100,
        currency: "usd",
      });

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
