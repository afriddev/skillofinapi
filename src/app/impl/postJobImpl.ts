"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import projectModel from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { sendOtp } from "../services/apiServices";
import { getOTP, getRandomId, getTodayDate } from "../utils/appUtils";
import { decodeString, encodeString } from "../utils/auth/authHandlers";
import { getAUthToken } from "../utils/auth/cookieHandlers";

export async function postJobImpl(user: {
  authToken: string;
  title: string;
  description: string;
  costPerHour: string;
  contractAmount: string;
  skills: string[];
}): Promise<{
  status: number;
  message: any;
  authToken?: string;
  ca?: boolean;
}> {
  await connectDB("users");

  const emailId = decodeString(user?.authToken);

  const userData = await userModel.findOne({ emailId });

  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  const userAccoutnData = await clientModel.findOne({ emailId });

  const userPostedProjects = userAccoutnData?.postedProjects ?? [];

  const projectData = await projectModel.create({
    id: getAUthToken(20),
    title: user?.title,
    description: user?.description ?? "",
    clientEmail: emailId,
    skillsRequired: user?.skills ?? [],
    costPerHour: parseInt(user?.costPerHour) ? parseInt(user?.costPerHour) : 0,
    budget: parseInt(user?.contractAmount) ? parseInt(user?.contractAmount) : 0,
  });
  if (!projectData) {
    return { status: 200, message: responseEnums?.ERROR };
  }

  userPostedProjects.push(projectData);

  await clientModel.updateOne(
    { emailId },
    {
      $set: {
        postedProjects: userPostedProjects,
        lastUpdatedAt: getTodayDate(),
      },
    }
  );

  return { status: 200, message: responseEnums?.SUCCESS };
}
