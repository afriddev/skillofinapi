"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { userLoginPayloadType } from "../types/userType";
import { getOTP } from "../utils/appUtils";
import { decodeString, encodeString } from "../utils/auth/authHandlers";

export async function handleLoginIMPL(
  user: userLoginPayloadType
): Promise<{ status: number; message: any; authToken?: string; ca?: boolean }> {
  await connectDB("users");

  const userData = await userModel.findOne({ emailId: user.emailId });

  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  if (decodeString(userData.password) !== user.password) {
    return { status: 200, message: userEnums.INVALID_PASSWORD };
  }

  const roleCollection =
    userData?.role.toLowerCase() === "freelancer"
      ? freelancerModel
      : clientModel;
  const roleData = await roleCollection.findOne({ emailId: user.emailId });

  if (!roleData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  if (user.otp) {
    if (userData.otp?.toString() === user.otp.toString()) {
      const authToken = encodeString(user.emailId);
      await userModel.updateOne(
        { emailId: user.emailId },
        { $set: { loggedIn: true, authToken } }
      );

      return {
        status: 200,
        message: responseEnums.SUCCESS,
        authToken,
      };
    } else {
      return { status: 200, message: userEnums.INVALID_OTP };
    }
  }

  const otp = getOTP();
  const otpResponse = await sendOtp(user.emailId, otp, "LOGIN");

  if (otpResponse !== responseEnums.SUCCESS) {
    return { status: 500, message: responseEnums.ERROR };
  }

  await userModel.updateOne({ emailId: user.emailId }, { $set: { otp } });

  return { status: 200, message: userEnums.OTP_SUCCESS };
}
