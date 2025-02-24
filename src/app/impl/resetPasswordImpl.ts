"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { getOTP } from "../utils/appUtils";
import {  encodeString } from "../utils/auth/authHandlers";

export async function resetPasswordImpl(
  user:{
    emailId:string,
    otp:string,
    passwordOne:string,
    passwordTwo:string
  }
): Promise<{ status: number; message: any; emailId?: string; ca?: boolean }> {
  await connectDB("users");

  const userData = await userModel.findOne({ emailId: user.emailId });

  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  if (user.otp && !user?.passwordOne) {
    if (userData.otp?.toString() === user.otp.toString()) {
      const emailId = encodeString(user.emailId);
      await userModel.updateOne(
        { emailId: user.emailId },
        { $set: { loggedIn: true, authToken:emailId, } }
      );

      return {
        status: 200,
        message: responseEnums.SUCCESS,
        emailId,
      };
    } else {
      return { status: 200, message: userEnums.INVALID_OTP };
    }
  }
  if(user?.otp && user?.passwordOne){
    await userModel.updateOne(
      { emailId: user.emailId },
      { $set: { password:encodeString(user?.passwordOne)} }
    );

  }

  const otp = getOTP();
  const otpResponse = await sendOtp(user.emailId, otp, "RESET_PASSWORD");

  if (otpResponse !== responseEnums.SUCCESS) {
    return { status: 500, message: responseEnums.ERROR };
  }

  await userModel.updateOne({ emailId: user.emailId }, { $set: { otp } });

  return { status: 200, message: userEnums.OTP_SUCCESS };
}
