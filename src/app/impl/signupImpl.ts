"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import tempUsersModel from "../mongodb/models/tempUsersModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { userSignUpPayloadType } from "../types/userType";
import { getOTP } from "../utils/appUtils";
import { encodeString } from "../utils/auth/authHandlers";
import { getAUthToken } from "../utils/auth/cookieHandlers";

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
    user?.role?.toLowerCase() === "freelancer" ? freelancerModel : clientModel;

  try {
    await userModel.create({
      emailId: user?.emailId,
      firstName: user?.firstName,
      lastName: user?.lastName ?? "",
      authToken: getAUthToken(),
      password: encodeString(user?.password),
      role:
        user?.role.toLowerCase() === "client"
          ? userRole.CLIENT
          : userRole.FREELANCER,

          countryCode: user?.countryCode,
      currency: user?.currency,
      countryName: user?.countryName,
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
