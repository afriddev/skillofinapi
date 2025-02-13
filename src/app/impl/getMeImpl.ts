"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function getMeIMPL(user: {
  authToken: string;
}): Promise<{ status: number; message: any; data?: any }> {
  await connectDB("users");
  const emailId = decodeString(user.authToken);
  const userData = await userModel.findOne({ emailId: emailId });

  if (!userData) {
    return {
      status: 200,
      message: userEnums.USER_NOT_FOUND,
    };
  }
  const userAccountModel =
    userData.role === userRole.FREELANCER ? freelancerModel : clientModel;

  const userAccountData = await userAccountModel.findOne({ emailId });

  return {
    status: 200,
    message: responseEnums.SUCCESS,
    data: {
      userData,
      userAccountData,
    },
  };
}
