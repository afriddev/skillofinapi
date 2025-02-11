"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import tempUsersModel from "../mongodb/models/tempUsersModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { userSignUpPayloadType } from "../types/userType";
import { getOTP, getTodayDate } from "../utils/appUtils";
import { encodeString } from "../utils/auth/authHandlers";
import mongoose from "mongoose";

async function handleSignUpIMPL(
  user: userSignUpPayloadType
): Promise<{ status: number; message: any }> {
  await connectDB("users");

  const existingUser = await userModel.findOne({ emailId: user.emailId });
  if (existingUser) {
    return { status: 409, message: userEnums.USER_EXISTS }; // 409 Conflict
  }

  const tempUser = await tempUsersModel.findOne({ emailId: user.emailId });

  if (!tempUser) {
    const otp = getOTP();
    const otpResponse = await sendOtp(user.emailId, otp, "SIGNUP");
    if (otpResponse !== responseEnums.SUCCESS) {
      return { status: 500, message: responseEnums.ERROR };
    }

    await tempUsersModel.create({
      emailId: user.emailId,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
    });

    return { status: 200, message: userEnums.OTP_SUCCESS };
  }

  if (!user.otp || tempUser.otp.toString() !== user.otp.toString()) {
    return { status: 401, message: userEnums.INVALID_OTP };
  }

  const roleCollection =
    user.role === "freelancer" ? freelancerModel : clientModel;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newUser = await userModel.create(
      [
        {
          emailId: user.emailId,
          firstName: user.firstName,
          lastName: user.lastName ?? "",
          phoneNumber: user.phoneNumber,
          authToken: user.authToken,
          password: encodeString(user.password),
          role: user.role,
          ca: true,
          createdAt: getTodayDate(),
          lastUpdatedAt: getTodayDate(),
        },
      ],
      { session }
    );

    await roleCollection.create(
      [
        {
          userId: newUser[0]._id,
          emailId: user.emailId,
          firstName: user.firstName,
          lastName: user.lastName ?? "",
          phoneNumber: user.phoneNumber,
          createdAt: getTodayDate(),
          lastUpdatedAt: getTodayDate(),
        },
      ],
      { session }
    );

    await tempUsersModel.deleteOne({ emailId: user.emailId }, { session });

    await session.commitTransaction();
    session.endSession();

    return { status: 201, message: responseEnums.SUCCESS };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 500, message: responseEnums.ERROR };
  }
}

export default handleSignUpIMPL;
