"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import bankModel from "../mongodb/models/bankModel";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import notificationsModel from "../mongodb/models/notificationMode";
import postModel from "../mongodb/models/postModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function getMeIMPL(user: {
  emailId: string;
  email: string;
}): Promise<{ status: number; message: any; data?: any }> {
  await connectDB("users");
  let emailId = user?.email ? user?.email : decodeString(user.emailId);

  const userData = await userModel.findOne({ emailId: emailId });

  if (!userData) {
    return {
      status: 200,
      message: userEnums.USER_NOT_FOUND,
    };
  }
  const userAccountModel =
    userData.role === userRole.FREELANCER
      ? freelancerModel
      : userData.role === userRole.BANK
      ? bankModel
      : clientModel;

  const userAccountData = await userAccountModel.findOne({ emailId });

  const posts = await postModel.find().sort({ createdAt: -1 });

  const notificationsData = await notificationsModel.findOne({ emailId });

  return {
    status: 200,
    message: responseEnums.SUCCESS,
    data: {
      userData,
      userAccountData,
      allPosts: posts,
      notificationsData,
    },
  };
}
