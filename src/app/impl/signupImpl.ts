"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import bankModel from "../mongodb/models/bankModel";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import tempUsersModel from "../mongodb/models/tempUsersModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { userSignUpPayloadType } from "../types/userType";
import { getOTP } from "../utils/appUtils";
import { hashString } from "../utils/auth/authHandlers";
import { getAUthToken } from "../utils/auth/cookieHandlers";
import moment from "moment-timezone";
import Stripe from "stripe";

async function handleSignUpIMPL(
  user: userSignUpPayloadType
): Promise<{ status: number; message: any }> {
  await connectDB("users");

  const existingUser = await userModel.findOne({ emailId: user?.emailId });
  if (existingUser) {
    return { status: 200, message: userEnums.USER_EXISTS };
  }

  const tempUser = await tempUsersModel.findOne({ emailId: user?.emailId });

  if (!tempUser || (tempUser && !user.otp)) {
    const otp = getOTP();
    const otpResponse = await sendOtp(user?.emailId, otp, "SIGNUP");
    if (otpResponse !== responseEnums.SUCCESS) {
      return { status: 500, message: responseEnums.ERROR };
    }

    if (tempUser) {
      await tempUsersModel.findOneAndUpdate(
        { emailId: user?.emailId },
        {
          otp,
          expiresAt: new Date(),
        }
      );
    } else {
      await tempUsersModel.create({
        emailId: user?.emailId,
        otp,
        expiresAt: new Date(),
      });
    }

    return { status: 200, message: userEnums.OTP_SUCCESS };
  }

  if (!user?.otp || tempUser?.otp.toString() !== user?.otp.toString()) {
    return { status: 401, message: userEnums.INVALID_OTP };
  }

  const roleCollection =
    user?.role?.toLowerCase() === "freelancer"
      ? freelancerModel
      : user?.role?.toLowerCase() === "bank"
      ? bankModel
      : clientModel;

  try {
    const timeZone = await getTimeZone(user?.countryCode);

    const nowWithTimeZone = moment().tz(timeZone).format("hh:mm A");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-01-27.acacia",
    });

    // const account = await stripe.accounts.create({
    //   type: "express",
    //   email: request?.freelancerEmailId,
    //   country: "US",
    //   capabilities: {
    //     transfers: { requested: true },
    //     card_payments: {
    //       requested: true,
    //     },
    //   },
    //   business_type: "individual",
    //   default_currency: "USD",
    // });

    await userModel.create({
      // paymentConnectId: account?.id,
      emailId: user?.emailId,
      mobileNumber: user?.mobileNumber,
      firstName: user?.firstName,
      lastName: user?.lastName ?? "",
      authToken: getAUthToken(),
      password: await hashString(user?.password),
      role:
        user?.role?.toLowerCase() === "client"
          ? userRole.CLIENT
          : user?.role?.toLowerCase() === "bank"
          ? userRole?.BANK
          : userRole.FREELANCER,

      countryCode: user?.countryCode,
      currency: user?.currency,
      countryName: `${user?.countryName} - ${nowWithTimeZone}`,
    });

    await roleCollection.create({
      emailId: user?.emailId,
      firstName: user?.firstName,
      lastName: user?.lastName ?? "",
      mobileNumber: user?.mobileNumber,
    });

    await tempUsersModel.deleteMany({ emailId: user?.emailId });

    return { status: 201, message: responseEnums.SUCCESS };
  } catch (error) {
    console.log(error);
    return { status: 500, message: responseEnums.ERROR };
  }
}

export default handleSignUpIMPL;

async function getTimeZone(alpha3: string) {
  const response = await fetch(
    `https://restcountries.com/v3.1/alpha/${alpha3}`
  );
  const data = await response.json();
  return data[0]?.timezones[0] || "UTC"; // Default to UTC if not found
}
