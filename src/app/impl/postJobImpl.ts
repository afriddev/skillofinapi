"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import projectModel, {
  PROJECT_TYPE_ENUM,
} from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";
import { getAUthToken } from "../utils/auth/cookieHandlers";

export async function postJobImpl(user: {
  emailId: string;
  title: string;
  description: string;
  costPerHour: string;
  contractAmount: string;
  skills: string[];
  jobType: string;
}): Promise<{
  status: number;
  message: any;
  emailId?: string;
  ca?: boolean;
}> {
  await connectDB("users");

  const emailId = decodeString(user?.emailId);

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
    projectType:
      user?.jobType === "project"
        ? PROJECT_TYPE_ENUM.PROJECT
        : PROJECT_TYPE_ENUM.JOB,
  });
  if (!projectData) {
    return { status: 200, message: responseEnums?.ERROR };
  }

  userPostedProjects.unshift(projectData);
  console.log(emailId)

  await clientModel.updateOne(
    { emailId },
    {
      $push: {
        postedProjects: projectData,
      },
    }
  );

  return { status: 200, message: responseEnums?.SUCCESS };
}
