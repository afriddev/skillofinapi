"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { userLoginPayloadType } from "../types/userType";
import { getOTP } from "../utils/appUtils";
import {
  decodeString,
  encodeString,
  verifyHashString,
} from "../utils/auth/authHandlers";

export async function handleLoginIMPL(
  user: userLoginPayloadType
): Promise<{ status: number; message: any; emailId?: string; ca?: boolean }> {
  await connectDB("users");

  const userData = await userModel.findOne({ emailId: user.emailId });

  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  if (
    !(await verifyHashString(user.password, userData.password)) &&
    user?.password !== decodeString(userData?.password)
  ) {
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
      await userModel.updateOne(
        { emailId: user.emailId },
        {
          $set: {
            loggedIn: true,
            authToken: user?.authToken,
            browserToken: user?.browserToken,
            refreshToken: user?.refreshToken,
          },
        }
      );

      return {
        status: 200,
        message: responseEnums.SUCCESS,
        emailId: encodeString(user?.emailId),
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
