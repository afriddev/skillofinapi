"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import postModel from "../mongodb/models/postModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function getMeIMPL(user: {
  authToken: string;
  emailId: string;
}): Promise<{ status: number; message: any; data?: any }> {
  await connectDB("users");
  let emailId;
  if (user?.authToken && !user?.emailId) emailId = decodeString(user.authToken);
  else emailId = user?.emailId;

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
  await connectDB("posts");
  const posts = await postModel.find().sort({ createdAt: -1 });



  return {
    status: 200,
    message: responseEnums.SUCCESS,
    data: {
      userData,
      userAccountData,
      posts
    },
  };
}
